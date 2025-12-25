/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid TypeScript error about missing 'cwd' property
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This ensures your code using process.env.API_KEY works in the browser
      'process.env': env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      exclude: ['**/node_modules/**', '**/e2e/**'],
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
      chunkSizeWarningLimit: 600, // Slightly increase limit
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'genai-vendor': ['@google/genai'],
            'spline-vendor': ['@splinetool/react-spline', '@splinetool/runtime'],
            'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
            'ui-utils': ['framer-motion', 'lucide-react'],
          },
        },
      },
    },
  };
});