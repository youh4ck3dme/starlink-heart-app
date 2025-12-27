/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import glsl from 'vite-plugin-glsl';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid TypeScript error about missing 'cwd' property
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(), 
      glsl(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'android-chrome-192x192.png', 'android-chrome-512x512.png'],
        manifest: {
          name: 'Starlink Heart',
          short_name: 'Starlink',
          description: 'AI tutor pre slovenské deti - matematika, slovenčina, angličtina',
          theme_color: '#3b82f6',
          background_color: '#060819',
          display: 'standalone',
          orientation: 'portrait-primary',
          id: 'com.starlinkheart.app',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'], // Cache static assets
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 1 day
                },
                networkTimeoutSeconds: 10
              }
            }
          ]
        }
      })
    ],
    define: {
      // This ensures your code using process.env.API_KEY works in the browser
      'process.env': env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      exclude: ['**/node_modules/**', '**/e2e/**'],
      alias: {
        // Mock static assets to return a string
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|apng)$': path.resolve(__dirname, './src/test/fileMock.js'),
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/setup.ts',
        ],
      },
    },
    build: {
      chunkSizeWarningLimit: 2500, // Spline 3D is lazy-loaded (~2MB) - acceptable for premium 3D feature
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'spline-vendor': ['@splinetool/react-spline', '@splinetool/runtime'],
            'genai-vendor': ['@google/genai'],
            'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
            'utils-vendor': ['framer-motion', 'lucide-react', 'zod', 'clsx', 'howler'],
          },
        },
      },
    },
  };
});