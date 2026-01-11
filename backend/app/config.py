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

    # アプリケーション設定
    node_env: str = 'development'

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
        origins = [self.cors_origin]
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
