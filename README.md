# バズり動画究極リサーチシステム

YouTube動画のバズ度（影響力）を分析するWebアプリケーション

## 概要

YouTubeの動画を検索し、再生回数とチャンネル登録者数から「影響力（バズ度）」を計算。通常のチャンネル規模を超えてバズっている動画を発見できます。

### 影響力（バズ度）の計算

```
影響力 = 再生回数 / チャンネル登録者数
```

- **大バズ（赤）**: 3.0倍以上
- **バズ（黄）**: 1.0〜3.0倍
- **通常（白）**: 1.0倍未満

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | React 19, TypeScript 5.9, Vite 7, MUI v7 |
| バックエンド | Python 3.12, FastAPI, uvicorn |
| 外部API | YouTube Data API v3 |

## 必要条件

- Node.js 20以上
- Python 3.12以上
- YouTube Data API v3 のAPIキー

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd バズり動画究極リサーチシステム
```

### 2. 環境変数を設定

```bash
cp .env.local.example .env.local
# .env.local を編集してYouTube APIキーを設定
```

**.env.local の内容:**
```
YOUTUBE_API_KEY=your-youtube-api-key-here
NODE_ENV=development
```

### 3. バックエンドのセットアップ

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

## 起動方法

### バックエンド（ターミナル1）

```bash
cd backend
source venv/bin/activate
PYTHONPATH=$(pwd) uvicorn app.main:app --host 0.0.0.0 --port 8433 --reload
```

### フロントエンド（ターミナル2）

```bash
cd frontend
npm run dev
```

## アクセス

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:3248 |
| バックエンドAPI | http://localhost:8433 |
| API ドキュメント | http://localhost:8433/docs |
| メトリクス | http://localhost:8433/metrics |

## APIエンドポイント

### GET /api/health

ヘルスチェック（YouTube API接続確認含む）

### POST /api/search

バズ動画検索

**リクエスト:**
```json
{
  "keyword": "検索キーワード",
  "filters": {
    "periodDays": 30,
    "impactMin": 1.0,
    "subscriberMin": 1000
  }
}
```

## 開発

### コード品質チェック

```bash
# フロントエンド
cd frontend
npm run lint
npm run build

# バックエンド
cd backend
source venv/bin/activate
flake8 app/
mypy app/
```

### E2Eテスト

```bash
npx playwright test
```

## ライセンス

MIT License
