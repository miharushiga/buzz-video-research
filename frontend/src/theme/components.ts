/**
 * クリーン＆モダン テーマ - MUIコンポーネントスタイルオーバーライド
 * ライトモード向けの各コンポーネントカスタムスタイル定義
 */
import type { Components, Theme } from '@mui/material/styles';
import { colors } from './palette';

export const components: Components<Theme> = {
  // CssBaseline - 基本スタイル
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: `${colors.primary.light} ${colors.background.default}`,
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          background: colors.background.default,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          background: colors.primary.light,
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
          background: colors.primary.main,
        },
      },
    },
  },

  // Button - ボタン
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        padding: '10px 24px',
        transition: 'all 0.2s ease',
      },
      contained: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          transform: 'translateY(-1px)',
        },
      },
      containedPrimary: {
        backgroundColor: colors.primary.main,
        '&:hover': {
          backgroundColor: colors.primary.dark,
        },
      },
      containedSecondary: {
        backgroundColor: colors.secondary.main,
        '&:hover': {
          backgroundColor: colors.secondary.dark,
        },
      },
      outlined: {
        borderColor: colors.primary.main,
        color: colors.primary.main,
        '&:hover': {
          borderColor: colors.primary.dark,
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
        },
      },
      text: {
        color: colors.primary.main,
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.04)',
        },
      },
    },
  },

  // Card - カード
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: colors.background.paper,
        border: `1px solid ${colors.divider}`,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },

  // Paper - ペーパー
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: colors.background.paper,
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      elevation3: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },

  // TextField - テキストフィールド
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: colors.background.paper,
          '& fieldset': {
            borderColor: colors.divider,
          },
          '&:hover fieldset': {
            borderColor: colors.primary.light,
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary.main,
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root': {
          color: colors.text.secondary,
        },
        '& .MuiInputBase-input': {
          color: colors.text.primary,
          '&::placeholder': {
            color: colors.text.disabled,
            opacity: 1,
          },
        },
      },
    },
  },

  // OutlinedInput - アウトラインインプット
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: colors.background.paper,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.primary.light,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.primary.main,
          borderWidth: 2,
        },
      },
      input: {
        padding: '14px 16px',
      },
    },
  },

  // AppBar - アプリバー
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: colors.background.paper,
        borderBottom: `1px solid ${colors.divider}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },

  // Drawer - ドロワー
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: colors.background.paper,
        borderRight: `1px solid ${colors.divider}`,
      },
    },
  },

  // ListItemButton - リストアイテムボタン
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '4px 8px',
        '&:hover': {
          backgroundColor: colors.background.surface,
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderLeft: `3px solid ${colors.primary.main}`,
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
          },
        },
      },
    },
  },

  // ListItemIcon - リストアイテムアイコン
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: colors.text.secondary,
        minWidth: 44,
      },
    },
  },

  // Chip - チップ
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
      colorPrimary: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: colors.primary.main,
      },
      colorSecondary: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        color: colors.secondary.main,
      },
    },
  },

  // Tooltip - ツールチップ
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: colors.text.primary,
        color: colors.background.paper,
        borderRadius: 6,
        fontSize: '0.75rem',
        padding: '6px 10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },

  // Table - テーブル
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${colors.divider}`,
        padding: '16px',
      },
      head: {
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        fontWeight: 600,
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: colors.background.surface,
        },
      },
    },
  },

  // Skeleton - スケルトン
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: colors.background.surface,
      },
    },
  },

  // Alert - アラート
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        border: '1px solid',
      },
      standardError: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: colors.error.dark,
      },
      standardWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        color: colors.warning.dark,
      },
      standardInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: colors.info.dark,
      },
      standardSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        color: colors.success.dark,
      },
    },
  },

  // Dialog - ダイアログ
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: colors.background.paper,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },

  // Menu - メニュー
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: colors.background.paper,
        border: `1px solid ${colors.divider}`,
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },

  // MenuItem - メニューアイテム
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        margin: '2px 6px',
        '&:hover': {
          backgroundColor: colors.background.surface,
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
          },
        },
      },
    },
  },

  // IconButton - アイコンボタン
  MuiIconButton: {
    styleOverrides: {
      root: {
        color: colors.text.secondary,
        '&:hover': {
          backgroundColor: colors.background.surface,
          color: colors.primary.main,
        },
      },
    },
  },

  // Divider - ディバイダー
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: colors.divider,
      },
    },
  },

  // Avatar - アバター
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrastText,
      },
    },
  },

  // Tabs - タブ
  MuiTabs: {
    styleOverrides: {
      indicator: {
        backgroundColor: colors.primary.main,
        height: 3,
        borderRadius: 3,
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        color: colors.text.secondary,
        '&.Mui-selected': {
          color: colors.primary.main,
        },
      },
    },
  },

  // LinearProgress - 線形プログレス
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        backgroundColor: colors.background.surface,
      },
      bar: {
        borderRadius: 4,
        backgroundColor: colors.primary.main,
      },
    },
  },

  // CircularProgress - 円形プログレス
  MuiCircularProgress: {
    styleOverrides: {
      colorPrimary: {
        color: colors.primary.main,
      },
    },
  },
};
