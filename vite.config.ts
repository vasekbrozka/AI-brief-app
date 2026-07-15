import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png'],
      manifest: {
        name: 'AIspresso',
        short_name: 'AIspresso',
        description:
          'Tvůj každodenní přehled novinek ze světa AI — stručně a ověřeně na jednom místě.',
        lang: 'cs',
        dir: 'ltr',
        theme_color: '#FBFBFD',
        background_color: '#FBFBFD',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['news', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Push + notification-click handlers live in a separate script so we
        // can keep using the zero-config generated service worker.
        importScripts: ['push-sw.js'],
        // Briefs are fetched from the GitHub Contents API (see src/lib/briefs.ts),
        // not bundled — daily content updates stay off Netlify's deploy bill.
        // Keep the freshly crawled briefs up to date, but still available offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              (url.hostname === 'raw.githubusercontent.com' ||
                url.hostname === 'api.github.com') &&
              url.pathname.includes('data/briefs/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'briefs-data',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
