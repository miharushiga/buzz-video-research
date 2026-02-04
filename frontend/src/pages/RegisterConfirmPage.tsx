/**
 * 登録確認ページ - バズ動画リサーチくん
 *
 * メール認証の案内を表示
 */

import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const RegisterConfirmPage = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';

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
          maxWidth: 450,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        {/* ロゴ */}
        <Box sx={{ mb: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            バズ動画リサーチくん
          </Typography>
        </Box>

        {/* メールアイコン */}
        <Box sx={{ mb: 3 }}>
          <MarkEmailReadIcon sx={{ fontSize: 80, color: 'success.main' }} />
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          確認メールを送信しました
        </Typography>

        <Alert severity="info" sx={{ my: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>{email || 'ご登録のメールアドレス'}</strong> に確認メールを送信しました。
          </Typography>
        </Alert>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          メール内のリンクをクリックして、メールアドレスの認証を完了してください。
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </Typography>

        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          size="large"
          fullWidth
        >
          ログインページへ
        </Button>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            認証完了後、ログインしてサービスをご利用いただけます。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterConfirmPage;
