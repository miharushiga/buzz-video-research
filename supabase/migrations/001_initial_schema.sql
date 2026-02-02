-- ==============================================
-- バズ動画リサーチくん - 初期スキーマ
-- Supabase PostgreSQL マイグレーション
-- ==============================================

-- 拡張機能有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. profiles テーブル（ユーザープロファイル）
-- ==============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS（Row Level Security）有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のプロファイルのみ参照・更新可能
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 管理者は全プロファイル参照可能
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 新規ユーザー登録時に自動でプロファイル作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==============================================
-- 2. app_settings テーブル（アプリ設定）
-- ==============================================
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- RLS有効化
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが設定を参照可能
CREATE POLICY "Anyone can read settings"
    ON app_settings FOR SELECT
    USING (TRUE);

-- 管理者のみ設定を更新可能
CREATE POLICY "Admins can update settings"
    ON app_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- デフォルト設定を挿入
INSERT INTO app_settings (key, value, description) VALUES
    ('trial_days', '7', 'トライアル期間（日数）'),
    ('monthly_price', '9900', '月額料金（円）'),
    ('admin_email', '"bemdrt@gmail.com"', '管理者メールアドレス');

-- ==============================================
-- 3. subscriptions テーブル（サブスクリプション）
-- ==============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    paypal_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'trialing',
    -- status: trialing, active, cancelled, expired, past_due
    trial_start TIMESTAMPTZ DEFAULT NOW(),
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    price_amount INTEGER DEFAULT 9900,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (
        status IN ('trialing', 'active', 'cancelled', 'expired', 'past_due')
    )
);

-- インデックス
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id);

-- RLS有効化
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサブスクリプションのみ参照可能
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- 管理者は全サブスクリプション参照可能
CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- サービスロールのみ更新可能（Webhook経由）
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- ==============================================
-- 4. payment_history テーブル（支払い履歴）
-- ==============================================
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    paypal_payment_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'JPY',
    status TEXT NOT NULL,
    -- status: pending, completed, failed, refunded
    payment_method TEXT DEFAULT 'paypal',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_payment_status CHECK (
        status IN ('pending', 'completed', 'failed', 'refunded')
    )
);

-- インデックス
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- RLS有効化
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の支払い履歴のみ参照可能
CREATE POLICY "Users can view own payment history"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

-- 管理者は全支払い履歴参照可能
CREATE POLICY "Admins can view all payment history"
    ON payment_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ==============================================
-- 5. usage_logs テーブル（利用ログ）
-- ==============================================
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    -- action: search, analyze, export
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- RLS有効化
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の利用ログのみ参照可能
CREATE POLICY "Users can view own usage logs"
    ON usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- サービスロールのみ挿入可能
CREATE POLICY "Service role can insert usage logs"
    ON usage_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 管理者は全利用ログ参照可能
CREATE POLICY "Admins can view all usage logs"
    ON usage_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ==============================================
-- 6. 更新日時自動更新トリガー
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- 7. 便利なビュー
-- ==============================================

-- アクティブなサブスクリプションを持つユーザー
CREATE VIEW active_subscribers AS
SELECT
    p.id,
    p.email,
    p.full_name,
    s.status,
    s.trial_end,
    s.current_period_end
FROM profiles p
JOIN subscriptions s ON p.id = s.user_id
WHERE s.status IN ('trialing', 'active')
    AND (
        (s.status = 'trialing' AND s.trial_end > NOW())
        OR (s.status = 'active' AND s.current_period_end > NOW())
    );

-- 日別利用統計
CREATE VIEW daily_usage_stats AS
SELECT
    DATE(created_at) AS date,
    action,
    COUNT(*) AS count
FROM usage_logs
GROUP BY DATE(created_at), action
ORDER BY date DESC;

-- 月別売上
CREATE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', paid_at) AS month,
    COUNT(*) AS payment_count,
    SUM(amount) AS total_amount
FROM payment_history
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;
