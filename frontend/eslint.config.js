import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // 複雑度チェック（ページコンポーネントは複雑になりやすいため緩和）
      'complexity': ['error', { max: 20 }],
      // 関数の最大行数
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      // ファイルの最大行数
      'max-lines': ['warn', { max: 700, skipBlankLines: true, skipComments: true }],
      // 行の最大長
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      // console.log禁止
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  }
);
