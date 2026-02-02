"""
バズ要因分析APIルーター

POST /api/analyze - 動画のバズ要因を分析
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas import AnalyzeRequest, AnalysisResult, Video
from app.dependencies import require_active_subscription
from app.core.security import UserInfo
from app.services.analyze_service import analyze_service
from app.services.auth_service import get_auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="動画のバズ要因を分析",
    description="""
    指定された動画のバズ要因をClaude AIで分析し、
    類似動画を探すための検索キーワードを提案します。

    ## 認証
    このエンドポイントは認証必須です。有効なサブスクリプション（トライアル含む）が必要です。

    ## 分析内容
    - バズ要因の特定（タイトル、投稿タイミング等）
    - 効果的な表現の解説
    - 類似動画検索用のキーワード提案（5件）
    """
)
async def analyze_video(
    request: Request,
    body: AnalyzeRequest,
    user: UserInfo = Depends(require_active_subscription)
) -> AnalysisResult:
    """動画のバズ要因を分析"""
    # 利用ログを記録
    auth_service = get_auth_service()
    await auth_service.log_usage(
        user_id=user.id,
        action='analyze',
        metadata={'video_id': body.video.video_id},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get('user-agent')
    )

    try:
        logger.info(f"Analyzing video: {body.video.video_id}, user={user.id}")
        result = await analyze_service.analyze_video(body.video)
        logger.info(f"Analysis completed for video: {body.video.video_id}")
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"分析中にエラーが発生しました: {str(e)}")
