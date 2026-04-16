import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Quiz Polizia Locale',
        short_name: 'QuizPL',
        description: 'App di preparazione per concorsi di Polizia Locale',
        theme_color: '#2E7D32',
        background_color: '#F1F8E9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@data': '/src/data',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'recharts', 'clsx'],
        }
      }
    },
    // Rimuove console.log e debugger in produzione (no information leak)
    minify: 'esbuild',
  },
  esbuild: {
    // Rimuove console.* e debugger dal bundle di produzione
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
})
