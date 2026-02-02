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
    let subscription: { unsubscribe: () => void } | null = null;

    const handleCallback = async () => {
      try {
        console.log('Auth callback started, URL hash:', window.location.hash ? 'present' : 'empty');

        // まずonAuthStateChangeをセットアップ
        const { data: authData } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed in callback:', event, session ? 'session exists' : 'no session');
            if (mounted && session) {
              console.log('Session detected via onAuthStateChange, redirecting...');
              navigate('/', { replace: true });
            }
          }
        );
        subscription = authData.subscription;

        // URLハッシュにトークンがある場合、Supabaseが処理するのを待つ
        if (window.location.hash.includes('access_token')) {
          console.log('Access token found in URL hash, waiting for Supabase to process...');

          // 少し待ってからセッションを確認
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data, error } = await supabase.auth.getSession();
          console.log('Session check result:', data?.session ? 'session exists' : 'no session', error);

          if (error) {
            console.error('Auth callback error:', error);
            if (mounted) setError(error.message);
            return;
          }

          if (data.session && mounted) {
            console.log('Session found after delay, redirecting to home');
            navigate('/', { replace: true });
            return;
          }
        }

        // セッションがまだない場合はさらに待つ
        console.log('Waiting for auth state change...');

        // タイムアウト後にログインページへ
        setTimeout(() => {
          if (mounted) {
            console.log('Timeout reached, checking session one more time...');
            supabase.auth.getSession().then(({ data }) => {
              if (mounted) {
                if (data.session) {
                  console.log('Session found on timeout, redirecting to home');
                  navigate('/', { replace: true });
                } else {
                  console.log('No session found, redirecting to login');
                  navigate('/login', { replace: true });
                }
              }
            });
          }
        }, 5000);
      } catch (err) {
        console.error('Callback processing error:', err);
        if (mounted) setError('認証処理中にエラーが発生しました');
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
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
