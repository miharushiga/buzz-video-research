"""
サービス層 - バズり動画究極リサーチシステム

ビジネスロジックをここで実装
"""

from app.services.youtube_service import (
    YouTubeAPIError,
    YouTubeAPIKeyError,
    YouTubeQuotaExceededError,
    YouTubeService,
    close_youtube_service,
    get_youtube_service,
)
from app.services.auth_service import AuthService, get_auth_service
from app.services.subscription_service import SubscriptionService, get_subscription_service
from app.services.paypal_service import PayPalService, get_paypal_service
from app.services.admin_service import AdminService, get_admin_service

__all__ = [
    # YouTube
    'YouTubeService',
    'YouTubeAPIError',
    'YouTubeAPIKeyError',
    'YouTubeQuotaExceededError',
    'get_youtube_service',
    'close_youtube_service',
    # Auth
    'AuthService',
    'get_auth_service',
    # Subscription
    'SubscriptionService',
    'get_subscription_service',
    # PayPal
    'PayPalService',
    'get_paypal_service',
    # Admin
    'AdminService',
    'get_admin_service',
]
