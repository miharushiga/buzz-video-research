/**
 * Googleログインボタン - バズ動画リサーチくん
 */

import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuthStore } from '../../stores/authStore';

interface GoogleLoginButtonProps {
  label?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleLoginButton = ({
  label = 'Googleでログイン',
  disabled = false,
  onSuccess,
  onError,
}: GoogleLoginButtonProps) => {
  const { signInWithGoogle, isLoading } = useAuthStore();

  const handleClick = async () => {
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Googleログインに失敗しました'));
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      size="large"
      startIcon={isLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {label}
    </Button>
  );
};

export default GoogleLoginButton;
