import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Plugin order can matter; React Router first, then path resolutions, then Tailwind
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  server: {
    // Prevent log file churn from triggering HMR/restart loops during log streaming QA.
    watch: {
      ignored: ['**/logs/**']
    }
  }
});
