/**
 * アカウント管理ページ - バズ動画リサーチくん
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useAuthStore } from '../stores/authStore';
import { SubscriptionCard } from '../components/subscription/SubscriptionCard';

export const AccountPage = () => {
  const navigate = useNavigate();
  const { user, profile, subscription, signOut, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleSaveProfile = async () => {
    // プロファイル更新のAPI呼び出し（authStoreに追加が必要）
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // TODO: プロファイル更新API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleCancelSubscription = async () => {
    // TODO: キャンセルAPI呼び出し
    setShowCancelDialog(false);
  };

  if (!user || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        アカウント設定
      </Typography>

      {/* プロファイル */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">プロファイル</Typography>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>
            保存しました
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.avatarUrl}
            sx={{ width: 80, height: 80, mr: 3 }}
          >
            {profile.fullName?.[0] || user.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body1">{user.email}</Typography>
            {profile.isAdmin && (
              <Chip label="管理者" size="small" color="primary" sx={{ mt: 0.5 }} />
            )}
          </Box>
        </Box>

        <TextField
          fullWidth
          label="お名前"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={20} /> : '保存'}
        </Button>
      </Paper>

      {/* サブスクリプション */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCardIcon sx={{ mr: 1 }} />
          <Typography variant="h6">サブスクリプション</Typography>
        </Box>

        <SubscriptionCard
          subscription={subscription}
          onUpgrade={() => navigate('/pricing')}
          onCancel={() => setShowCancelDialog(true)}
        />
      </Paper>

      {/* アカウント操作 */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          アカウント操作
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          disabled={isLoading}
        >
          ログアウト
        </Button>
      </Paper>

      {/* キャンセル確認ダイアログ */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>サブスクリプションをキャンセル</DialogTitle>
        <DialogContent>
          <DialogContentText>
            サブスクリプションをキャンセルすると、現在の請求期間終了後にサービスが利用できなくなります。
            本当にキャンセルしますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>戻る</Button>
          <Button onClick={handleCancelSubscription} color="error">
            キャンセルする
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountPage;
