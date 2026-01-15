import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from 'react-router';
import type { Route } from './+types/root';
import { ThemeProvider } from '~/components/ThemeProvider';
import { Toaster } from '~/components/ui/sonner';
import './globals.css';

export function meta(): Route.MetaFunction {
  return [
    { title: 'Ralph Monitoring UI' },
    { name: 'description', content: 'Monitor active Ralph tasks and execution logs' }
  ];
}

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Outlet />
          <Toaster />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 
      ? 'The requested page could not be found.' 
      : typeof error.data === 'string' 
        ? error.data 
        : error.statusText || details;
  } else if (process.env.NODE_ENV === 'development' && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
              <pre className="w-full p-4 overflow-x-auto">
                <code>{stack}</code>
              </pre>
            )}
          </main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
