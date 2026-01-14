import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('tasks/:taskId', 'routes/tasks.$taskId.tsx')
] satisfies RouteConfig;
