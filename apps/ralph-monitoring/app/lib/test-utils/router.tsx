import { createMemoryRouter, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';

/**
 * Creates a routes stub component for testing React Router components.
 * Use this for component-level tests where you need Link/useHref to work.
 * 
 * @example
 * ```tsx
 * const routes = [
 *   { path: '/', Component: MyComponent },
 *   { path: '/api/data', loader: async () => ({ data: 'test' }) }
 * ];
 * const Stub = createRoutesStub(routes);
 * render(<Stub initialEntries={['/']} />);
 * ```
 */
export function createRoutesStub(routes: RouteObject[]) {
	return function RoutesStub({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
		const router = createMemoryRouter(routes, { initialEntries });
		return <RouterProvider router={router} />;
	};
}

/**
 * Convenience helper to build a single route object for a component.
 * 
 * @example
 * ```tsx
 * const routes = [
 *   createRoutesFor(MyComponent, { path: '/' }),
 *   { path: '/api/data', loader: async () => ({ data: 'test' }) }
 * ];
 * ```
 */
export function createRoutesFor(
	Component: React.ComponentType<any>,
	extras: Partial<RouteObject> = {}
): RouteObject {
	return {
		path: '/',
		Component,
		...extras
	};
}

/**
 * Minimal single-route render helper for simple component tests.
 * 
 * @example
 * ```tsx
 * const { router, container } = renderRouteComponent(MyComponent, {
 *   path: '/',
 *   loader: async () => ({ data: 'test' })
 * });
 * ```
 */
export function renderRouteComponent(
	Component: React.ComponentType<any>,
	options: {
		path?: string;
		loader?: RouteObject['loader'];
		action?: RouteObject['action'];
		initialEntries?: string[];
	} = {}
) {
	const { path = '/', loader, action, initialEntries = ['/'] } = options;
	
	const routes: RouteObject[] = [
		{
			path,
			Component,
			loader,
			action
		}
	];
	
	const router = createMemoryRouter(routes, { initialEntries });
	const result = render(<RouterProvider router={router} />);
	
	return {
		...result,
		router
	};
}
