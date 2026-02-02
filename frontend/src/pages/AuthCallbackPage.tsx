/**
 * 認証コールバックページ - バズ動画リサーチくん
 *
 * OAuth認証後のリダイレクト先
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    // 環境変数を取得してトリム
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

    // 新しいクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseKey);

    const checkSession = async (): Promise<boolean> => {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    };

    const decodeJWT = (token: string): Record<string, unknown> | null => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    };

    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // JWTをデコード
        let jwtInfo = '';
        if (accessToken) {
          const payload = decodeJWT(accessToken);
          if (payload) {
            jwtInfo = `\n\nJWTペイロード:\n`;
            jwtInfo += `iss: ${payload.iss}\n`;
            jwtInfo += `aud: ${payload.aud}\n`;
            jwtInfo += `sub: ${payload.sub}\n`;
            jwtInfo += `email: ${payload.email}\n`;
            jwtInfo += `exp: ${payload.exp} (${new Date((payload.exp as number) * 1000).toLocaleString()})`;
          } else {
            jwtInfo = '\n\nJWT: デコード失敗';
          }
        }

        // デバッグ情報を表示
        let debug = `Supabase URL (trimmed): [${supabaseUrl}] (${supabaseUrl.length}文字)\n`;
        debug += `Supabase Key: ${supabaseKey.length}文字\n`;
        debug += `access_token: ${accessToken?.length || 0}文字\n`;
        debug += `refresh_token: [${refreshToken}]`;
        debug += jwtInfo;
        setDebugInfo(debug);

        if (accessToken) {
          // まずgetUserでトークンを検証
          setDebugInfo(prev => prev + '\n\ngetUser試行中...');

          try {
            const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

            if (userError) {
              setDebugInfo(prev => prev + `\ngetUserエラー: ${userError.message}`);
            } else if (userData?.user) {
              setDebugInfo(prev => prev + `\ngetUser成功: ${userData.user.email}`);

              // LocalStorageに直接セッションを保存
              const sessionData = {
                access_token: accessToken,
                refresh_token: refreshToken || '',
                token_type: 'bearer',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                user: userData.user,
              };

              const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
              localStorage.setItem(storageKey, JSON.stringify(sessionData));
              setDebugInfo(prev => prev + `\nセッション保存完了: ${storageKey}`);

              // URLをクリアしてホームへ
              window.history.replaceState(null, '', window.location.pathname);
              window.location.href = '/';
              return;
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setDebugInfo(prev => prev + `\ngetUser例外: ${msg}`);
          }
        }

        // トークンがない場合はセッションを確認
        const hasSession = await checkSession();
        if (hasSession && mounted) {
          navigate('/', { replace: true });
        } else if (mounted) {
          setError('認証に失敗しました。');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setDebugInfo(prev => prev + `\n\n例外: ${errorMessage}`);
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
        {debugInfo && (
          <Typography
            component="pre"
            sx={{
              fontSize: '11px',
              color: 'text.secondary',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              maxWidth: '90vw',
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
            }}
          >
            {debugInfo}
          </Typography>
        )}
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
