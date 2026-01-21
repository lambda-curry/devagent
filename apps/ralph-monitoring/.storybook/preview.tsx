import type { Decorator, Preview } from '@storybook/react';

import '../app/globals.css';
import { ThemeProvider } from '../app/components/ThemeProvider';

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as 'light' | 'dark' | undefined) ?? 'light';

  if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', theme === 'dark');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      // next-themes supports forcedTheme; cast keeps Storybook typings simple.
      {...({ forcedTheme: theme } as unknown)}
    >
      <div className="min-h-screen bg-background text-foreground p-[var(--space-6)]">
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;

