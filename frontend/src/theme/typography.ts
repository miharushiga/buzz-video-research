/**
 * クリーン＆モダン テーマ - タイポグラフィ設定
 * 日本語対応のフォントファミリーとMUI v6準拠の設定
 */
import type { ThemeOptions } from '@mui/material/styles';

// フォントファミリー定義
export const fontFamily = [
  '"Noto Sans JP"',
  '"Inter"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

// タイポグラフィオプション
export const typography: ThemeOptions['typography'] = {
  fontFamily,
  // 見出し
  h1: {
    fontFamily,
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontFamily,
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontFamily,
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontFamily,
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontFamily,
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontFamily,
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.5,
    letterSpacing: '0.0075em',
  },
  // 本文
  body1: {
    fontFamily,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0.01071em',
  },
  // サブタイトル
  subtitle1: {
    fontFamily,
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontFamily,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  // ボタン
  button: {
    fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'none',
  },
  // キャプション
  caption: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  // オーバーライン
  overline: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.625rem',
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};
