import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'og-preview.png'],
      manifest: {
        name: 'Free GST Billing Software',
        short_name: 'GST Billing',
        description: 'Open-source GST invoicing for India. Tax invoices, GSTR-1 / GSTR-3B / GSTR-2B, TDS / TCS, multi-currency, recurring billing.',
        theme_color: '#1e40af',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'any',
        lang: 'en-IN',
        categories: ['business', 'productivity', 'finance'],
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: [
          '**/assets/pdf-*.js',
          '**/assets/qr-*.js',
          '**/assets/index.es-*.js',
          '**/tesseract/**',
        ],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/assets\/(pdf|qr|index\.es)-[A-Za-z0-9]+\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lazy-chunks-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@free-gst/document-renderer': path.resolve(__dirname, './packages/document-renderer/src/index.ts'),
      '@free-gst/api-contracts': path.resolve(__dirname, './packages/api-contracts/src/index.ts'),
      '@free-gst/financial-core': path.resolve(__dirname, './packages/financial-core/src/index.ts'),
      '@free-gst/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@free-gst/api-client': path.resolve(__dirname, './packages/api-client/src/index.ts'),
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
    // The two >1 MiB outputs are intentionally lazy vendor boundaries
    // (Ant Design and React-PDF); the application entry remains below 350 KiB.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-vendor': ['antd', '@ant-design/icons', 'dayjs'],
          'motion-vendor': ['motion'],
          'cloud-vendor': ['@supabase/supabase-js'],
          'pdf': ['jspdf', 'html2canvas'],
          'icons': ['lucide-react'],
          'qr': ['qrcode'],
        },
      },
    },
  },
});
