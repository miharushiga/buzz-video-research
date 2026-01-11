# バズり動画究極リサーチシステム 要件定義書

## 1. プロジェクト概要

### 1.1 目的
個人YouTubeクリエイターが、キーワード入力だけでバズ動画を自動収集し、影響力（再生数÷登録者数）で可視化できるWebアプリケーション。

### 1.2 ターゲットユーザー
- YouTubeクリエイター（個人）
- 動画マーケティング担当者
- コンテンツ企画者

### 1.3 成功指標
- 検索から結果表示まで5秒以内
- 1日100回以上の検索に対応
- バズ度の視覚的な判別が一目で可能

---

## 2. 機能要件

### 2.1 キーワード検索機能
- キーワードを入力してYouTube動画を検索
- 最大50件の検索結果を取得
- フィルター条件の指定が可能

### 2.2 フィルター機能
| フィルター | 選択肢 |
|-----------|--------|
| 期間 | 7日, 30日, 90日, 365日, 全期間 |
| 影響力 | 最小値〜最大値 |
| 登録者数 | 最小値〜最大値 |

### 2.3 影響力計算・表示
```
影響力 = 再生回数 ÷ チャンネル登録者数

色分け:
- 赤（大バズ）: 3.0倍以上
- 黄（バズ）: 1.0〜3.0倍
- 白（通常）: 1.0倍未満
```

### 2.4 検索結果テーブル
| 項目 | 説明 |
|------|------|
| サムネイル | 動画サムネイル画像 |
| タイトル | 動画タイトル |
| 影響力 | バズ度（色分け表示） |
| 再生回数 | 総再生回数 |
| 高評価率 | 高評価数/再生回数 |
| チャンネル名 | チャンネル名 |
| 登録者数 | チャンネル登録者数 |
| 投稿日 | 動画公開日 |
| 日平均再生数 | 再生回数/経過日数 |

### 2.5 ソート機能
- 影響力（デフォルト: 降順）
- 再生回数
- 投稿日
- 日平均再生数

### 2.6 CSVエクスポート
検索結果をCSV形式でダウンロード可能

### 2.7 動画詳細ページ
選択した動画の詳細情報を表示:
- サムネイル大
- YouTubeリンク
- 影響力の詳細計算
- 統計情報一覧
- チャンネル情報

---

## 3. 非機能要件

### 3.1 パフォーマンス
- 検索レスポンス: 5秒以内
- ページ読み込み: 2秒以内

### 3.2 スケーラビリティ
- 同時接続: 100ユーザー
- 日次検索: 10,000回

### 3.3 セキュリティ
- APIキーの安全な管理
- XSS/CSRF対策

---

## 4. 技術スタック

### 4.1 フロントエンド
- React 18
- TypeScript 5
- MUI v6
- Vite 5
- Zustand（状態管理）
- React Query（データフェッチ）

### 4.2 バックエンド
- Python 3.12
- FastAPI
- YouTube Data API v3

---

## 5. API設計

### 5.1 POST /api/search
キーワード検索を実行し、バズ動画を取得

**リクエスト:**
```json
{
  "keyword": "検索キーワード",
  "filters": {
    "periodDays": 30,
    "impactMin": 1.0,
    "impactMax": null,
    "subscriberMin": null,
    "subscriberMax": null
  }
}
```

**レスポンス:**
```json
{
  "keyword": "検索キーワード",
  "searchedAt": "2026-01-11T12:00:00Z",
  "videos": [
    {
      "videoId": "xxxxx",
      "url": "https://youtube.com/watch?v=xxxxx",
      "title": "動画タイトル",
      "publishedAt": "2026-01-10T00:00:00Z",
      "thumbnailUrl": "https://...",
      "viewCount": 100000,
      "likeCount": 5000,
      "channelId": "UCxxxxx",
      "channelName": "チャンネル名",
      "subscriberCount": 10000,
      "channelCreatedAt": "2020-01-01T00:00:00Z",
      "daysAgo": 1,
      "dailyAvgViews": 100000,
      "impactRatio": 10.0,
      "likeRatio": 0.05
    }
  ]
}
```

### 5.2 GET /api/health
ヘルスチェック

**レスポンス:**
```json
{
  "status": "ok"
}
```

---

## 6. データ型定義

### 6.1 Video
```typescript
interface Video {
  videoId: string;
  url: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  channelId: string;
  channelName: string;
  subscriberCount: number;
  channelCreatedAt: string;
  daysAgo: number;
  dailyAvgViews: number;
  impactRatio: number;
  likeRatio: number;
}
```

### 6.2 SearchFilters
```typescript
interface SearchFilters {
  periodDays: number | null;
  impactMin: number | null;
  impactMax: number | null;
  subscriberMin: number | null;
  subscriberMax: number | null;
}
```

---

## 7. 画面構成

### 7.1 検索ページ（/）
- キーワード入力フォーム
- フィルター設定パネル
- 検索結果テーブル
- CSVエクスポートボタン

### 7.2 動画詳細ページ（/video/:videoId）
- 動画情報カード
- 統計情報パネル
- チャンネル情報パネル
- 戻るボタン

---

## 8. 開発フェーズ

### Phase 1: 要件定義 ✅
### Phase 2: Git/GitHub管理
### Phase 3: フロントエンド基盤
### Phase 4: ページ実装
### Phase 5: バックエンド実装
### Phase 6: 結合テスト
### Phase 7: デプロイ
