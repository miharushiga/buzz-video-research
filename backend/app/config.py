"""
環境変数管理 - バズり動画究極リサーチシステム

.env.local（プロジェクトルート）から環境変数を読み込み
"""

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """アプリケーション設定"""

    # YouTube API
    youtube_api_key: str

    # Claude API（バズ要因分析用）
    anthropic_api_key: str = ''

    # Supabase
    supabase_url: str = ''
    supabase_anon_key: str = ''
    supabase_service_role_key: str = ''
    supabase_jwt_secret: str = ''

    # PayPal
    paypal_client_id: str = ''
    paypal_client_secret: str = ''
    paypal_api_url: str = 'https://api-m.sandbox.paypal.com'
    paypal_plan_id: str = ''
    paypal_webhook_id: str = ''

    # アプリケーション設定
    node_env: str = 'development'

    # 社内モード（認証・課金なし）
    internal_mode: bool = False

    # ポート設定（CLAUDE.md準拠）
    backend_port: int = 8433
    frontend_port: int = 3248

    # CORS設定
    cors_origin: str = 'http://localhost:3248'

    class Config:
        """Pydantic設定"""

        # .env.local はプロジェクトルートに配置
        # config.py -> app/ -> backend/ -> プロジェクトルート
        env_file = str(Path(__file__).parent.parent.parent / '.env.local')
        env_file_encoding = 'utf-8'
        case_sensitive = False
        extra = 'ignore'  # VITE_* 等のフロントエンド専用変数を無視

    @property
    def is_development(self) -> bool:
        """開発環境かどうかを判定"""
        return self.node_env == 'development'

    @property
    def cors_origins(self) -> list[str]:
        """CORS許可オリジンのリストを返す"""
        # カンマ区切りで複数オリジンをサポート
        origins = [o.strip() for o in self.cors_origin.split(',') if o.strip()]
        # 開発環境では localhost のバリエーションも許可
        if self.is_development:
            origins.extend([
                f'http://localhost:{self.frontend_port}',
                f'http://127.0.0.1:{self.frontend_port}',
            ])
        return list(set(origins))


@lru_cache()
def get_settings() -> Settings:
    """
    設定のシングルトンインスタンスを取得

    Returns:
        Settings: アプリケーション設定
    """
    return Settings()


# 設定インスタンスのエクスポート
settings = get_settings()
