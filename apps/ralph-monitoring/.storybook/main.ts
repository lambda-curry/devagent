import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        // Ensure Storybook does not inherit the app's Vite config (RR7 plugin).
        viteConfigPath: path.resolve(__dirname, "./vite.config.ts")
      }
    }
  },
  stories: ["../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  async viteFinal(viteConfig) {
    const existingPlugins = viteConfig.plugins ?? [];
    const existingPluginsWithoutReactRouter = existingPlugins
      .flatMap((plugin) => (Array.isArray(plugin) ? plugin : [plugin]))
      .filter((plugin) => {
        if (!plugin || typeof plugin !== "object") return true;
        if (!("name" in plugin) || typeof plugin.name !== "string") return true;
        return !plugin.name.includes("react-router");
      });

    return {
      ...viteConfig,
      // Storybook runs Vite programmatically; prevent loading the app's Vite config
      // (which includes the RR7 Vite plugin and expects a config file context).
      configFile: false,
      plugins: [
        ...existingPluginsWithoutReactRouter,
        tsconfigPaths({ projects: [path.resolve(__dirname, "../tsconfig.json")] }),
        tailwindcss()
      ]
    };
  }
};

export default config;
