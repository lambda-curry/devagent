import type { Decorator } from "@storybook/react";
import { RouterProvider } from "react-router";

import { ThemeProvider } from "~/components/ThemeProvider";

import { createStorybookRouter, type StorybookRouterOptions } from "./router";

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

  const StoryRouteComponent = () => <Story />;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {routerParams?.disabled ? (
        <Story />
      ) : (
        <RouterProvider router={createStorybookRouter(StoryRouteComponent, routerParams)} />
      )}
    </ThemeProvider>
  );
};

