/**
 * 認証コールバックページ - バズ動画リサーチくん
 *
 * OAuth認証後のリダイレクト先
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../lib/supabase';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            if (mounted) setError(`認証エラー: ${setSessionError.message}`);
            return;
          }

          if (data.session) {
            window.history.replaceState(null, '', window.location.pathname);
            if (mounted) {
              navigate('/', { replace: true });
            }
            return;
          }
        }

        // トークンがない場合は既存のセッションを確認
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          if (mounted) {
            navigate('/', { replace: true });
          }
        } else {
          if (mounted) {
            setError('認証に失敗しました。もう一度お試しください。');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (mounted) setError(`エラー: ${errorMessage}`);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 2,
        }}
      >
        <Typography color="error">{error}</Typography>
        <Typography
          component="a"
          href="/login"
          sx={{ color: 'primary.main', textDecoration: 'underline' }}
        >
          ログインページに戻る
        </Typography>
      </Box>
    );
  }

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
      <Typography color="text.secondary">認証処理中...</Typography>
    </Box>
  );
};

export default AuthCallbackPage;
