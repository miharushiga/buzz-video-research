# 本番運用: カスタムSMTP設定ガイド

## 概要

Supabaseの標準メール配信は制限があり、確認メールが届かないことがあります。
本番運用では、信頼性の高いメール配信サービスを設定することを推奨します。

---

## 推奨サービス

| サービス | 無料枠 | 特徴 |
|----------|--------|------|
| **SendGrid** | 100通/日 | 設定が簡単、信頼性高い |
| **Mailgun** | 1,000通/月（3ヶ月） | 開発者向け、詳細な分析 |
| **Amazon SES** | 62,000通/月（EC2から） | 低コスト、大量配信向け |
| **Resend** | 3,000通/月 | モダンなAPI、簡単設定 |

---

## SendGrid での設定手順（推奨）

### 1. SendGrid アカウント作成

1. https://sendgrid.com/ にアクセス
2. 「Start for Free」をクリック
3. アカウントを作成（メール認証が必要）

### 2. API Key の作成

1. SendGrid ダッシュボードにログイン
2. 左メニュー「Settings」→「API Keys」
3. 「Create API Key」をクリック
4. 名前を入力（例: `buzz-video-supabase`）
5. 「Full Access」または「Restricted Access」で「Mail Send」を有効
6. 「Create & View」をクリック
7. **API Keyをコピーして安全に保存**（一度しか表示されません）

### 3. Sender Identity の設定

1. 左メニュー「Settings」→「Sender Authentication」
2. 「Single Sender Verification」を選択
3. 送信元メールアドレスを登録（例: `noreply@yourdomain.com`）
4. 確認メールが届くので、リンクをクリックして認証

### 4. Supabase での SMTP 設定

1. Supabase ダッシュボードにログイン
2. 対象プロジェクトを選択
3. 左メニュー「Project Settings」（歯車アイコン）
4. 「Authentication」タブをクリック
5. 下にスクロールして「SMTP Settings」セクションを探す
6. 「Enable Custom SMTP」をONにする
7. 以下を入力:

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.sendgrid.net` |
| **Port** | `587` |
| **Username** | `apikey`（固定値） |
| **Password** | SendGridで作成したAPI Key |
| **Sender email** | 認証済みの送信元メールアドレス |
| **Sender name** | `バズ動画リサーチくん` |

8. 「Save」をクリック

---

## Resend での設定手順（代替）

### 1. Resend アカウント作成

1. https://resend.com/ にアクセス
2. GitHubまたはメールでサインアップ

### 2. API Key の作成

1. ダッシュボード左メニュー「API Keys」
2. 「Create API Key」をクリック
3. 名前を入力、権限は「Full access」
4. API Keyをコピーして保存

### 3. ドメイン設定（オプション、推奨）

1. 「Domains」→「Add Domain」
2. ドメインを入力
3. 表示されるDNSレコードを設定

### 4. Supabase での設定

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Resend API Key |
| **Sender email** | `noreply@yourdomain.com` |

---

## Gmail SMTP での設定（小規模向け）

**注意**: Gmailは1日500通の制限があります。テスト用途向け。

### 1. Googleアカウントでアプリパスワードを作成

1. Google アカウント設定 → セキュリティ
2. 2段階認証を有効にする
3. 「アプリパスワード」を作成
4. アプリ: 「メール」、デバイス: 「その他」
5. 生成されたパスワードをコピー

### 2. Supabase での設定

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.gmail.com` |
| **Port** | `587` |
| **Username** | あなたのGmailアドレス |
| **Password** | アプリパスワード |
| **Sender email** | あなたのGmailアドレス |

---

## 設定後のテスト

1. テスト用のメールアドレスで新規登録
2. 確認メールが届くか確認
3. 迷惑メールフォルダも確認
4. メール内のリンクが正しく動作するか確認

---

## トラブルシューティング

### メールが届かない場合

1. **送信元メールアドレスが認証済みか確認**
2. **SPF/DKIM設定**（独自ドメインの場合）
3. **Supabaseのログを確認**: Authentication → Logs
4. **SendGrid/Resendのダッシュボードでエラーを確認**

### リンクが無効な場合

1. Supabase「URL Configuration」で正しいサイトURLが設定されているか確認
2. リダイレクトURLが許可リストに含まれているか確認

---

## 環境変数（参考）

本番環境で管理する環境変数:

```env
# Supabase（既存）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# SMTP設定はSupabaseダッシュボードで行うため、
# 環境変数での設定は不要です
```

---

## 推奨設定

| 環境 | 推奨サービス |
|------|-------------|
| 開発・テスト | Supabase標準 または Gmail |
| 本番（小規模） | Resend（無料枠3,000通/月） |
| 本番（中〜大規模） | SendGrid または Amazon SES |

---

最終更新: 2026年2月4日
