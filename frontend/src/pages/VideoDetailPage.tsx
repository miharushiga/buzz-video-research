import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSearchStore } from '../stores/searchStore';
import { getImpactLevel, type ImpactLevel, type Video } from '../types';

// 影響力レベルに応じた色を取得
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

// 影響力レベルに応じたラベルを取得
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

// 影響力セクションコンポーネント
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
        影響力（バズ度）
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

/**
 * P-002: 動画詳細ページ
 * 選択した動画の詳細情報を表示（公開ページ）
 */
export const VideoDetailPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { videos } = useSearchStore();

  // 検索結果から該当動画を取得
  const video = videos.find((v) => v.videoId === videoId);

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
          <ThumbnailSection video={video} />
        </Grid>

        {/* 右カラム: 動画情報 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* 動画タイトル */}
            <Box>
              <Typography variant="h5">{video.title}</Typography>
            </Box>

            {/* 影響力セクション */}
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
