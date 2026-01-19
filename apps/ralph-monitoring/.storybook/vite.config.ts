import { defineConfig } from "vite";

// Storybook's Vite builder loads a Vite config file (even when running Vite
// programmatically). We keep this config intentionally minimal so Storybook
// does NOT inherit the app's RR7 Vite plugin (which expects a config-file
// context and breaks under Storybook).
export default defineConfig({});

