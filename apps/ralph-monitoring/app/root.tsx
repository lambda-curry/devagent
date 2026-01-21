import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from 'react-router';
import type { Route } from './+types/root';
import { ThemeProvider } from '~/components/ThemeProvider';
import { Toaster } from '~/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import './globals.css';

export const meta: Route.MetaFunction = () => [
  { title: 'Ralph Monitoring UI' },
  { name: 'description', content: 'Monitor active Ralph tasks and execution logs' }
];

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div data-wrapper className="min-h-dvh">
            <Outlet />
          </div>
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
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="mx-auto w-full max-w-4xl p-[var(--space-6)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{message}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-4)]">
                <p className="text-sm text-muted-foreground">{details}</p>
                {stack ? (
                  <pre className="overflow-x-auto rounded-lg border bg-code p-[var(--space-3)] text-xs text-code-foreground">
                    <code>{stack}</code>
                  </pre>
                ) : null}
              </CardContent>
            </Card>
          </main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
