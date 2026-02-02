"""
サブスクリプションルーター - バズ動画リサーチくん

サブスクリプション管理のAPIエンドポイント
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.core.security import UserInfo
from app.services.subscription_service import (
    get_subscription_service,
    SubscriptionService,
    SubscriptionInfo,
)


router = APIRouter(prefix='/api/subscription', tags=['サブスクリプション'])


class CreateSubscriptionRequest(BaseModel):
    """サブスクリプション作成リクエスト"""
    return_url: str
    cancel_url: str


class CreateSubscriptionResponse(BaseModel):
    """サブスクリプション作成レスポンス"""
    success: bool
    subscription_id: Optional[str] = None
    approval_url: Optional[str] = None
    error: Optional[str] = None


class SubscriptionStatusResponse(BaseModel):
    """サブスクリプション状態レスポンス"""
    has_subscription: bool
    subscription: Optional[SubscriptionInfo] = None


class CancelSubscriptionRequest(BaseModel):
    """サブスクリプションキャンセルリクエスト"""
    reason: Optional[str] = None


@router.get('/status', response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    user: UserInfo = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    サブスクリプション状態を取得

    Returns:
        SubscriptionStatusResponse: サブスクリプション状態
    """
    subscription = await service.get_subscription(user.id)

    return SubscriptionStatusResponse(
        has_subscription=subscription is not None,
        subscription=subscription
    )


@router.post('/create', response_model=CreateSubscriptionResponse)
async def create_subscription(
    request: CreateSubscriptionRequest,
    user: UserInfo = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    PayPalサブスクリプションを作成

    Args:
        request: 作成リクエスト（リダイレクトURL）

    Returns:
        CreateSubscriptionResponse: 作成結果（承認URL）
    """
    # 既存のアクティブなサブスクリプションをチェック
    existing = await service.get_subscription(user.id)
    if existing and existing.status in ('active', 'trialing'):
        return CreateSubscriptionResponse(
            success=False,
            error='既にアクティブなサブスクリプションがあります'
        )

    result = await service.create_paypal_subscription(
        user_id=user.id,
        return_url=request.return_url,
        cancel_url=request.cancel_url,
    )

    return CreateSubscriptionResponse(
        success=result.success,
        subscription_id=result.subscription_id,
        approval_url=result.approval_url,
        error=result.error,
    )


@router.post('/activate')
async def activate_subscription(
    paypal_subscription_id: str,
    user: UserInfo = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    サブスクリプションをアクティブ化（PayPal決済完了後に呼び出し）

    Args:
        paypal_subscription_id: PayPalサブスクリプションID

    Returns:
        dict: 結果
    """
    success = await service.activate_subscription(paypal_subscription_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='サブスクリプションのアクティブ化に失敗しました'
        )

    return {'success': True, 'message': 'サブスクリプションがアクティブになりました'}


@router.post('/cancel')
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    user: UserInfo = Depends(get_current_user),
    service: SubscriptionService = Depends(get_subscription_service)
):
    """
    サブスクリプションをキャンセル

    Args:
        request: キャンセルリクエスト

    Returns:
        dict: 結果
    """
    success = await service.cancel_subscription(user.id, request.reason or '')

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='サブスクリプションのキャンセルに失敗しました'
        )

    return {
        'success': True,
        'message': '現在の請求期間終了時にサブスクリプションがキャンセルされます'
    }
