"""
管理者サービス - バズ動画リサーチくん

管理者向けの統計・ユーザー管理機能
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from pydantic import BaseModel
from supabase import Client

from app.core.supabase import get_supabase_admin


logger = logging.getLogger(__name__)


class DashboardStats(BaseModel):
    """ダッシュボード統計"""
    total_users: int
    active_subscribers: int
    trialing_users: int
    monthly_revenue: int
    total_searches: int
    total_analyses: int
    users_today: int
    searches_today: int


class UserListItem(BaseModel):
    """ユーザー一覧アイテム"""
    id: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool
    created_at: datetime
    subscription_status: Optional[str] = None
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None


class UserDetail(BaseModel):
    """ユーザー詳細"""
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool
    created_at: datetime
    subscription_status: Optional[str] = None
    trial_end: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    total_searches: int
    total_analyses: int
    last_activity: Optional[datetime] = None


class AppSettings(BaseModel):
    """アプリ設定"""
    trial_days: int
    monthly_price: int
    admin_email: str


class AdminService:
    """管理者サービスクラス"""

    def __init__(self, supabase: Optional[Client] = None):
        self.supabase = supabase or get_supabase_admin()

    async def get_dashboard_stats(self) -> DashboardStats:
        """
        ダッシュボード統計を取得

        Returns:
            DashboardStats: 統計情報
        """
        try:
            now = datetime.now(tz=timezone.utc)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

            # 総ユーザー数
            total_users_result = self.supabase.table('profiles').select('id', count='exact').execute()
            total_users = total_users_result.count or 0

            # アクティブなサブスクライバー数
            active_subs_result = self.supabase.table('subscriptions').select('id', count='exact').eq('status', 'active').execute()
            active_subscribers = active_subs_result.count or 0

            # トライアル中ユーザー数
            trialing_result = self.supabase.table('subscriptions').select('id', count='exact').eq('status', 'trialing').gt('trial_end', now.isoformat()).execute()
            trialing_users = trialing_result.count or 0

            # 今月の売上
            revenue_result = self.supabase.table('payment_history').select('amount').eq('status', 'completed').gte('paid_at', month_start.isoformat()).execute()
            monthly_revenue = sum(p['amount'] for p in revenue_result.data) if revenue_result.data else 0

            # 総検索数
            searches_result = self.supabase.table('usage_logs').select('id', count='exact').eq('action', 'search').execute()
            total_searches = searches_result.count or 0

            # 総分析数
            analyses_result = self.supabase.table('usage_logs').select('id', count='exact').eq('action', 'analyze').execute()
            total_analyses = analyses_result.count or 0

            # 今日の新規ユーザー
            users_today_result = self.supabase.table('profiles').select('id', count='exact').gte('created_at', today_start.isoformat()).execute()
            users_today = users_today_result.count or 0

            # 今日の検索数
            searches_today_result = self.supabase.table('usage_logs').select('id', count='exact').eq('action', 'search').gte('created_at', today_start.isoformat()).execute()
            searches_today = searches_today_result.count or 0

            return DashboardStats(
                total_users=total_users,
                active_subscribers=active_subscribers,
                trialing_users=trialing_users,
                monthly_revenue=monthly_revenue,
                total_searches=total_searches,
                total_analyses=total_analyses,
                users_today=users_today,
                searches_today=searches_today,
            )

        except Exception as e:
            logger.error(f'Failed to get dashboard stats: {e}')
            return DashboardStats(
                total_users=0,
                active_subscribers=0,
                trialing_users=0,
                monthly_revenue=0,
                total_searches=0,
                total_analyses=0,
                users_today=0,
                searches_today=0,
            )

    async def get_users(
        self,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> tuple[List[UserListItem], int]:
        """
        ユーザー一覧を取得

        Args:
            page: ページ番号
            per_page: 1ページあたりの件数
            search: 検索クエリ
            status_filter: ステータスフィルター

        Returns:
            tuple: (ユーザーリスト, 総件数)
        """
        try:
            offset = (page - 1) * per_page

            # プロファイルを取得
            query = self.supabase.table('profiles').select('*', count='exact')

            if search:
                query = query.or_(f'email.ilike.%{search}%,full_name.ilike.%{search}%')

            query = query.order('created_at', desc=True).range(offset, offset + per_page - 1)
            profiles_result = query.execute()

            total = profiles_result.count or 0
            profiles = profiles_result.data or []

            # 各ユーザーのサブスクリプション状態を取得
            user_ids = [p['id'] for p in profiles]
            subs_result = self.supabase.table('subscriptions').select('*').in_('user_id', user_ids).execute()

            subs_by_user = {}
            for sub in subs_result.data or []:
                subs_by_user[sub['user_id']] = sub

            users = []
            for p in profiles:
                sub = subs_by_user.get(p['id'])

                # ステータスフィルター
                sub_status = sub['status'] if sub else 'none'
                if status_filter and sub_status != status_filter:
                    continue

                users.append(UserListItem(
                    id=p['id'],
                    email=p['email'],
                    full_name=p.get('full_name'),
                    is_admin=p.get('is_admin', False),
                    created_at=datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')),
                    subscription_status=sub_status,
                    trial_end=datetime.fromisoformat(sub['trial_end'].replace('Z', '+00:00')) if sub and sub.get('trial_end') else None,
                    current_period_end=datetime.fromisoformat(sub['current_period_end'].replace('Z', '+00:00')) if sub and sub.get('current_period_end') else None,
                ))

            return users, total

        except Exception as e:
            logger.error(f'Failed to get users: {e}')
            return [], 0

    async def get_user_detail(self, user_id: str) -> Optional[UserDetail]:
        """
        ユーザー詳細を取得

        Args:
            user_id: ユーザーID

        Returns:
            UserDetail: ユーザー詳細
        """
        try:
            # プロファイル取得
            profile_result = self.supabase.table('profiles').select('*').eq('id', user_id).single().execute()
            if not profile_result.data:
                return None

            p = profile_result.data

            # サブスクリプション取得
            sub_result = self.supabase.table('subscriptions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
            sub = sub_result.data[0] if sub_result.data else None

            # 利用統計
            searches_result = self.supabase.table('usage_logs').select('id', count='exact').eq('user_id', user_id).eq('action', 'search').execute()
            analyses_result = self.supabase.table('usage_logs').select('id', count='exact').eq('user_id', user_id).eq('action', 'analyze').execute()

            # 最終アクティビティ
            last_activity_result = self.supabase.table('usage_logs').select('created_at').eq('user_id', user_id).order('created_at', desc=True).limit(1).execute()
            last_activity = None
            if last_activity_result.data:
                last_activity = datetime.fromisoformat(last_activity_result.data[0]['created_at'].replace('Z', '+00:00'))

            return UserDetail(
                id=p['id'],
                email=p['email'],
                full_name=p.get('full_name'),
                avatar_url=p.get('avatar_url'),
                is_admin=p.get('is_admin', False),
                created_at=datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')),
                subscription_status=sub['status'] if sub else 'none',
                trial_end=datetime.fromisoformat(sub['trial_end'].replace('Z', '+00:00')) if sub and sub.get('trial_end') else None,
                current_period_end=datetime.fromisoformat(sub['current_period_end'].replace('Z', '+00:00')) if sub and sub.get('current_period_end') else None,
                total_searches=searches_result.count or 0,
                total_analyses=analyses_result.count or 0,
                last_activity=last_activity,
            )

        except Exception as e:
            logger.error(f'Failed to get user detail: {e}')
            return None

    async def update_user(
        self,
        user_id: str,
        is_admin: Optional[bool] = None,
        full_name: Optional[str] = None
    ) -> bool:
        """
        ユーザー情報を更新

        Args:
            user_id: ユーザーID
            is_admin: 管理者フラグ
            full_name: 名前

        Returns:
            bool: 成功したかどうか
        """
        try:
            update_data = {}
            if is_admin is not None:
                update_data['is_admin'] = is_admin
            if full_name is not None:
                update_data['full_name'] = full_name

            if not update_data:
                return True

            self.supabase.table('profiles').update(update_data).eq('id', user_id).execute()
            return True

        except Exception as e:
            logger.error(f'Failed to update user: {e}')
            return False

    async def get_settings(self) -> AppSettings:
        """
        アプリ設定を取得

        Returns:
            AppSettings: アプリ設定
        """
        try:
            result = self.supabase.table('app_settings').select('key, value').execute()

            settings_dict = {}
            for item in result.data or []:
                # JSONBの値をパース
                value = item['value']
                if isinstance(value, str):
                    try:
                        import json
                        value = json.loads(value)
                    except:
                        pass
                settings_dict[item['key']] = value

            return AppSettings(
                trial_days=int(settings_dict.get('trial_days', 7)),
                monthly_price=int(settings_dict.get('monthly_price', 9900)),
                admin_email=str(settings_dict.get('admin_email', 'bemdrt@gmail.com')),
            )

        except Exception as e:
            logger.error(f'Failed to get settings: {e}')
            return AppSettings(
                trial_days=7,
                monthly_price=9900,
                admin_email='bemdrt@gmail.com',
            )

    async def update_settings(self, settings: AppSettings) -> bool:
        """
        アプリ設定を更新

        Args:
            settings: 更新する設定

        Returns:
            bool: 成功したかどうか
        """
        try:
            import json

            updates = [
                ('trial_days', str(settings.trial_days)),
                ('monthly_price', str(settings.monthly_price)),
                ('admin_email', json.dumps(settings.admin_email)),
            ]

            for key, value in updates:
                self.supabase.table('app_settings').upsert({
                    'key': key,
                    'value': value,
                }).execute()

            return True

        except Exception as e:
            logger.error(f'Failed to update settings: {e}')
            return False


# シングルトンインスタンス
_admin_service: Optional[AdminService] = None


def get_admin_service() -> AdminService:
    """管理者サービスのシングルトンインスタンスを取得"""
    global _admin_service
    if _admin_service is None:
        _admin_service = AdminService()
    return _admin_service
