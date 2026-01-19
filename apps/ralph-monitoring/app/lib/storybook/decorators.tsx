import type { Decorator } from "@storybook/react";
import { useCallback, useRef } from "react";
import { RouterProvider, type RouteObject } from "react-router";

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

interface RouteFingerprint {
  id: string | null;
  path: string | null;
  index: boolean | null;
  caseSensitive: boolean | null;
  children: RouteFingerprint[] | null;
}

const getRouteFingerprint = (route: RouteObject): RouteFingerprint => ({
  id: route.id ?? null,
  path: route.path ?? null,
  index: (route as { index?: boolean }).index ?? null,
  caseSensitive: route.caseSensitive ?? null,
  children: route.children?.map(getRouteFingerprint) ?? null
});

const getStorybookRouterKey = (
  routerParams: StorybookRrRouterParameters | undefined
) => {
  // Storybook re-renders can recreate objects/functions (especially in `extraRoutes`).
  // We fingerprint only *structural* router inputs to keep a stable router instance
  // across controls/args changes while still recreating if the routing shape changes.
  const extraRoutes = (routerParams?.extraRoutes ?? []).map(getRouteFingerprint);

  return JSON.stringify({
    initialEntries: routerParams?.initialEntries ?? ["/"],
    initialIndex: routerParams?.initialIndex ?? null,
    storyPath: routerParams?.storyPath ?? "*",
    extraRoutes
  });
};

export const withThemeAndRrRouter: Decorator = (Story, context) => {
  const routerParams = context.parameters?.rrRouter as
    | StorybookRrRouterParameters
    | undefined;

  const themeParam = (context.parameters?.theme ?? "light") as StorybookTheme;
  const theme: StorybookTheme =
    themeParam === "light" || themeParam === "dark" || themeParam === "system"
      ? themeParam
      : "light";

  // Keep a stable route component identity, while always rendering the latest Story
  // (args/controls changes may update the Story function reference).
  const storyRef = useRef(Story);
  storyRef.current = Story;

  const StoryRouteComponent = useCallback(() => {
    const CurrentStory = storyRef.current;
    return <CurrentStory />;
  }, []);

  const routerKey = getStorybookRouterKey(routerParams);
  const routerRef = useRef<ReturnType<typeof createStorybookRouter> | null>(null);
  const routerKeyRef = useRef<string | null>(null);

  if (!routerRef.current || routerKeyRef.current !== routerKey) {
    routerRef.current = createStorybookRouter(StoryRouteComponent, routerParams);
    routerKeyRef.current = routerKey;
  }

  const router = routerRef.current!;

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
        <RouterProvider router={router} />
      )}
    </ThemeProvider>
  );
};

