import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**/*.ts',
        'src/api/**/*.ts',
        'src/app/**/*.{ts,tsx}',
        'src/hooks/__tests__/**/*.ts',
        'src/components/__tests__/**/*.ts',
        'src/pages/**/*.{ts,tsx}',
        'src/api/endpoints/**/*.ts',
        'src/context/**/*.ts',
        'src/hooks/**/*.ts',
        'src/redux/**/*.ts',
        'src/utils/**/*.ts',
        'src/types/**/*.ts',
      ],
    },
  },
});
