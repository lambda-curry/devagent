import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, defaultExclude } from 'vitest/config';

const includePerfTests = process.env.VITEST_PERF === 'true';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: includePerfTests ? defaultExclude : [...defaultExclude, '**/*.perf.test.ts'],
    // Cap worker count to avoid runaway memory during watch runs.
    maxWorkers: 2,
    minWorkers: 1
  }
});
