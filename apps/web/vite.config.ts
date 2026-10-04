import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
  ],
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), game: resolve(import.meta.dirname, 'game.html') },
    },
  },
  server: { port: 5173 },
});
