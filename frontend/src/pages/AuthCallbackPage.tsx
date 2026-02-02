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
        // URLハッシュからトークンを抽出
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // トークンを使ってセッションを設定
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Failed to set session:', error);
            if (mounted) setError(error.message);
            return;
          }

          if (data.session && mounted) {
            // URLハッシュをクリア
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/', { replace: true });
            return;
          }
        }

        // トークンがない場合はセッションを確認
        const { data } = await supabase.auth.getSession();
        if (data.session && mounted) {
          navigate('/', { replace: true });
          return;
        }

        // セッションがない場合はログインページへ
        if (mounted) {
          setError('認証に失敗しました。もう一度お試しください。');
          setTimeout(() => {
            if (mounted) navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        if (mounted) setError('認証処理中にエラーが発生しました');
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
