// https://vitest.dev/config/
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/prisma/seed.ts'],
    },
    // Run tests sequentially to avoid DB conflicts
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
