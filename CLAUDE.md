# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: バズ動画リサーチくん（旧称: バズり動画究極リサーチシステム）
開始日: 2026-01-11
商用化: 2026-02-02
技術スタック:
  frontend: React 19 + TypeScript 5.9 + MUI v7 + Vite 7
  backend: Python 3.12 + FastAPI
  database: Supabase (PostgreSQL)
  認証: Supabase Auth (Google OAuth対応)
  決済: PayPal Subscriptions
```

## サービス情報
```yaml
サービス名: バズ動画リサーチくん
運営会社: 株式会社天命
運営責任者: 志賀美春
管理者メール: bemdrt@gmail.com
お問い合わせ: info@tenmeijouju.com
月額料金: 9,900円（税込）
トライアル: 7日間（管理画面で変更可能）
決済方法: PayPal
```

## 開発環境
```yaml
ポート設定:
  frontend: 3248
  backend: 8433

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  サンプル: .env.example
  必須項目:
    # YouTube API
    - YOUTUBE_API_KEY: YouTube Data API v3のAPIキー

    # Supabase
    - SUPABASE_URL: SupabaseプロジェクトURL
    - SUPABASE_ANON_KEY: 匿名キー
    - SUPABASE_SERVICE_ROLE_KEY: サービスロールキー
    - SUPABASE_JWT_SECRET: JWT署名シークレット
    - VITE_SUPABASE_URL: フロントエンド用URL
    - VITE_SUPABASE_ANON_KEY: フロントエンド用匿名キー

    # PayPal
    - PAYPAL_CLIENT_ID: クライアントID
    - PAYPAL_CLIENT_SECRET: クライアントシークレット
    - PAYPAL_API_URL: API URL (sandbox/production)
    - PAYPAL_PLAN_ID: サブスクリプションプランID
    - PAYPAL_WEBHOOK_ID: WebhookのID
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: VideoList.tsx)
  - ユーティリティ: camelCase.ts (例: formatNumber.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下
  - ファイル行数: 700行以下
  - 複雑度(McCabe): 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/videos, /channels)
  - ケバブケース使用 (/buzz-videos)

エンドポイント一覧:
  公開:
    - GET /api/health: ヘルスチェック

  認証必須:
    - GET /api/auth/me: 自分のプロファイル取得
    - PUT /api/auth/me: プロファイル更新
    - GET /api/auth/subscription: サブスクリプション状態
    - POST /api/auth/trial/start: トライアル開始
    - GET /api/auth/check: 認証状態チェック

  認証+サブスク必須:
    - POST /api/search: キーワード検索・バズ動画取得
    - POST /api/analyze: バズ要因分析

  サブスクリプション:
    - GET /api/subscription/status: サブスク状態
    - POST /api/subscription/create: PayPalサブスク作成
    - POST /api/subscription/activate: サブスクアクティブ化
    - POST /api/subscription/cancel: サブスクキャンセル

  Webhook:
    - POST /api/webhook/paypal: PayPal Webhook

  管理者専用:
    - GET /api/admin/dashboard: ダッシュボード統計
    - GET /api/admin/users: ユーザー一覧
    - GET /api/admin/users/:id: ユーザー詳細
    - PUT /api/admin/users/:id: ユーザー更新
    - GET /api/admin/settings: アプリ設定
    - PUT /api/admin/settings: アプリ設定更新
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: app/schemas.py

同期ルール:
  - 両ファイルは常に同一の構造を保つ
  - 片方を更新したら即座にもう片方も更新
```

### 影響力（バズ度）計算ルール
```yaml
計算式: viewCount / subscriberCount
色分け:
  - 赤 (大バズ): 3.0倍以上
  - 黄 (バズ): 1.0〜3.0倍
  - 白 (通常): 1.0倍未満
注意:
  - subscriberCount が 0 の場合は計算しない（0除算防止）
```

### 高評価率計算ルール
```yaml
計算式: likeCount / viewCount
注意:
  - 低評価数は2021年12月以降非公開のため使用不可
  - viewCount が 0 の場合は計算しない
```

## ディレクトリ構造
```
バズ動画リサーチくん/
├── frontend/                    # フロントエンド（React）
│   ├── src/
│   │   ├── components/          # UIコンポーネント
│   │   │   ├── auth/            # 認証コンポーネント
│   │   │   ├── common/          # 共通コンポーネント（ProtectedRoute, Footer）
│   │   │   └── subscription/    # サブスクリプションコンポーネント
│   │   ├── lib/                 # 外部ライブラリ連携（Supabase）
│   │   ├── pages/               # ページコンポーネント
│   │   │   └── admin/           # 管理者ページ
│   │   ├── layouts/             # レイアウトコンポーネント
│   │   ├── stores/              # Zustand ストア（authStore, searchStore）
│   │   ├── types/               # 型定義
│   │   └── utils/               # ユーティリティ関数
│   └── ...
├── backend/                     # バックエンド（FastAPI）
│   ├── app/
│   │   ├── main.py              # エントリーポイント
│   │   ├── config.py            # 設定
│   │   ├── dependencies.py      # 依存性注入（認証）
│   │   ├── schemas.py           # Pydanticスキーマ
│   │   ├── core/                # コア機能
│   │   │   ├── supabase.py      # Supabaseクライアント
│   │   │   └── security.py      # JWT検証
│   │   ├── routers/             # APIルーター
│   │   │   ├── auth.py          # 認証
│   │   │   ├── subscription.py  # サブスクリプション
│   │   │   ├── webhook.py       # PayPal Webhook
│   │   │   ├── admin.py         # 管理者
│   │   │   ├── search.py        # 検索（認証必須）
│   │   │   └── analyze.py       # 分析（認証必須）
│   │   └── services/            # ビジネスロジック
│   │       ├── youtube_service.py   # YouTube API
│   │       ├── auth_service.py      # 認証
│   │       ├── subscription_service.py # サブスク
│   │       ├── paypal_service.py    # PayPal
│   │       └── admin_service.py     # 管理者
│   └── ...
├── supabase/                    # Supabase設定
│   └── migrations/              # SQLマイグレーション
│       └── 001_initial_schema.sql
├── docs/                        # ドキュメント
├── CLAUDE.md                    # このファイル
├── .env.example                 # 環境変数サンプル
├── .flake8                      # Python Lint設定
└── pyproject.toml               # Python プロジェクト設定
```

## 最新技術情報（知識カットオフ対応）
```yaml
YouTube Data API:
  - 低評価数は2021年12月13日以降、動画オーナー以外は取得不可
  - 代替として「高評価数 / 再生回数」を使用
  - 登録者数は1,000人以上で3桁に丸められる

YouTube Shorts:
  - 2026年現在、3分以内（180秒以下）の動画がショート扱い
  - contentDetails.duration で判定可能（ISO 8601形式）

MUI v6:
  - @mui/material, @mui/icons-material を使用
  - emotionベースのスタイリング
```

## 今後の実装予定（TODO）
```yaml
ショート動画除外機能:
  概要: 検索結果からYouTube Shortsを除外するオプション
  判定基準: duration <= 180秒（3分以内）
  UI: チェックボックス「ショート動画を除外する」
  変更ファイル:
    - backend/app/schemas.py: SearchFiltersにexcludeShorts追加
    - backend/app/services/youtube_service.py: duration取得・フィルタリング
    - frontend/src/types/index.ts: 型定義追加
    - frontend/src/pages/SearchPage.tsx: UIチェックボックス追加
  注意: APIクォータを少し余分に消費（contentDetails取得）
```

## ルーティング構造
```yaml
公開ページ:
  /login: ログインページ
  /register: 新規登録ページ
  /pricing: 料金プランページ
  /terms: 利用規約
  /privacy: プライバシーポリシー

認証必須ページ:
  /account: アカウント管理
  /subscription/success: サブスクリプション成功

認証+サブスク必須ページ:
  /: 検索ページ（メイン）
  /video/:videoId: 動画詳細ページ

管理者専用ページ:
  /admin: 管理者ダッシュボード
  /admin/users: ユーザー管理
  /admin/settings: 設定管理
```

## 関連プロジェクト
```yaml
YouTube自動企画作成ツール:
  - 本システムのデータを活用して企画・台本を自動生成
  - 別プロジェクトとして独立
  - パス: /home/mi-ha-/YouTube自動企画作成ツール/
```

### 13. E2Eテスト自律実行の絶対原則

**【重要】セッション開始時・compact後の自動判定**

このセクションはE2Eテストオーケストレーターによって自動生成されました。

---

**最初に必ず専門知識を注入してください**

E2Eテスト実行中の場合、以下を実行してから開始してください：

```
inject_knowledge ツールで keyword: "@E2Eテストオーケストレーター"
を実行してから開始してください。（初回必須・compact後も必須）
```

重要：キーワードは "@E2Eテストオーケストレーター"
をそのまま使用してください。変換や推測は不要です。

準備完了です。まず知識注入を実行してから、タスクを開始してください。

---

**E2Eテストオーケストレーター実行中の判定**:
- SCOPE_PROGRESS.mdに「## 📊 E2Eテスト全体進捗」が存在する場合
- または、セッション再開時に前回のメッセージに「E2Eテスト」「オーケストレーター」キーワードがある場合

**セッション開始時・compact後の自動処理**:
1. 上記の判定基準でE2Eテスト実行中と判定
2. inject_knowledge('@E2Eテストオーケストレーター') を必ず実行
3. docs/e2e-best-practices.md の存在確認（なければ初期テンプレート作成）
4. SCOPE_PROGRESS.mdから [ ] テストの続きを自動で特定
5. [x] のテストは絶対にスキップ
6. ユーザー確認不要、完全自律モードで継続
7. ページ選定も自動（未完了ページを上から順に選択）
8. 停止条件：全テスト100%完了のみ

**5回エスカレーション後の処理**:
- チェックリストに [-] マークを付ける
- docs/e2e-test-history/skipped-tests.md に記録
- 次のテストへ自動で進む（停止しない）

**ベストプラクティス自動蓄積**:
- 各テストで成功した方法を docs/e2e-best-practices.md に自動保存
- 後続テストが前のテストの知見を自動活用
- 試行錯誤が減っていく（学習効果）

**重要**:
- この原則はCLAUDE.mdに記載されているため、compact後も自動で適用される
- セッション開始時にこのセクションがない場合、オーケストレーターが自動で追加する
