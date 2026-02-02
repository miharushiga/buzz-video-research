import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuthStore } from '../stores/authStore';
import { Footer } from '../components/common/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * メインレイアウト - 全ページ共通
 * AppBar + コンテンツエリア + ユーザーメニュー
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { user, profile, subscription, signOut } = useAuthStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  // サブスクリプション状態ラベル
  const getSubscriptionLabel = () => {
    if (!subscription) return null;

    switch (subscription.status) {
      case 'trialing':
        return (
          <Chip
            label={`トライアル残り${subscription.daysRemaining}日`}
            size="small"
            color="info"
            variant="outlined"
          />
        );
      case 'active':
        return (
          <Chip
            label="有料プラン"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'cancelled':
      case 'expired':
        return (
          <Chip
            label="期限切れ"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <AppBar position="fixed" color="default" elevation={0}>
        <Toolbar>
          <AutoAwesomeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            バズ動画リサーチくん
          </Typography>

          {/* スペーサー */}
          <Box sx={{ flexGrow: 1 }} />

          {/* サブスクリプション状態 */}
          <Box sx={{ mr: 2 }}>
            {getSubscriptionLabel()}
          </Box>

          {/* ユーザーメニュー */}
          {user && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar
                  src={profile?.avatarUrl}
                  sx={{ width: 36, height: 36 }}
                >
                  {profile?.fullName?.[0] || user.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 200 },
                  },
                }}
              >
                {/* ユーザー情報 */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {profile?.fullName || 'ユーザー'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => handleNavigate('/account')}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>アカウント</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleNavigate('/pricing')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>プラン管理</ListItemText>
                </MenuItem>

                {/* 管理者メニュー */}
                {profile?.isAdmin && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => handleNavigate('/admin')}>
                      <ListItemIcon>
                        <AdminPanelSettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>管理者ダッシュボード</ListItemText>
                    </MenuItem>
                  </>
                )}

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>ログアウト</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // AppBarの高さ分のpadding
          pb: 4,
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* フッター */}
      <Footer />
    </Box>
  );
};

export default MainLayout;
