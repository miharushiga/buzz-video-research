"""
検索APIルーター - バズり動画究極リサーチシステム

POST /api/search エンドポイントを提供
キーワード検索・フィルター適用・バズ動画取得
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas import ApiError, SearchRequest, SearchResult
from app.dependencies import require_active_subscription
from app.core.security import UserInfo
from app.services.youtube_service import (
    YouTubeAPIError,
    YouTubeAPIKeyError,
    YouTubeQuotaExceededError,
    get_youtube_service,
)
from app.services.auth_service import get_auth_service

# レート制限（検索API専用）
limiter = Limiter(key_func=get_remote_address)

# ロガー設定
logger = logging.getLogger(__name__)

# ルーター作成
router = APIRouter(
    prefix='/api',
    tags=['Search'],
)


@router.post(
    '/search',
    response_model=SearchResult,
    responses={
        200: {
            'description': '検索成功',
            'model': SearchResult,
        },
        400: {
            'description': 'リクエストパラメータエラー',
            'model': ApiError,
        },
        401: {
            'description': '認証エラー',
            'model': ApiError,
        },
        402: {
            'description': 'サブスクリプション必要',
            'model': ApiError,
        },
        429: {
            'description': 'YouTube APIクォータ超過',
            'model': ApiError,
        },
        500: {
            'description': 'サーバーエラー',
            'model': ApiError,
        },
        502: {
            'description': 'YouTube APIエラー',
            'model': ApiError,
        },
    },
    summary='バズ動画検索',
    description='''
キーワードでYouTube動画を検索し、影響力（バズ度）などの計算値を付加して返します。

## 認証
このエンドポイントは認証必須です。有効なサブスクリプション（トライアル含む）が必要です。

## 影響力（バズ度）の計算
- 計算式: `viewCount / subscriberCount`
- 大バズ（赤）: 3.0倍以上
- バズ（黄）: 1.0〜3.0倍
- 通常（白）: 1.0倍未満

## フィルター条件
- `periodDays`: 期間フィルター（7, 30, 90, 365日 または null=全期間）
- `impactMin/Max`: 影響力の範囲
- `subscriberMin/Max`: 登録者数の範囲
''',
)
@limiter.limit('30/minute')
async def search_videos(
    request: Request,
    body: SearchRequest,
    user: UserInfo = Depends(require_active_subscription)
) -> SearchResult:
    """
    バズ動画を検索する

    Args:
        request: FastAPIリクエストオブジェクト（レート制限用）
        body: 検索リクエスト（キーワードとフィルター条件）

    Returns:
        SearchResult: 検索結果（動画リスト付き）

    Raises:
        HTTPException: 各種エラー
    """
    logger.info(f'Search request received: keyword={body.keyword}, user={user.id}')

    # 認証サービス取得
    auth_service = get_auth_service()

    # 1日の検索回数制限をチェック（20回/日）
    can_search, remaining, limit_error = await auth_service.check_search_limit(
        user_id=user.id,
        daily_limit=20
    )
    if not can_search:
        logger.warning(f'Search limit exceeded for user={user.id}')
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=limit_error,
        )

    # 利用ログを記録
    await auth_service.log_usage(
        user_id=user.id,
        action='search',
        metadata={'keyword': body.keyword, 'remaining_today': remaining - 1},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get('user-agent')
    )

    try:
        # YouTubeサービス取得
        youtube_service = get_youtube_service()

        # バズ動画検索実行
        result = await youtube_service.search_buzz_videos(
            keyword=body.keyword,
            filters=body.filters,
        )

        logger.info(
            f'Search completed: {len(result.videos)} videos found '
            f'for keyword={body.keyword}'
        )

        # 残り検索回数を追加してレスポンスを返す
        result.searches_remaining = remaining - 1
        return result

    except YouTubeQuotaExceededError as e:
        logger.warning(f'YouTube API quota exceeded: {e}')
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
        )

    except YouTubeAPIKeyError as e:
        logger.error(f'YouTube API key error: {e}')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    except YouTubeAPIError as e:
        logger.error(f'YouTube API error: {e}')
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )

    except Exception as e:
        logger.exception(f'Unexpected error during search: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'検索中に予期しないエラーが発生しました: {e}',
        )
