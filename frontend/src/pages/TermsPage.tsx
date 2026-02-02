/**
 * 利用規約ページ - バズ動画リサーチくん
 */

import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const TermsPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            利用規約
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            最終更新日: 2026年2月2日
          </Typography>

          <Section title="事業者情報">
            <Typography component="div" sx={{ pl: 2 }}>
              <table>
                <tbody>
                  <tr>
                    <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>事業者名</td>
                    <td style={{ paddingBottom: '8px' }}>株式会社天命</td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '24px' }}>連絡先</td>
                    <td>info@tenmeijouju.com</td>
                  </tr>
                </tbody>
              </table>
            </Typography>
          </Section>

          <Section title="第1条（適用）">
            <Typography paragraph>
              本利用規約（以下「本規約」）は、バズ動画リサーチくん（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で本サービスを利用するものとします。
            </Typography>
          </Section>

          <Section title="第2条（定義）">
            <Typography paragraph>
              本規約において使用する用語の定義は以下の通りとします。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>「本サービス」とは、当社が提供するYouTube動画分析サービスを指します。</li>
              <li>「ユーザー」とは、本サービスを利用するすべての個人または法人を指します。</li>
              <li>「コンテンツ」とは、本サービスを通じて提供される情報、データ、分析結果等を指します。</li>
            </Typography>
          </Section>

          <Section title="第3条（アカウント登録）">
            <Typography paragraph>
              1. ユーザーは、本サービスを利用するためにアカウント登録が必要です。
            </Typography>
            <Typography paragraph>
              2. ユーザーは、登録情報について正確かつ最新の情報を提供する義務を負います。
            </Typography>
            <Typography paragraph>
              3. ユーザーは、自己のアカウント情報を適切に管理し、第三者に使用させてはなりません。
            </Typography>
          </Section>

          <Section title="第4条（サービス内容）">
            <Typography paragraph>
              本サービスは、YouTube動画のデータを分析し、影響力（バズ度）等の指標を提供するサービスです。本サービスはYouTube Data APIを利用していますが、YouTube LLCとは関係ありません。
            </Typography>
          </Section>

          <Section title="第5条（料金および支払い）">
            <Typography paragraph>
              1. 本サービスの利用料金は、月額9,900円（税込）とします。
            </Typography>
            <Typography paragraph>
              2. 新規登録ユーザーには7日間の無料トライアル期間が付与されます。
            </Typography>
            <Typography paragraph>
              3. 料金の支払いはPayPalを通じて行われます。
            </Typography>
            <Typography paragraph>
              4. サブスクリプションは自動更新されます。キャンセルは請求期間終了前に行う必要があります。
            </Typography>
          </Section>

          <Section title="第6条（禁止事項）">
            <Typography paragraph>
              ユーザーは以下の行為を行ってはなりません。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>不正アクセスまたはこれを試みる行為</li>
              <li>本サービスのデータを無断で複製、転売する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </Typography>
          </Section>

          <Section title="第7条（サービスの停止・変更）">
            <Typography paragraph>
              1. 当社は、以下の場合にサービスの全部または一部を停止することができます。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>システムの保守点検を行う場合</li>
              <li>天災、停電その他の不可抗力により運営が困難な場合</li>
              <li>その他、当社が必要と判断した場合</li>
            </Typography>
            <Typography paragraph>
              2. 当社は、本サービスの内容を予告なく変更することができます。
            </Typography>
          </Section>

          <Section title="第8条（免責事項）">
            <Typography paragraph>
              1. 本サービスは「現状有姿」で提供され、特定目的への適合性を保証するものではありません。
            </Typography>
            <Typography paragraph>
              2. 当社は、本サービスの利用により生じた損害について、故意または重過失がある場合を除き、責任を負いません。
            </Typography>
            <Typography paragraph>
              3. YouTube APIの仕様変更等により、サービスの機能が制限される場合があります。
            </Typography>
          </Section>

          <Section title="第9条（規約の変更）">
            <Typography paragraph>
              1. 当社は、必要に応じて本規約を変更することができます。
            </Typography>
            <Typography paragraph>
              2. 変更後の規約は、本サービス上での掲示により効力を生じます。
            </Typography>
          </Section>

          <Section title="第10条（準拠法・管轄）">
            <Typography paragraph>
              本規約は日本法に準拠し、本規約に関する紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </Typography>
          </Section>

          <Section title="第11条（お問い合わせ）">
            <Typography paragraph>
              本規約に関するお問い合わせは、以下までご連絡ください。
            </Typography>
            <Typography paragraph>
              株式会社天命<br />
              メールアドレス: info@tenmeijouju.com
            </Typography>
          </Section>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Link component={RouterLink} to="/">
              ホームに戻る
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

export default TermsPage;
