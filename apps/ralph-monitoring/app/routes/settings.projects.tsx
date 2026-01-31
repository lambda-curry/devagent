import { useId } from 'react';
import { Link, href, useFetcher } from 'react-router';
import type { Route } from './+types/settings.projects';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  getProjectList,
  getProjectsConfigPath,
  isConfigWritable,
  addProject,
  removeProject,
  getConfigWriteInstructions
} from '~/lib/projects.server';
import { data } from 'react-router';

export async function loader() {
  const projects = getProjectList();
  const configPath = getProjectsConfigPath();
  const writable = isConfigWritable();
  return { projects, configPath, writable };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'add') {
    const path = (formData.get('path') as string)?.trim();
    const label = (formData.get('label') as string)?.trim() || undefined;
    if (!path) {
      return data({ ok: false, error: 'Path is required.', intent: 'add' }, { status: 400 });
    }
    const result = addProject({ path, label });
    if (!result.success) {
      return data({ ok: false, error: result.error, intent: 'add' }, { status: 400 });
    }
    return data({ ok: true, id: result.id, intent: 'add' });
  }

  if (intent === 'remove') {
    const projectId = (formData.get('projectId') as string)?.trim();
    if (!projectId) {
      return data({ ok: false, error: 'Project id is required.', intent: 'remove' }, { status: 400 });
    }
    const result = removeProject(projectId);
    if (!result.success) {
      return data({ ok: false, error: result.error, intent: 'remove' }, { status: 400 });
    }
    return data({ ok: true, intent: 'remove' });
  }

  return data({ ok: false, error: 'Unknown action.', intent: null }, { status: 400 });
}

export const meta: Route.MetaFunction = () => [
  { title: 'Projects - Ralph Monitoring' },
  { name: 'description', content: 'Add and remove Ralph projects' }
];

export default function SettingsProjects({ loaderData }: Route.ComponentProps) {
  const { projects, writable } = loaderData;
  const pathId = useId();
  const labelId = useId();
  const addFetcher = useFetcher<typeof action>();
  const addError =
    addFetcher.data && !addFetcher.data.ok && addFetcher.data.intent === 'add' && 'error' in addFetcher.data
      ? (addFetcher.data as { error: string }).error
      : null;
  const addSuccess = addFetcher.data?.ok && addFetcher.data.intent === 'add';

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-2xl p-[var(--space-6)]">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to={href('/projects/:projectId', { projectId: 'combined' })}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            ← Back to tasks
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Project settings</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Projects list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects configured.</p>
            ) : (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <ProjectRow key={p.id} project={p} writable={writable} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {writable ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add project</CardTitle>
            </CardHeader>
            <CardContent>
              <addFetcher.Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="add" />
                <div>
                  <label htmlFor={pathId} className="block text-sm font-medium mb-1">
                    Path (repo root or path to .beads/beads.db)
                  </label>
                  <Input
                    id={pathId}
                    name="path"
                    type="text"
                    placeholder="/path/to/repo or /path/to/repo/.beads/beads.db"
                    required
                    className="font-mono text-sm"
                    disabled={addFetcher.state !== 'idle'}
                  />
                </div>
                <div>
                  <label htmlFor={labelId} className="block text-sm font-medium mb-1">
                    Label (optional)
                  </label>
                  <Input
                    id={labelId}
                    name="label"
                    type="text"
                    placeholder="My project"
                    className="text-sm"
                    disabled={addFetcher.state !== 'idle'}
                  />
                </div>
                {addError && (
                  <p className="text-sm text-destructive" role="alert">
                    {addError}
                  </p>
                )}
                {addSuccess && (
                  <output className="block text-sm text-green-600 dark:text-green-400" htmlFor={pathId}>
                    Project added. Switch to it from the project dropdown on the task list.
                  </output>
                )}
                <Button type="submit" disabled={addFetcher.state !== 'idle'}>
                  {addFetcher.state !== 'idle' ? 'Adding…' : 'Add project'}
                </Button>
              </addFetcher.Form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Config is read-only</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {getConfigWriteInstructions()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  writable
}: {
  project: { id: string; path: string; label?: string; valid: boolean };
  writable: boolean;
}) {
  const removeFetcher = useFetcher<typeof action>();
  const removeError =
    removeFetcher.data && !removeFetcher.data.ok && removeFetcher.data.intent === 'remove' && 'error' in removeFetcher.data
      ? (removeFetcher.data as { error: string }).error
      : null;

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0 flex-1">
        <span className="font-medium">{project.label ?? project.id}</span>
        <span className="text-muted-foreground text-sm ml-2 font-mono truncate block">
          {project.path}
        </span>
        {!project.valid && (
          <span className="text-destructive text-sm">Invalid path (DB not found or not readable)</span>
        )}
      </div>
      {writable && (
        <removeFetcher.Form method="post">
          <input type="hidden" name="intent" value="remove" />
          <input type="hidden" name="projectId" value={project.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={removeFetcher.state !== 'idle'}
          >
            {removeFetcher.state !== 'idle' ? 'Removing…' : 'Remove'}
          </Button>
        </removeFetcher.Form>
      )}
      {removeError && <p className="text-sm text-destructive col-span-2">{removeError}</p>}
    </li>
  );
}
