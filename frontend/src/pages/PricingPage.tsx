/**
 * 料金プランページ - バズ動画リサーチくん
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuthStore } from '../stores/authStore';
import { PayPalButton } from '../components/subscription/PayPalButton';
import { TrialBanner } from '../components/subscription/TrialBanner';

const FEATURES = [
  'YouTubeのバズ動画を無制限検索',
  '影響力（バズ度）の詳細分析',
  '動画データのCSVエクスポート',
  'チャンネル登録者数・再生回数分析',
  '期間・影響力でのフィルタリング',
];

export const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscription, startTrial } = useAuthStore();

  const [trialStarting, setTrialStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = (location.state as { expired?: boolean })?.expired;

  const handleStartTrial = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    setTrialStarting(true);
    setError(null);

    try {
      await startTrial();
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'トライアル開始に失敗しました');
    } finally {
      setTrialStarting(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    navigate('/');
  };

  // 既にアクティブなサブスクリプションがある場合
  if (subscription?.isActive) {
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
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ご利用中のプラン
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            現在{subscription.status === 'trialing' ? 'トライアル' : '有料プラン'}をご利用中です
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            サービスを利用する
          </Button>
        </Paper>
      </Box>
    );
  }

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
        }}
      >
        {/* ヘッダー */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight={700}>
            バズ動画リサーチくん
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            YouTubeのバズ動画を発見・分析
          </Typography>
        </Box>

        {/* 期限切れアラート */}
        {isExpired && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            サブスクリプションの期限が切れました。継続してご利用いただくには、プランを選択してください。
          </Alert>
        )}

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* トライアルバナー */}
        {subscription?.status !== 'expired' && subscription?.status !== 'cancelled' && (
          <TrialBanner onStartTrial={handleStartTrial} isLoading={trialStarting} />
        )}

        <Divider sx={{ my: 3 }} />

        {/* 料金プラン */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" fontWeight={700} color="primary">
            ¥9,900
            <Typography component="span" variant="body1" color="text.secondary">
              /月
            </Typography>
          </Typography>
        </Box>

        {/* 機能リスト */}
        <List>
          {FEATURES.map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        {/* 決済ボタン */}
        {user ? (
          <PayPalButton onSuccess={handleSubscriptionSuccess} />
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/register')}
            >
              無料トライアルを開始
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              既にアカウントをお持ちの方は{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/login')}
                sx={{ p: 0, minWidth: 'auto' }}
              >
                ログイン
              </Button>
            </Typography>
          </Box>
        )}

        {/* 注意事項 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            いつでもキャンセル可能です。
            <br />
            キャンセル後も請求期間終了まで利用できます。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PricingPage;
