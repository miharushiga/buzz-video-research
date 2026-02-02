/**
 * フッターコンポーネント - バズ動画リサーチくん
 */

import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
          }}
        >
          {/* リンク */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              利用規約
            </Link>
            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="mailto:bemdrt@gmail.com"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              お問い合わせ
            </Link>
          </Box>

          {/* コピーライト */}
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} バズ動画リサーチくん
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 特定商取引法に基づく表記 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" component="div">
            特定商取引法に基づく表記
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
            販売業者: 個人事業 | 運営責任者: お問い合わせにて開示 |
            所在地: お問い合わせにて開示 | 連絡先: bemdrt@gmail.com |
            販売価格: 月額9,900円（税込） | 支払方法: PayPal |
            サービス提供時期: 決済完了後即時 | 返品・キャンセル: 当月分の返金は不可、次月以降のキャンセルは可能
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
