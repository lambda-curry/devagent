import type { Preview } from "@storybook/react";

import "../app/globals.css";

import { withThemeAndRrRouter } from "~/lib/storybook";

const preview: Preview = {
  decorators: [withThemeAndRrRouter],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
