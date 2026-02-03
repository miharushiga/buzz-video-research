"""
YouTube API連携サービス - バズり動画究極リサーチシステム

YouTube Data API v3を使用した動画検索・詳細取得・チャンネル情報取得
影響力（バズ度）・高評価率・日平均再生数の計算機能を提供
"""

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from cachetools import TTLCache
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from app.config import settings
from app.schemas import SearchFilters, SearchResult, Video

# ロガー設定
logger = logging.getLogger(__name__)


# ============================================
# 定数定義
# ============================================

YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

# APIエンドポイント
SEARCH_ENDPOINT = f'{YOUTUBE_API_BASE_URL}/search'
VIDEOS_ENDPOINT = f'{YOUTUBE_API_BASE_URL}/videos'
CHANNELS_ENDPOINT = f'{YOUTUBE_API_BASE_URL}/channels'
COMMENT_THREADS_ENDPOINT = f'{YOUTUBE_API_BASE_URL}/commentThreads'

# デフォルト検索設定
DEFAULT_MAX_RESULTS = 50  # YouTube APIの1リクエストあたりの最大取得数

# TTLキャッシュ設定（600秒 = 10分）
# 同一キーワード・フィルター条件での検索結果をキャッシュ
_search_cache: TTLCache = TTLCache(maxsize=100, ttl=600)


# ============================================
# 例外クラス
# ============================================

class YouTubeAPIError(Exception):
    """YouTube API関連のエラー"""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class YouTubeQuotaExceededError(YouTubeAPIError):
    """YouTube API クォータ超過エラー"""

    def __init__(self):
        super().__init__(
            'YouTube API のクォータを超過しました。しばらく時間をおいてから再度お試しください。',
            status_code=403
        )


class YouTubeAPIKeyError(YouTubeAPIError):
    """YouTube API キーエラー"""

    def __init__(self):
        super().__init__(
            'YouTube API キーが無効です。設定を確認してください。',
            status_code=401
        )


class YouTubeAPITemporaryError(YouTubeAPIError):
    """YouTube API 一時的エラー（リトライ対象）"""

    def __init__(self, message: str, status_code: int):
        super().__init__(message, status_code)


# ============================================
# リトライ設定
# ============================================

# リトライ対象の例外
RETRY_EXCEPTIONS = (
    httpx.TimeoutException,
    httpx.NetworkError,
    YouTubeAPITemporaryError,
)

# リトライデコレータ
retry_on_temporary_error = retry(
    retry=retry_if_exception_type(RETRY_EXCEPTIONS),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)


# ============================================
# YouTube API サービスクラス
# ============================================

class YouTubeService:
    """YouTube API連携サービス"""

    def __init__(self):
        """サービス初期化"""
        self.api_key = settings.youtube_api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """HTTPクライアントを取得（遅延初期化）"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def close(self) -> None:
        """HTTPクライアントを閉じる"""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def _handle_api_response(
        self,
        response: httpx.Response,
        context: str
    ) -> dict:
        """
        APIレスポンスを処理し、エラーハンドリングを行う

        Args:
            response: HTTPレスポンス
            context: エラーメッセージ用のコンテキスト

        Returns:
            dict: レスポンスJSON

        Raises:
            YouTubeAPIError: API呼び出しエラー
        """
        if response.status_code == 200:
            return response.json()

        error_detail = ''
        try:
            error_data = response.json()
            if 'error' in error_data:
                error_detail = error_data['error'].get('message', '')
                error_reason = error_data['error'].get('errors', [{}])[0].get('reason', '')

                # クォータ超過チェック
                if error_reason == 'quotaExceeded':
                    logger.warning('YouTube API quota exceeded')
                    raise YouTubeQuotaExceededError()

                # APIキーエラーチェック
                if response.status_code == 401 or error_reason == 'keyInvalid':
                    logger.error('YouTube API key is invalid')
                    raise YouTubeAPIKeyError()
        except (ValueError, KeyError):
            error_detail = response.text

        error_message = f'{context}に失敗しました: {error_detail}'
        logger.error(f'YouTube API error: {error_message}')

        # 5xxエラーは一時的エラーとしてリトライ対象にする
        if 500 <= response.status_code < 600:
            raise YouTubeAPITemporaryError(error_message, response.status_code)

        raise YouTubeAPIError(error_message, status_code=response.status_code)

    # ============================================
    # 動画検索（search.list API）
    # ============================================

    @retry_on_temporary_error
    async def search_videos(
        self,
        keyword: str,
        max_results: int = DEFAULT_MAX_RESULTS,
        published_after: Optional[datetime] = None
    ) -> list[str]:
        """
        キーワードで動画を検索し、動画IDリストを取得

        Args:
            keyword: 検索キーワード
            max_results: 最大取得件数（デフォルト: 50）
            published_after: この日時以降に公開された動画のみ取得

        Returns:
            list[str]: 動画IDリスト

        Raises:
            YouTubeAPIError: API呼び出しエラー
        """
        logger.info(f'Searching videos for keyword: {keyword}')

        client = await self._get_client()

        params = {
            'part': 'id',
            'q': keyword,
            'type': 'video',
            'order': 'relevance',
            'maxResults': min(max_results, DEFAULT_MAX_RESULTS),
            'key': self.api_key,
        }

        if published_after:
            params['publishedAfter'] = published_after.isoformat()

        response = await client.get(SEARCH_ENDPOINT, params=params)
        data = await self._handle_api_response(response, '動画検索')

        video_ids = [
            item['id']['videoId']
            for item in data.get('items', [])
            if item.get('id', {}).get('videoId')
        ]

        logger.info(f'Found {len(video_ids)} videos for keyword: {keyword}')
        return video_ids

    # ============================================
    # 動画詳細取得（videos.list API）
    # ============================================

    @retry_on_temporary_error
    async def get_video_details(self, video_ids: list[str]) -> list[dict]:
        """
        動画IDリストから動画詳細情報を取得

        Args:
            video_ids: 動画IDリスト

        Returns:
            list[dict]: 動画詳細情報リスト

        Raises:
            YouTubeAPIError: API呼び出しエラー
        """
        if not video_ids:
            return []

        logger.info(f'Fetching details for {len(video_ids)} videos')

        client = await self._get_client()

        # 50件ずつ分割してリクエスト（API制限）
        all_videos = []
        for i in range(0, len(video_ids), DEFAULT_MAX_RESULTS):
            batch_ids = video_ids[i:i + DEFAULT_MAX_RESULTS]

            params = {
                'part': 'snippet,statistics',
                'id': ','.join(batch_ids),
                'key': self.api_key,
            }

            response = await client.get(VIDEOS_ENDPOINT, params=params)
            data = await self._handle_api_response(response, '動画詳細取得')

            all_videos.extend(data.get('items', []))

        logger.info(f'Fetched details for {len(all_videos)} videos')
        return all_videos

    # ============================================
    # チャンネル情報取得（channels.list API）
    # ============================================

    @retry_on_temporary_error
    async def get_channel_details(self, channel_ids: list[str]) -> dict[str, dict]:
        """
        チャンネルIDリストからチャンネル詳細情報を取得

        Args:
            channel_ids: チャンネルIDリスト

        Returns:
            dict[str, dict]: チャンネルID -> チャンネル情報の辞書

        Raises:
            YouTubeAPIError: API呼び出しエラー
        """
        if not channel_ids:
            return {}

        # 重複を除去
        unique_channel_ids = list(set(channel_ids))
        logger.info(f'Fetching details for {len(unique_channel_ids)} channels')

        client = await self._get_client()

        channel_map: dict[str, dict] = {}

        # 50件ずつ分割してリクエスト（API制限）
        for i in range(0, len(unique_channel_ids), DEFAULT_MAX_RESULTS):
            batch_ids = unique_channel_ids[i:i + DEFAULT_MAX_RESULTS]

            params = {
                'part': 'snippet,statistics',
                'id': ','.join(batch_ids),
                'key': self.api_key,
            }

            response = await client.get(CHANNELS_ENDPOINT, params=params)
            data = await self._handle_api_response(response, 'チャンネル情報取得')

            for item in data.get('items', []):
                channel_id = item.get('id')
                if channel_id:
                    channel_map[channel_id] = {
                        'id': channel_id,
                        'title': item.get('snippet', {}).get('title', ''),
                        'subscriberCount': int(
                            item.get('statistics', {}).get('subscriberCount', 0)
                        ),
                        'publishedAt': item.get('snippet', {}).get('publishedAt', ''),
                    }

        logger.info(f'Fetched details for {len(channel_map)} channels')
        return channel_map

    # ============================================
    # 計算ロジック
    # ============================================

    @staticmethod
    def calculate_days_ago(published_at: str) -> int:
        """
        公開日からの経過日数を計算（UTC基準）

        Args:
            published_at: 公開日時（ISO 8601形式）

        Returns:
            int: 経過日数（0以上）
        """
        try:
            published_date = datetime.fromisoformat(
                published_at.replace('Z', '+00:00')
            )
            now = datetime.now(timezone.utc)
            delta = now - published_date
            return max(0, delta.days)
        except (ValueError, TypeError):
            logger.warning(f'Invalid published_at format: {published_at}')
            return 0

    @staticmethod
    def calculate_daily_avg_views(view_count: int, days_ago: int) -> float:
        """
        日平均再生数を計算

        Args:
            view_count: 再生回数
            days_ago: 経過日数

        Returns:
            float: 日平均再生数（経過日数が0の場合は再生回数をそのまま返す）
        """
        if days_ago <= 0:
            # 今日公開された動画は再生回数をそのまま返す
            return float(view_count)
        return round(view_count / days_ago, 2)

    @staticmethod
    def calculate_impact_ratio(view_count: int, subscriber_count: int) -> float:
        """
        影響力（バズ度）を計算: viewCount / subscriberCount

        Args:
            view_count: 再生回数
            subscriber_count: 登録者数

        Returns:
            float: 影響力（登録者数が0の場合は0.0を返す）
        """
        if subscriber_count <= 0:
            # 0除算防止
            return 0.0
        return round(view_count / subscriber_count, 2)

    @staticmethod
    def calculate_like_ratio(like_count: int, view_count: int) -> float:
        """
        高評価率を計算: likeCount / viewCount

        Args:
            like_count: 高評価数
            view_count: 再生回数

        Returns:
            float: 高評価率（再生回数が0の場合は0.0を返す）
        """
        if view_count <= 0:
            # 0除算防止
            return 0.0
        return round(like_count / view_count, 4)

    # ============================================
    # コメント取得（commentThreads.list API）
    # ============================================

    @retry_on_temporary_error
    async def get_video_comments(
        self,
        video_id: str,
        max_results: int = 20
    ) -> list[dict]:
        """
        動画のコメントを取得

        Args:
            video_id: 動画ID
            max_results: 最大取得件数（デフォルト: 20）

        Returns:
            list[dict]: コメントリスト（author, text, likeCount）
        """
        logger.info(f'Fetching comments for video: {video_id}')

        client = await self._get_client()

        try:
            params = {
                'part': 'snippet',
                'videoId': video_id,
                'order': 'relevance',
                'maxResults': min(max_results, 100),
                'key': self.api_key,
            }

            response = await client.get(COMMENT_THREADS_ENDPOINT, params=params)
            data = await self._handle_api_response(response, 'コメント取得')

            comments = []
            for item in data.get('items', []):
                snippet = item.get('snippet', {}).get('topLevelComment', {}).get('snippet', {})
                comments.append({
                    'author': snippet.get('authorDisplayName', ''),
                    'text': snippet.get('textDisplay', ''),
                    'likeCount': snippet.get('likeCount', 0),
                })

            logger.info(f'Fetched {len(comments)} comments for video: {video_id}')
            return comments

        except YouTubeAPIError as e:
            # コメント無効の場合は空リストを返す
            if 'disabled' in str(e).lower() or 'commentsDisabled' in str(e):
                logger.info(f'Comments are disabled for video: {video_id}')
                return []
            raise

    # ============================================
    # 字幕/トランスクリプト取得
    # ============================================

    async def get_video_transcript(
        self,
        video_id: str,
        languages: list[str] = ['ja', 'en']
    ) -> Optional[str]:
        """
        動画の字幕/トランスクリプトを取得

        Args:
            video_id: 動画ID
            languages: 優先言語リスト

        Returns:
            str: トランスクリプトテキスト（取得できない場合はNone）
        """
        logger.info(f'Fetching transcript for video: {video_id}')

        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            from youtube_transcript_api._errors import (
                TranscriptsDisabled,
                NoTranscriptFound,
                VideoUnavailable,
            )

            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

                # 優先言語で字幕を探す
                transcript = None
                for lang in languages:
                    try:
                        transcript = transcript_list.find_transcript([lang])
                        break
                    except NoTranscriptFound:
                        continue

                # 見つからない場合は自動生成字幕を試す
                if transcript is None:
                    try:
                        transcript = transcript_list.find_generated_transcript(languages)
                    except NoTranscriptFound:
                        pass

                if transcript is None:
                    logger.info(f'No transcript found for video: {video_id}')
                    return None

                # テキストを結合
                transcript_data = transcript.fetch()
                text = ' '.join([item['text'] for item in transcript_data])

                # 長すぎる場合は切り詰め（Claude APIのトークン制限対策）
                if len(text) > 5000:
                    text = text[:5000] + '...'

                logger.info(f'Fetched transcript ({len(text)} chars) for video: {video_id}')
                return text

            except (TranscriptsDisabled, VideoUnavailable) as e:
                logger.info(f'Transcript not available for video {video_id}: {e}')
                return None

        except ImportError:
            logger.warning('youtube-transcript-api is not installed')
            return None
        except Exception as e:
            logger.warning(f'Failed to fetch transcript for video {video_id}: {e}')
            return None

    # ============================================
    # 統合検索メソッド
    # ============================================

    async def search_buzz_videos(
        self,
        keyword: str,
        filters: Optional[SearchFilters] = None
    ) -> SearchResult:
        """
        バズ動画を検索し、影響力などの計算値を付加して返す

        Args:
            keyword: 検索キーワード
            filters: 検索フィルター条件

        Returns:
            SearchResult: 検索結果（動画リスト付き）

        Raises:
            YouTubeAPIError: API呼び出しエラー
        """
        # キャッシュキー生成（キーワード + フィルター条件のハッシュ）
        cache_key_data = {
            'keyword': keyword,
            'filters': filters.model_dump() if filters else None
        }
        cache_key = hashlib.md5(
            json.dumps(cache_key_data, sort_keys=True).encode('utf-8')
        ).hexdigest()

        # キャッシュヒット確認
        if cache_key in _search_cache:
            logger.info(f'Cache hit for keyword: {keyword}')
            return _search_cache[cache_key]

        logger.info(f'Cache miss - Starting buzz video search for keyword: {keyword}')

        # 期間フィルターの計算
        published_after = None
        if filters and filters.period_days:
            from datetime import timedelta
            published_after = datetime.now(timezone.utc) - timedelta(
                days=filters.period_days
            )

        try:
            # Step 1: 動画検索
            video_ids = await self.search_videos(
                keyword=keyword,
                published_after=published_after
            )

            if not video_ids:
                logger.info(f'No videos found for keyword: {keyword}')
                return SearchResult(
                    keyword=keyword,
                    searched_at=datetime.now(timezone.utc).isoformat(),
                    videos=[]
                )

            # Step 2: 動画詳細取得
            video_details = await self.get_video_details(video_ids)

            # Step 3: チャンネルID収集
            channel_ids = [
                video.get('snippet', {}).get('channelId')
                for video in video_details
                if video.get('snippet', {}).get('channelId')
            ]

            # Step 4: チャンネル情報取得
            channel_map = await self.get_channel_details(channel_ids)

            # Step 5: Video オブジェクトの構築
            videos: list[Video] = []
            for video in video_details:
                try:
                    video_obj = self._build_video_object(video, channel_map)
                    if video_obj:
                        # フィルター適用
                        if self._apply_filters(video_obj, filters):
                            videos.append(video_obj)
                except Exception as e:
                    video_id = video.get('id', 'unknown')
                    logger.warning(f'Failed to build video object for {video_id}: {e}')
                    continue

            # 影響力でソート（降順）
            videos.sort(key=lambda v: v.impact_ratio, reverse=True)

            logger.info(
                f'Search completed: {len(videos)} videos found for keyword: {keyword}'
            )

            result = SearchResult(
                keyword=keyword,
                searched_at=datetime.now(timezone.utc).isoformat(),
                videos=videos
            )

            # 結果をキャッシュに保存
            _search_cache[cache_key] = result
            logger.info(f'Search result cached for keyword: {keyword}')

            return result

        except YouTubeAPIError:
            raise
        except Exception as e:
            logger.exception(f'Unexpected error during search: {e}')
            raise YouTubeAPIError(f'検索中に予期しないエラーが発生しました: {e}')

    def _build_video_object(
        self,
        video_data: dict,
        channel_map: dict[str, dict]
    ) -> Optional[Video]:
        """
        APIレスポンスからVideoオブジェクトを構築

        Args:
            video_data: 動画詳細データ
            channel_map: チャンネル情報マップ

        Returns:
            Video: 動画オブジェクト（構築失敗時はNone）
        """
        try:
            video_id = video_data.get('id', '')
            snippet = video_data.get('snippet', {})
            statistics = video_data.get('statistics', {})

            channel_id = snippet.get('channelId', '')
            channel_info = channel_map.get(channel_id, {})

            # 基本情報
            published_at = snippet.get('publishedAt', '')
            view_count = int(statistics.get('viewCount', 0))
            like_count = int(statistics.get('likeCount', 0))
            subscriber_count = int(channel_info.get('subscriberCount', 0))

            # 計算値
            days_ago = self.calculate_days_ago(published_at)
            daily_avg_views = self.calculate_daily_avg_views(view_count, days_ago)
            impact_ratio = self.calculate_impact_ratio(view_count, subscriber_count)
            like_ratio = self.calculate_like_ratio(like_count, view_count)

            # サムネイルURL取得（高解像度優先）
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = (
                thumbnails.get('high', {}).get('url') or
                thumbnails.get('medium', {}).get('url') or
                thumbnails.get('default', {}).get('url') or
                ''
            )

            return Video(
                video_id=video_id,
                url=f'https://www.youtube.com/watch?v={video_id}',
                title=snippet.get('title', ''),
                published_at=published_at,
                thumbnail_url=thumbnail_url,
                view_count=view_count,
                like_count=like_count,
                channel_id=channel_id,
                channel_name=channel_info.get('title', snippet.get('channelTitle', '')),
                subscriber_count=subscriber_count,
                channel_created_at=channel_info.get('publishedAt', ''),
                days_ago=days_ago,
                daily_avg_views=daily_avg_views,
                impact_ratio=impact_ratio,
                like_ratio=like_ratio,
            )
        except Exception as e:
            logger.warning(f'Failed to build video object: {e}')
            return None

    def _apply_filters(
        self,
        video: Video,
        filters: Optional[SearchFilters]
    ) -> bool:
        """
        動画にフィルターを適用

        Args:
            video: 動画オブジェクト
            filters: 検索フィルター条件

        Returns:
            bool: フィルター条件を満たす場合True
        """
        if filters is None:
            return True

        # 影響力フィルター
        if filters.impact_min is not None and video.impact_ratio < filters.impact_min:
            return False
        if filters.impact_max is not None and video.impact_ratio > filters.impact_max:
            return False

        # 登録者数フィルター
        if filters.subscriber_min is not None:
            if video.subscriber_count < filters.subscriber_min:
                return False
        if filters.subscriber_max is not None:
            if video.subscriber_count > filters.subscriber_max:
                return False

        return True


# ============================================
# サービスインスタンス（シングルトン）
# ============================================

_youtube_service: Optional[YouTubeService] = None


def get_youtube_service() -> YouTubeService:
    """
    YouTubeサービスのシングルトンインスタンスを取得

    Returns:
        YouTubeService: YouTubeサービスインスタンス
    """
    global _youtube_service
    if _youtube_service is None:
        _youtube_service = YouTubeService()
    return _youtube_service


async def close_youtube_service() -> None:
    """YouTubeサービスをクローズ"""
    global _youtube_service
    if _youtube_service is not None:
        await _youtube_service.close()
        _youtube_service = None
