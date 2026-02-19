/**
 * 管理者ダッシュボード - バズ動画リサーチくん
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuthStore } from '../../stores/authStore';

interface DashboardStats {
  total_users: number;
  active_subscribers: number;
  trialing_users: number;
  monthly_revenue: number;
  total_searches: number;
  total_analyses: number;
  users_today: number;
  searches_today: number;
}

import { API_BASE_URL } from '../../lib/api';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('統計の取得に失敗しました');
        }

        const data = await response.json();
        setStats(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: '総ユーザー数',
      value: stats?.total_users ?? 0,
      icon: <PeopleIcon />,
      color: '#2196f3',
      sub: `本日 +${stats?.users_today ?? 0}`,
    },
    {
      title: 'アクティブ購読者',
      value: stats?.active_subscribers ?? 0,
      icon: <CreditCardIcon />,
      color: '#4caf50',
      sub: `トライアル中: ${stats?.trialing_users ?? 0}`,
    },
    {
      title: '今月の売上',
      value: `¥${(stats?.monthly_revenue ?? 0).toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: '#ff9800',
      sub: '',
    },
    {
      title: '総検索数',
      value: stats?.total_searches ?? 0,
      icon: <SearchIcon />,
      color: '#9c27b0',
      sub: `本日 ${stats?.searches_today ?? 0}`,
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={600}>
          管理者ダッシュボード
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/admin/settings')}
            sx={{ mr: 1 }}
          >
            設定
          </Button>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/admin/users')}
          >
            ユーザー管理
          </Button>
        </Box>
      </Box>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: `${card.color}15`,
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {card.value}
                </Typography>
                {card.sub && (
                  <Typography variant="caption" color="text.secondary">
                    {card.sub}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* タブ */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="最近のアクティビティ" />
          <Tab label="売上推移" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Typography color="text.secondary">
              最近のユーザーアクティビティがここに表示されます
            </Typography>
          )}
          {tabValue === 1 && (
            <Typography color="text.secondary">
              売上推移のグラフがここに表示されます
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
