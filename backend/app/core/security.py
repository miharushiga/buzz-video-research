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


async def verify_token_with_supabase(token: str) -> TokenPayload:
    """
    Supabaseを使用してJWTトークンを検証

    Args:
        token: JWTトークン（Bearerプレフィックスなし）

    Returns:
        TokenPayload: トークンのペイロード

    Raises:
        HTTPException: トークンが無効な場合
    """
    from app.core.supabase import get_supabase_admin

    try:
        supabase = get_supabase_admin()

        # Supabaseでトークンを検証してユーザー情報を取得
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='無効なトークンです',
                headers={'WWW-Authenticate': 'Bearer'}
            )

        user = user_response.user

        return TokenPayload(
            sub=user.id,
            email=user.email,
            exp=0,  # Supabaseが管理
            iat=0,
            aud='authenticated',
            role=user.role
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.warning(f'Token verification failed: {type(e).__name__}: {e}')
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

    payload = await verify_token_with_supabase(token)

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
