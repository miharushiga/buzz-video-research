/**
 * PayPal決済ボタン - バズ動画リサーチくん
 */

import { useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useAuthStore } from '../../stores/authStore';
import { API_BASE_URL } from '../../lib/api';

interface PayPalButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const PayPalButton = ({ onError }: PayPalButtonProps) => {
  const { session } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!session?.access_token) {
      setError('ログインが必要です');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'サブスクリプションの作成に失敗しました');
      }

      // PayPalの承認ページへリダイレクト
      if (data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        throw new Error('承認URLが取得できませんでした');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '決済処理に失敗しました';
      setError(errorMessage);
      onError?.(e instanceof Error ? e : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CreditCardIcon />}
        onClick={handleClick}
        disabled={isLoading}
        sx={{
          py: 1.5,
          backgroundColor: '#0070ba',
          '&:hover': {
            backgroundColor: '#005ea6',
          },
        }}
      >
        {isLoading ? '処理中...' : 'PayPalで決済'}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <img
          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
          alt="PayPal"
          style={{ height: 23 }}
        />
      </Box>
    </Box>
  );
};

export default PayPalButton;
