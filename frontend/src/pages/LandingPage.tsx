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
      title: '検索ワード自動提案',
      description: '「何を検索すればいいかわからない」を解決。AIが最適な検索キーワードを提案します。',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: 'バズ度自動計算',
      description: '再生数÷登録者数で「真のバズ度」を計算。登録者が少なくてもバズった動画を発見。',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: 'AI バズ要因分析',
      description: 'なぜその動画がバズったのか？タイトル・内容・コメントからAIが徹底分析。',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#FF0000' }} />,
      title: '実践者のノウハウ',
      description: '何千万円もかけてYouTubeで実践・検証してきた「バズの法則」をシステム化。',
    },
  ];

  const steps = [
    { number: '1', title: 'キーワードを入力', description: '調べたいジャンルやテーマを入力' },
    { number: '2', title: '検索実行', description: 'ボタンを押すだけで自動収集' },
    { number: '3', title: 'バズ動画を発見', description: 'バズ度順にソートして一目で把握' },
  ];

  const benefits = [
    '何千万円もかけて学んだ「バズの法則」が、月額9,900円で使い放題',
    '登録者数に騙されない。本当にバズった動画だけを発見',
    '企画会議の前に5分リサーチするだけで、ネタが溢れ出す',
    '初心者でもトップYouTuber並みのリサーチが可能に',
    '「何を検索すればいいか」もう悩まない。AIが提案してくれる',
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
                fontSize: { xs: '1.5rem', md: '2.5rem' },
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
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.9,
                mt: 2,
              }}
            >
              何年もかけて分析し、失敗を繰り返し、やっと掴んだ成功パターン。
              <br />
              そのエッセンスを、たった数クリックで手に入れる。
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

      {/* 実績セクション */}
      <Box sx={{ bgcolor: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="center"
            alignItems="center"
            spacing={{ xs: 3, md: 8 }}
          >
            <Stack alignItems="center">
              <Typography variant="h3" fontWeight="bold" color="#FF0000">
                ¥数千万
              </Typography>
              <Typography color="text.secondary">投資した広告費・制作費</Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h3" fontWeight="bold" color="#FF0000">
                500本+
              </Typography>
              <Typography color="text.secondary">分析した動画数</Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h3" fontWeight="bold" color="#FF0000">
                10万人
              </Typography>
              <Typography color="text.secondary">達成した登録者数</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 問題提起セクション */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack alignItems="center" textAlign="center" spacing={4}>
          <Typography variant="h4" fontWeight="bold" color="#333">
            でも、こんな悩みはありませんか？
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[
              '登録者数が多い動画ばかり出てくる',
              '「本当にバズった動画」が見つからない',
              'リサーチに何時間もかかる',
              '真似しても再現できない',
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
          <Box sx={{ mt: 4, p: 4, bgcolor: '#E8F5E9', borderRadius: 3, maxWidth: 850, border: '2px solid #4CAF50' }}>
            <Typography variant="h5" fontWeight="bold" color="#333" gutterBottom>
              バズ動画リサーチくんなら、
              <Box component="span" color="#FF0000">「バズ度」</Box>で動画を評価。
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              再生数÷登録者数 = <strong>バズ度（再生倍率）</strong>
              <br />
              登録者1万人で10万回再生なら、バズ度は10倍。これが「本当にバズった動画」の指標です。
              <br />
              大手チャンネルの動画に埋もれることなく、小さくてもバズった動画を発見できます。
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

      {/* キーワード提案セクション（新規追加） */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" spacing={4}>
            <Chip
              label="独自機能"
              sx={{
                bgcolor: '#FFD700',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ lineHeight: 1.5 }}
            >
              「何を検索すればいいかわからない」
              <br />
              その悩み、終わりにしませんか？
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, maxWidth: 700, lineHeight: 1.8 }}
            >
              バズ動画を見つけたい。でも、<strong>検索ワードが思いつかない。</strong>
              <br />
              これがYouTubeリサーチの最大の壁です。
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" color="#FF6B6B" gutterBottom>
                      従来のリサーチ
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        '検索ワードを自分で考える必要がある',
                        '思いついたワードでしか検索できない',
                        '見つかる動画に偏りが出る',
                        '競合と同じ動画ばかり参考にしてしまう',
                      ].map((item, index) => (
                        <Typography key={index} variant="body2" sx={{ opacity: 0.8 }}>
                          ✕ {item}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    border: '2px solid #4CAF50',
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" color="#4CAF50" gutterBottom>
                      バズ動画リサーチくん
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        'AIが最適な検索キーワードを自動提案',
                        '分析結果から次の検索ワードを発見',
                        'クリックするだけで再検索が可能',
                        '思いもよらないバズ動画に出会える',
                      ].map((item, index) => (
                        <Typography key={index} variant="body2" sx={{ color: '#4CAF50' }}>
                          ✓ {item}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                p: 4,
                bgcolor: 'rgba(255, 215, 0, 0.1)',
                borderRadius: 3,
                maxWidth: 800,
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                YouTubeで<Box component="span" sx={{ color: '#FFD700' }}>何千万円</Box>もかけて学んだ
                <br />
                「バズるキーワードの法則」をシステム化
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 2 }}>
                実際にYouTubeで何百本もの動画を投稿し、何千万円もの広告費をかけて検証してきた
                <strong>「バズを生む検索キーワードの法則」</strong>。
                <br />
                その全てをロジック化し、あなたのジャンルに合わせて自動提案します。
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

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
              「バズの法則」を、あなたの手に。
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              10万人YouTuberが何千万円もかけて実践し、やっと掴んだ成功パターン。
              <br />
              そのエッセンスを凝縮したシステムを、7日間無料でお試しください。
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

          {/* 特定商取引法に基づく表記 */}
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }} component="div">
              特定商取引法に基づく表記
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, mt: 0.5 }} component="div">
              販売業者: 株式会社天命 | 運営責任者: 志賀美春 |
              所在地: お問い合わせにて開示 | 連絡先: info@tenmeijouju.com |
              販売価格: 月額9,900円（税込） | 支払方法: PayPal |
              サービス提供時期: 決済完了後即時 | 返品・キャンセル: 当月分の返金は不可、次月以降のキャンセルは可能
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
