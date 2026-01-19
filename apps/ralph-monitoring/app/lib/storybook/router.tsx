import type { ComponentType } from "react";
import { createMemoryRouter, type RouteObject } from "react-router";

export interface StorybookRouterOptions {
  /**
   * Initial URL entries for the memory router.
   * Defaults to ['/'].
   */
  initialEntries?: string[];
  initialIndex?: number;
  /**
   * The path that will render the story component.
   * Defaults to '*', so stories render regardless of current location.
   */
  storyPath?: string;
  /**
   * Extra routes to support `useFetcher`, `Form`, loaders, and actions without network.
   *
   * Example:
   * `{ path: "/api/demo", action: async ({ request }) => data({ ok: true }) }`
   */
  extraRoutes?: RouteObject[];
}

export const createStoryRoute = (
  StoryComponent: ComponentType,
  options: { id?: string; path?: string } = {}
): RouteObject => ({
  id: options.id ?? "storybook-story",
  path: options.path ?? "*",
  Component: StoryComponent
});

export const createStorybookRouter = (
  StoryComponent: ComponentType,
  options: StorybookRouterOptions = {}
) => {
  const routes: RouteObject[] = [
    createStoryRoute(StoryComponent, { path: options.storyPath }),
    ...(options.extraRoutes ?? [])
  ];

  return createMemoryRouter(routes, {
    initialEntries: options.initialEntries ?? ["/"],
    initialIndex: options.initialIndex
  });
};

