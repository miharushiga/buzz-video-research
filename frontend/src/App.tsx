import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { MainLayout } from './layouts/MainLayout';
import { SearchPage } from './pages/SearchPage';
import { VideoDetailPage } from './pages/VideoDetailPage';

// React Query クライアント
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* 検索ページ */}
              <Route path="/" element={<SearchPage />} />
              {/* 動画詳細ページ */}
              <Route path="/video/:videoId" element={<VideoDetailPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
