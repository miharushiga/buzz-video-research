import { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchStore } from '../stores/searchStore';
import { useAuthStore } from '../stores/authStore';
import { getImpactLevel, type ImpactLevel, type Video, type AnalysisResult } from '../types';

// 再生倍率レベルに応じた色を取得
const getImpactColor = (level: ImpactLevel): string => {
  switch (level) {
    case 'high':
      return '#ef4444'; // 赤: 大バズ
    case 'medium':
      return '#f59e0b'; // 黄: バズ
    default:
      return '#e2e8f0'; // 白: 通常
  }
};

// 再生倍率レベルに応じたラベルを取得
const getImpactLabel = (level: ImpactLevel): string => {
  switch (level) {
    case 'high':
      return '大バズ';
    case 'medium':
      return 'バズ';
    default:
      return '通常';
  }
};

// 数値をフォーマット
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// 日付をフォーマット
const formatDate = (dateString: string): string => {
  return dateString.split('T')[0];
};

// 戻るボタンコンポーネント
const BackButton = () => (
  <Box mb={3}>
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      component={RouterLink}
      to="/"
    >
      一覧に戻る
    </Button>
  </Box>
);

// サムネイルセクションコンポーネント
const ThumbnailSection = ({ video }: { video: Video }) => (
  <Paper
    elevation={0}
    sx={{
      overflow: 'hidden',
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      component="img"
      src={video.thumbnailUrl}
      alt={video.title}
      sx={{
        width: '100%',
        height: 'auto',
        aspectRatio: '16 / 9',
        objectFit: 'cover',
        display: 'block',
      }}
    />
    <Box p={2} textAlign="center">
      <Button
        variant="contained"
        startIcon={<OpenInNewIcon />}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          py: 1.5,
          px: 4,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
          },
        }}
      >
        YouTubeで見る
      </Button>
    </Box>
  </Paper>
);

// 再生倍率セクションコンポーネント
const ImpactSection = ({ video }: { video: Video }) => {
  const impactLevel = getImpactLevel(video.impactRatio);
  const impactColor = getImpactColor(impactLevel);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        再生倍率（バズ度）
      </Typography>
      <Box display="flex" alignItems="baseline" gap={2} mb={2}>
        <Typography variant="h2" fontWeight="bold" sx={{ color: impactColor }}>
          {video.impactRatio.toFixed(1)}x
        </Typography>
        <Chip
          label={getImpactLabel(impactLevel)}
          sx={{
            bgcolor: impactLevel !== 'low' ? `${impactColor}33` : 'transparent',
            color: impactColor,
            fontWeight: 500,
          }}
        />
      </Box>
      <Box sx={{ bgcolor: 'rgba(15, 10, 26, 0.5)', borderRadius: 1, p: 2 }}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>計算式:</Box> 再生回数 / 登録者数
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>計算:</Box>{' '}
          {formatNumber(video.viewCount)} / {formatNumber(video.subscriberCount)} ={' '}
          <Box component="span" sx={{ color: impactColor, fontWeight: 500 }}>{video.impactRatio.toFixed(1)}x</Box>
        </Typography>
      </Box>
    </Paper>
  );
};

// 動画統計セクションコンポーネント
const VideoStatsSection = ({ video }: { video: Video }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="subtitle1" color="text.secondary" mb={2}>
      動画統計
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">再生回数</Typography>
        <Typography variant="h6">{formatNumber(video.viewCount)}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">高評価数</Typography>
        <Typography variant="h6">{formatNumber(video.likeCount)}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">高評価率</Typography>
        <Typography variant="h6">{(video.likeRatio * 100).toFixed(1)}%</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">日平均再生数</Typography>
        <Typography variant="h6">{formatNumber(Math.round(video.dailyAvgViews))}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">投稿日</Typography>
        <Typography variant="h6">{formatDate(video.publishedAt)}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">経過日数</Typography>
        <Typography variant="h6">{video.daysAgo}日前</Typography>
      </Grid>
    </Grid>
  </Paper>
);

// チャンネル情報セクションコンポーネント
const ChannelInfoSection = ({ video }: { video: Video }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="subtitle1" color="text.secondary" mb={2}>
      チャンネル情報
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" color="text.secondary">チャンネル名</Typography>
        <Typography variant="h6">{video.channelName}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">登録者数</Typography>
        <Typography variant="h6">{formatNumber(video.subscriberCount)}</Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <Typography variant="caption" color="text.secondary">チャンネル開設日</Typography>
        <Typography variant="h6">{formatDate(video.channelCreatedAt)}</Typography>
      </Grid>
    </Grid>
  </Paper>
);

// バズ要因分析セクションコンポーネント
interface AnalysisSectionProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  onKeywordClick: (keyword: string) => void;
}

const AnalysisSection = ({ analysis, isLoading, error, onAnalyze, onKeywordClick }: AnalysisSectionProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="subtitle1" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <AutoAwesomeIcon fontSize="small" />
        バズ要因分析（AI）
      </Typography>
      {!analysis && !isLoading && (
        <Button
          variant="contained"
          size="small"
          onClick={onAnalyze}
          startIcon={<AutoAwesomeIcon />}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            },
          }}
        >
          分析する
        </Button>
      )}
    </Box>

    {isLoading && (
      <Box display="flex" alignItems="center" justifyContent="center" py={4}>
        <CircularProgress size={32} />
        <Typography ml={2} color="text.secondary">
          AIが分析中...
        </Typography>
      </Box>
    )}

    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}

    {analysis && (
      <Box>
        {/* 分析要約 */}
        <Box
          sx={{
            bgcolor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 1,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {analysis.analysisSummary}
          </Typography>
        </Box>

        {/* バズ要因 */}
        <Typography variant="subtitle2" mb={1.5} fontWeight={600} sx={{ color: '#1a1a2e' }}>
          バズ要因
        </Typography>
        <Box
          sx={{
            bgcolor: '#f5f5f7',
            borderRadius: 2,
            p: 2.5,
            mb: 3,
            whiteSpace: 'pre-wrap',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{
              color: '#333',
              lineHeight: 1.8,
              fontSize: '0.9rem',
            }}
          >
            {analysis.buzzFactors}
          </Typography>
        </Box>

        {/* 検索キーワード提案 */}
        <Typography variant="subtitle2" mb={0.5} display="flex" alignItems="center" gap={1} fontWeight={600} sx={{ color: '#1a1a2e' }}>
          <SearchIcon fontSize="small" />
          類似動画を探すキーワード
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          キーワードをクリックすると、そのキーワードで再検索できます
        </Typography>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {analysis.suggestedKeywords.map((item, index) => (
            <Box
              key={index}
              sx={{
                bgcolor: '#f5f5f7',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Chip
                label={item.keyword}
                size="medium"
                clickable
                onClick={() => onKeywordClick(item.keyword)}
                sx={{
                  bgcolor: '#6366f1',
                  color: 'white',
                  fontWeight: 600,
                  flexShrink: 0,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#4f46e5',
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#333',
                  lineHeight: 1.6,
                  pt: 0.3,
                }}
              >
                {item.reason}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    )}

    {!analysis && !isLoading && !error && (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        「分析する」ボタンをクリックすると、AIがこの動画のバズ要因を分析し、
        類似動画を探すための検索キーワードを提案します。
      </Typography>
    )}
  </Paper>
);

/**
 * P-002: 動画詳細ページ
 * 選択した動画の詳細情報を表示（公開ページ）
 */
export const VideoDetailPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { videos } = useSearchStore();
  const { session } = useAuthStore();

  // 分析状態
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // 検索結果から該当動画を取得
  const video = videos.find((v) => v.videoId === videoId);

  // キーワードクリック時のハンドラー
  const handleKeywordClick = (keyword: string) => {
    // URLクエリパラメータ付きで検索ページに遷移
    navigate(`/?q=${encodeURIComponent(keyword)}`);
  };

  // 分析API呼び出し
  const handleAnalyze = async () => {
    if (!video) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 認証ヘッダーを追加
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ video }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('ログインが必要です');
        }
        if (response.status === 402) {
          throw new Error('有効なサブスクリプションが必要です');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '分析に失敗しました');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!video) {
    return (
      <Container maxWidth="lg" sx={{ p: 3 }}>
        <BackButton />
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography color="text.secondary">
            動画が見つかりません。検索ページから動画を選択してください。
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ p: 3 }}>
      <BackButton />
      <Grid container spacing={4}>
        {/* 左カラム: サムネイル */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <ThumbnailSection video={video} />

            {/* バズ要因分析セクション */}
            <AnalysisSection
              analysis={analysis}
              isLoading={isAnalyzing}
              error={analysisError}
              onAnalyze={handleAnalyze}
              onKeywordClick={handleKeywordClick}
            />
          </Box>
        </Grid>

        {/* 右カラム: 動画情報 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* 動画タイトル */}
            <Box>
              <Typography variant="h5">{video.title}</Typography>
            </Box>

            {/* 再生倍率セクション */}
            <ImpactSection video={video} />

            {/* 動画統計セクション */}
            <VideoStatsSection video={video} />

            {/* チャンネル情報セクション */}
            <ChannelInfoSection video={video} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoDetailPage;
