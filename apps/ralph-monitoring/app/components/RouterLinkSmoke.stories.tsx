import type { Meta, StoryObj } from '@storybook/react';
import { Link } from 'react-router';

const RouterLinkSmoke = () => (
  <div className="p-4">
    <p className="mb-2 text-sm text-muted-foreground">
      Smoke test: verifies Storybook’s global React Router decorator provides router context.
    </p>
    <Link className="text-primary underline underline-offset-4" to="/destination">
      Go
    </Link>
  </div>
);

const meta = {
  title: 'smoke/RouterLink',
  component: RouterLinkSmoke,
  parameters: {
    docs: {
      description: {
        component: 'Renders a `react-router` `<Link>` to validate router decorators/stubs.'
      }
    }
  }
} satisfies Meta<typeof RouterLinkSmoke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
