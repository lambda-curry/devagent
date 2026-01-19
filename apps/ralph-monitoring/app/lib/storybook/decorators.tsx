import type { Decorator } from "@storybook/react";
import { RouterProvider } from "react-router";

import { ThemeProvider } from "~/components/ThemeProvider";

import { createStorybookRouter, type StorybookRouterOptions } from "./router";

export type StorybookTheme = "light" | "dark" | "system";

export interface StorybookRrRouterParameters extends StorybookRouterOptions {
  /**
   * Disable the memory router wrapper for this story.
   * ThemeProvider still applies.
   */
  disabled?: boolean;
}

export const withThemeAndRrRouter: Decorator = (Story, context) => {
  const routerParams = context.parameters?.rrRouter as
    | StorybookRrRouterParameters
    | undefined;

  const themeParam = (context.parameters?.theme ?? "light") as StorybookTheme;
  const theme: StorybookTheme =
    themeParam === "light" || themeParam === "dark" || themeParam === "system"
      ? themeParam
      : "light";

  const StoryRouteComponent = () => <Story />;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={theme === "system"}
      forcedTheme={theme === "system" ? undefined : theme}
      disableTransitionOnChange
    >
      {routerParams?.disabled ? (
        <Story />
      ) : (
        <RouterProvider router={createStorybookRouter(StoryRouteComponent, routerParams)} />
      )}
    </ThemeProvider>
  );
};

