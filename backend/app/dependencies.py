"""
依存性注入 - バズ動画リサーチくん

FastAPI Dependency Injection
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import verify_token, get_current_user as _get_current_user, UserInfo


# HTTPベアラー認証スキーム
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserInfo:
    """
    認証必須のエンドポイント用依存性

    Args:
        credentials: HTTPベアラー認証情報

    Returns:
        UserInfo: 認証済みユーザー情報

    Raises:
        HTTPException: 認証失敗時
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='認証が必要です',
            headers={'WWW-Authenticate': 'Bearer'}
        )

    return await _get_current_user(credentials.credentials)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserInfo]:
    """
    認証任意のエンドポイント用依存性

    Args:
        credentials: HTTPベアラー認証情報

    Returns:
        Optional[UserInfo]: 認証済みユーザー情報（未認証時はNone）
    """
    if not credentials:
        return None

    try:
        return await _get_current_user(credentials.credentials)
    except HTTPException:
        return None


async def require_admin(user: UserInfo = Depends(get_current_user)) -> UserInfo:
    """
    管理者権限必須のエンドポイント用依存性

    Args:
        user: 認証済みユーザー

    Returns:
        UserInfo: 管理者ユーザー情報

    Raises:
        HTTPException: 管理者でない場合
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='管理者権限が必要です'
        )

    return user


async def require_active_subscription(user: UserInfo = Depends(get_current_user)) -> UserInfo:
    """
    アクティブなサブスクリプション必須のエンドポイント用依存性

    Args:
        user: 認証済みユーザー

    Returns:
        UserInfo: サブスクリプションがアクティブなユーザー

    Raises:
        HTTPException: サブスクリプションがアクティブでない場合
    """
    from app.services.auth_service import get_auth_service

    auth_service = get_auth_service()
    subscription = await auth_service.get_subscription_status(user.id)

    if not subscription.is_active:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail='有効なサブスクリプションが必要です',
            headers={'X-Subscription-Status': subscription.status}
        )

    return user
