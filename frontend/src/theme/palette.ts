/**
 * クリーン＆モダン テーマ - カラーパレット定義
 * ビジネス風のライトテーマで、インディゴ系の落ち着いた配色が特徴
 */
import type { PaletteOptions } from '@mui/material/styles';

// 基本色定義
export const colors = {
  // プライマリカラー（インディゴ系）
  primary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff',
  },
  // セカンダリカラー（バイオレット系）
  secondary: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff',
  },
  // 背景色（ライトモード）
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    surface: '#f1f5f9',
  },
  // テキスト色
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  // ステータス色
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#000000',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  // ディバイダー・ボーダー
  divider: '#e2e8f0',
  // バズ度表示用カラー
  buzz: {
    high: '#ef4444',    // 赤（大バズ: 3.0倍以上）
    medium: '#f59e0b',  // 黄（バズ: 1.0〜3.0倍）
    low: '#1e293b',     // 黒（通常: 1.0倍未満）
  },
  // アクセントカラー
  accent: {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    blue: '#3b82f6',
  },
} as const;

// MUIパレットオプション
export const palette: PaletteOptions = {
  mode: 'light',
  primary: colors.primary,
  secondary: colors.secondary,
  background: {
    default: colors.background.default,
    paper: colors.background.paper,
  },
  text: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    disabled: colors.text.disabled,
  },
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  divider: colors.divider,
  action: {
    active: colors.primary.main,
    hover: 'rgba(99, 102, 241, 0.04)',
    selected: 'rgba(99, 102, 241, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(99, 102, 241, 0.12)',
  },
};
