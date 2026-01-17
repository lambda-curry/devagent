import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Limit workers to prevent memory exhaustion
    // Use threads pool for better isolation, but limit concurrency
    pool: 'threads',
    poolOptions: {
      threads: {
        // Limit to 2 workers to reduce memory usage
        // Each worker runs tests in isolation but uses memory
        minThreads: 1,
        maxThreads: 2,
        // Use single fork for very memory-intensive tests
        singleThread: false,
      },
    },
    // Increase test timeout for slower machines
    testTimeout: 10000,
    // Isolate each test file to prevent shared state
    isolate: true,
    // Limit memory usage by running fewer tests in parallel
    sequence: {
      // Run tests sequentially within a file to reduce peak memory
      shuffle: false,
    },
  },
});
