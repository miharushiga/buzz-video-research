"""
バズ要因分析サービス - Claude APIを使用した動画分析

YouTube動画のバズ要因を分析し、類似動画を探すための検索キーワードを提案
字幕・コメントデータも活用した深い分析を提供
"""

import logging
from typing import Optional

import anthropic

from app.config import settings
from app.schemas import Video, AnalysisResult
from app.services.youtube_service import get_youtube_service

logger = logging.getLogger(__name__)


# バズ要因分析のシステムプロンプト
ANALYSIS_SYSTEM_PROMPT = """あなたはYouTube動画のバズ要因を分析する専門家です。
何千万円もかけてYouTubeで実践してきた経験を持つプロの視点で分析してください。

与えられた動画情報（タイトル、統計、字幕内容、コメント）を総合的に分析し、
**良い点**と**改善点**の両方を明確に提示してください。

## バズ要因チェックリスト（良い点の観点）
- 緊急性（「○日までに見て」「今すぐ」など）
- 損失回避（「知らないと損」「見逃すな」など）
- 禁止ワード（「絶対やるな」「〇〇禁止」など）
- 伏字・気になる表現（「○○な人は」「実は...」など）
- 数字リスト（「○選」「○つのサイン」「TOP10」など）
- コメント誘導（質問形式、意見を求める表現）
- 感情訴求（驚き、怒り、感動、共感）
- トレンド・時事性（話題のテーマ、季節性）
- 1本で完結する構成（視聴者がすぐ満足を得られる）

## YouTube運営の注意点（改善点の観点）
- 「第1話」「第2話」などのエピソード形式 → YouTubeでは推奨されない（途中から見た人が離脱する）
- 前提知識が必要な内容 → 新規視聴者が理解できない
- シリーズ前提の構成 → 1本で完結していない
- ターゲットが曖昧 → 誰に向けた動画かわからない
- タイトルと内容の乖離 → 期待と違うと低評価につながる

## 回答形式
必ず以下の形式で回答してください：

### 🎯 この動画の良い点
（箇条書きで3〜5個）

### ⚠️ 改善できる点
（箇条書きで2〜4個、なければ「特になし」）

### 💡 なぜバズったのか
（100字程度の考察）

分析結果は具体的かつ実用的に、日本語で回答してください。"""


SUGGESTION_SYSTEM_PROMPT = """あなたはYouTube動画検索の専門家です。

与えられた動画の特徴を分析し、同じようなバズり動画を見つけるための検索キーワードを提案してください。

## 提案のポイント
1. 動画のテーマ・ジャンルに関連するキーワード
2. バズ要因として機能しているフレーズ
3. 類似コンテンツを見つけるための派生キーワード
4. ターゲット視聴者層が使いそうな検索ワード

各キーワードには、なぜそのキーワードが効果的かの簡単な理由も添えてください。"""


class AnalyzeService:
    """バズ要因分析サービス"""

    def __init__(self):
        """Claude APIクライアントを初期化"""
        if settings.anthropic_api_key:
            self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        else:
            self.client = None
            logger.warning("ANTHROPIC_API_KEY is not set. Analysis features will be disabled.")

    async def analyze_video(self, video: Video) -> AnalysisResult:
        """
        動画のバズ要因を分析（字幕・コメントも活用）

        Args:
            video: 分析対象の動画情報

        Returns:
            AnalysisResult: 分析結果（バズ要因と検索キーワード提案）
        """
        if not self.client:
            return AnalysisResult(
                video_id=video.video_id,
                buzz_factors="Claude APIキーが設定されていないため、分析を実行できません。",
                suggested_keywords=[],
                analysis_summary="APIキー未設定"
            )

        try:
            # YouTube APIから追加情報を取得
            youtube_service = get_youtube_service()

            # 字幕を取得
            transcript = await youtube_service.get_video_transcript(video.video_id)

            # コメントを取得
            comments = await youtube_service.get_video_comments(video.video_id, max_results=15)

            # 動画情報をテキストに変換（字幕・コメント含む）
            video_info = self._format_video_info(video, transcript, comments)

            # バズ要因分析
            buzz_factors = await self._analyze_buzz_factors(video_info)

            # 検索キーワード提案
            suggested_keywords = await self._suggest_keywords(video_info, buzz_factors)

            # 要約を生成
            summary = await self._generate_summary(video, buzz_factors)

            return AnalysisResult(
                video_id=video.video_id,
                buzz_factors=buzz_factors,
                suggested_keywords=suggested_keywords,
                analysis_summary=summary
            )

        except Exception as e:
            logger.error(f"Analysis failed for video {video.video_id}: {e}")
            return AnalysisResult(
                video_id=video.video_id,
                buzz_factors=f"分析中にエラーが発生しました: {str(e)}",
                suggested_keywords=[],
                analysis_summary="エラー"
            )

    def _format_video_info(
        self,
        video: Video,
        transcript: Optional[str] = None,
        comments: Optional[list[dict]] = None
    ) -> str:
        """動画情報をテキスト形式にフォーマット（字幕・コメント含む）"""
        info = f"""## 動画情報

**タイトル**: {video.title}

**チャンネル**: {video.channel_name}
**登録者数**: {video.subscriber_count:,}人

**再生数**: {video.view_count:,}回
**高評価数**: {video.like_count:,}
**高評価率**: {video.like_ratio * 100:.2f}%

**再生倍率（バズ度）**: {video.impact_ratio:.1f}倍（再生数÷登録者数）
**日平均再生数**: {video.daily_avg_views:,.0f}回

**投稿日**: {video.published_at[:10]}
**経過日数**: {video.days_ago}日

**動画URL**: {video.url}"""

        # 字幕がある場合は追加
        if transcript:
            # 長すぎる場合は切り詰め
            transcript_preview = transcript[:2000] + '...' if len(transcript) > 2000 else transcript
            info += f"""

## 動画の字幕/内容（一部）
{transcript_preview}"""

        # コメントがある場合は追加
        if comments and len(comments) > 0:
            info += """

## 視聴者コメント（人気順）"""
            for i, comment in enumerate(comments[:10], 1):
                comment_text = comment.get('text', '')[:200]
                like_count = comment.get('likeCount', 0)
                info += f"""
{i}. 「{comment_text}」（👍 {like_count}）"""

        return info

    async def _analyze_buzz_factors(self, video_info: str) -> str:
        """バズ要因を分析（良い点・改善点を含む）"""
        message = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2500,
            system=ANALYSIS_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"""以下の動画を分析し、良い点と改善点を明確に提示してください。

{video_info}

※ 特に「第1話」「第2話」のようなエピソード形式になっていないか、
1本で完結する構成になっているかも確認してください。"""
                }
            ]
        )
        return message.content[0].text

    async def _suggest_keywords(self, video_info: str, buzz_factors: str) -> list[dict]:
        """類似動画検索用のキーワードを提案"""
        message = self.client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=SUGGESTION_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"""以下の動画情報とバズ要因分析を元に、同じようなバズ動画を見つけるための検索キーワードを5つ提案してください。

{video_info}

## バズ要因分析結果
{buzz_factors}

## 回答形式（JSON形式で回答）
[
  {{"keyword": "検索キーワード1", "reason": "このキーワードが効果的な理由"}},
  {{"keyword": "検索キーワード2", "reason": "このキーワードが効果的な理由"}},
  ...
]

JSONのみを出力してください。"""
                }
            ]
        )

        # JSONをパース
        try:
            import json
            response_text = message.content[0].text.strip()
            # JSONブロックを抽出
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            return json.loads(response_text)
        except Exception as e:
            logger.warning(f"Failed to parse keywords JSON: {e}")
            return [{"keyword": "パース失敗", "reason": str(e)}]

    async def _generate_summary(self, video: Video, buzz_factors: str) -> str:
        """分析結果の要約を生成"""
        # 再生倍率に基づく評価
        if video.impact_ratio >= 3.0:
            level = "大バズ"
        elif video.impact_ratio >= 1.0:
            level = "バズ"
        else:
            level = "通常"

        return f"{level}動画（{video.impact_ratio:.1f}倍）- チャンネル登録者{video.subscriber_count:,}人に対し再生数{video.view_count:,}回を達成"


# シングルトンインスタンス
analyze_service = AnalyzeService()
