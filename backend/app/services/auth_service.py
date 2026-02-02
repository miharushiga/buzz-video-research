"""
認証サービス - バズ動画リサーチくん

ユーザー登録・ログイン・プロファイル管理
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from pydantic import BaseModel, EmailStr
from supabase import Client

from app.core.supabase import get_supabase_admin


logger = logging.getLogger(__name__)


class UserProfile(BaseModel):
    """ユーザープロファイル"""
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    created_at: datetime


class SubscriptionStatus(BaseModel):
    """サブスクリプション状態"""
    status: str  # trialing, active, cancelled, expired, none
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    is_active: bool = False
    days_remaining: Optional[int] = None


class AuthService:
    """認証サービスクラス"""

    def __init__(self, supabase: Optional[Client] = None):
        self.supabase = supabase or get_supabase_admin()

    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        ユーザープロファイルを取得

        Args:
            user_id: ユーザーID

        Returns:
            UserProfile: プロファイル（存在しない場合はNone）
        """
        try:
            result = self.supabase.table('profiles').select('*').eq('id', user_id).single().execute()

            if not result.data:
                return None

            return UserProfile(
                id=result.data['id'],
                email=result.data['email'],
                full_name=result.data.get('full_name'),
                avatar_url=result.data.get('avatar_url'),
                is_admin=result.data.get('is_admin', False),
                created_at=datetime.fromisoformat(result.data['created_at'].replace('Z', '+00:00'))
            )

        except Exception as e:
            logger.error(f'Failed to get profile: {e}')
            return None

    async def update_profile(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None
    ) -> Optional[UserProfile]:
        """
        ユーザープロファイルを更新

        Args:
            user_id: ユーザーID
            full_name: 名前
            avatar_url: アバターURL

        Returns:
            UserProfile: 更新後のプロファイル
        """
        update_data = {}
        if full_name is not None:
            update_data['full_name'] = full_name
        if avatar_url is not None:
            update_data['avatar_url'] = avatar_url

        if not update_data:
            return await self.get_profile(user_id)

        try:
            result = self.supabase.table('profiles').update(update_data).eq('id', user_id).execute()

            if result.data:
                return await self.get_profile(user_id)
            return None

        except Exception as e:
            logger.error(f'Failed to update profile: {e}')
            return None

    async def get_subscription_status(self, user_id: str) -> SubscriptionStatus:
        """
        サブスクリプション状態を取得

        Args:
            user_id: ユーザーID

        Returns:
            SubscriptionStatus: サブスクリプション状態
        """
        try:
            result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()

            if not result.data:
                return SubscriptionStatus(status='none', is_active=False)

            sub = result.data[0]
            now = datetime.now(tz=timezone.utc)

            status = sub['status']
            trial_end = None
            current_period_end = None
            is_active = False
            days_remaining = None

            if sub.get('trial_end'):
                trial_end = datetime.fromisoformat(sub['trial_end'].replace('Z', '+00:00'))
            if sub.get('current_period_end'):
                current_period_end = datetime.fromisoformat(sub['current_period_end'].replace('Z', '+00:00'))

            # アクティブ判定
            if status == 'trialing' and trial_end and trial_end > now:
                is_active = True
                days_remaining = (trial_end - now).days
            elif status == 'active' and current_period_end and current_period_end > now:
                is_active = True
                days_remaining = (current_period_end - now).days
            elif status in ('cancelled', 'expired'):
                is_active = False

            return SubscriptionStatus(
                status=status,
                trial_end=trial_end,
                current_period_end=current_period_end,
                is_active=is_active,
                days_remaining=days_remaining
            )

        except Exception as e:
            logger.error(f'Failed to get subscription status: {e}')
            return SubscriptionStatus(status='none', is_active=False)

    async def has_used_trial(self, user_id: str) -> bool:
        """
        ユーザーが過去にトライアルを使用したかチェック

        Args:
            user_id: ユーザーID

        Returns:
            bool: トライアル使用済みかどうか
        """
        try:
            # トライアルを開始したことがあるかチェック（ステータス問わず）
            result = self.supabase.table('subscriptions').select('id').eq('user_id', user_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f'Failed to check trial history: {e}')
            return False

    async def start_trial(self, user_id: str) -> tuple[SubscriptionStatus, str]:
        """
        トライアルを開始

        Args:
            user_id: ユーザーID

        Returns:
            tuple[SubscriptionStatus, str]: (トライアル状態, エラーメッセージ)
        """
        try:
            # 既存のサブスクリプションをチェック
            existing = await self.get_subscription_status(user_id)
            if existing.status != 'none':
                if existing.is_active:
                    return existing, ''
                else:
                    # 過去にトライアルまたはサブスクがあった場合
                    return existing, 'トライアルは一度のみご利用いただけます。有料プランをご検討ください。'

            # 過去にトライアルを使用したかチェック
            if await self.has_used_trial(user_id):
                return SubscriptionStatus(status='expired', is_active=False), 'トライアルは一度のみご利用いただけます。有料プランをご検討ください。'

            # トライアル日数を取得
            settings_result = self.supabase.table('app_settings').select('value').eq('key', 'trial_days').single().execute()
            trial_days = int(settings_result.data['value']) if settings_result.data else 7

            now = datetime.now(tz=timezone.utc)
            trial_end = now + timedelta(days=trial_days)

            # サブスクリプション作成
            result = self.supabase.table('subscriptions').insert({
                'user_id': user_id,
                'status': 'trialing',
                'trial_start': now.isoformat(),
                'trial_end': trial_end.isoformat()
            }).execute()

            if result.data:
                return SubscriptionStatus(
                    status='trialing',
                    trial_end=trial_end,
                    is_active=True,
                    days_remaining=trial_days
                ), ''

            return SubscriptionStatus(status='none', is_active=False), 'トライアルの開始に失敗しました'

        except Exception as e:
            logger.error(f'Failed to start trial: {e}')
            return SubscriptionStatus(status='none', is_active=False), 'トライアルの開始に失敗しました'

    async def log_usage(
        self,
        user_id: str,
        action: str,
        metadata: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """
        利用ログを記録

        Args:
            user_id: ユーザーID
            action: アクション（search, analyze, export）
            metadata: メタデータ
            ip_address: IPアドレス
            user_agent: ユーザーエージェント

        Returns:
            bool: 成功したかどうか
        """
        try:
            self.supabase.table('usage_logs').insert({
                'user_id': user_id,
                'action': action,
                'metadata': metadata,
                'ip_address': ip_address,
                'user_agent': user_agent
            }).execute()
            return True

        except Exception as e:
            logger.error(f'Failed to log usage: {e}')
            return False


# シングルトンインスタンス
_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    """認証サービスのシングルトンインスタンスを取得"""
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
