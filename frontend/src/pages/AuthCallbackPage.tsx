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

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

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
        let debug = `Supabase URL: [${supabaseUrl}]\n`;
        debug += `access_token: ${accessToken?.length || 0}文字\n`;
        debug += `refresh_token: [${refreshToken}]`;
        debug += jwtInfo;
        setDebugInfo(debug);

        if (accessToken) {
          setDebugInfo(prev => prev + '\n\nセッション設定中...');

          // refresh_tokenが短すぎる場合は、ダミーの長いトークンを使用
          const safeRefreshToken = refreshToken && refreshToken.length > 20
            ? refreshToken
            : accessToken; // アクセストークンをリフレッシュトークンとして使用（一時的な回避策）

          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: safeRefreshToken,
            });

            if (error) {
              setDebugInfo(prev => prev + `\nsetSessionエラー: ${error.message}`);
              // エラーでも続行 - getSessionを試す
            } else if (data.session) {
              setDebugInfo(prev => prev + '\nセッション設定成功！');
              window.history.replaceState(null, '', window.location.pathname);
              navigate('/', { replace: true });
              return;
            }
          } catch (e) {
            setDebugInfo(prev => prev + `\nsetSession例外: ${e instanceof Error ? e.message : String(e)}`);
          }

          // getSessionを試す
          setDebugInfo(prev => prev + '\n\ngetSession試行中...');
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setDebugInfo(prev => prev + '\nセッション取得成功！');
            window.history.replaceState(null, '', window.location.pathname);
            navigate('/', { replace: true });
            return;
          }
          setDebugInfo(prev => prev + '\nセッションなし');
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
