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
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let checkCount = 0;
    const maxChecks = 10;

    const checkSession = async (): Promise<boolean> => {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    };

    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const hasHash = hash.includes('access_token');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // デバッグ情報を表示
        const debug = `Hash: ${hasHash ? 'あり' : 'なし'}\nURL設定: ${supabaseUrl ? 'あり' : 'なし'}\nKey設定: ${supabaseKey ? 'あり' : 'なし'}`;
        setDebugInfo(debug);

        if (hasHash) {
          // セッションが設定されるまでポーリング
          const pollSession = async () => {
            if (!mounted) return;

            checkCount++;
            const hasSession = await checkSession();
            setDebugInfo(prev => prev + `\nチェック${checkCount}: ${hasSession ? 'セッションあり' : 'セッションなし'}`);

            if (hasSession) {
              // セッション検出成功
              window.history.replaceState(null, '', window.location.pathname);
              navigate('/', { replace: true });
            } else if (checkCount < maxChecks) {
              // まだセッションがない場合は再試行
              setTimeout(pollSession, 500);
            } else {
              // 最大試行回数に達した
              if (mounted) {
                setError('認証に失敗しました。もう一度お試しください。');
              }
            }
          };

          // 最初のチェックを少し遅らせる
          setTimeout(pollSession, 500);
        } else {
          // ハッシュがない場合は直接セッションを確認
          const hasSession = await checkSession();
          if (hasSession && mounted) {
            navigate('/', { replace: true });
          } else if (mounted) {
            navigate('/login', { replace: true });
          }
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
      {debugInfo && (
        <Typography
          component="pre"
          sx={{
            fontSize: '12px',
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            maxWidth: '400px',
          }}
        >
          {debugInfo}
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallbackPage;
