"""
APIルーター - バズり動画究極リサーチシステム

各エンドポイントのルーターをここでエクスポート
"""

from app.routers.health import router as health_router
from app.routers.search import router as search_router
from app.routers.analyze import router as analyze_router
from app.routers.auth import router as auth_router
from app.routers.subscription import router as subscription_router
from app.routers.webhook import router as webhook_router
from app.routers.admin import router as admin_router

__all__: list[str] = [
    'health_router',
    'search_router',
    'analyze_router',
    'auth_router',
    'subscription_router',
    'webhook_router',
    'admin_router',
]
