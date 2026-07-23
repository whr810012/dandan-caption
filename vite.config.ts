import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/caption/',
  plugins: [vue()],
  server: {
    proxy: {
      // 与生产路径一致：/caption/api/caption-gen
      '/caption/api/caption-gen': {
        target: 'http://127.0.0.1:8791',
        changeOrigin: true,
        rewrite: () => '/api/caption-gen',
      },
      '/api/caption-gen': {
        target: 'http://127.0.0.1:8791',
        changeOrigin: true,
      },
    },
  },
})
