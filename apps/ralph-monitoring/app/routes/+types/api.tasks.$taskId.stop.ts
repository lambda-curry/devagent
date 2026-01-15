import type { ActionFunctionArgs } from 'react-router';

export namespace Route {
  export type ActionArgs = ActionFunctionArgs<{
    taskId: string;
  }>;
}
