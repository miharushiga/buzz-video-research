import type { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * メインレイアウト - 全ページ共通
 * AppBar + コンテンツエリア
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
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
            }}
          >
            YouTube自動企画作成ツール
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // AppBarの高さ分のpadding
          pb: 4,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
