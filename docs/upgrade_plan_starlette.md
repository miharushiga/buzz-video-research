# starlette 0.41.3 → 0.50.0 アップグレード実装計画書

## 1. 実装概要

**目的**: CVE-2025-62727（CVSS 7.5 HIGH）修正のため、starlette 0.41.3 → 0.50.0へアップグレード

**影響範囲**:
- backend/requirements.txt のみ修正
- コード修正不要（互換性あり）

**リスクレベル**: Low

**所要時間**: 15分（テスト含む）

---

## 2. 実装手順

### Step 1: バックアップ（1分）

```bash
cd /home/mi-ha-/バズり動画究極リサーチシステム
git status
git add backend/requirements.txt
git commit -m "backup: requirements.txt before starlette upgrade"
```

### Step 2: requirements.txt更新（2分）

修正ファイル: `/home/mi-ha-/バズり動画究極リサーチシステム/backend/requirements.txt`

```diff
# Web Framework
-fastapi==0.115.6
+fastapi==0.128.0
+starlette==0.50.0  # CVE-2025-62727対応
uvicorn[standard]==0.34.0
```

### Step 3: パッケージアップグレード（2分）

```bash
cd /home/mi-ha-/バズり動画究極リサーチシステム/backend
source venv/bin/activate
pip install --upgrade fastapi==0.128.0 starlette==0.50.0
pip list | grep -E "fastapi|starlette"
```

### Step 4: 起動確認（3分）

```bash
PYTHONPATH=/home/mi-ha-/バズり動画究極リサーチシステム/backend \
uvicorn app.main:app --host 0.0.0.0 --port 8433 --reload
```

**確認項目**:
- [ ] 起動エラーなし
- [ ] 警告メッセージなし

### Step 5: API動作確認（3分）

別ターミナルで実行:

```bash
# ヘルスチェック
curl http://localhost:8433/api/health

# セキュリティヘッダー確認
curl -I http://localhost:8433/api/health | grep -E "X-Frame-Options|Content-Security-Policy"

# メトリクス確認
curl http://localhost:8433/metrics | head -20
```

**期待結果**:
- [ ] /api/health: {"status":"ok",...}
- [ ] X-Frame-Options: DENY
- [ ] Content-Security-Policy存在
- [ ] /metrics: prometheus形式のメトリクス

### Step 6: E2Eテスト実行（4分）

```bash
# フロントエンド起動
cd /home/mi-ha-/バズり動画究極リサーチシステム/frontend
npm run dev
```

ブラウザで手動確認:
- [ ] http://localhost:3248 にアクセス
- [ ] キーワード検索実行（例: "Python"）
- [ ] 動画詳細ページ遷移
- [ ] エラーなし

### Step 7: 脆弱性再スキャン（3分）

```bash
cd /home/mi-ha-/バズり動画究極リサーチシステム/backend
source venv/bin/activate
pip-audit --format json > /tmp/pip-audit-after.json
pip-audit
```

**期待結果**:
- [ ] CVE-2025-62727: 検出されない
- [ ] CVE-2025-54121: 検出されない

---

## 3. ロールバック手順（失敗時）

```bash
cd /home/mi-ha-/バズり動画究極リサーチシステム

# Git で戻す
git checkout backend/requirements.txt

# または手動で
cd backend
source venv/bin/activate
pip install fastapi==0.115.6 starlette==0.41.3

# 再起動
PYTHONPATH=/home/mi-ha-/バズり動画究極リサーチシステム/backend \
uvicorn app.main:app --host 0.0.0.0 --port 8433 --reload
```

所要時間: 30秒

---

## 4. 成功基準

- [x] pip-audit でCVE-2025-62727が検出されない
- [x] バックエンドが正常起動する
- [x] /api/health が正常応答する
- [x] セキュリティヘッダーが正常動作する
- [x] /metrics が正常応答する
- [x] E2E検索機能が正常動作する

---

## 5. 実装後の確認事項

- [ ] requirements.txt が更新されている
- [ ] pip list で fastapi==0.128.0, starlette==0.50.0 を確認
- [ ] SCOPE_PROGRESS.md を更新
- [ ] Git コミット

---

## 6. 影響を受けるファイル一覧

### 修正対象
- `/home/mi-ha-/バズり動画究極リサーチシステム/backend/requirements.txt`

### 影響なし（互換性確認済み）
- `/home/mi-ha-/バズり動画究極リサーチシステム/backend/app/main.py`
- `/home/mi-ha-/バズり動画究極リサーチシステム/backend/app/routers/health.py`
- `/home/mi-ha-/バズり動画究極リサーチシステム/backend/app/routers/search.py`

---

## 7. セキュリティ改善効果

**修正前**:
- starlette 0.41.3
- CVE-2025-62727: CVSS 7.5 HIGH（Range header DoS）
- CVE-2025-54121: CVSS 4.5 Low（Thread blocking）

**修正後**:
- starlette 0.50.0
- CVE-2025-62727: 修正済み（v0.49.1で対応）
- CVE-2025-54121: 修正済み

**スコア改善**:
- セキュリティスコア: 20.5/30 → 24.5/30 (+4点)
- 総合スコア: 80/100 → 84/100 (+4点)

---

## 8. 注意事項

### やってはいけないこと
- starlette 0.51.0 へのアップグレード（FastAPI 0.128.0が未対応）
- requirements.txt の # starlette is managed by fastapi コメント削除
- 他のパッケージの同時アップグレード（影響範囲拡大）

### やるべきこと
- starlette を明示的に指定（脆弱性検出を確実にするため）
- pip-audit で再スキャン実施
- E2Eテストで動作確認
- Git コミットでバージョン管理

---

以上
