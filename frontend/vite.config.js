import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@store': resolve(__dirname, 'src/store'),
      '@features': resolve(__dirname, 'src/features'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@config': resolve(__dirname, 'src/config'),
      '@templates': resolve(__dirname, 'src/templates'),
      'next/link': resolve(__dirname, 'src/compat/next/link.jsx'),
      'next/image': resolve(__dirname, 'src/compat/next/image.jsx'),
      'next/head': resolve(__dirname, 'src/compat/next/head.jsx'),
      'next/router': resolve(__dirname, 'src/compat/next/router.js'),
      'next/navigation': resolve(__dirname, 'src/compat/next/navigation.js'),
      'next/font/google': resolve(__dirname, 'src/compat/next/font-google.js'),
      'next/font/local': resolve(__dirname, 'src/compat/next/font-local.js'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'index-portfolio.html'),
      },
    },
  },
})
