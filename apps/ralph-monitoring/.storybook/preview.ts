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
    },
    viewport: {
      viewports: {
        mobile375: {
          name: "Mobile 375",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
      },
    },
  },
};

export default preview;
