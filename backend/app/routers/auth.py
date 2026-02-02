"""
認証ルーター - バズ動画リサーチくん

認証関連のAPIエンドポイント
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_current_user, get_optional_user
from app.core.security import UserInfo
from app.services.auth_service import (
    get_auth_service,
    AuthService,
    UserProfile,
    SubscriptionStatus
)


router = APIRouter(prefix='/api/auth', tags=['認証'])


class ProfileResponse(BaseModel):
    """プロファイルレスポンス"""
    profile: UserProfile
    subscription: SubscriptionStatus


class ProfileUpdateRequest(BaseModel):
    """プロファイル更新リクエスト"""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class TrialStartResponse(BaseModel):
    """トライアル開始レスポンス"""
    success: bool
    subscription: SubscriptionStatus
    message: str


@router.get('/me', response_model=ProfileResponse)
async def get_my_profile(
    user: UserInfo = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    自分のプロファイルを取得

    Returns:
        ProfileResponse: プロファイルとサブスクリプション状態
    """
    profile = await auth_service.get_profile(user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='プロファイルが見つかりません'
        )

    subscription = await auth_service.get_subscription_status(user.id)

    return ProfileResponse(profile=profile, subscription=subscription)


@router.put('/me', response_model=ProfileResponse)
async def update_my_profile(
    request: ProfileUpdateRequest,
    user: UserInfo = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    自分のプロファイルを更新

    Args:
        request: 更新内容

    Returns:
        ProfileResponse: 更新後のプロファイル
    """
    profile = await auth_service.update_profile(
        user.id,
        full_name=request.full_name,
        avatar_url=request.avatar_url
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='プロファイルの更新に失敗しました'
        )

    subscription = await auth_service.get_subscription_status(user.id)

    return ProfileResponse(profile=profile, subscription=subscription)


@router.get('/subscription', response_model=SubscriptionStatus)
async def get_my_subscription(
    user: UserInfo = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    サブスクリプション状態を取得

    Returns:
        SubscriptionStatus: サブスクリプション状態
    """
    return await auth_service.get_subscription_status(user.id)


@router.post('/trial/start', response_model=TrialStartResponse)
async def start_trial(
    user: UserInfo = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    無料トライアルを開始

    Returns:
        TrialStartResponse: トライアル開始結果
    """
    # 既存のサブスクリプションをチェック
    existing = await auth_service.get_subscription_status(user.id)
    if existing.status != 'none':
        return TrialStartResponse(
            success=False,
            subscription=existing,
            message='既にサブスクリプションが存在します'
        )

    # トライアル開始
    subscription = await auth_service.start_trial(user.id)

    if subscription.status == 'trialing':
        return TrialStartResponse(
            success=True,
            subscription=subscription,
            message=f'{subscription.days_remaining}日間の無料トライアルを開始しました'
        )

    return TrialStartResponse(
        success=False,
        subscription=subscription,
        message='トライアルの開始に失敗しました'
    )


@router.get('/check')
async def check_auth(user: Optional[UserInfo] = Depends(get_optional_user)):
    """
    認証状態をチェック（トークンなしでも呼び出し可能）

    Returns:
        dict: 認証状態
    """
    if user:
        return {
            'authenticated': True,
            'user_id': user.id,
            'email': user.email,
            'is_admin': user.is_admin
        }

    return {'authenticated': False}
