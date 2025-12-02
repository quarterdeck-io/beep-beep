import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/renderer/src/**/*.test.ts', 'src/renderer/src/**/*.spec.ts'],
    setupFiles: ['src/renderer/test/setup-tests.ts']
  }
})
