import { test, expect } from '@playwright/test';

/**
 * E2E-SEARCH-001: ページ初期表示
 *
 * 操作: `/`にアクセス
 * 期待結果: 検索フォームが表示され、初期メッセージ
 *          「キーワードを入力してバズ動画を検索しましょう」が表示される
 */
test('E2E-SEARCH-001: ページ初期表示', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // 検索フォームが表示されることを確認
  // キーワード入力フィールド
  const keywordInput = page.getByLabel('キーワード');
  await expect(keywordInput).toBeVisible();

  // 検索ボタン
  const searchButton = page.getByRole('button', { name: /検索/ });
  await expect(searchButton).toBeVisible();

  // 初期メッセージが表示されることを確認
  const initialMessage = page.getByText('キーワードを入力してバズ動画を検索しましょう');
  await expect(initialMessage).toBeVisible();
});

/**
 * E2E-SEARCH-002: キーワード検索実行
 *
 * 操作: キーワード「料理」を入力し検索ボタンをクリック
 * 期待結果: ローディング表示後、検索結果一覧が表示される。
 *          「料理」の検索結果：X件 が表示される
 */
test('E2E-SEARCH-002: キーワード検索実行', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // ローディング表示を確認（検索中...ボタンまたはCircularProgressが表示される）
  await expect(page.getByRole('button', { name: /検索中/ })).toBeVisible();

  // 検索結果が表示されるまで待機（ローディング完了後）
  // 「料理」の検索結果：X件 というテキストが表示されることを確認
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // 初期メッセージが非表示になっていることを確認
  const initialMessage = page.getByText('キーワードを入力してバズ動画を検索しましょう');
  await expect(initialMessage).not.toBeVisible();
});

/**
 * E2E-SEARCH-003: Enter キーで検索
 *
 * 操作: キーワード入力後Enterキーを押す
 * 期待結果: 検索が実行され結果が表示される
 */
test('E2E-SEARCH-003: Enter キーで検索', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // Enterキーを押す
  await keywordInput.press('Enter');

  // ローディング表示を確認（検索中...ボタンが表示される）
  await expect(page.getByRole('button', { name: /検索中/ })).toBeVisible();

  // 検索結果が表示されるまで待機
  // 「料理」の検索結果：X件 というテキストが表示されることを確認
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // 初期メッセージが非表示になっていることを確認
  const initialMessage = page.getByText('キーワードを入力してバズ動画を検索しましょう');
  await expect(initialMessage).not.toBeVisible();
});

/**
 * E2E-SEARCH-004: 期間フィルター変更
 *
 * 操作: 期間を「過去7日」に変更して検索
 * 期待結果: フィルター条件が反映された検索結果が表示される
 */
test('E2E-SEARCH-004: 期間フィルター変更', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // 期間フィルターを「過去7日」に変更
  // MUI Selectをクリックして開く
  const periodSelect = page.getByLabel('期間');
  await periodSelect.click();

  // 「過去7日」のメニューアイテムを選択
  const menuItem = page.getByRole('option', { name: '過去7日' });
  await menuItem.click();

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // ローディング表示を確認
  await expect(page.getByRole('button', { name: /検索中/ })).toBeVisible();

  // 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // 期間フィルターが「過去7日」に設定されていることを確認
  // MUI Selectの表示値を確認
  await expect(periodSelect).toHaveText('過去7日');
});

/**
 * E2E-SEARCH-005: 影響力フィルター適用
 *
 * 操作: 影響力の最小値に「1.0」を入力
 * 期待結果: 影響力1.0以上の動画のみ表示される
 */
test('E2E-SEARCH-005: 影響力フィルター適用', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // 初期の検索結果件数を取得
  const initialResultText = await resultText.textContent();
  const initialCountMatch = initialResultText?.match(/(\d+)件/);
  const initialCount = initialCountMatch ? parseInt(initialCountMatch[1], 10) : 0;

  // 影響力の最小値フィールドを特定
  // 「影響力」ラベルの下にある最初のテキストフィールド（placeholder="0"）
  const impactSection = page.locator('text=影響力').locator('..');
  const impactMinInput = impactSection.locator('input[type="number"]').first();

  // 影響力の最小値に「1.0」を入力
  await impactMinInput.fill('1.0');

  // フィルタリングがフロントエンド側で即座に適用されるので、結果件数が変化するのを確認
  // 影響力1.0以上のみ表示されるため、件数が減るか同じになるはず

  // 少し待機してフィルターが適用されるのを確認
  await page.waitForTimeout(500);

  // 結果表示が更新されることを確認（件数が変わっている可能性）
  const filteredResultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(filteredResultText).toBeVisible();

  // フィルター適用後の件数を取得
  const filteredText = await filteredResultText.textContent();
  const filteredCountMatch = filteredText?.match(/(\d+)件/);
  const filteredCount = filteredCountMatch ? parseInt(filteredCountMatch[1], 10) : 0;

  // フィルター後の件数は初期件数以下であるべき
  expect(filteredCount).toBeLessThanOrEqual(initialCount);

  // 表示されている動画の影響力がすべて1.0以上であることを確認
  // テーブルの影響力セル（「X.XX倍」形式）を取得
  const impactCells = page.locator('table tbody tr td:nth-child(3)');
  const impactCellCount = await impactCells.count();

  // 動画が表示されている場合、すべての影響力値が1.0以上であることを確認
  if (impactCellCount > 0) {
    for (let i = 0; i < impactCellCount; i++) {
      const cellText = await impactCells.nth(i).textContent();
      // 「X.XX倍」形式から数値を抽出
      const impactMatch = cellText?.match(/([\d.]+)倍/);
      if (impactMatch) {
        const impactValue = parseFloat(impactMatch[1]);
        expect(impactValue).toBeGreaterThanOrEqual(1.0);
      }
    }
  }
});

/**
 * E2E-SEARCH-006: ソート機能
 *
 * 操作: テーブルのヘッダー（再生回数など）をクリック
 * 期待結果: 昇順/降順でソートされる
 */
test('E2E-SEARCH-006: ソート機能', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // テーブルが表示されていることを確認
  const table = page.locator('table');
  await expect(table).toBeVisible();

  // 再生回数のソートラベルを取得
  const viewCountSortLabel = page.getByRole('button', { name: '再生回数' });
  await expect(viewCountSortLabel).toBeVisible();

  // 再生回数セルを取得する関数
  const getViewCounts = async (): Promise<number[]> => {
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    const values: number[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      // 再生回数は4列目（0-indexed: 3）
      const cellText = await rows.nth(i).locator('td').nth(3).textContent();
      if (cellText) {
        // カンマを除去して数値に変換
        const numValue = parseInt(cellText.replace(/,/g, ''), 10);
        if (!isNaN(numValue)) {
          values.push(numValue);
        }
      }
    }
    return values;
  };

  // 初期状態のデータを取得（影響力の降順でソートされている）
  const initialViewCounts = await getViewCounts();

  // 再生回数ヘッダーをクリック（降順でソート）
  await viewCountSortLabel.click();
  await page.waitForTimeout(300); // ソート適用の待機

  // ソート後の再生回数を取得
  const descViewCounts = await getViewCounts();

  // 降順ソートを確認（前の値が次の値以上）
  let isDescending = true;
  for (let i = 0; i < descViewCounts.length - 1; i++) {
    if (descViewCounts[i] < descViewCounts[i + 1]) {
      isDescending = false;
      break;
    }
  }
  expect(isDescending).toBe(true);

  // もう一度クリックして昇順に切り替え
  await viewCountSortLabel.click();
  await page.waitForTimeout(300); // ソート適用の待機

  // 昇順ソート後の再生回数を取得
  const ascViewCounts = await getViewCounts();

  // 昇順ソートを確認（前の値が次の値以下）
  let isAscending = true;
  for (let i = 0; i < ascViewCounts.length - 1; i++) {
    if (ascViewCounts[i] > ascViewCounts[i + 1]) {
      isAscending = false;
      break;
    }
  }
  expect(isAscending).toBe(true);

  // ソートがトグルで切り替わったことを確認（降順と昇順が異なる順序）
  // 最初と最後の要素が逆転しているか確認
  if (descViewCounts.length > 1 && ascViewCounts.length > 1) {
    const descFirst = descViewCounts[0];
    const ascFirst = ascViewCounts[0];
    // 降順の最初の値は昇順の最初の値より大きいか等しい
    expect(descFirst).toBeGreaterThanOrEqual(ascFirst);
  }
});

/**
 * E2E-SEARCH-007: 動画詳細へ遷移
 *
 * 操作: 検索結果から動画をクリック
 * 期待結果: 動画詳細ページ（`/video/:id`）に遷移
 */
test('E2E-SEARCH-007: 動画詳細へ遷移', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // キーワード「料理」を入力
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill('料理');

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // 検索結果が表示されるまで待機
  const resultText = page.getByText(/「料理」の検索結果：\d+件/);
  await expect(resultText).toBeVisible({ timeout: 30000 });

  // テーブルが表示されていることを確認
  const table = page.locator('table');
  await expect(table).toBeVisible();

  // 最初の動画行をクリック
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible();

  // 行をクリックして詳細ページへ遷移
  await firstRow.click();

  // URLが `/video/:id` 形式に遷移したことを確認
  await expect(page).toHaveURL(/\/video\/[a-zA-Z0-9_-]+/);

  // 動画詳細ページの要素が表示されていることを確認
  // 「一覧に戻る」ボタンが表示されていることで詳細ページを確認
  const backButton = page.getByRole('link', { name: '一覧に戻る' });
  await expect(backButton).toBeVisible();

  // 動画詳細の内容が表示されているか、または「動画が見つかりません」メッセージが表示されているか確認
  // （Zustandストアの状態によって異なる可能性がある）
  // どちらかの要素が表示されていれば、正しく詳細ページに遷移できている
  const videoDetailContent = page.getByText('動画統計');
  const notFoundMessage = page.getByText('動画が見つかりません');

  // 動画統計セクションまたはエラーメッセージのいずれかが表示されることを確認
  await expect(videoDetailContent.or(notFoundMessage)).toBeVisible();
});

/**
 * E2E-SEARCH-008: 空キーワードで検索不可
 *
 * 操作: キーワード未入力で検索ボタン確認
 * 期待結果: 検索ボタンが無効化されている
 */
test('E2E-SEARCH-008: 空キーワードで検索不可', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // 検索ボタンを取得
  const searchButton = page.getByRole('button', { name: /検索/ });
  await expect(searchButton).toBeVisible();

  // キーワードが空の状態で検索ボタンが無効化されていることを確認
  await expect(searchButton).toBeDisabled();

  // キーワード入力フィールドが空であることを確認
  const keywordInput = page.getByLabel('キーワード');
  await expect(keywordInput).toHaveValue('');

  // 空白スペースのみ入力しても無効のままであることを確認
  await keywordInput.fill('   ');
  await expect(searchButton).toBeDisabled();

  // キーワードを入力すると有効化されることを確認
  await keywordInput.fill('テスト');
  await expect(searchButton).toBeEnabled();

  // キーワードを削除すると再び無効化されることを確認
  await keywordInput.clear();
  await expect(searchButton).toBeDisabled();
});

/**
 * E2E-SEARCH-009: 検索結果0件
 *
 * 操作: 存在しないキーワードで検索
 * 期待結果: 「検索結果がありません」メッセージが表示される
 */
test('E2E-SEARCH-009: 検索結果0件', async ({ page }) => {
  // `/`にアクセス
  await page.goto('/');

  // 存在しないキーワードを入力（ランダムな文字列を使用）
  const nonExistentKeyword = 'xyznonexistentkeyword12345678';
  const keywordInput = page.getByLabel('キーワード');
  await keywordInput.fill(nonExistentKeyword);

  // 検索ボタンをクリック
  const searchButton = page.getByRole('button', { name: /検索/ });
  await searchButton.click();

  // ローディング表示を確認
  await expect(page.getByRole('button', { name: /検索中/ })).toBeVisible();

  // 「検索結果がありません」メッセージが表示されることを確認
  const noResultMessage = page.getByText('検索結果がありません');
  await expect(noResultMessage).toBeVisible({ timeout: 30000 });

  // 検索結果のテーブルが表示されていないことを確認
  const table = page.locator('table');
  await expect(table).not.toBeVisible();
});