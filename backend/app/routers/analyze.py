"""
バズ要因分析APIルーター

POST /api/analyze - 動画のバズ要因を分析
"""

import logging

from fastapi import APIRouter, HTTPException

from app.schemas import AnalyzeRequest, AnalysisResult, Video
from app.services.analyze_service import analyze_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="動画のバズ要因を分析",
    description="""
    指定された動画のバズ要因をClaude AIで分析し、
    類似動画を探すための検索キーワードを提案します。

    ## 分析内容
    - バズ要因の特定（タイトル、投稿タイミング等）
    - 効果的な表現の解説
    - 類似動画検索用のキーワード提案（5件）
    """
)
async def analyze_video(request: AnalyzeRequest) -> AnalysisResult:
    """動画のバズ要因を分析"""
    try:
        logger.info(f"Analyzing video: {request.video.video_id}")
        result = await analyze_service.analyze_video(request.video)
        logger.info(f"Analysis completed for video: {request.video.video_id}")
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"分析中にエラーが発生しました: {str(e)}")
