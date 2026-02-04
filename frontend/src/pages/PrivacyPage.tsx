/**
 * プライバシーポリシーページ - バズ動画リサーチくん
 */

import { Box, Container, Paper, Typography, Link, Button, Stack } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const PrivacyPage = () => {
  const location = useLocation();
  const fromRegister = (location.state as { fromRegister?: boolean })?.fromRegister;

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'background.default' }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            プライバシーポリシー
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            最終更新日: 2026年2月2日
          </Typography>

          <Section title="1. 事業者情報">
            <Typography component="div" sx={{ pl: 2 }}>
              <table>
                <tbody>
                  <tr>
                    <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>事業者名</td>
                    <td style={{ paddingBottom: '8px' }}>株式会社天命</td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '24px', paddingBottom: '8px' }}>個人情報保護管理者</td>
                    <td style={{ paddingBottom: '8px' }}>志賀美春</td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: '24px' }}>連絡先</td>
                    <td>info@tenmeijouju.com</td>
                  </tr>
                </tbody>
              </table>
            </Typography>
          </Section>

          <Section title="2. はじめに">
            <Typography paragraph>
              バズ動画リサーチくん（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて説明します。
            </Typography>
          </Section>

          <Section title="3. 収集する情報">
            <Typography paragraph>
              本サービスでは、以下の情報を収集します。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              3.1 アカウント情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>メールアドレス</li>
              <li>氏名（任意）</li>
              <li>プロフィール画像（Google認証の場合）</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              3.2 利用情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>検索キーワード</li>
              <li>サービス利用日時</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報）</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              3.3 決済情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>決済に関する情報はPayPalにより処理され、当社はクレジットカード番号等の決済情報を保持しません。</li>
            </Typography>
          </Section>

          <Section title="4. 情報の利用目的">
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

          <Section title="5. 情報の共有">
            <Typography paragraph>
              当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>サービス提供に必要な業務委託先への提供（適切な契約により保護されます）</li>
            </Typography>
          </Section>

          <Section title="6. 第三者サービス">
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

          <Section title="7. Google APIサービス ユーザーデータポリシー">
            <Typography paragraph>
              本サービスはYouTube Data APIを使用しています。本サービスの利用により、ユーザーはGoogleのプライバシーポリシー（
              <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener">
                https://policies.google.com/privacy
              </Link>
              ）に同意したものとみなされます。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              YouTube APIから取得する情報
            </Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>公開されている動画の情報（タイトル、説明、再生回数、高評価数など）</li>
              <li>公開されているチャンネルの情報（チャンネル名、登録者数など）</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              データの利用制限
            </Typography>
            <Typography paragraph>
              本サービスは、Google API サービスのユーザーデータポリシー（
              <Link href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">
                Google API Services User Data Policy
              </Link>
              ）に準拠しており、「制限付き使用」の要件を遵守しています。YouTube APIから取得したデータは、本サービスの機能提供のためにのみ使用され、第三者への販売や広告目的での使用は行いません。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Googleアカウントの接続解除
            </Typography>
            <Typography paragraph>
              ユーザーは、Googleアカウントの設定ページ（
              <Link href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener">
                https://security.google.com/settings/security/permissions
              </Link>
              ）から、本サービスへのアクセス許可をいつでも取り消すことができます。
            </Typography>
          </Section>

          <Section title="8. データの保存">
            <Typography paragraph>
              ユーザーの個人情報は、サービス提供に必要な期間、または法令で定められた期間保存されます。アカウント削除後、個人情報は速やかに削除されますが、法的義務や正当なビジネス上の理由により一部の情報を保持する場合があります。
            </Typography>
          </Section>

          <Section title="9. セキュリティ">
            <Typography paragraph>
              当社は、個人情報を保護するために適切な技術的・組織的措置を講じています。これには、暗号化、アクセス制限、定期的なセキュリティ監査が含まれます。
            </Typography>
          </Section>

          <Section title="10. ユーザーの権利">
            <Typography paragraph>
              ユーザーは、以下の権利を有します。
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>個人情報へのアクセス権（開示請求）</li>
              <li>個人情報の訂正を求める権利</li>
              <li>個人情報の削除を求める権利</li>
              <li>個人情報の利用停止を求める権利</li>
            </Typography>
          </Section>

          <Section title="11. 開示・訂正・削除等の請求手続き">
            <Typography paragraph>
              個人情報の開示、訂正、削除、利用停止等をご希望の場合は、以下の手続きに従ってご請求ください。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              請求方法
            </Typography>
            <Typography component="ol" sx={{ pl: 2, mb: 2 }}>
              <li>下記の連絡先へメールにてご請求ください</li>
              <li>本人確認のため、登録メールアドレスからの送信をお願いします</li>
              <li>請求内容（開示・訂正・削除・利用停止のいずれか）を明記してください</li>
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              対応期間
            </Typography>
            <Typography paragraph>
              ご請求を受け付けてから、原則として2週間以内に対応いたします。
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              連絡先
            </Typography>
            <Typography paragraph>
              株式会社天命 個人情報保護管理者<br />
              メールアドレス: info@tenmeijouju.com
            </Typography>
          </Section>

          <Section title="12. Cookieの使用">
            <Typography paragraph>
              本サービスでは、セッション管理および認証のためにCookieを使用します。ブラウザの設定でCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。
            </Typography>
          </Section>

          <Section title="13. 子どものプライバシー">
            <Typography paragraph>
              本サービスは16歳未満の方を対象としていません。16歳未満の方の個人情報を故意に収集することはありません。
            </Typography>
          </Section>

          <Section title="14. ポリシーの変更">
            <Typography paragraph>
              当社は、本プライバシーポリシーを随時更新する場合があります。重要な変更がある場合は、サービス上での通知またはメールでお知らせします。
            </Typography>
          </Section>

          <Section title="15. お問い合わせ">
            <Typography paragraph>
              本プライバシーポリシーに関するご質問は、以下までご連絡ください。
            </Typography>
            <Typography paragraph>
              株式会社天命<br />
              個人情報保護管理者: 志賀美春<br />
              メールアドレス: info@tenmeijouju.com
            </Typography>
          </Section>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={3}>
              {fromRegister && (
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                >
                  登録画面に戻る
                </Button>
              )}
              <Link component={RouterLink} to="/">
                ホームに戻る
              </Link>
            </Stack>
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
