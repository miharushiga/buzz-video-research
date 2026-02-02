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
    const handleCallback = async () => {
      try {
        // URLからセッションを取得（ハッシュフラグメントを処理）
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          console.log('Session found, redirecting to home');
          // セッションがある場合はホームへリダイレクト
          navigate('/', { replace: true });
        } else {
          // セッションがない場合は少し待ってから再試行
          console.log('No session yet, waiting...');

          // onAuthStateChangeを待つ
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              console.log('Auth state changed in callback:', event);
              if (session) {
                subscription.unsubscribe();
                navigate('/', { replace: true });
              }
            }
          );

          // タイムアウト後にログインページへ
          setTimeout(() => {
            subscription.unsubscribe();
            console.log('Timeout, redirecting to login');
            navigate('/login', { replace: true });
          }, 5000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('認証処理中にエラーが発生しました');
      }
    };

    handleCallback();
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
