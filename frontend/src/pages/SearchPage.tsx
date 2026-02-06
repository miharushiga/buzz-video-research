import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { VideoTable } from '../components/VideoTable';
import { filterVideos, sortVideos } from '../utils/videoFilter';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore } from '../stores/authStore';
import type { Video, SortConfig, SearchFilters } from '../types';

/**
 * フィルターのデフォルト値
 * - 期間: 1年（365日）
 * - 再生倍率: 1倍以上
 * - 登録者数: 1000人以上
 */
const DEFAULT_FILTERS: SearchFilters = {
  periodDays: 365,
  impactMin: 1,
  impactMax: null,
  subscriberMin: 1000,
  subscriberMax: null,
};

/**
 * P-001: 企画作成ページ（Step 1: バズ動画検索）
 * キーワードでバズ動画を検索し、影響力付きで一覧表示
 */
export const SearchPage = () => {
  // URLクエリパラメータを取得
  const [searchParams, setSearchParams] = useSearchParams();
  // グローバルストアから検索結果を取得（ページ遷移後の復元用）
  const { keyword: storedKeyword, videos: storedVideos, setSearchResult } = useSearchStore();
  // 認証ストアからセッションを取得
  const { session } = useAuthStore();

  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'impactRatio',
    order: 'desc',
  });
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isComposing, setIsComposing] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  // 検索実行関数（useCallbackで安定化）
  const executeSearch = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8433';
      const apiUrl = `${apiBase}/api/search`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ keyword: searchKeyword.trim(), filters }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('ログインが必要です');
        }
        if (response.status === 402) {
          throw new Error('有効なサブスクリプションが必要です');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '検索に失敗しました');
      }

      const data = await response.json();
      setVideos(data.videos);
      setSearchedKeyword(searchKeyword.trim());
      // 残り検索回数を更新
      if (data.searchesRemaining !== undefined) {
        setSearchesRemaining(data.searchesRemaining);
      }
      setSearchResult({
        keyword: searchKeyword.trim(),
        videos: data.videos,
        searchedAt: new Date().toISOString(),
        searchesRemaining: data.searchesRemaining,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, session?.access_token, setSearchResult]);

  // ページ読み込み時にストアから検索結果を復元
  useEffect(() => {
    if (storedKeyword && storedVideos.length > 0) {
      setKeyword(storedKeyword);
      setSearchedKeyword(storedKeyword);
      setVideos(storedVideos);
    }
  }, []);

  // URLクエリパラメータから検索を自動実行
  useEffect(() => {
    const queryKeyword = searchParams.get('q');
    if (queryKeyword && !hasAutoSearched) {
      setKeyword(queryKeyword);
      setHasAutoSearched(true);
      // URLからqパラメータを削除（履歴に残さない）
      setSearchParams({}, { replace: true });
      // 検索を実行
      executeSearch(queryKeyword);
    }
  }, [searchParams, hasAutoSearched, executeSearch, setSearchParams]);

  const handleSearch = async () => {
    await executeSearch(keyword);
  };

  // IME（日本語入力）対応: 変換確定のEnterでは検索しない
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    if (field === 'periodDays') {
      setFilters((prev) => ({
        ...prev,
        periodDays: value === 'all' ? null : Number(value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: value === '' ? null : Number(value),
      }));
    }
  };

  // フィルタリング処理（MVPではフロントエンドで実行）
  const filteredVideos = filterVideos(videos, filters);

  // ソート済み動画リスト（フィルタリング後にソート）
  const sortedVideos = sortVideos(filteredVideos, sortConfig.field, sortConfig.order);

  return (
    <Box>
      {/* 検索セクション */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
          Step 1: バズ動画を検索
        </Typography>

        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          {/* キーワード入力行 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <TextField
                fullWidth
                label="キーワード"
                placeholder="例: 料理 レシピ 時短"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                disabled={isLoading}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !keyword.trim()}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120, py: 1.75, px: 4 }}
            >
              {isLoading ? '検索中...' : '検索'}
            </Button>
            {searchesRemaining !== null && (
              <Chip
                label={`本日の残り検索: ${searchesRemaining}回`}
                color={searchesRemaining <= 5 ? 'warning' : 'default'}
                variant="outlined"
                size="medium"
                sx={{ ml: 1, py: 2.5 }}
              />
            )}
          </Box>

          {/* フィルター行 */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* 期間設定 */}
            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="period-label">期間</InputLabel>
              <Select
                labelId="period-label"
                value={filters.periodDays === null ? 'all' : filters.periodDays.toString()}
                label="期間"
                onChange={(e) => handleFilterChange('periodDays', e.target.value)}
              >
                <MenuItem value="7">過去7日</MenuItem>
                <MenuItem value="30">過去30日</MenuItem>
                <MenuItem value="90">過去90日</MenuItem>
                <MenuItem value="365">過去1年</MenuItem>
                <MenuItem value="all">全期間</MenuItem>
              </Select>
            </FormControl>

            {/* 再生倍率レンジ */}
            <Box sx={{ minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                再生倍率
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="number"
                  placeholder="1"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={filters.impactMin ?? ''}
                  onChange={(e) => handleFilterChange('impactMin', e.target.value)}
                  sx={{ width: 80 }}
                  size="small"
                />
                <Typography color="text.secondary">倍〜</Typography>
                <TextField
                  type="number"
                  placeholder="∞"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={filters.impactMax ?? ''}
                  onChange={(e) => handleFilterChange('impactMax', e.target.value)}
                  sx={{ width: 80 }}
                  size="small"
                />
                <Typography color="text.secondary">倍</Typography>
              </Box>
              <FormHelperText sx={{ mt: 0.5 }}>再生数÷登録者数</FormHelperText>
            </Box>

            {/* 登録者数レンジ */}
            <Box sx={{ minWidth: 260 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                登録者数
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="number"
                  placeholder="1000"
                  inputProps={{ min: 0, step: 1000 }}
                  value={filters.subscriberMin ?? ''}
                  onChange={(e) => handleFilterChange('subscriberMin', e.target.value)}
                  sx={{ width: 100 }}
                  size="small"
                />
                <Typography color="text.secondary">人〜</Typography>
                <TextField
                  type="number"
                  placeholder="∞"
                  inputProps={{ min: 0, step: 1000 }}
                  value={filters.subscriberMax ?? ''}
                  onChange={(e) => handleFilterChange('subscriberMax', e.target.value)}
                  sx={{ width: 100 }}
                  size="small"
                />
                <Typography color="text.secondary">人</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 検索結果 */}
      {searchedKeyword && !error && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="text.primary">
              「{searchedKeyword}」の検索結果：{filteredVideos.length}件
              {filteredVideos.length !== videos.length && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  (全{videos.length}件中)
                </Typography>
              )}
            </Typography>
          </Box>

          {sortedVideos.length > 0 ? (
            <>
              <VideoTable
                videos={sortedVideos}
                sortConfig={sortConfig}
                onSort={handleSort}
                keyword={searchedKeyword}
              />

              {/* 凡例（バズ度説明） */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  mt: 3,
                  p: 2,
                  backgroundColor: 'background.surface',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    大バズ (3.0x以上)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    バズ (1.0x〜3.0x)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: 'text.primary',
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    通常 (1.0x未満)
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {videos.length > 0 ? 'フィルター条件に一致する動画がありません' : '検索結果がありません'}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* 初期状態 */}
      {!searchedKeyword && !isLoading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            キーワードを入力してバズ動画を検索しましょう
          </Typography>
          <Typography color="text.secondary" variant="body2">
            再生倍率（再生数÷登録者数）で動画のバズ度を自動計算します
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SearchPage;
