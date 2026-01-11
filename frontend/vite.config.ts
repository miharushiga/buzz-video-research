import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3248,
    // 開発環境のみ proxy を使用
    // 本番環境では VITE_API_URL 環境変数を使用
    proxy: {
      '/api': {
        target: 'http://localhost:8433',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
