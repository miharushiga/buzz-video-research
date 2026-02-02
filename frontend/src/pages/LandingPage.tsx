/**
 * ランディングページ - バズ動画リサーチくん
 *
 * サービス紹介・新規ユーザー獲得用
 */

import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Search,
  Analytics,
  Speed,
  CheckCircle,
  PlayCircleOutline,
  Star,
} from '@mui/icons-material';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: 'キーワード検索',
      description: '気になるキーワードで検索するだけ。YouTubeの膨大な動画から瞬時に結果を取得。',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: 'バズ度自動計算',
      description: '再生数÷登録者数で「バズり度」を自動計算。チャンネル規模に関係なく、本当にバズった動画がわかる。',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: '詳細分析',
      description: '高評価率、投稿タイミング、タイトルの特徴など、バズの要因を多角的に分析。',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: '時短リサーチ',
      description: '何時間もかかっていたリサーチが数分で完了。企画立案の時間を大幅に短縮。',
    },
  ];

  const steps = [
    { number: '1', title: 'キーワードを入力', description: '調べたいジャンルやテーマを入力' },
    { number: '2', title: '検索実行', description: 'ボタンを押すだけで自動収集' },
    { number: '3', title: 'バズ動画を発見', description: 'バズ度順にソートして一目で把握' },
  ];

  const benefits = [
    '成功者が何年もかけて見つけた「バズのパターン」が一目でわかる',
    '登録者数に騙されない「真の実力」を持つ動画を発見できる',
    '企画会議の前に5分リサーチするだけで、ネタが溢れ出す',
    '競合がなぜ伸びているのか、データで丸裸にできる',
    '初心者でもプロ並みのリサーチが可能に',
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      {/* ヘッダー */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          bgcolor: 'white',
          borderBottom: '1px solid #E0E0E0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <PlayCircleOutline sx={{ color: '#FF0000', fontSize: 32 }} />
              <Typography variant="h6" fontWeight="bold" color="#333">
                バズ動画リサーチくん
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 2 }}
              >
                ログイン
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FF0000',
                  '&:hover': { bgcolor: '#CC0000' },
                }}
              >
                無料で始める
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ヒーローセクション */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 50%, #990000 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack alignItems="center" textAlign="center" spacing={4}>
            <Chip
              label="7日間無料トライアル実施中"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                py: 2,
                px: 1,
              }}
            />
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.6rem', md: '2.8rem' },
                lineHeight: 1.4,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              10万人YouTuberが
              <br />
              血のにじむ努力で手に入れた
              <br />
              <Box component="span" sx={{ color: '#FFD700' }}>「バズの法則」</Box>を、あなたの手に。
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.95,
                maxWidth: 700,
                fontSize: { xs: '1rem', md: '1.2rem' },
                lineHeight: 1.8,
              }}
            >
              何年もかけて分析し、失敗を繰り返し、やっと掴んだ成功パターン。
              <br />
              そのエッセンスを、<Box component="span" fontWeight="bold">たった数クリック</Box>で手に入れる。
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'white',
                  color: '#FF0000',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#F5F5F5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                7日間無料で試す
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/pricing')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                料金プランを見る
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 現実セクション */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack alignItems="center" textAlign="center" spacing={4}>
          <Typography variant="h4" fontWeight="bold" color="#333">
            YouTubeで成功するのは、なぜ難しいのか？
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
            登録者10万人を超えるYouTuberたちは、何百本もの動画を投稿し、
            数え切れない失敗を経験し、膨大な時間をリサーチに費やしてきました。
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              '「なぜあの動画はバズったのか」がわからない',
              '真似してもなぜか自分の動画は伸びない',
              'リサーチに何時間もかけても成果が出ない',
              '登録者数が多いチャンネルの動画ばかり参考にしてしまう',
            ].map((problem, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: '#FFF5F5',
                    border: '1px solid #FFCCCC',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="#CC0000" fontWeight="medium">
                      {problem}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4, p: 4, bgcolor: '#FFF8E1', borderRadius: 3, maxWidth: 800 }}>
            <Typography variant="h5" fontWeight="bold" color="#333" gutterBottom>
              成功者が何年もかけて学んだことを、
              <Box component="span" color="#FF0000">一瞬で</Box>手に入れる方法があります。
            </Typography>
            <Typography color="text.secondary">
              バズ動画リサーチくんは、「再生数÷登録者数」という独自の指標で
              <strong>本当にバズった動画だけ</strong>を抽出。
              成功パターンを可視化し、あなたの企画に活かせます。
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* 機能紹介セクション */}
      <Box sx={{ bgcolor: 'white', py: 10 }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={6}>
            <Typography variant="h4" fontWeight="bold" color="#333" textAlign="center">
              バズ動画リサーチくんの特徴
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <CardContent sx={{ py: 4 }}>
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* 使い方セクション */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack alignItems="center" spacing={6}>
          <Typography variant="h4" fontWeight="bold" color="#333" textAlign="center">
            かんたん3ステップ
          </Typography>
          <Grid container spacing={4} alignItems="center">
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Stack alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#FF0000',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary" textAlign="center">
                    {step.description}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* メリットセクション */}
      <Box sx={{ bgcolor: '#333', color: 'white', py: 10 }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={4}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              バズ動画リサーチくんを使うと...
            </Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              {benefits.map((benefit, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography variant="body1">{benefit}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 料金セクション */}
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: '#FF0000',
              color: 'white',
              py: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              料金プラン
            </Typography>
          </Box>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Chip
              icon={<Star sx={{ color: '#FFD700 !important' }} />}
              label="7日間無料トライアル"
              sx={{
                bgcolor: '#FFF8E1',
                color: '#FF8F00',
                fontWeight: 'bold',
                mb: 3,
              }}
            />
            <Typography variant="h3" fontWeight="bold" color="#333">
              ¥9,900
              <Typography component="span" variant="h6" color="text.secondary">
                /月（税込）
              </Typography>
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Stack spacing={1.5} alignItems="flex-start" sx={{ mb: 4 }}>
              {[
                'キーワード検索 無制限',
                'バズ度自動計算',
                '詳細分析機能',
                '検索結果のエクスポート',
                'メールサポート',
              ].map((item, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={1}>
                  <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />
                  <Typography>{item}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#FF0000',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                py: 1.5,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#CC0000',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              無料トライアルを始める
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              クレジットカード不要・いつでもキャンセル可能
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* 最終CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" fontWeight="bold">
              成功への近道は、ここにある。
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500 }}>
              10万人YouTuberが何年もかけて手に入れた「バズの法則」。
              <br />
              7日間の無料トライアルで、その価値を体感してください。
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: '#FF0000',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                py: 2,
                px: 6,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#F5F5F5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              無料で始める
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* フッター */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#222',
          color: 'white',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <PlayCircleOutline sx={{ color: '#FF0000' }} />
              <Typography fontWeight="bold">バズ動画リサーチくん</Typography>
            </Stack>
            <Stack direction="row" spacing={3}>
              <Typography
                component="a"
                href="/terms"
                sx={{ color: 'white', textDecoration: 'none', '&:hover': { opacity: 0.8 } }}
              >
                利用規約
              </Typography>
              <Typography
                component="a"
                href="/privacy"
                sx={{ color: 'white', textDecoration: 'none', '&:hover': { opacity: 0.8 } }}
              >
                プライバシーポリシー
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2026 株式会社天命
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
