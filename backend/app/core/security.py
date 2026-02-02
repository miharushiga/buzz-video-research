"""
セキュリティモジュール - バズ動画リサーチくん

JWT検証・ユーザー認証機能を提供
"""

import logging
from typing import Optional
from datetime import datetime, timezone

from fastapi import HTTPException, status
from pydantic import BaseModel
import jwt

from app.config import settings


logger = logging.getLogger(__name__)


class TokenPayload(BaseModel):
    """JWTトークンのペイロード"""
    sub: str  # ユーザーID
    email: Optional[str] = None
    exp: int
    iat: int
    aud: Optional[str] = None
    role: Optional[str] = None


class UserInfo(BaseModel):
    """認証済みユーザー情報"""
    id: str
    email: str
    is_admin: bool = False


def verify_token(token: str) -> TokenPayload:
    """
    JWTトークンを検証

    Args:
        token: JWTトークン（Bearerプレフィックスなし）

    Returns:
        TokenPayload: トークンのペイロード

    Raises:
        HTTPException: トークンが無効な場合
    """
    try:
        # Supabaseの公開鍵でJWT検証
        # HS256アルゴリズムの場合はJWT Secretを使用
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=['HS256'],
            audience='authenticated',
            options={'verify_aud': True}
        )

        # 有効期限チェック
        exp = payload.get('exp')
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(tz=timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='トークンの有効期限が切れています',
                headers={'WWW-Authenticate': 'Bearer'}
            )

        return TokenPayload(
            sub=payload.get('sub', ''),
            email=payload.get('email'),
            exp=payload.get('exp', 0),
            iat=payload.get('iat', 0),
            aud=payload.get('aud'),
            role=payload.get('role')
        )

    except jwt.ExpiredSignatureError:
        logger.warning('Token expired')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='トークンの有効期限が切れています',
            headers={'WWW-Authenticate': 'Bearer'}
        )

    except jwt.InvalidAudienceError:
        logger.warning('Invalid token audience')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='無効なトークンです',
            headers={'WWW-Authenticate': 'Bearer'}
        )

    except jwt.PyJWTError as e:
        logger.warning(f'JWT verification failed: {e}')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='トークンの検証に失敗しました',
            headers={'WWW-Authenticate': 'Bearer'}
        )


async def get_current_user(token: str) -> UserInfo:
    """
    現在の認証済みユーザーを取得

    Args:
        token: JWTトークン

    Returns:
        UserInfo: ユーザー情報

    Raises:
        HTTPException: 認証失敗時
    """
    from app.core.supabase import get_supabase_admin

    payload = verify_token(token)

    # Supabaseからユーザー情報を取得
    supabase = get_supabase_admin()

    try:
        result = supabase.table('profiles').select('*').eq('id', payload.sub).single().execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='ユーザーが見つかりません'
            )

        profile = result.data

        return UserInfo(
            id=profile['id'],
            email=profile['email'],
            is_admin=profile.get('is_admin', False)
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f'Failed to get user profile: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='ユーザー情報の取得に失敗しました'
        )


def require_admin(user: UserInfo) -> None:
    """
    管理者権限を要求

    Args:
        user: ユーザー情報

    Raises:
        HTTPException: 管理者でない場合
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='管理者権限が必要です'
        )
