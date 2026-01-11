/**
 * クリーン＆モダン テーマ - メインエクスポート
 * MUI v6 テーマ設定
 *
 * テーマ: クリーン＆モダン（ビジネス風）
 * 特徴: ライトモード、インディゴ系の落ち着いた配色、シンプルで使いやすいUI
 */
import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

// テーマオプション
const themeOptions: ThemeOptions = {
  palette,
  typography,
  components,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
};

// テーマ作成
const theme = createTheme(themeOptions);

// 個別エクスポート
export { palette, colors } from './palette';
export { typography } from './typography';
export { components } from './components';

// デフォルトエクスポート
export default theme;
