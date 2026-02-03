import Database from 'better-sqlite3';
import { readFileSync, writeFileSync, existsSync, accessSync, mkdirSync, readdirSync } from 'node:fs';
import { constants } from 'node:fs';
import { join, resolve, isAbsolute } from 'node:path';

/**
 * Project entry in the projects config file.
 * `path` is the repo root (directory containing `.beads/beads.db`).
 */
export interface Project {
  id: string;
  path: string;
  label?: string;
}

/**
 * Projects config file schema.
 * Persisted at path from RALPH_PROJECTS_FILE or default `.ralph/projects.json` under repo root.
 */
export interface ProjectsConfig {
  projects: Project[];
  defaultId?: string;
}

const DEFAULT_CONFIG_FILENAME = 'projects.json';
const RELATIVE_CONFIG_DIR = '.ralph';
const BEADS_DB_RELATIVE = join('.beads', 'beads.db');
const DEFAULT_SCAN_MAX_DEPTH = 4;
const DEFAULT_SCAN_MAX_RESULTS = 50;
const SCAN_IGNORE_DIRS = new Set([
  '.beads',
  '.git',
  '.hg',
  '.svn',
  '.ralph',
  '.next',
  '.cache',
  'node_modules',
  'dist',
  'build',
  'out',
]);

function getRepoRoot(): string {
  const cwd = process.cwd();
  if (process.env.REPO_ROOT) return process.env.REPO_ROOT;
  if (cwd.includes('apps/ralph-monitoring')) return join(cwd, '../..');
  return cwd;
}

/**
 * Resolves the path to the projects config file.
 * Uses RALPH_PROJECTS_FILE if set, otherwise `<repoRoot>/.ralph/projects.json`.
 */
export function getProjectsConfigPath(): string {
  if (process.env.RALPH_PROJECTS_FILE) return process.env.RALPH_PROJECTS_FILE;
  return join(getRepoRoot(), RELATIVE_CONFIG_DIR, DEFAULT_CONFIG_FILENAME);
}

function expandTildePath(input: string): string {
  if (input === '~' || input.startsWith('~/')) {
    const home = process.env.HOME;
    if (!home) return input;
    return input === '~' ? home : join(home, input.slice(2));
  }
  return input;
}

function resolveProjectPath(input: string): string {
  const trimmed = expandTildePath(input.trim());
  if (isAbsolute(trimmed)) return trimmed;
  return join(getRepoRoot(), trimmed);
}

/**
 * Resolves the Beads DB path for a project.
 * If `projectPath` ends with `beads.db`, treats it as the DB path; otherwise treats it as repo root and returns `<projectPath>/.beads/beads.db`.
 * Relative paths resolve from the repo root.
 */
export function resolveBeadsDbPath(projectPath: string): string {
  const normalized = expandTildePath(projectPath.trim());
  if (normalized.endsWith('beads.db')) return resolveProjectPath(normalized);
  return join(resolveProjectPath(normalized), BEADS_DB_RELATIVE);
}

export function normalizeDbPath(projectPath: string): string {
  return resolve(resolveBeadsDbPath(projectPath));
}

/**
 * Validates that the project path exists and the Beads DB at that location exists and is readable.
 * Returns true if the DB file exists and can be opened readonly.
 */
export function validateProjectPath(projectPath: string): boolean {
  const dbPath = resolveBeadsDbPath(projectPath);
  if (!existsSync(dbPath)) return false;
  try {
    const db = new Database(dbPath, { readonly: true });
    db.close();
    return true;
  } catch {
    return false;
  }
}

/** Parses raw JSON string into ProjectsConfig; throws on invalid schema. Exported for tests. */
export function parseProjectsConfig(raw: string): ProjectsConfig {
  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== 'object' || !Array.isArray((data as Record<string, unknown>).projects)) {
    throw new Error('Invalid projects config: expected { projects: Project[] }');
  }
  const { projects, defaultId } = data as { projects: unknown[]; defaultId?: string };
  const out: Project[] = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (!p || typeof p !== 'object' || typeof (p as Record<string, unknown>).id !== 'string' || typeof (p as Record<string, unknown>).path !== 'string') {
      throw new Error(`Invalid project at index ${i}: expected { id: string, path: string, label?: string }`);
    }
    const { id, path, label } = p as { id: string; path: string; label?: string };
    out.push({ id: id.trim(), path: path.trim(), label: typeof label === 'string' ? label.trim() : undefined });
  }
  return {
    projects: out,
    defaultId: typeof defaultId === 'string' ? defaultId.trim() : undefined,
  };
}

/**
 * Loads and parses the projects config file.
 * Throws if the file does not exist or is invalid.
 */
export function loadProjectsConfig(): ProjectsConfig {
  const configPath = getProjectsConfigPath();
  if (!existsSync(configPath)) {
    throw new Error(`Projects config not found: ${configPath}. Set RALPH_PROJECTS_FILE or create ${join(getRepoRoot(), RELATIVE_CONFIG_DIR, DEFAULT_CONFIG_FILENAME)}.`);
  }
  const raw = readFileSync(configPath, 'utf-8');
  return parseProjectsConfig(raw);
}

/**
 * Result item for getProjectList: project plus validation status.
 */
export interface ProjectWithValidation extends Project {
  valid: boolean;
}

/**
 * Returns the project list from config, with validation that each project path exists and DB is readable.
 */
export function getProjectList(): ProjectWithValidation[] {
  try {
    const config = loadProjectsConfig();
    return config.projects.map((p) => ({
      ...p,
      valid: validateProjectPath(p.path),
    }));
  } catch {
    return [];
  }
}

/**
 * Returns the repo root path for a project by id, or null if not found.
 */
export function getPathByProjectId(projectId: string): string | null {
  try {
    const config = loadProjectsConfig();
    const project = config.projects.find((p) => p.id === projectId);
    return project ? project.path : null;
  } catch {
    return null;
  }
}

/**
 * Returns the default project id from config (defaultId or first project), or null if no projects.
 */
export function getDefaultProjectId(): string | null {
  try {
    const config = loadProjectsConfig();
    if (config.projects.length === 0) return null;
    if (config.defaultId && config.projects.some((p) => p.id === config.defaultId)) {
      return config.defaultId;
    }
    return config.projects[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the projects config file exists and is writable, or if the parent directory
 * exists and we can create the file. Used to decide whether to show add/remove UI or instructions.
 */
export function isConfigWritable(): boolean {
  const configPath = getProjectsConfigPath();
  const dir = join(configPath, '..');
  try {
    if (existsSync(configPath)) {
      accessSync(configPath, constants.W_OK);
      return true;
    }
    if (existsSync(dir)) {
      accessSync(dir, constants.W_OK);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Slug for project id: last path segment, lowercased, non-alphanumeric replaced with hyphen. */
function slugFromPath(path: string): string {
  const normalized = path.trim().replace(/\\/g, '/');
  const segment = normalized.split('/').filter(Boolean).pop() ?? 'project';
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

/** Ensures unique id among existing ids by appending -2, -3, etc. */
function ensureUniqueId(baseId: string, existingIds: string[]): string {
  const set = new Set(existingIds);
  if (!set.has(baseId)) return baseId;
  let n = 2;
  while (set.has(`${baseId}-${n}`)) n++;
  return `${baseId}-${n}`;
}

export type AddProjectResult = { success: true; id: string } | { success: false; error: string };
export type RemoveProjectResult = { success: true } | { success: false; error: string };
export interface ScanForBeadsProjectsResult {
  matches: string[];
  errors: string[];
  truncated: boolean;
}

/**
 * Appends a project to the config. Validates path (DB must exist and be readable).
 * Generates id from path (slug) and ensures uniqueness. Returns new project id or error.
 */
export function addProject(input: { path: string; label?: string }): AddProjectResult {
  const projectPath = input.path.trim();
  if (!projectPath) return { success: false, error: 'Path is required.' };
  if (!validateProjectPath(projectPath)) {
    return { success: false, error: 'Path does not point to a valid Beads database (.beads/beads.db not found or not readable).' };
  }
  const configPath = getProjectsConfigPath();
  const dir = join(configPath, '..');
  try {
    let config: ProjectsConfig;
    if (existsSync(configPath)) {
      try {
        accessSync(configPath, constants.W_OK);
      } catch {
        return { success: false, error: 'Config file is not writable.' };
      }
      const raw = readFileSync(configPath, 'utf-8');
      config = parseProjectsConfig(raw);
    } else {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      accessSync(dir, constants.W_OK);
      config = { projects: [] };
    }
    const baseId = slugFromPath(projectPath);
    const existingIds = config.projects.map((p) => p.id);
    const id = ensureUniqueId(baseId, existingIds);
    const label = typeof input.label === 'string' ? input.label.trim() : undefined;
    config.projects.push({ id, path: projectPath, label });
    writeFileSync(configPath, JSON.stringify({ ...config, projects: config.projects }, null, 2), 'utf-8');
    return { success: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add project.';
    return { success: false, error: message };
  }
}

/**
 * Removes a project from the config by id. Returns success or error.
 */
export function removeProject(projectId: string): RemoveProjectResult {
  const id = projectId.trim();
  if (!id) return { success: false, error: 'Project id is required.' };
  const configPath = getProjectsConfigPath();
  if (!existsSync(configPath)) return { success: false, error: 'Config file not found.' };
  try {
    accessSync(configPath, constants.W_OK);
  } catch {
    return { success: false, error: 'Config file is not writable.' };
  }
  try {
    const raw = readFileSync(configPath, 'utf-8');
    const config = parseProjectsConfig(raw);
    const index = config.projects.findIndex((p) => p.id === id);
    if (index < 0) return { success: false, error: 'Project not found.' };
    config.projects.splice(index, 1);
    const payload: ProjectsConfig = {
      projects: config.projects,
      defaultId: config.defaultId && config.projects.some((p) => p.id === config.defaultId) ? config.defaultId : undefined
    };
    writeFileSync(configPath, JSON.stringify(payload, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove project.';
    return { success: false, error: message };
  }
}

/**
 * Returns instructions for editing the config file manually (when read-only).
 */
export function getConfigWriteInstructions(): string {
  const configPath = getProjectsConfigPath();
  return `To add or remove projects, edit the config file manually:\n${configPath}\n\nSchema: { "projects": [{ "id": "string", "path": "absolute-or-relative-path", "label": "optional" }], "defaultId": "optional" }`;
}

/**
 * Scans one or more root directories for Beads databases (.beads/beads.db).
 * Returns matched project roots, any errors encountered, and whether results were truncated.
 */
export function scanForBeadsProjects(
  roots: string[],
  options: { maxDepth?: number; maxResults?: number } = {},
): ScanForBeadsProjectsResult {
  const maxDepth = options.maxDepth ?? DEFAULT_SCAN_MAX_DEPTH;
  const maxResults = options.maxResults ?? DEFAULT_SCAN_MAX_RESULTS;
  const matches = new Set<string>();
  const errors: string[] = [];
  let truncated = false;
  const visited = new Set<string>();

  const normalizedRoots = roots.map((root) => root.trim()).filter(Boolean);
  if (normalizedRoots.length === 0) {
    return { matches: [], errors: ['At least one root path is required.'], truncated: false };
  }

  for (const root of normalizedRoots) {
    const resolvedRoot = resolveProjectPath(root);
    if (!existsSync(resolvedRoot)) {
      errors.push(`Root not found: ${root}`);
      continue;
    }

    let foundInRoot = false;
    const queue: Array<{ dir: string; depth: number }> = [{ dir: resolvedRoot, depth: 0 }];

    while (queue.length > 0) {
      const { dir, depth } = queue.pop()!;
      if (visited.has(dir)) continue;
      visited.add(dir);

      if (validateProjectPath(dir)) {
        matches.add(dir);
        foundInRoot = true;
        if (matches.size >= maxResults) {
          truncated = true;
          break;
        }
      }

      if (depth >= maxDepth) continue;

      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          if (SCAN_IGNORE_DIRS.has(entry.name)) continue;
          queue.push({ dir: join(dir, entry.name), depth: depth + 1 });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Unable to read ${dir}: ${message}`);
      }
    }

    if (truncated) break;
    if (!foundInRoot) {
      errors.push(`No Beads database found under ${root} (depth ${maxDepth}).`);
    }
  }

  return {
    matches: Array.from(matches),
    errors,
    truncated,
  };
}

export function getExistingProjectDbPaths(): Set<string> {
  try {
    const config = loadProjectsConfig();
    return new Set(config.projects.map((p) => normalizeDbPath(p.path)));
  } catch {
    return new Set();
  }
}

export function isProjectAlreadyConfigured(projectPath: string, existing?: Set<string>): boolean {
  const set = existing ?? getExistingProjectDbPaths();
  return set.has(normalizeDbPath(projectPath));
}
