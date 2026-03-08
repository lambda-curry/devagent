import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, defaultExclude } from 'vitest/config';

const includePerfTests = process.env.VITEST_PERF === 'true';
const includeSqliteTests = process.env.VITEST_SQLITE === 'true';

const sqliteExclude = [
  '**/db/__tests__/beads.server.test.ts',
  '**/db/__tests__/seed-data.test.ts',
  '**/lib/test-utils/__tests__/testDatabase.test.ts',
  '**/lib/__tests__/projects.server.test.ts'
];

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: includePerfTests
      ? defaultExclude
      : [
          ...defaultExclude,
          '**/*.perf.test.ts',
          ...(includeSqliteTests ? [] : sqliteExclude)
        ],
    // Use forks so native modules (better-sqlite3) load in real Node processes and avoid
    // ERR_DLOPEN_FAILED / NODE_MODULE_VERSION mismatch in worker threads.
    pool: 'forks',
    // Cap worker count to avoid runaway memory during watch runs.
    maxWorkers: 2,
    minWorkers: 1
  }
});
