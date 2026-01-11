# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: バズり動画究極リサーチシステム
開始日: 2026-01-11
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6 + Vite 5
  backend: Python 3.12 + FastAPI
  database: なし（MVP段階）
```

## 開発環境
```yaml
ポート設定:
  frontend: 3248
  backend: 8433

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - YOUTUBE_API_KEY: YouTube Data API v3のAPIキー
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
  - GET /api/health: ヘルスチェック
  - POST /api/search: キーワード検索・バズ動画取得
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
バズり動画究極リサーチシステム/
├── frontend/                 # フロントエンド（React）
│   ├── src/
│   │   ├── components/       # UIコンポーネント
│   │   ├── pages/            # ページコンポーネント
│   │   ├── hooks/            # カスタムフック
│   │   ├── stores/           # Zustand ストア
│   │   ├── types/            # 型定義
│   │   └── utils/            # ユーティリティ関数
│   └── ...
├── backend/                  # バックエンド（FastAPI）
│   ├── app/
│   │   ├── main.py           # エントリーポイント
│   │   ├── routers/          # APIルーター
│   │   ├── services/         # ビジネスロジック
│   │   │   └── youtube_service.py  # YouTube API連携
│   │   ├── schemas.py        # Pydanticスキーマ
│   │   └── config.py         # 設定
│   └── ...
├── docs/                     # ドキュメント
│   ├── requirements.md       # 要件定義書
│   └── SCOPE_PROGRESS.md     # 進捗管理表
├── CLAUDE.md                 # このファイル
├── .flake8                   # Python Lint設定
└── pyproject.toml            # Python プロジェクト設定
```

## 最新技術情報（知識カットオフ対応）
```yaml
YouTube Data API:
  - 低評価数は2021年12月13日以降、動画オーナー以外は取得不可
  - 代替として「高評価数 / 再生回数」を使用
  - 登録者数は1,000人以上で3桁に丸められる

MUI v6:
  - @mui/material, @mui/icons-material を使用
  - emotionベースのスタイリング
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
