/**
 * 新規登録ページ - バズ動画リサーチくん
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuthStore } from '../stores/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // バリデーション
    if (password !== confirmPassword) {
      setValidationError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setValidationError('パスワードは8文字以上で入力してください');
      return;
    }

    if (!agreeTerms) {
      setValidationError('利用規約への同意が必要です');
      return;
    }

    try {
      await signUp(email, password, fullName || undefined);
      // 登録成功後、確認メール送信画面へ（または自動ログイン）
      navigate('/');
    } catch {
      // エラーはストアで処理済み
    }
  };

  const handleGoogleLogin = async () => {
    if (!agreeTerms) {
      setValidationError('利用規約への同意が必要です');
      return;
    }

    clearError();
    setValidationError('');

    try {
      await signInWithGoogle();
    } catch {
      // エラーはストアで処理済み
    }
  };

  const displayError = validationError || error;

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
            7日間無料トライアルを開始
          </Typography>
        </Box>

        {/* エラー表示 */}
        {displayError && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => {
              clearError();
              setValidationError('');
            }}
          >
            {displayError}
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
          Googleで登録
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            または
          </Typography>
        </Divider>

        {/* メール登録フォーム */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="お名前（任意）"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ mb: 2 }}
          />

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
            label="パスワード（8文字以上）"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="パスワード（確認）"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          {/* 利用規約同意 */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                <Link component={RouterLink} to="/terms">
                  利用規約
                </Link>
                と
                <Link component={RouterLink} to="/privacy">
                  プライバシーポリシー
                </Link>
                に同意します
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? <CircularProgress size={24} /> : '無料トライアルを開始'}
          </Button>
        </Box>

        {/* リンク */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            すでにアカウントをお持ちの方は{' '}
            <Link component={RouterLink} to="/login">
              ログイン
            </Link>
          </Typography>
        </Box>

        {/* 料金情報 */}
        <Box
          sx={{
            mt: 4,
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            トライアル終了後は月額 <strong>¥9,900</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            いつでもキャンセル可能
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
