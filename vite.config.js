import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // 게임(index.html)과 대시보드(dashboard.html) 두 페이지를 함께 빌드
      input: {
        main: 'index.html',
        dashboard: 'dashboard.html',
      },
    },
  },
});
