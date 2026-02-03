import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Plugin order can matter; React Router first, then path resolutions, then Tailwind
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  server: {
    // Bind explicitly so local proxying (e.g. Tailscale Funnel) can reach the dev server.
    host: '127.0.0.1',

    // Allow Tailscale Funnel hostname to reach the Vite dev server.
    // (Vite blocks unknown Host headers by default.)
    allowedHosts: ['.tail769eb9.ts.net'],

    // Prevent log file churn from triggering HMR/restart loops during log streaming QA.
    watch: {
      ignored: ['**/logs/**']
    }
  },
  ssr: {
    // Ensure remix-hook-form is bundled with the app to share react-router context
    noExternal: ['react-hook-form', 'remix-hook-form', '@lambdacurry/forms']
  },
  optimizeDeps: {
    // Pre-bundle these dependencies to avoid runtime context issues
    include: ['react', 'react-dom', 'react-router', 'react-hook-form', 'remix-hook-form'],
    // Ensure single instances of these packages
    dedupe: ['react', 'react-dom', 'react-router', 'react-hook-form', 'remix-hook-form']
  }
});
