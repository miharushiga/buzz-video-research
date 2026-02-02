/**
 * プライバシーポリシーページ - バズ動画リサーチくん
 */

import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const PrivacyPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            プライバシーポリシー
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            最終更新日: 2026年2月1日
          </Typography>

          <Section title="1. はじめに">
            <Typography paragraph>
              バズ動画リサーチくん（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて説明します。
            </Typography>
          </Section>

          <Section title="2. 収集する情報">
            <Typography paragraph>
              本サービスでは、以下の情報を収集します。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              2.1 アカウント情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>メールアドレス</li>
              <li>氏名（任意）</li>
              <li>プロフィール画像（Google認証の場合）</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              2.2 利用情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>検索キーワード</li>
              <li>サービス利用日時</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報）</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              2.3 決済情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>決済に関する情報はPayPalにより処理され、当社はクレジットカード番号等の決済情報を保持しません。</li>
            </Typography>
          </Section>

          <Section title="3. 情報の利用目的">
            <Typography paragraph>
              収集した情報は、以下の目的で利用します。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>サービスの提供および運営</li>
              <li>ユーザーサポートの提供</li>
              <li>サービスの改善および新機能の開発</li>
              <li>利用規約違反の調査</li>
              <li>法的義務の履行</li>
            </Typography>
          </Section>

          <Section title="4. 情報の共有">
            <Typography paragraph>
              当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>サービス提供に必要な業務委託先への提供（適切な契約により保護されます）</li>
            </Typography>
          </Section>

          <Section title="5. 第三者サービス">
            <Typography paragraph>
              本サービスでは、以下の第三者サービスを利用しています。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>
                <strong>Supabase</strong>: 認証およびデータベースサービス
                （<Link href="https://supabase.com/privacy" target="_blank" rel="noopener">プライバシーポリシー</Link>）
              </li>
              <li>
                <strong>PayPal</strong>: 決済処理
                （<Link href="https://www.paypal.com/jp/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener">プライバシーポリシー</Link>）
              </li>
              <li>
                <strong>YouTube Data API</strong>: 動画データの取得
                （<Link href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googleプライバシーポリシー</Link>）
              </li>
              <li>
                <strong>Google OAuth</strong>: 認証サービス
                （<Link href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googleプライバシーポリシー</Link>）
              </li>
            </Typography>
          </Section>

          <Section title="6. データの保存">
            <Typography paragraph>
              ユーザーの個人情報は、サービス提供に必要な期間、または法令で定められた期間保存されます。アカウント削除後、個人情報は速やかに削除されますが、法的義務や正当なビジネス上の理由により一部の情報を保持する場合があります。
            </Typography>
          </Section>

          <Section title="7. セキュリティ">
            <Typography paragraph>
              当社は、個人情報を保護するために適切な技術的・組織的措置を講じています。これには、暗号化、アクセス制限、定期的なセキュリティ監査が含まれます。
            </Typography>
          </Section>

          <Section title="8. ユーザーの権利">
            <Typography paragraph>
              ユーザーは、以下の権利を有します。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>個人情報へのアクセス権</li>
              <li>個人情報の訂正を求める権利</li>
              <li>個人情報の削除を求める権利</li>
              <li>個人情報の処理に異議を唱える権利</li>
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              これらの権利を行使する場合は、bemdrt@gmail.com までご連絡ください。
            </Typography>
          </Section>

          <Section title="9. Cookieの使用">
            <Typography paragraph>
              本サービスでは、セッション管理および認証のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。
            </Typography>
          </Section>

          <Section title="10. 子どものプライバシー">
            <Typography paragraph>
              本サービスは16歳未満の方を対象としていません。16歳未満の方の個人情報を故意に収集することはありません。
            </Typography>
          </Section>

          <Section title="11. ポリシーの変更">
            <Typography paragraph>
              当社は、本プライバシーポリシーを随時更新する場合があります。重要な変更がある場合は、サービス上での通知またはメールでお知らせします。
            </Typography>
          </Section>

          <Section title="12. お問い合わせ">
            <Typography paragraph>
              本プライバシーポリシーに関するご質問は、以下までご連絡ください。
            </Typography>
            <Typography paragraph>
              メールアドレス: bemdrt@gmail.com
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

export default PrivacyPage;
