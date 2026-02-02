import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  TableSortLabel,
  Tooltip,
  Button,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { useSearchStore } from '../stores/searchStore';
import { getImpactLevel, type Video, type SortConfig, type ImpactLevel } from '../types';

interface VideoTableProps {
  videos: Video[];
  sortConfig: SortConfig;
  onSort: (field: SortConfig['field']) => void;
  keyword: string;
}

/**
 * 動画一覧テーブル
 * 13項目を表示し、再生倍率で色分け
 */
export const VideoTable = ({ videos, sortConfig, onSort, keyword }: VideoTableProps) => {
  const navigate = useNavigate();
  const { setSearchResult } = useSearchStore();

  // 再生倍率レベルに応じた背景色
  const getImpactBgColor = (level: ImpactLevel): string => {
    switch (level) {
      case 'high':
        return 'rgba(239, 68, 68, 0.15)'; // 赤
      case 'medium':
        return 'rgba(245, 158, 11, 0.15)'; // 黄
      default:
        return 'transparent'; // 白（通常）
    }
  };

  // 再生倍率レベルに応じたテキスト色
  const getImpactTextColor = (level: ImpactLevel): string => {
    switch (level) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#e2e8f0';
    }
  };

  // 動画詳細ページへ遷移
  const handleRowClick = (video: Video) => {
    // ストアに検索結果を保存してから遷移
    setSearchResult({
      keyword,
      videos,
      searchedAt: new Date().toISOString(),
    });
    navigate(`/video/${video.videoId}`);
  };

  // CSVエクスポート
  const handleExportCsv = () => {
    const headers = [
      'キーワード',
      '動画投稿日',
      '動画URL',
      'タイトル',
      '高評価率',
      '再生倍率',
      '再生回数',
      'チャンネル名',
      '登録者数',
      'チャンネル開設日',
      '何日前',
      '日平均再生数',
    ];

    const rows = videos.map((v) => [
      keyword,
      new Date(v.publishedAt).toLocaleDateString('ja-JP'),
      v.url,
      `"${v.title.replace(/"/g, '""')}"`,
      `${(v.likeRatio * 100).toFixed(2)}%`,
      `${v.impactRatio.toFixed(2)}倍`,
      v.viewCount,
      `"${v.channelName.replace(/"/g, '""')}"`,
      v.subscriberCount,
      new Date(v.channelCreatedAt).toLocaleDateString('ja-JP'),
      v.daysAgo,
      Math.round(v.dailyAvgViews),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buzz_videos_${keyword}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* CSVエクスポートボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCsv}
          size="small"
        >
          CSVエクスポート
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 350px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 80 }}>サムネイル</TableCell>
              <TableCell sx={{ minWidth: 250 }}>タイトル</TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <TableSortLabel
                  active={sortConfig.field === 'impactRatio'}
                  direction={sortConfig.field === 'impactRatio' ? sortConfig.order : 'desc'}
                  onClick={() => onSort('impactRatio')}
                >
                  再生倍率
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <TableSortLabel
                  active={sortConfig.field === 'viewCount'}
                  direction={sortConfig.field === 'viewCount' ? sortConfig.order : 'desc'}
                  onClick={() => onSort('viewCount')}
                >
                  再生回数
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>高評価率</TableCell>
              <TableCell sx={{ minWidth: 150 }}>チャンネル</TableCell>
              <TableCell sx={{ minWidth: 100 }}>登録者数</TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <TableSortLabel
                  active={sortConfig.field === 'publishedAt'}
                  direction={sortConfig.field === 'publishedAt' ? sortConfig.order : 'desc'}
                  onClick={() => onSort('publishedAt')}
                >
                  投稿日
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <TableSortLabel
                  active={sortConfig.field === 'dailyAvgViews'}
                  direction={sortConfig.field === 'dailyAvgViews' ? sortConfig.order : 'desc'}
                  onClick={() => onSort('dailyAvgViews')}
                >
                  日平均
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 50 }}>リンク</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video) => {
              const impactLevel = getImpactLevel(video.impactRatio);
              return (
                <TableRow
                  key={video.videoId}
                  hover
                  onClick={() => handleRowClick(video)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: getImpactBgColor(impactLevel),
                    '&:hover': {
                      backgroundColor:
                        impactLevel === 'high'
                          ? 'rgba(239, 68, 68, 0.25)'
                          : impactLevel === 'medium'
                          ? 'rgba(245, 158, 11, 0.25)'
                          : 'action.hover',
                    },
                  }}
                >
                  {/* サムネイル */}
                  <TableCell>
                    <Box
                      component="img"
                      src={video.thumbnailUrl}
                      alt=""
                      sx={{
                        width: 80,
                        height: 45,
                        objectFit: 'cover',
                        borderRadius: 0.5,
                      }}
                    />
                  </TableCell>

                  {/* タイトル */}
                  <TableCell>
                    <Tooltip title={video.title}>
                      <Typography
                        sx={{
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {video.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  {/* 再生倍率 */}
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: getImpactTextColor(impactLevel),
                      }}
                    >
                      {video.impactRatio.toFixed(2)}倍
                    </Typography>
                  </TableCell>

                  {/* 再生回数 */}
                  <TableCell>{video.viewCount.toLocaleString()}</TableCell>

                  {/* 高評価率 */}
                  <TableCell>{(video.likeRatio * 100).toFixed(2)}%</TableCell>

                  {/* チャンネル */}
                  <TableCell>
                    <Tooltip title={video.channelName}>
                      <Typography
                        sx={{
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {video.channelName}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  {/* 登録者数 */}
                  <TableCell>{video.subscriberCount.toLocaleString()}</TableCell>

                  {/* 投稿日 */}
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {video.daysAgo}日前
                    </Typography>
                  </TableCell>

                  {/* 日平均再生数 */}
                  <TableCell>{Math.round(video.dailyAvgViews).toLocaleString()}</TableCell>

                  {/* 外部リンク */}
                  <TableCell>
                    <IconButton
                      size="small"
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VideoTable;
