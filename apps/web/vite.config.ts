import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

function cleanGameHtmlPlugin() {
  return {
    name: 'clean-game-html',
    enforce: 'post' as const,
    generateBundle(_options: unknown, bundle: Record<string, { type: string; source?: string | Uint8Array }>) {
      const gameAsset = bundle['game.html'];
      if (gameAsset && gameAsset.type === 'asset' && typeof gameAsset.source === 'string') {
        gameAsset.source = gameAsset.source
          .replace(/<link rel="manifest"[^>]*>/gi, '')
          .replace(/<script id="vite-plugin-pwa:register-sw"[^>]*><\/script>/gi, '');
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      useCredentials: true,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Aprumo',
        short_name: 'Aprumo',
        description: 'Plataforma clínica para intervenção em ABA e no Modelo Denver',
        lang: 'pt-BR',
        theme_color: '#3f6b67',
        background_color: '#faf9f6',
        display: 'standalone',
        orientation: 'any',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // Arquivos versionados: cache primeiro. HTML: rede primeiro. Nada de dados clínicos no cache.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
    cleanGameHtmlPlugin(),
  ],
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), game: resolve(import.meta.dirname, 'game.html') },
    },
  },
  server: { port: 5173 },
});
