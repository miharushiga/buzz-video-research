import { test, expect } from '@playwright/test';

/**
 * 動画詳細ページ（/video/:id）のE2Eテスト
 */

/**
 * E2E-VIDEO-001: 動画詳細表示
 *
 * 操作: 検索結果から動画をクリック
 * 期待結果: 動画詳細ページが表示され、サムネイル・タイトル・影響力が表示される
 */
test('E2E-VIDEO-001: 動画詳細表示', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: テーブルが表示されていることを確認
  const table = page.locator('table');
  await expect(table).toBeVisible();

  // Step 5: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  // Step 6: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // Step 7: サムネイルが表示されていることを確認
  const thumbnail = page.locator('img[alt]').first();
  await expect(thumbnail).toBeVisible();
  await expect(thumbnail).toHaveAttribute('src', /.+/);

  // Step 8: タイトルが表示されていることを確認
  const title = page.locator('h5');
  await expect(title).toBeVisible();
  const titleText = await title.textContent();
  expect(titleText).toBeTruthy();
  expect(titleText!.length).toBeGreaterThan(0);

  // Step 9: 影響力（バズ度）が表示されていることを確認
  const impactLabel = page.getByText('影響力（バズ度）');
  await expect(impactLabel).toBeVisible();

  // 影響力の数値（X.Xx形式）が表示されていることを確認
  const impactValue = page.locator('h2').filter({ hasText: /\d+\.\d+x/ });
  await expect(impactValue).toBeVisible();

  // 影響力レベルのラベル（大バズ/バズ/通常）が表示されていることを確認
  const impactChip = page.locator('.MuiChip-root').filter({
    hasText: /大バズ|バズ|通常/
  });
  await expect(impactChip).toBeVisible();
});

/**
 * E2E-VIDEO-002: 影響力セクション表示
 *
 * 操作: 動画詳細ページを確認
 * 期待結果: 影響力（バズ度）の数値、計算式、ラベル（大バズ/バズ/通常）が表示される
 */
test('E2E-VIDEO-002: 影響力セクション表示', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  // Step 5: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // Step 6: 影響力セクションのラベルが表示されていることを確認
  const impactSectionLabel = page.getByText('影響力（バズ度）');
  await expect(impactSectionLabel).toBeVisible();

  // Step 7: 影響力の数値（X.Xx形式）が表示されていることを確認
  const impactValue = page.locator('h2').filter({ hasText: /\d+\.\d+x/ });
  await expect(impactValue).toBeVisible();

  // 数値が正しい形式であることを確認（小数点1桁 + x）
  const impactText = await impactValue.textContent();
  expect(impactText).toMatch(/^\d+\.\d+x$/);

  // Step 8: 計算式が表示されていることを確認（「計算式: 再生回数 / 登録者数」）
  const formulaLabel = page.getByText('計算式:');
  await expect(formulaLabel).toBeVisible();

  const formulaText = page.getByText('再生回数 / 登録者数');
  await expect(formulaText).toBeVisible();

  // Step 9: 実際の計算内容が表示されていることを確認（「計算: X / Y = Z.Zx」形式）
  const calculationLabel = page.getByText('計算:').first();
  await expect(calculationLabel).toBeVisible();

  // 計算結果の詳細（数値 / 数値 = 数値x）が含まれていることを確認
  const calculationContainer = page.locator('text=/\\d[\\d,]* \\/ \\d[\\d,]* =/');
  await expect(calculationContainer).toBeVisible();

  // Step 10: 影響力レベルのラベル（大バズ/バズ/通常）のいずれかが表示されていることを確認
  const impactChip = page.locator('.MuiChip-root').filter({
    hasText: /大バズ|バズ|通常/
  });
  await expect(impactChip).toBeVisible();

  // Chipのテキストを取得して、正しいラベルであることを確認
  const chipText = await impactChip.textContent();
  expect(['大バズ', 'バズ', '通常']).toContain(chipText);
});

/**
 * E2E-VIDEO-003: 動画統計表示
 *
 * 操作: 動画詳細ページを確認
 * 期待結果: 再生回数、高評価数、高評価率、日平均再生数、投稿日、経過日数が表示される
 */
test('E2E-VIDEO-003: 動画統計表示', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  // Step 5: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // Step 6: 動画統計セクションのラベルが表示されていることを確認
  const statsSection = page.getByText('動画統計');
  await expect(statsSection).toBeVisible();

  // Step 7: 再生回数が表示されていることを確認
  const viewCountLabel = page.getByText('再生回数', { exact: true });
  await expect(viewCountLabel).toBeVisible();
  // 再生回数の値が数値形式（カンマ区切り）で表示されていることを確認
  const viewCountValue = viewCountLabel.locator('..').locator('h6');
  await expect(viewCountValue).toBeVisible();
  const viewCountText = await viewCountValue.textContent();
  expect(viewCountText).toMatch(/^[\d,]+$/);

  // Step 8: 高評価数が表示されていることを確認
  const likeCountLabel = page.getByText('高評価数', { exact: true });
  await expect(likeCountLabel).toBeVisible();
  const likeCountValue = likeCountLabel.locator('..').locator('h6');
  await expect(likeCountValue).toBeVisible();
  const likeCountText = await likeCountValue.textContent();
  expect(likeCountText).toMatch(/^[\d,]+$/);

  // Step 9: 高評価率が表示されていることを確認（XX.X%形式）
  const likeRatioLabel = page.getByText('高評価率', { exact: true });
  await expect(likeRatioLabel).toBeVisible();
  const likeRatioValue = likeRatioLabel.locator('..').locator('h6');
  await expect(likeRatioValue).toBeVisible();
  const likeRatioText = await likeRatioValue.textContent();
  expect(likeRatioText).toMatch(/^\d+(\.\d+)?%$/);

  // Step 10: 日平均再生数が表示されていることを確認
  const dailyAvgLabel = page.getByText('日平均再生数', { exact: true });
  await expect(dailyAvgLabel).toBeVisible();
  const dailyAvgValue = dailyAvgLabel.locator('..').locator('h6');
  await expect(dailyAvgValue).toBeVisible();
  const dailyAvgText = await dailyAvgValue.textContent();
  expect(dailyAvgText).toMatch(/^[\d,]+$/);

  // Step 11: 投稿日が表示されていることを確認（YYYY-MM-DD形式）
  const publishedAtLabel = page.getByText('投稿日', { exact: true });
  await expect(publishedAtLabel).toBeVisible();
  const publishedAtValue = publishedAtLabel.locator('..').locator('h6');
  await expect(publishedAtValue).toBeVisible();
  const publishedAtText = await publishedAtValue.textContent();
  expect(publishedAtText).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  // Step 12: 経過日数が表示されていることを確認（N日前形式）
  const daysAgoLabel = page.getByText('経過日数', { exact: true });
  await expect(daysAgoLabel).toBeVisible();
  const daysAgoValue = daysAgoLabel.locator('..').locator('h6');
  await expect(daysAgoValue).toBeVisible();
  const daysAgoText = await daysAgoValue.textContent();
  expect(daysAgoText).toMatch(/^\d+日前$/);
});

/**
 * E2E-VIDEO-004: チャンネル情報表示
 *
 * 操作: 動画詳細ページを確認
 * 期待結果: チャンネル名、登録者数、チャンネル開設日が表示される
 */
test('E2E-VIDEO-004: チャンネル情報表示', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  // Step 5: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // Step 6: チャンネル情報セクションのラベルが表示されていることを確認
  const channelSection = page.getByText('チャンネル情報');
  await expect(channelSection).toBeVisible();

  // Step 7: チャンネル名が表示されていることを確認
  const channelNameLabel = page.getByText('チャンネル名', { exact: true });
  await expect(channelNameLabel).toBeVisible();
  const channelNameValue = channelNameLabel.locator('..').locator('h6');
  await expect(channelNameValue).toBeVisible();
  const channelNameText = await channelNameValue.textContent();
  expect(channelNameText).toBeTruthy();
  expect(channelNameText!.length).toBeGreaterThan(0);

  // Step 8: 登録者数が表示されていることを確認（数値形式、カンマ区切り）
  const subscriberLabel = page.getByText('登録者数', { exact: true });
  await expect(subscriberLabel).toBeVisible();
  const subscriberValue = subscriberLabel.locator('..').locator('h6');
  await expect(subscriberValue).toBeVisible();
  const subscriberText = await subscriberValue.textContent();
  expect(subscriberText).toMatch(/^[\d,]+$/);

  // Step 9: チャンネル開設日が表示されていることを確認（YYYY-MM-DD形式）
  const channelCreatedAtLabel = page.getByText('チャンネル開設日', { exact: true });
  await expect(channelCreatedAtLabel).toBeVisible();
  const channelCreatedAtValue = channelCreatedAtLabel.locator('..').locator('h6');
  await expect(channelCreatedAtValue).toBeVisible();
  const channelCreatedAtText = await channelCreatedAtValue.textContent();
  expect(channelCreatedAtText).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

/**
 * E2E-VIDEO-005: YouTubeリンク
 *
 * 操作: 「YouTubeで見る」ボタンを確認
 * 期待結果: ボタンが存在し、正しいYouTube URLがhref属性に設定されている
 */
test('E2E-VIDEO-005: YouTubeリンク', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();

  // 動画IDを取得（URLから抽出するため、クリック後にURLを確認）
  await firstRow.click();

  // Step 5: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/([a-zA-Z0-9_-]+)/);

  // URLから動画IDを抽出
  const currentUrl = page.url();
  const urlMatch = currentUrl.match(/\/video\/([a-zA-Z0-9_-]+)/);
  expect(urlMatch).toBeTruthy();
  const videoId = urlMatch![1];

  // Step 6: 「YouTubeで見る」ボタンが存在することを確認
  const youtubeButton = page.getByRole('link', { name: /YouTubeで見る/ });
  await expect(youtubeButton).toBeVisible();

  // Step 7: ボタンに正しいYouTube URLがhref属性に設定されていることを確認
  const expectedUrl = `https://www.youtube.com/watch?v=${videoId}`;
  await expect(youtubeButton).toHaveAttribute('href', expectedUrl);

  // Step 8: target="_blank"が設定されていることを確認（新しいタブで開く）
  await expect(youtubeButton).toHaveAttribute('target', '_blank');

  // Step 9: rel="noopener noreferrer"が設定されていることを確認（セキュリティ対策）
  await expect(youtubeButton).toHaveAttribute('rel', 'noopener noreferrer');
});

/**
 * E2E-VIDEO-006: 一覧に戻る
 *
 * 操作: 「一覧に戻る」ボタンをクリック
 * 期待結果: 検索ページ（`/`）に戻る
 */
test('E2E-VIDEO-006: 一覧に戻る', async ({ page }) => {
  // Step 1: 検索ページにアクセス
  await page.goto('/');

  // Step 2: キーワードを入力して検索を実行
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // Step 3: 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // Step 4: 最初の動画の行をクリックして詳細ページに遷移
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  // Step 5: URLが /video/:videoId 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // Step 6: 「一覧に戻る」ボタン（リンクとしてレンダリング）を見つけてクリック
  const backButton = page.getByRole('link', { name: /一覧に戻る/ });
  await expect(backButton).toBeVisible();
  await backButton.click();

  // Step 7: 検索ページ（/）に戻ったことを確認
  await expect(page).toHaveURL('/');

  // Step 8: 検索ページが正しく表示されていることを確認（キーワード入力欄の存在で判定）
  const keywordInputOnSearchPage = page.getByLabel('キーワード');
  await expect(keywordInputOnSearchPage).toBeVisible();
});

/**
 * E2E-VIDEO-007: 存在しない動画ID
 *
 * 操作: 直接`/video/invalid-id`にアクセス
 * 期待結果: 「動画が見つかりません」エラーメッセージと戻るボタンが表示される
 */
test.only('E2E-VIDEO-007: 存在しない動画ID', async ({ page }) => {
  // Step 1: 存在しない動画IDで直接詳細ページにアクセス
  await page.goto('/video/invalid-id');

  // Step 2: エラーメッセージが表示されていることを確認
  const errorMessage = page.getByText('動画が見つかりません');
  await expect(errorMessage).toBeVisible();

  // Step 3: 戻るボタン（「一覧に戻る」ボタン）が表示されていることを確認
  const backButton = page.getByRole('link', { name: /一覧に戻る/ });
  await expect(backButton).toBeVisible();

  // Step 4: 戻るボタンをクリックして検索ページに戻れることを確認
  await backButton.click();

  // Step 5: 検索ページ（/）に戻ったことを確認
  await expect(page).toHaveURL('/');

  // Step 6: 検索ページが正しく表示されていることを確認
  const keywordInput = page.getByLabel('キーワード');
  await expect(keywordInput).toBeVisible();
});
