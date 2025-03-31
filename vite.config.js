import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { mockDataPlugin } from './mockDataPlugin';

export default defineConfig({
  base: './',
  plugins: [react(), mockDataPlugin()],
  build: {
    target: 'es2022',
    assetsDir: '',
    rollupOptions: {
      input: {
        index: 'index.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
