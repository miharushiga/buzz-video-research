/**
 * ログインページ - バズ動画リサーチくん
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuthStore } from '../stores/authStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await signIn(email, password);
      navigate('/');
    } catch {
      // エラーはストアで処理済み
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await signInWithGoogle();
    } catch {
      // エラーはストアで処理済み
    }
  };

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
          maxWidth: 400,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* ロゴ */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            バズ動画リサーチくん
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ログインしてサービスを利用
          </Typography>
        </Box>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Googleログイン */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          sx={{ mb: 3 }}
        >
          Googleでログイン
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            または
          </Typography>
        </Divider>

        {/* メールログインフォーム */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'ログイン'}
          </Button>
        </Box>

        {/* リンク */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            アカウントをお持ちでない方は{' '}
            <Link component={RouterLink} to="/register">
              新規登録
            </Link>
          </Typography>
        </Box>

        {/* 利用規約 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ログインすることで、
            <Link component={RouterLink} to="/terms">
              利用規約
            </Link>
            と
            <Link component={RouterLink} to="/privacy">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
