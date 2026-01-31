import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('projects/:projectId', 'routes/projects.$projectId.tsx', [
    index('routes/projects.$projectId._index.tsx'),
    route('tasks/:taskId', 'routes/projects.$projectId.tasks.$taskId.tsx'),
  ]),
  // Legacy: redirect /tasks/:taskId to combined project task detail
  route('tasks/:taskId', 'routes/tasks.$taskId.tsx'),
  route('epics', 'routes/epics.tsx', [
    index('routes/epics._index.tsx'),
    route(':epicId', 'routes/epics.$epicId.tsx'),
  ]),
  // API routes for logs (static and streaming) — projectId via query
  route('api/logs/:taskId', 'routes/api.logs.$taskId.ts'),
  route('api/logs/:taskId/stream', 'routes/api.logs.$taskId.stream.ts'),
  // API routes for tasks — projectId via query
  route('api/tasks/:taskId/stop', 'routes/api.tasks.$taskId.stop.ts'),
  // API routes for loop control
  route('api/loop/pause', 'routes/api.loop.pause.ts'),
  route('api/loop/resume', 'routes/api.loop.resume.ts'),
  route('api/loop/skip/:taskId', 'routes/api.loop.skip.$taskId.ts'),
  route('api/loop/start', 'routes/api.loop.start.ts'),
] satisfies RouteConfig;
