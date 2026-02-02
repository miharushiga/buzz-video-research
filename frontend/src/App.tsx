import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { MainLayout } from './layouts/MainLayout';
import { SearchPage } from './pages/SearchPage';
import { VideoDetailPage } from './pages/VideoDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PricingPage } from './pages/PricingPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { SettingsPage } from './pages/admin/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SubscriptionSuccessPage } from './pages/SubscriptionSuccessPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProtectedRoute, RedirectIfAuthenticated } from './components/common/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

// React Query クライアント
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      retry: 1,
    },
  },
});

// 認証初期化コンポーネント
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthInitializer>
            <Routes>
              {/* 認証ページ（未認証時のみ） */}
              <Route
                path="/login"
                element={
                  <RedirectIfAuthenticated>
                    <LoginPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/register"
                element={
                  <RedirectIfAuthenticated>
                    <RegisterPage />
                  </RedirectIfAuthenticated>
                }
              />

              {/* 料金ページ（認証不要） */}
              <Route path="/pricing" element={<PricingPage />} />

              {/* 認証コールバック（認証不要） */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* サブスクリプション成功ページ（認証必須） */}
              <Route
                path="/subscription/success"
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <SubscriptionSuccessPage />
                  </ProtectedRoute>
                }
              />

              {/* アカウントページ（認証必須、サブスク不要） */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute requireSubscription={false}>
                    <MainLayout>
                      <AccountPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* 管理者ページ（管理者のみ） */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireSubscription={false} requireAdmin={true}>
                    <MainLayout>
                      <AdminDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireSubscription={false} requireAdmin={true}>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requireSubscription={false} requireAdmin={true}>
                    <MainLayout>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* 保護されたページ（認証 + サブスク必須） */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requireSubscription={true}>
                    <MainLayout>
                      <SearchPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video/:videoId"
                element={
                  <ProtectedRoute requireSubscription={true}>
                    <MainLayout>
                      <VideoDetailPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* 法的文書ページ（公開） */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </AuthInitializer>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
