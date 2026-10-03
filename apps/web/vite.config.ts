import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@free-gst/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src/index.ts'),
      '@free-gst/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@free-gst/api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
      '@free-gst/financial-core': path.resolve(__dirname, '../../packages/financial-core/src/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
