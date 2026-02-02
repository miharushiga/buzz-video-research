/**
 * サブスクリプション成功ページ - バズ動画リサーチくん
 *
 * PayPal決済完了後にリダイレクトされるページ
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8433';

export const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, fetchSubscription } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateSubscription = async () => {
      const subscriptionId = searchParams.get('subscription_id');

      if (!subscriptionId) {
        setStatus('error');
        setError('サブスクリプションIDが見つかりません');
        return;
      }

      if (!session?.access_token) {
        setStatus('error');
        setError('ログインが必要です');
        return;
      }

      try {
        // サブスクリプションをアクティブ化
        const response = await fetch(
          `${API_BASE_URL}/api/subscription/activate?paypal_subscription_id=${subscriptionId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'アクティブ化に失敗しました');
        }

        // サブスクリプション状態を更新
        await fetchSubscription();

        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'エラーが発生しました');
      }
    };

    activateSubscription();
  }, [searchParams, session, fetchSubscription]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              サブスクリプションを有効化しています...
            </Typography>
            <Typography color="text.secondary">
              しばらくお待ちください
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              サブスクリプションが有効になりました
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              ありがとうございます。すべての機能をご利用いただけます。
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
            >
              サービスを利用する
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              エラーが発生しました
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              問題が解決しない場合は、サポートまでお問い合わせください。
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/pricing')}>
                料金ページに戻る
              </Button>
              <Button variant="contained" onClick={() => navigate('/account')}>
                アカウント設定
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SubscriptionSuccessPage;
