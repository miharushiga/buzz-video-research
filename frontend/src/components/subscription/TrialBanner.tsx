/**
 * トライアルバナー - バズ動画リサーチくん
 */

import { Typography, Button, CircularProgress, Paper } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface TrialBannerProps {
  onStartTrial: () => void;
  isLoading?: boolean;
  trialDays?: number;
}

export const TrialBanner = ({
  onStartTrial,
  isLoading = false,
  trialDays = 7,
}: TrialBannerProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
      }}
    >
      <RocketLaunchIcon sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {trialDays}日間無料トライアル
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
        クレジットカード不要ですぐに始められます
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onStartTrial}
        disabled={isLoading}
        sx={{
          backgroundColor: 'white',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'grey.100',
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="primary" />
        ) : (
          '無料で始める'
        )}
      </Button>
    </Paper>
  );
};

export default TrialBanner;
