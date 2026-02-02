"""
PayPal サービス - バズ動画リサーチくん

PayPal Subscriptions API との連携
"""

import logging
from datetime import datetime, timezone
from typing import Optional
import base64

import httpx
from pydantic import BaseModel

from app.config import settings


logger = logging.getLogger(__name__)


class PayPalAccessToken(BaseModel):
    """PayPalアクセストークン"""
    access_token: str
    token_type: str
    expires_in: int


class PayPalSubscription(BaseModel):
    """PayPalサブスクリプション情報"""
    id: str
    status: str
    plan_id: str
    subscriber_email: Optional[str] = None
    start_time: Optional[str] = None
    billing_info: Optional[dict] = None


class PayPalWebhookEvent(BaseModel):
    """PayPal Webhookイベント"""
    id: str
    event_type: str
    resource_type: str
    resource: dict
    create_time: str


class PayPalService:
    """PayPalサービスクラス"""

    def __init__(self):
        self.base_url = settings.paypal_api_url
        self.client_id = settings.paypal_client_id
        self.client_secret = settings.paypal_client_secret
        self.plan_id = settings.paypal_plan_id
        self._access_token: Optional[str] = None
        self._token_expires: Optional[datetime] = None

    async def _get_access_token(self) -> str:
        """アクセストークンを取得（キャッシュ対応）"""
        now = datetime.now(tz=timezone.utc)

        # キャッシュされたトークンが有効な場合は再利用
        if self._access_token and self._token_expires and self._token_expires > now:
            return self._access_token

        # 新しいトークンを取得
        credentials = base64.b64encode(
            f'{self.client_id}:{self.client_secret}'.encode()
        ).decode()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{self.base_url}/v1/oauth2/token',
                headers={
                    'Authorization': f'Basic {credentials}',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data={'grant_type': 'client_credentials'},
            )

            if response.status_code != 200:
                logger.error(f'Failed to get PayPal access token: {response.text}')
                raise Exception('PayPalアクセストークンの取得に失敗しました')

            data = response.json()
            self._access_token = data['access_token']
            # 有効期限を設定（少し余裕を持たせる）
            self._token_expires = now.replace(second=now.second + data['expires_in'] - 60)

            return self._access_token

    async def create_subscription(self, return_url: str, cancel_url: str) -> dict:
        """
        サブスクリプションを作成

        Args:
            return_url: 決済完了後のリダイレクトURL
            cancel_url: 決済キャンセル時のリダイレクトURL

        Returns:
            dict: 作成されたサブスクリプション情報
        """
        access_token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{self.base_url}/v1/billing/subscriptions',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json',
                },
                json={
                    'plan_id': self.plan_id,
                    'application_context': {
                        'brand_name': 'バズ動画リサーチくん',
                        'locale': 'ja-JP',
                        'shipping_preference': 'NO_SHIPPING',
                        'user_action': 'SUBSCRIBE_NOW',
                        'return_url': return_url,
                        'cancel_url': cancel_url,
                    },
                },
            )

            if response.status_code not in (200, 201):
                logger.error(f'Failed to create subscription: {response.text}')
                raise Exception('サブスクリプションの作成に失敗しました')

            return response.json()

    async def get_subscription(self, subscription_id: str) -> PayPalSubscription:
        """
        サブスクリプション情報を取得

        Args:
            subscription_id: サブスクリプションID

        Returns:
            PayPalSubscription: サブスクリプション情報
        """
        access_token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f'{self.base_url}/v1/billing/subscriptions/{subscription_id}',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json',
                },
            )

            if response.status_code != 200:
                logger.error(f'Failed to get subscription: {response.text}')
                raise Exception('サブスクリプション情報の取得に失敗しました')

            data = response.json()
            return PayPalSubscription(
                id=data['id'],
                status=data['status'],
                plan_id=data['plan_id'],
                subscriber_email=data.get('subscriber', {}).get('email_address'),
                start_time=data.get('start_time'),
                billing_info=data.get('billing_info'),
            )

    async def cancel_subscription(self, subscription_id: str, reason: str = '') -> bool:
        """
        サブスクリプションをキャンセル

        Args:
            subscription_id: サブスクリプションID
            reason: キャンセル理由

        Returns:
            bool: 成功したかどうか
        """
        access_token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json',
                },
                json={'reason': reason},
            )

            if response.status_code != 204:
                logger.error(f'Failed to cancel subscription: {response.text}')
                return False

            return True

    async def verify_webhook_signature(
        self,
        headers: dict,
        body: bytes,
    ) -> bool:
        """
        Webhook署名を検証

        Args:
            headers: リクエストヘッダー
            body: リクエストボディ

        Returns:
            bool: 検証成功したかどうか
        """
        access_token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f'{self.base_url}/v1/notifications/verify-webhook-signature',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json',
                },
                json={
                    'auth_algo': headers.get('PAYPAL-AUTH-ALGO', ''),
                    'cert_url': headers.get('PAYPAL-CERT-URL', ''),
                    'transmission_id': headers.get('PAYPAL-TRANSMISSION-ID', ''),
                    'transmission_sig': headers.get('PAYPAL-TRANSMISSION-SIG', ''),
                    'transmission_time': headers.get('PAYPAL-TRANSMISSION-TIME', ''),
                    'webhook_id': settings.paypal_webhook_id,
                    'webhook_event': body.decode('utf-8'),
                },
            )

            if response.status_code != 200:
                logger.error(f'Failed to verify webhook signature: {response.text}')
                return False

            data = response.json()
            return data.get('verification_status') == 'SUCCESS'


# シングルトンインスタンス
_paypal_service: Optional[PayPalService] = None


def get_paypal_service() -> PayPalService:
    """PayPalサービスのシングルトンインスタンスを取得"""
    global _paypal_service
    if _paypal_service is None:
        _paypal_service = PayPalService()
    return _paypal_service
