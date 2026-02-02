/**
 * 設定管理ページ - バズ動画リサーチくん
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useAuthStore } from '../../stores/authStore';

interface AppSettings {
  trial_days: number;
  monthly_price: number;
  admin_email: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8433';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();

  const [settings, setSettings] = useState<AppSettings>({
    trial_days: 7,
    monthly_price: 9900,
    admin_email: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('設定の取得に失敗しました');
        }

        const data = await response.json();
        setSettings(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [session]);

  const handleSave = async () => {
    if (!session?.access_token) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました');
      }

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, maxWidth: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          設定管理
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          設定を保存しました
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        {/* トライアル設定 */}
        <Typography variant="h6" gutterBottom>
          トライアル設定
        </Typography>
        <TextField
          fullWidth
          label="トライアル期間（日数）"
          type="number"
          value={settings.trial_days}
          onChange={(e) => setSettings({ ...settings, trial_days: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 1, max: 30 }}
          helperText="新規登録ユーザーに付与する無料トライアル期間"
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* 料金設定 */}
        <Typography variant="h6" gutterBottom>
          料金設定
        </Typography>
        <TextField
          fullWidth
          label="月額料金（円）"
          type="number"
          value={settings.monthly_price}
          onChange={(e) => setSettings({ ...settings, monthly_price: parseInt(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
          helperText="PayPalプランの料金と一致させてください"
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* 管理者設定 */}
        <Typography variant="h6" gutterBottom>
          管理者設定
        </Typography>
        <TextField
          fullWidth
          label="管理者メールアドレス"
          type="email"
          value={settings.admin_email}
          onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
          helperText="通知や問い合わせの送信先"
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          size="large"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          保存
        </Button>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
