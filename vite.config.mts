import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    tsconfigPaths: true
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'src/services/**/*.spec.ts',
            'src/drivers/**/*.spec.ts'
          ]
        }
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          dir: 'src/http/controllers'
        }
      }
    ]
  }
})
