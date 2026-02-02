"""
Pydanticスキーマ定義 - バズり動画究極リサーチシステム

フロントエンドの型定義（frontend/src/types/index.ts）と同期必須
更新時は両ファイルを同時に更新すること
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ============================================
# YouTube動画関連
# ============================================

class Video(BaseModel):
    """YouTube動画情報"""

    # 識別情報
    video_id: str = Field(..., alias='videoId', description='動画ID')
    url: str = Field(..., description='動画URL')

    # 基本情報
    title: str = Field(..., description='動画タイトル')
    published_at: str = Field(..., alias='publishedAt', description='公開日時（ISO 8601形式）')
    thumbnail_url: str = Field(..., alias='thumbnailUrl', description='サムネイルURL')

    # 統計情報
    view_count: int = Field(..., alias='viewCount', ge=0, description='再生回数')
    like_count: int = Field(..., alias='likeCount', ge=0, description='高評価数')

    # チャンネル情報
    channel_id: str = Field(..., alias='channelId', description='チャンネルID')
    channel_name: str = Field(..., alias='channelName', description='チャンネル名')
    subscriber_count: int = Field(..., alias='subscriberCount', ge=0, description='登録者数')
    channel_created_at: str = Field(
        ...,
        alias='channelCreatedAt',
        description='チャンネル作成日時（ISO 8601形式）'
    )

    # 計算値
    days_ago: int = Field(..., alias='daysAgo', ge=0, description='公開からの経過日数')
    daily_avg_views: float = Field(
        ...,
        alias='dailyAvgViews',
        ge=0,
        description='1日あたりの平均再生回数'
    )
    impact_ratio: float = Field(
        ...,
        alias='impactRatio',
        ge=0,
        description='影響力: viewCount / subscriberCount'
    )
    like_ratio: float = Field(
        ...,
        alias='likeRatio',
        ge=0,
        le=1,
        description='高評価率: likeCount / viewCount'
    )

    class Config:
        """Pydantic設定"""

        populate_by_name = True
        json_schema_extra = {
            'example': {
                'videoId': 'dQw4w9WgXcQ',
                'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'title': 'サンプル動画タイトル',
                'publishedAt': '2024-01-15T12:00:00Z',
                'thumbnailUrl': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                'viewCount': 1000000,
                'likeCount': 50000,
                'channelId': 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
                'channelName': 'サンプルチャンネル',
                'subscriberCount': 500000,
                'channelCreatedAt': '2020-01-01T00:00:00Z',
                'daysAgo': 365,
                'dailyAvgViews': 2739.73,
                'impactRatio': 2.0,
                'likeRatio': 0.05
            }
        }


class SearchFilters(BaseModel):
    """検索フィルター条件"""

    period_days: Optional[int] = Field(
        None,
        alias='periodDays',
        ge=1,
        description='期間フィルター（日数）: 7, 30, 90, 365, null=全期間'
    )
    impact_min: Optional[float] = Field(
        None,
        alias='impactMin',
        ge=0,
        description='影響力最小値'
    )
    impact_max: Optional[float] = Field(
        None,
        alias='impactMax',
        ge=0,
        description='影響力最大値'
    )
    subscriber_min: Optional[int] = Field(
        None,
        alias='subscriberMin',
        ge=0,
        description='登録者数最小値'
    )
    subscriber_max: Optional[int] = Field(
        None,
        alias='subscriberMax',
        ge=0,
        description='登録者数最大値'
    )

    class Config:
        """Pydantic設定"""

        populate_by_name = True


class SearchRequest(BaseModel):
    """検索リクエスト"""

    keyword: str = Field(..., min_length=1, max_length=100, description='検索キーワード')
    filters: Optional[SearchFilters] = Field(None, description='検索フィルター条件')

    class Config:
        """Pydantic設定"""

        populate_by_name = True
        json_schema_extra = {
            'example': {
                'keyword': 'Python チュートリアル',
                'filters': {
                    'periodDays': 30,
                    'impactMin': 1.0,
                    'impactMax': None,
                    'subscriberMin': 1000,
                    'subscriberMax': None
                }
            }
        }


class SearchResult(BaseModel):
    """検索結果"""

    keyword: str = Field(..., description='検索キーワード')
    searched_at: str = Field(..., alias='searchedAt', description='検索日時（ISO 8601形式）')
    videos: list[Video] = Field(default_factory=list, description='動画リスト')

    class Config:
        """Pydantic設定"""

        populate_by_name = True


# ============================================
# 共通型
# ============================================

class ApiError(BaseModel):
    """APIエラーレスポンス"""

    detail: str = Field(..., description='エラー詳細メッセージ')

    class Config:
        """Pydantic設定"""

        json_schema_extra = {
            'example': {
                'detail': 'キーワードを入力してください'
            }
        }


class SortField(str, Enum):
    """ソートフィールド"""

    IMPACT_RATIO = 'impactRatio'
    VIEW_COUNT = 'viewCount'
    PUBLISHED_AT = 'publishedAt'
    DAILY_AVG_VIEWS = 'dailyAvgViews'


class SortOrder(str, Enum):
    """ソート順"""

    ASC = 'asc'
    DESC = 'desc'


class SortConfig(BaseModel):
    """ソート条件"""

    field: SortField = Field(..., description='ソートフィールド')
    order: SortOrder = Field(..., description='ソート順')


class ImpactLevel(str, Enum):
    """
    影響力レベル（バズ度）

    - high: 赤（3倍以上 = 大バズ）
    - medium: 黄（1〜3倍 = バズ）
    - low: 白（1倍未満 = 通常）
    """

    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'


def get_impact_level(impact_ratio: float) -> ImpactLevel:
    """
    影響力レベルを判定する

    Args:
        impact_ratio: 影響力（viewCount / subscriberCount）

    Returns:
        ImpactLevel: 影響力レベル
    """
    if impact_ratio >= 3.0:
        return ImpactLevel.HIGH
    if impact_ratio >= 1.0:
        return ImpactLevel.MEDIUM
    return ImpactLevel.LOW


# ============================================
# バズ要因分析
# ============================================

class SuggestedKeyword(BaseModel):
    """検索キーワード提案"""

    keyword: str = Field(..., description='提案キーワード')
    reason: str = Field(..., description='このキーワードが効果的な理由')


class AnalysisResult(BaseModel):
    """バズ要因分析結果"""

    video_id: str = Field(..., alias='videoId', description='分析対象の動画ID')
    buzz_factors: str = Field(..., alias='buzzFactors', description='バズ要因の分析結果')
    suggested_keywords: list[SuggestedKeyword] = Field(
        default_factory=list,
        alias='suggestedKeywords',
        description='類似動画検索用のキーワード提案'
    )
    analysis_summary: str = Field(..., alias='analysisSummary', description='分析結果の要約')

    class Config:
        """Pydantic設定"""

        populate_by_name = True


class AnalyzeRequest(BaseModel):
    """分析リクエスト"""

    video: Video = Field(..., description='分析対象の動画情報')

    class Config:
        """Pydantic設定"""

        populate_by_name = True


# ============================================
# ヘルスチェック
# ============================================

class YouTubeApiStatus(BaseModel):
    """YouTube API接続ステータス"""

    connected: bool = Field(..., description='YouTube APIへの接続状態')
    message: str = Field(..., description='ステータスメッセージ')

    class Config:
        """Pydantic設定"""

        json_schema_extra = {
            'example': {
                'connected': True,
                'message': 'YouTube API is connected'
            }
        }


class HealthResponse(BaseModel):
    """ヘルスチェックレスポンス"""

    status: str = Field(..., description='ステータス（ok または error）')
    message: str = Field(..., description='メッセージ')
    version: str = Field(..., description='アプリケーションバージョン')
    youtube_api: Optional[YouTubeApiStatus] = Field(
        None,
        alias='youtubeApi',
        description='YouTube API接続ステータス'
    )

    class Config:
        """Pydantic設定"""

        populate_by_name = True
        json_schema_extra = {
            'example': {
                'status': 'ok',
                'message': 'バズり動画究極リサーチシステム is running',
                'version': '1.0.0',
                'youtubeApi': {
                    'connected': True,
                    'message': 'YouTube API is connected'
                }
            }
        }
