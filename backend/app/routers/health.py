"""
ヘルスチェックルーター - バズり動画究極リサーチシステム

GET /api/health エンドポイントを提供
"""

import httpx
from fastapi import APIRouter

from app import __version__
from app.config import settings
from app.schemas import HealthResponse, YouTubeApiStatus


router = APIRouter(
    prefix='/api',
    tags=['Health'],
)


async def check_youtube_api_connection() -> YouTubeApiStatus:
    """
    YouTube Data API v3への接続確認を行う

    Returns:
        YouTubeApiStatus: 接続ステータス
    """
    try:
        # YouTube Data API v3 のチャンネル情報取得エンドポイントで接続確認
        # mine=false, part=id のみで最小限のリクエスト
        url = 'https://www.googleapis.com/youtube/v3/channels'
        params = {
            'part': 'id',
            'id': 'UC_x5XG1OV2P6uZZ5FSM9Ttw',  # Google Developers チャンネル
            'key': settings.youtube_api_key,
        }

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params)

        if response.status_code == 200:
            return YouTubeApiStatus(
                connected=True,
                message='YouTube API is connected'
            )
        else:
            # 詳細なエラー理由を取得
            error_message = f'HTTP {response.status_code}'
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_reason = error_data['error'].get('errors', [{}])[0].get('reason', 'unknown')
                    error_msg = error_data['error'].get('message', '')
                    error_message = f'{error_reason}: {error_msg}'
            except Exception:
                error_message = response.text[:200] if response.text else f'HTTP {response.status_code}'

            return YouTubeApiStatus(
                connected=False,
                message=f'YouTube API error - {error_message}'
            )

    except httpx.TimeoutException:
        return YouTubeApiStatus(
            connected=False,
            message='YouTube API connection timeout'
        )
    except httpx.RequestError as e:
        return YouTubeApiStatus(
            connected=False,
            message=f'YouTube API connection error: {str(e)}'
        )
    except Exception as e:
        return YouTubeApiStatus(
            connected=False,
            message=f'Unexpected error: {str(e)}'
        )


@router.get(
    '/health',
    response_model=HealthResponse,
    summary='ヘルスチェック',
    description='APIサーバーの稼働状態とYouTube API接続状態を確認する'
)
async def health_check() -> HealthResponse:
    """
    ヘルスチェックエンドポイント

    - APIサーバーの稼働状態を確認
    - YouTube Data API v3への接続確認

    Returns:
        HealthResponse: ヘルスチェック結果
    """
    # YouTube API接続確認
    youtube_status = await check_youtube_api_connection()

    return HealthResponse(
        status='ok',
        message='バズり動画究極リサーチシステム is running',
        version=__version__,
        youtube_api=youtube_status
    )
