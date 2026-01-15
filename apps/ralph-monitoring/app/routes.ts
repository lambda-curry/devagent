import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('tasks/:taskId', 'routes/tasks.$taskId.tsx'),
  // API routes for logs (static and streaming)
  route('api/logs/:taskId', 'routes/api.logs.$taskId.ts'),
  route('api/logs/:taskId/stream', 'routes/api.logs.$taskId.stream.ts'),
  // API route for stopping tasks
  route('api/tasks/:taskId/stop', 'routes/api.tasks.$taskId.stop.ts')
] satisfies RouteConfig;
