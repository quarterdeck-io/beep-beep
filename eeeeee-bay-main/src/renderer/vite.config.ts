import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
    // Add more test config as needed
  },
  define: {
    'import.meta.env.VITE_EBAY_CLIENT_ID': JSON.stringify(process.env.VITE_EBAY_CLIENT_ID),
    'import.meta.env.VITE_EBAY_APP_ID': JSON.stringify(process.env.VITE_EBAY_APP_ID),
    'import.meta.env.VITE_EBAY_CLIENT_SECRET': JSON.stringify(process.env.VITE_EBAY_CLIENT_SECRET),
    'import.meta.env.VITE_EBAY_AUTH_TOKEN': JSON.stringify(process.env.VITE_EBAY_AUTH_TOKEN),
    'import.meta.env.VITE_EBAY_REDIRECT_URI': JSON.stringify(process.env.VITE_EBAY_REDIRECT_URI),
    'import.meta.env.VITE_EBAY_SCOPE': JSON.stringify(process.env.VITE_EBAY_SCOPE)
  }
})
