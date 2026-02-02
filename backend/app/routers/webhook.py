"""
Webhookルーター - バズ動画リサーチくん

PayPal Webhookの処理
"""

import logging
import json

from fastapi import APIRouter, Request, HTTPException, status

from app.services.paypal_service import get_paypal_service
from app.services.subscription_service import get_subscription_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix='/api/webhook', tags=['Webhook'])


@router.post('/paypal')
async def paypal_webhook(request: Request):
    """
    PayPal Webhookエンドポイント

    PayPalからの通知を受け取り、サブスクリプション状態を更新
    """
    # リクエストボディを取得
    body = await request.body()

    # ヘッダーを取得
    headers = {
        'PAYPAL-AUTH-ALGO': request.headers.get('PAYPAL-AUTH-ALGO', ''),
        'PAYPAL-CERT-URL': request.headers.get('PAYPAL-CERT-URL', ''),
        'PAYPAL-TRANSMISSION-ID': request.headers.get('PAYPAL-TRANSMISSION-ID', ''),
        'PAYPAL-TRANSMISSION-SIG': request.headers.get('PAYPAL-TRANSMISSION-SIG', ''),
        'PAYPAL-TRANSMISSION-TIME': request.headers.get('PAYPAL-TRANSMISSION-TIME', ''),
    }

    # 署名を検証
    paypal_service = get_paypal_service()
    is_valid = await paypal_service.verify_webhook_signature(headers, body)

    if not is_valid:
        logger.warning('Invalid PayPal webhook signature')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid webhook signature'
        )

    # イベントをパース
    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        logger.error('Failed to parse webhook body')
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Invalid JSON body'
        )

    event_type = event.get('event_type', '')
    resource = event.get('resource', {})

    logger.info(f'Received PayPal webhook: {event_type}')

    subscription_service = get_subscription_service()

    # イベントタイプに応じた処理
    if event_type == 'BILLING.SUBSCRIPTION.ACTIVATED':
        # サブスクリプションがアクティブ化された
        subscription_id = resource.get('id')
        if subscription_id:
            await subscription_service.activate_subscription(subscription_id)

    elif event_type == 'BILLING.SUBSCRIPTION.CANCELLED':
        # サブスクリプションがキャンセルされた
        subscription_id = resource.get('id')
        if subscription_id:
            await subscription_service.handle_subscription_cancelled(subscription_id)

    elif event_type == 'BILLING.SUBSCRIPTION.EXPIRED':
        # サブスクリプションが期限切れ
        subscription_id = resource.get('id')
        if subscription_id:
            await subscription_service.handle_subscription_cancelled(subscription_id)

    elif event_type == 'BILLING.SUBSCRIPTION.SUSPENDED':
        # サブスクリプションが一時停止
        subscription_id = resource.get('id')
        if subscription_id:
            await subscription_service.handle_subscription_cancelled(subscription_id)

    elif event_type == 'PAYMENT.SALE.COMPLETED':
        # 支払いが完了
        billing_agreement_id = resource.get('billing_agreement_id')
        if billing_agreement_id:
            await subscription_service.handle_payment_success(
                billing_agreement_id,
                resource
            )

    elif event_type == 'PAYMENT.SALE.DENIED':
        # 支払いが拒否された
        logger.warning(f'Payment denied: {resource}')

    elif event_type == 'PAYMENT.SALE.REFUNDED':
        # 返金された
        logger.info(f'Payment refunded: {resource}')

    else:
        logger.info(f'Unhandled webhook event type: {event_type}')

    return {'status': 'ok'}
