import { Link, href, useNavigate, useParams, useRouteLoaderData } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { ProjectWithValidation } from '~/lib/projects.server';

const ROOT_LOADER_ID = 'root';

interface RootLoaderData {
  projects: ProjectWithValidation[];
  defaultProjectId: string | null;
}

export function ProjectSwitcher() {
  const rootData = useRouteLoaderData(ROOT_LOADER_ID) as RootLoaderData | undefined;
  const params = useParams();
  const navigate = useNavigate();
  const projectId = params.projectId ?? rootData?.defaultProjectId ?? 'combined';

  const projects = rootData?.projects ?? [];
  const defaultId = rootData?.defaultProjectId ?? null;

  const displayValue = projectId || defaultId || 'combined';

  const handleValueChange = (value: string) => {
    navigate(href('/projects/:projectId', { projectId: value }));
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={displayValue} onValueChange={handleValueChange}>
        <SelectTrigger aria-label="Active project" className="w-[200px] sm:w-[240px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="combined">All projects</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id} disabled={!p.valid}>
              {p.label ?? p.id}
              {!p.valid ? ' (invalid path)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link
        to="/settings/projects"
        className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
      >
        Manage
      </Link>
    </div>
  );
}
