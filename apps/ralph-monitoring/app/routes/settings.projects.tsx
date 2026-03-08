import { useId } from 'react';
import { Link, href, useFetcher } from 'react-router';
import type { Route } from './+types/settings.projects';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  getProjectList,
  getProjectsConfigPath,
  isConfigWritable,
  addProject,
  removeProject,
  getConfigWriteInstructions,
  scanForBeadsProjects,
  getExistingProjectDbPaths,
  isProjectAlreadyConfigured,
  normalizeDbPath
} from '~/lib/projects.server';
import { data } from 'react-router';

export async function loader() {
  const projects = getProjectList();
  const configPath = getProjectsConfigPath();
  const writable = isConfigWritable();
  const configWriteInstructions = getConfigWriteInstructions();
  return { projects, configPath, writable, configWriteInstructions };
}

/** Parse form body; supports multipart/form-data and application/x-www-form-urlencoded (e.g. in tests). */
async function getFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    return request.formData();
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  const fd = new FormData();
  params.forEach((value, key) => {
    fd.append(key, value);
  });
  return fd;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await getFormData(request);
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

  if (intent === 'scan') {
    const rootsRaw = (formData.get('roots') as string)?.trim();
    const roots = rootsRaw ? rootsRaw.split(/\r?\n/).map((root) => root.trim()).filter(Boolean) : [];
    if (roots.length === 0) {
      return data({ ok: false, error: 'At least one root path is required.', intent: 'scan' }, { status: 400 });
    }
    const result = scanForBeadsProjects(roots);
    return data({ ok: true, intent: 'scan', ...result });
  }

  if (intent === 'add-scanned') {
    const paths = formData
      .getAll('paths')
      .map((path) => String(path).trim())
      .filter(Boolean);
    if (paths.length === 0) {
      return data(
        {
          ok: false,
          intent: 'add-scanned',
          added: [],
          skipped: [],
          errors: [{ path: '(selection)', error: 'Select at least one project to add.' }]
        },
        { status: 400 }
      );
    }
    const existingDbPaths = getExistingProjectDbPaths();
    const added: Array<{ path: string; id: string }> = [];
    const skipped: Array<{ path: string; reason: string }> = [];
    const errors: Array<{ path: string; error: string }> = [];

    for (const path of paths) {
      if (isProjectAlreadyConfigured(path, existingDbPaths)) {
        skipped.push({ path, reason: 'Already configured.' });
        continue;
      }
      const result = addProject({ path });
      if (result.success) {
        added.push({ path, id: result.id });
        existingDbPaths.add(normalizeDbPath(path));
      } else {
        errors.push({ path, error: result.error });
      }
    }

    return data({
      ok: errors.length === 0,
      intent: 'add-scanned',
      added,
      skipped,
      errors,
    });
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
  const { projects, writable, configWriteInstructions } = loaderData;
  const pathId = useId();
  const labelId = useId();
  const scanRootsId = useId();
  const addFetcher = useFetcher<typeof action>();
  const scanFetcher = useFetcher<typeof action>();
  const addScanFetcher = useFetcher<typeof action>();
  const addError =
    addFetcher.data && !addFetcher.data.ok && addFetcher.data.intent === 'add' && 'error' in addFetcher.data
      ? (addFetcher.data as { error: string }).error
      : null;
  const addSuccess = addFetcher.data?.ok && addFetcher.data.intent === 'add';
  const scanError =
    scanFetcher.data && !scanFetcher.data.ok && scanFetcher.data.intent === 'scan' && 'error' in scanFetcher.data
      ? (scanFetcher.data as { error: string }).error
      : null;
  const scanResult =
    scanFetcher.data?.ok && scanFetcher.data.intent === 'scan'
      ? (scanFetcher.data as unknown as {
          matches: string[];
          errors: string[];
          truncated: boolean;
        })
      : null;
  const addScanResult =
    addScanFetcher.data && addScanFetcher.data.intent === 'add-scanned'
      ? (addScanFetcher.data as unknown as {
          ok: boolean;
          added: Array<{ path: string; id: string }>;
          skipped: Array<{ path: string; reason: string }>;
          errors: Array<{ path: string; error: string }>;
        })
      : null;

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

        {writable && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Find projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan one or more root folders (one per line). Relative paths resolve from the repo
                root, and ~ expands to your home directory. We will look for .beads/beads.db up to
                four levels deep.
              </p>
              <scanFetcher.Form method="post" className="space-y-3">
                <input type="hidden" name="intent" value="scan" />
                <div>
                  <label htmlFor={scanRootsId} className="block text-sm font-medium mb-1">
                    Roots to scan
                  </label>
                  <Textarea
                    id={scanRootsId}
                    name="roots"
                    placeholder="/path/to/workspace"
                    className="font-mono text-sm"
                    rows={4}
                    disabled={scanFetcher.state !== 'idle'}
                  />
                </div>
                {scanError && (
                  <p className="text-sm text-destructive" role="alert">
                    {scanError}
                  </p>
                )}
                <Button type="submit" disabled={scanFetcher.state !== 'idle'}>
                  {scanFetcher.state !== 'idle' ? 'Scanning…' : 'Scan folders'}
                </Button>
              </scanFetcher.Form>

              {scanResult && (
                <div className="space-y-3">
                  {scanResult.matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No Beads databases found.</p>
                  ) : (
                    <addScanFetcher.Form method="post" className="space-y-3">
                      <input type="hidden" name="intent" value="add-scanned" />
                      <div className="space-y-2">
                        {scanResult.matches.map((path) => (
                          <label key={path} className="flex items-start gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="paths"
                              value={path}
                              defaultChecked
                              className="mt-1 h-4 w-4 rounded border-input"
                              disabled={addScanFetcher.state !== 'idle'}
                            />
                            <span className="font-mono text-xs break-all">{path}</span>
                          </label>
                        ))}
                      </div>
                      <Button type="submit" disabled={addScanFetcher.state !== 'idle'}>
                        {addScanFetcher.state !== 'idle' ? 'Adding…' : 'Add selected'}
                      </Button>
                    </addScanFetcher.Form>
                  )}

                  {scanResult.truncated && (
                    <p className="text-sm text-muted-foreground">
                      Results truncated. Narrow the roots or move projects closer to the root.
                    </p>
                  )}
                  {scanResult.errors.length > 0 && (
                    <div className="space-y-1">
                      {scanResult.errors.map((message, index) => (
                        <p key={`${index}-${message}`} className="text-sm text-muted-foreground">
                          {message}
                        </p>
                      ))}
                    </div>
                  )}

                  {addScanResult && (
                    <div className="space-y-1">
                      {addScanResult.added.length > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Added {addScanResult.added.length} project(s).
                        </p>
                      )}
                      {addScanResult.skipped.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Skipped {addScanResult.skipped.length} already configured project(s).
                        </p>
                      )}
                      {addScanResult.errors.map((entry) => (
                        <p key={`${entry.path}-${entry.error}`} className="text-sm text-destructive">
                          {entry.path}: {entry.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                    Path (repo root or path to .beads/beads.db; supports ~ and relative to repo root)
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
                {configWriteInstructions}
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
