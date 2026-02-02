"""
APIルーター - バズり動画究極リサーチシステム

各エンドポイントのルーターをここでエクスポート
"""

from app.routers.health import router as health_router
from app.routers.search import router as search_router
from app.routers.analyze import router as analyze_router

__all__: list[str] = ['health_router', 'search_router', 'analyze_router']
