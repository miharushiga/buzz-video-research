"""
Supabase クライアント - バズ動画リサーチくん

Supabase への接続を管理するモジュール
"""

from functools import lru_cache
from typing import Optional

from supabase import create_client, Client


class SupabaseClientManager:
    """Supabase クライアント管理クラス"""

    _client: Optional[Client] = None
    _admin_client: Optional[Client] = None

    @classmethod
    def get_client(cls, url: str, anon_key: str) -> Client:
        """
        匿名キーを使用したSupabaseクライアントを取得

        Args:
            url: Supabase URL
            anon_key: 匿名キー

        Returns:
            Client: Supabaseクライアント
        """
        if cls._client is None:
            cls._client = create_client(url, anon_key)
        return cls._client

    @classmethod
    def get_admin_client(cls, url: str, service_role_key: str) -> Client:
        """
        サービスロールキーを使用したSupabaseクライアントを取得（管理者用）

        Args:
            url: Supabase URL
            service_role_key: サービスロールキー

        Returns:
            Client: Supabaseクライアント（管理者権限）
        """
        if cls._admin_client is None:
            cls._admin_client = create_client(url, service_role_key)
        return cls._admin_client

    @classmethod
    def reset(cls) -> None:
        """クライアントをリセット（テスト用）"""
        cls._client = None
        cls._admin_client = None


@lru_cache()
def get_supabase_client() -> Client:
    """
    Supabaseクライアントを取得（Dependency Injection用）

    Returns:
        Client: Supabaseクライアント
    """
    from app.config import settings

    return SupabaseClientManager.get_client(
        settings.supabase_url,
        settings.supabase_anon_key
    )


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Supabase管理者クライアントを取得（Webhook・バッチ処理用）

    Returns:
        Client: Supabaseクライアント（管理者権限）
    """
    from app.config import settings

    return SupabaseClientManager.get_admin_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )
