import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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

/**
 * Resolves the Beads DB path for a project.
 * If `projectPath` ends with `beads.db`, treats it as the DB path; otherwise treats it as repo root and returns `<projectPath>/.beads/beads.db`.
 */
export function resolveBeadsDbPath(projectPath: string): string {
  const normalized = projectPath.trim();
  if (normalized.endsWith('beads.db')) return normalized;
  return join(normalized, BEADS_DB_RELATIVE);
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
