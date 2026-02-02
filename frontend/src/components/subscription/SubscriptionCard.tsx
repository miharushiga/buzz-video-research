/**
 * サブスクリプションカード - バズ動画リサーチくん
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import type { SubscriptionStatus } from '../../stores/authStore';

interface SubscriptionCardProps {
  subscription: SubscriptionStatus | null;
  onUpgrade?: () => void;
  onCancel?: () => void;
}

export const SubscriptionCard = ({
  subscription,
  onUpgrade,
  onCancel,
}: SubscriptionCardProps) => {
  if (!subscription || subscription.status === 'none') {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            サブスクリプションなし
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            サービスを利用するにはプランにご登録ください。
          </Typography>
          <Button variant="contained" onClick={onUpgrade}>
            プランを選択
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    switch (subscription.status) {
      case 'trialing':
        return {
          label: 'トライアル中',
          color: 'info' as const,
          icon: <CheckCircleIcon />,
          description: `残り ${subscription.daysRemaining} 日`,
        };
      case 'active':
        return {
          label: '有効',
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          description: '月額 ¥9,900',
        };
      case 'cancelled':
        return {
          label: 'キャンセル済み',
          color: 'warning' as const,
          icon: <WarningIcon />,
          description: '期間終了後に利用停止',
        };
      case 'expired':
        return {
          label: '期限切れ',
          color: 'error' as const,
          icon: <ErrorIcon />,
          description: '再登録が必要です',
        };
      case 'past_due':
        return {
          label: '支払い遅延',
          color: 'error' as const,
          icon: <ErrorIcon />,
          description: '支払い情報を更新してください',
        };
      default:
        return {
          label: '不明',
          color: 'default' as const,
          icon: null,
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressValue = () => {
    if (subscription.status === 'trialing' && subscription.daysRemaining !== undefined) {
      // 7日間のトライアルとして計算
      return ((7 - subscription.daysRemaining) / 7) * 100;
    }
    return 0;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">現在のプラン</Typography>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            icon={statusInfo.icon || undefined}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {statusInfo.description}
        </Typography>

        {subscription.status === 'trialing' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={getProgressValue()}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              トライアル終了日: {formatDate(subscription.trialEnd)}
            </Typography>
          </Box>
        )}

        {subscription.status === 'active' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              次回請求日: {formatDate(subscription.currentPeriodEnd)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          {subscription.status === 'trialing' && (
            <Button variant="contained" onClick={onUpgrade}>
              有料プランに移行
            </Button>
          )}

          {subscription.status === 'active' && (
            <Button variant="outlined" color="error" onClick={onCancel}>
              キャンセル
            </Button>
          )}

          {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
            <Button variant="contained" onClick={onUpgrade}>
              プランを再開
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
