import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('arcade', 'routes/arcade.tsx'),
  route('login', 'routes/login.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('reset-password/:token', 'routes/reset-password.$token.tsx'),
  route('tasks/:taskId', 'routes/tasks.$taskId.tsx'),
  // API routes for logs (static and streaming)
  route('api/logs/:taskId', 'routes/api.logs.$taskId.ts'),
  route('api/logs/:taskId/stream', 'routes/api.logs.$taskId.stream.ts'),
  // API routes for tasks
  route('api/tasks/:taskId/stop', 'routes/api.tasks.$taskId.stop.ts'),
  route('api/tasks/:taskId/comments', 'routes/api.tasks.$taskId.comments.ts'),
  // API routes for authentication
  route('api/forgot-password', 'routes/api.forgot-password.ts'),
  route('api/reset-password', 'routes/api.reset-password.ts')
] satisfies RouteConfig;
