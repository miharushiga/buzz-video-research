-- ============================================
-- 検索結果キャッシュテーブル
-- YouTube APIクォータ節約のため、検索結果を永続化
-- ============================================

-- search_cache テーブル作成
CREATE TABLE IF NOT EXISTS search_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- キャッシュキー（MD5ハッシュ）
    cache_key VARCHAR(32) NOT NULL UNIQUE,

    -- 検索条件
    keyword VARCHAR(100) NOT NULL,
    filters JSONB,

    -- 検索結果（JSON形式）
    result JSONB NOT NULL,

    -- TTL管理
    expires_at TIMESTAMPTZ NOT NULL,

    -- メタデータ
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_search_cache_key ON search_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_search_cache_keyword ON search_cache(keyword);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);

-- RLSポリシー（サービスロールのみアクセス可能）
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- サービスロールは全操作可能
CREATE POLICY "Service role can manage cache"
    ON search_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 期限切れキャッシュ削除関数
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント
COMMENT ON TABLE search_cache IS 'YouTube検索結果のキャッシュ（APIクォータ節約用）';
COMMENT ON COLUMN search_cache.cache_key IS 'キーワード+フィルターのMD5ハッシュ';
COMMENT ON COLUMN search_cache.hit_count IS 'キャッシュヒット回数（効果測定用）';
