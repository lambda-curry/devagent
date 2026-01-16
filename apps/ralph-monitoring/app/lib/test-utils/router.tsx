import type { ReactNode } from 'react';
import { createRoutesStub as buildRoutesStub, type RouteObject, Outlet } from 'react-router';

type StubRoutes = Parameters<typeof buildRoutesStub>[0];

function MockThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const createRoutesStub = (routes: RouteObject[]) => {
  const rootRoute: RouteObject = {
    id: 'root',
    Component: function TestLayout() {
      return (
        <MockThemeProvider>
          <Outlet />
        </MockThemeProvider>
      );
    },
    HydrateFallback: () => null,
    children: routes
  };

  const Stub = buildRoutesStub([rootRoute] as StubRoutes);
  return function TestRouterStub({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
    return <Stub initialEntries={initialEntries} />;
  };
};
