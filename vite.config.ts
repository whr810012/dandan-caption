import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/caption/',
  plugins: [vue()],
  server: {
    proxy: {
      '/api/caption-gen': {
        target: 'http://127.0.0.1:8791',
        changeOrigin: true,
      },
    },
  },
})
