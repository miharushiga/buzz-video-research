"""
サブスクリプションサービス - バズ動画リサーチくん

サブスクリプションの管理とPayPal連携
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from pydantic import BaseModel
from supabase import Client

from app.core.supabase import get_supabase_admin
from app.services.paypal_service import get_paypal_service, PayPalService


logger = logging.getLogger(__name__)


class SubscriptionInfo(BaseModel):
    """サブスクリプション情報"""
    id: str
    user_id: str
    status: str
    paypal_subscription_id: Optional[str] = None
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    price_amount: int = 9900
    cancel_at_period_end: bool = False


class CreateSubscriptionResult(BaseModel):
    """サブスクリプション作成結果"""
    success: bool
    subscription_id: Optional[str] = None
    approval_url: Optional[str] = None
    error: Optional[str] = None


class SubscriptionService:
    """サブスクリプションサービスクラス"""

    def __init__(
        self,
        supabase: Optional[Client] = None,
        paypal: Optional[PayPalService] = None
    ):
        self.supabase = supabase or get_supabase_admin()
        self.paypal = paypal or get_paypal_service()

    async def get_subscription(self, user_id: str) -> Optional[SubscriptionInfo]:
        """
        ユーザーのサブスクリプションを取得

        Args:
            user_id: ユーザーID

        Returns:
            SubscriptionInfo: サブスクリプション情報
        """
        try:
            result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()

            if not result.data:
                return None

            sub = result.data[0]
            return SubscriptionInfo(
                id=sub['id'],
                user_id=sub['user_id'],
                status=sub['status'],
                paypal_subscription_id=sub.get('paypal_subscription_id'),
                trial_end=datetime.fromisoformat(sub['trial_end'].replace('Z', '+00:00')) if sub.get('trial_end') else None,
                current_period_end=datetime.fromisoformat(sub['current_period_end'].replace('Z', '+00:00')) if sub.get('current_period_end') else None,
                price_amount=sub.get('price_amount', 9900),
                cancel_at_period_end=sub.get('cancel_at_period_end', False),
            )

        except Exception as e:
            logger.error(f'Failed to get subscription: {e}')
            return None

    async def create_paypal_subscription(
        self,
        user_id: str,
        return_url: str,
        cancel_url: str
    ) -> CreateSubscriptionResult:
        """
        PayPalサブスクリプションを作成

        Args:
            user_id: ユーザーID
            return_url: 決済完了後のリダイレクトURL
            cancel_url: 決済キャンセル時のリダイレクトURL

        Returns:
            CreateSubscriptionResult: 作成結果
        """
        try:
            # PayPalでサブスクリプション作成
            paypal_sub = await self.paypal.create_subscription(return_url, cancel_url)

            # 承認URLを取得
            approval_url = None
            for link in paypal_sub.get('links', []):
                if link.get('rel') == 'approve':
                    approval_url = link.get('href')
                    break

            if not approval_url:
                return CreateSubscriptionResult(
                    success=False,
                    error='承認URLが取得できませんでした'
                )

            # DBにサブスクリプション（pending状態）を作成
            result = self.supabase.table('subscriptions').insert({
                'user_id': user_id,
                'paypal_subscription_id': paypal_sub['id'],
                'status': 'pending',
            }).execute()

            if not result.data:
                return CreateSubscriptionResult(
                    success=False,
                    error='サブスクリプションの作成に失敗しました'
                )

            return CreateSubscriptionResult(
                success=True,
                subscription_id=result.data[0]['id'],
                approval_url=approval_url,
            )

        except Exception as e:
            logger.error(f'Failed to create PayPal subscription: {e}')
            return CreateSubscriptionResult(
                success=False,
                error=str(e)
            )

    async def activate_subscription(self, paypal_subscription_id: str) -> bool:
        """
        サブスクリプションをアクティブ化（PayPal決済完了後）

        Args:
            paypal_subscription_id: PayPalサブスクリプションID

        Returns:
            bool: 成功したかどうか
        """
        try:
            # PayPalからサブスクリプション情報を取得
            paypal_sub = await self.paypal.get_subscription(paypal_subscription_id)

            if paypal_sub.status != 'ACTIVE':
                logger.warning(f'PayPal subscription is not active: {paypal_sub.status}')
                return False

            # 次回請求日を計算（月次）
            now = datetime.now(tz=timezone.utc)
            current_period_end = now + timedelta(days=30)

            # DBを更新
            result = self.supabase.table('subscriptions').update({
                'status': 'active',
                'current_period_start': now.isoformat(),
                'current_period_end': current_period_end.isoformat(),
            }).eq('paypal_subscription_id', paypal_subscription_id).execute()

            if not result.data:
                logger.error('Failed to update subscription in DB')
                return False

            # 支払い履歴を記録
            sub = result.data[0]
            self.supabase.table('payment_history').insert({
                'subscription_id': sub['id'],
                'user_id': sub['user_id'],
                'paypal_payment_id': paypal_subscription_id,
                'amount': sub.get('price_amount', 9900),
                'status': 'completed',
                'paid_at': now.isoformat(),
            }).execute()

            return True

        except Exception as e:
            logger.error(f'Failed to activate subscription: {e}')
            return False

    async def cancel_subscription(self, user_id: str, reason: str = '') -> bool:
        """
        サブスクリプションをキャンセル

        Args:
            user_id: ユーザーID
            reason: キャンセル理由

        Returns:
            bool: 成功したかどうか
        """
        try:
            # 現在のサブスクリプションを取得
            sub = await self.get_subscription(user_id)
            if not sub or sub.status not in ('active', 'trialing'):
                return False

            # PayPalサブスクリプションがある場合はキャンセル
            if sub.paypal_subscription_id:
                await self.paypal.cancel_subscription(sub.paypal_subscription_id, reason)

            # DBを更新（期間終了時にキャンセル）
            self.supabase.table('subscriptions').update({
                'cancel_at_period_end': True,
                'cancelled_at': datetime.now(tz=timezone.utc).isoformat(),
            }).eq('id', sub.id).execute()

            return True

        except Exception as e:
            logger.error(f'Failed to cancel subscription: {e}')
            return False

    async def handle_payment_success(self, paypal_subscription_id: str, payment_data: dict) -> bool:
        """
        支払い成功時の処理（Webhook用）

        Args:
            paypal_subscription_id: PayPalサブスクリプションID
            payment_data: 支払いデータ

        Returns:
            bool: 成功したかどうか
        """
        try:
            # サブスクリプションを取得
            result = self.supabase.table('subscriptions').select('*').eq('paypal_subscription_id', paypal_subscription_id).single().execute()

            if not result.data:
                logger.error(f'Subscription not found: {paypal_subscription_id}')
                return False

            sub = result.data
            now = datetime.now(tz=timezone.utc)

            # 期間を延長
            current_period_end = now + timedelta(days=30)

            self.supabase.table('subscriptions').update({
                'status': 'active',
                'current_period_start': now.isoformat(),
                'current_period_end': current_period_end.isoformat(),
                'cancel_at_period_end': False,
            }).eq('id', sub['id']).execute()

            # 支払い履歴を記録
            amount = payment_data.get('amount', {}).get('value', '9900')
            self.supabase.table('payment_history').insert({
                'subscription_id': sub['id'],
                'user_id': sub['user_id'],
                'paypal_payment_id': payment_data.get('id', ''),
                'amount': int(float(amount)),
                'status': 'completed',
                'paid_at': now.isoformat(),
            }).execute()

            return True

        except Exception as e:
            logger.error(f'Failed to handle payment success: {e}')
            return False

    async def handle_subscription_cancelled(self, paypal_subscription_id: str) -> bool:
        """
        サブスクリプションキャンセル時の処理（Webhook用）

        Args:
            paypal_subscription_id: PayPalサブスクリプションID

        Returns:
            bool: 成功したかどうか
        """
        try:
            self.supabase.table('subscriptions').update({
                'status': 'cancelled',
                'cancelled_at': datetime.now(tz=timezone.utc).isoformat(),
            }).eq('paypal_subscription_id', paypal_subscription_id).execute()

            return True

        except Exception as e:
            logger.error(f'Failed to handle subscription cancelled: {e}')
            return False

    async def check_expired_subscriptions(self) -> int:
        """
        期限切れサブスクリプションをチェック（バッチ処理用）

        Returns:
            int: 更新したサブスクリプション数
        """
        try:
            now = datetime.now(tz=timezone.utc)

            # トライアル期限切れ
            self.supabase.table('subscriptions').update({
                'status': 'expired'
            }).eq('status', 'trialing').lt('trial_end', now.isoformat()).execute()

            # サブスクリプション期限切れ（キャンセル予約済み）
            self.supabase.table('subscriptions').update({
                'status': 'expired'
            }).eq('status', 'active').eq('cancel_at_period_end', True).lt('current_period_end', now.isoformat()).execute()

            return 0  # 実際の更新数を返すにはカウントが必要

        except Exception as e:
            logger.error(f'Failed to check expired subscriptions: {e}')
            return 0


# シングルトンインスタンス
_subscription_service: Optional[SubscriptionService] = None


def get_subscription_service() -> SubscriptionService:
    """サブスクリプションサービスのシングルトンインスタンスを取得"""
    global _subscription_service
    if _subscription_service is None:
        _subscription_service = SubscriptionService()
    return _subscription_service
