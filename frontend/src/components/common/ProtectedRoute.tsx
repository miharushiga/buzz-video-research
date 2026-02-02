/**
 * 保護されたルート - バズ動画リサーチくん
 *
 * 認証・サブスクリプション状態に応じてリダイレクト
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireSubscription = true,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, profile, subscription, isLoading, isInitialized } = useAuthStore();

  // 初期化中はローディング表示
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">読み込み中...</Typography>
      </Box>
    );
  }

  // 未認証の場合はログインページへ
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 管理者権限が必要な場合
  if (requireAdmin && !profile?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // サブスクリプションが必要な場合
  if (requireSubscription && !subscription?.isActive) {
    // サブスクリプションがない場合は料金ページへ
    if (subscription?.status === 'none') {
      return <Navigate to="/pricing" state={{ from: location }} replace />;
    }

    // 期限切れ・キャンセル済みの場合も料金ページへ
    if (subscription?.status === 'expired' || subscription?.status === 'cancelled') {
      return <Navigate to="/pricing" state={{ from: location, expired: true }} replace />;
    }
  }

  return <>{children}</>;
};

/**
 * 認証済みユーザーをリダイレクト（ログインページ等で使用）
 */
interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RedirectIfAuthenticated = ({
  children,
  redirectTo = '/',
}: RedirectIfAuthenticatedProps) => {
  const { user, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  // 初期化中はローディング表示
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">読み込み中...</Typography>
      </Box>
    );
  }

  // 認証済みの場合はリダイレクト
  if (user) {
    // 元のページに戻る（なければデフォルトへ）
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
