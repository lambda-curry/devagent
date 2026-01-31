import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import {
  getProjectsConfigPath,
  resolveBeadsDbPath,
  validateProjectPath,
  parseProjectsConfig,
  loadProjectsConfig,
  getProjectList,
  getPathByProjectId,
  getDefaultProjectId,
  isConfigWritable,
  addProject,
  removeProject,
  getConfigWriteInstructions,
} from '../projects.server';

describe('projects.server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getProjectsConfigPath', () => {
    it('returns RALPH_PROJECTS_FILE when set', () => {
      process.env.RALPH_PROJECTS_FILE = '/custom/projects.json';
      expect(getProjectsConfigPath()).toBe('/custom/projects.json');
    });

    it('returns default path under repo root when RALPH_PROJECTS_FILE is unset', () => {
      delete process.env.RALPH_PROJECTS_FILE;
      const path = getProjectsConfigPath();
      expect(path).toMatch(/\.ralph\/projects\.json$/);
    });
  });

  describe('resolveBeadsDbPath', () => {
    it('returns path as-is when it ends with beads.db', () => {
      expect(resolveBeadsDbPath('/repo/beads.db')).toBe('/repo/beads.db');
      expect(resolveBeadsDbPath('/some/.beads/beads.db')).toBe('/some/.beads/beads.db');
    });

    it('returns join(path, .beads, beads.db) when path is repo root', () => {
      expect(resolveBeadsDbPath('/repo')).toBe('/repo/.beads/beads.db');
      expect(resolveBeadsDbPath('/home/user/project')).toBe('/home/user/project/.beads/beads.db');
    });

    it('trims whitespace', () => {
      expect(resolveBeadsDbPath('  /repo  ')).toBe('/repo/.beads/beads.db');
    });
  });

  describe('validateProjectPath', () => {
    it('returns true when path is a valid beads.db file that can be opened', () => {
      const dir = mkdtempSync(join(tmpdir(), 'ralph-projects-test-'));
      const dbPath = join(dir, 'beads.db');
      const db = new Database(dbPath);
      db.exec('CREATE TABLE issues (id TEXT PRIMARY KEY)');
      db.close();
      expect(validateProjectPath(dbPath)).toBe(true);
      rmSync(dbPath, { force: true });
      rmSync(dir, { recursive: true, force: true });
    });

    it('returns true when path is repo root containing .beads/beads.db', () => {
      const repoRoot = mkdtempSync(join(tmpdir(), 'ralph-repo-'));
      const beadsDir = join(repoRoot, '.beads');
      mkdirSync(beadsDir, { recursive: true });
      const dbPath = join(beadsDir, 'beads.db');
      const db = new Database(dbPath);
      db.close();
      expect(validateProjectPath(repoRoot)).toBe(true);
      rmSync(repoRoot, { recursive: true, force: true });
    });

    it('returns false when path does not exist', () => {
      expect(validateProjectPath('/nonexistent/path/beads.db')).toBe(false);
      expect(validateProjectPath('/nonexistent/repo')).toBe(false);
    });

    it('returns false when resolved DB path is a directory (not a file)', () => {
      const repoRoot = mkdtempSync(join(tmpdir(), 'ralph-repo-'));
      const beadsDir = join(repoRoot, '.beads');
      mkdirSync(beadsDir, { recursive: true });
      // beads.db is a directory, not a file - cannot open as SQLite
      const fakeBeadsDb = join(beadsDir, 'beads.db');
      mkdirSync(fakeBeadsDb, { recursive: true });
      expect(validateProjectPath(repoRoot)).toBe(false);
      rmSync(repoRoot, { recursive: true, force: true });
    });
  });

  describe('parseProjectsConfig', () => {
    it('parses valid config with projects and optional defaultId', () => {
      const raw = JSON.stringify({
        projects: [
          { id: 'p1', path: '/repo1', label: 'Repo 1' },
          { id: 'p2', path: '/repo2' },
        ],
        defaultId: 'p1',
      });
      const config = parseProjectsConfig(raw);
      expect(config.projects).toHaveLength(2);
      expect(config.projects[0]).toEqual({ id: 'p1', path: '/repo1', label: 'Repo 1' });
      expect(config.projects[1]).toEqual({ id: 'p2', path: '/repo2', label: undefined });
      expect(config.defaultId).toBe('p1');
    });

    it('trims id, path, and label', () => {
      const raw = JSON.stringify({
        projects: [{ id: '  id1  ', path: '  /path  ', label: '  Label  ' }],
      });
      const config = parseProjectsConfig(raw);
      expect(config.projects[0]).toEqual({ id: 'id1', path: '/path', label: 'Label' });
    });

    it('throws when projects is not an array', () => {
      expect(() => parseProjectsConfig('{}')).toThrow('Invalid projects config');
      expect(() => parseProjectsConfig('{"projects": null}')).toThrow('Invalid projects config');
    });

    it('throws when a project entry is missing id or path', () => {
      expect(() => parseProjectsConfig('{"projects": [{"path": "/p"}]}')).toThrow('Invalid project at index 0');
      expect(() => parseProjectsConfig('{"projects": [{"id": "x"}]}')).toThrow('Invalid project at index 0');
    });
  });

  describe('loadProjectsConfig', () => {
    it('throws when config file does not exist', () => {
      process.env.RALPH_PROJECTS_FILE = join(tmpdir(), 'nonexistent-projects.json');
      expect(() => loadProjectsConfig()).toThrow('Projects config not found');
    });

    it('loads and parses when file exists with valid JSON', () => {
      const dir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(dir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [{ id: 'a', path: '/repo/a', label: 'A' }],
          defaultId: 'a',
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;
      const config = loadProjectsConfig();
      expect(config.projects).toHaveLength(1);
      expect(config.projects[0].id).toBe('a');
      expect(config.defaultId).toBe('a');
      rmSync(dir, { recursive: true, force: true });
    });
  });

  describe('getProjectList', () => {
    it('returns empty array when config file does not exist', () => {
      process.env.RALPH_PROJECTS_FILE = join(tmpdir(), 'nonexistent-projects.json');
      expect(getProjectList()).toEqual([]);
    });

    it('returns list with valid flag per project', () => {
      const repoRoot = mkdtempSync(join(tmpdir(), 'ralph-repo-'));
      const beadsDir = join(repoRoot, '.beads');
      mkdirSync(beadsDir, { recursive: true });
      const dbPath = join(beadsDir, 'beads.db');
      const db = new Database(dbPath);
      db.close();

      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [
            { id: 'valid', path: repoRoot, label: 'Valid' },
            { id: 'invalid', path: '/nonexistent', label: 'Invalid' },
          ],
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      const list = getProjectList();
      expect(list).toHaveLength(2);
      const validProject = list.find((p) => p.id === 'valid');
      const invalidProject = list.find((p) => p.id === 'invalid');
      expect(validProject?.valid).toBe(true);
      expect(invalidProject?.valid).toBe(false);

      rmSync(repoRoot, { recursive: true, force: true });
      rmSync(configDir, { recursive: true, force: true });
    });
  });

  describe('getPathByProjectId', () => {
    it('returns path when project exists in config', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [
            { id: 'p1', path: '/repo/one' },
            { id: 'p2', path: '/repo/two', label: 'Two' },
          ],
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getPathByProjectId('p1')).toBe('/repo/one');
      expect(getPathByProjectId('p2')).toBe('/repo/two');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns null when project id not found', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [{ id: 'p1', path: '/r' }] }));
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getPathByProjectId('other')).toBeNull();

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns null when config file does not exist', () => {
      process.env.RALPH_PROJECTS_FILE = join(tmpdir(), 'nonexistent-projects.json');
      expect(getPathByProjectId('any')).toBeNull();
    });
  });

  describe('getDefaultProjectId', () => {
    it('returns defaultId when set and present in projects', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [
            { id: 'a', path: '/a' },
            { id: 'b', path: '/b' },
          ],
          defaultId: 'b',
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getDefaultProjectId()).toBe('b');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns first project when defaultId is not set', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [
            { id: 'first', path: '/first' },
            { id: 'second', path: '/second' },
          ],
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getDefaultProjectId()).toBe('first');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns first project when defaultId is set but not in projects', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [{ id: 'only', path: '/only' }],
          defaultId: 'missing',
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getDefaultProjectId()).toBe('only');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns null when no projects', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [] }));
      process.env.RALPH_PROJECTS_FILE = configPath;

      expect(getDefaultProjectId()).toBeNull();

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns null when config file does not exist', () => {
      process.env.RALPH_PROJECTS_FILE = join(tmpdir(), 'nonexistent-projects.json');
      expect(getDefaultProjectId()).toBeNull();
    });
  });

  describe('isConfigWritable', () => {
    it('returns true when config file exists and is writable', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [] }));
      process.env.RALPH_PROJECTS_FILE = configPath;
      expect(isConfigWritable()).toBe(true);
      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns true when config file does not exist but parent dir exists and is writable', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      rmSync(configPath, { force: true });
      process.env.RALPH_PROJECTS_FILE = configPath;
      expect(isConfigWritable()).toBe(true);
      rmSync(configDir, { recursive: true, force: true });
    });
  });

  describe('addProject', () => {
    it('adds a valid project and returns its id', () => {
      const repoRoot = mkdtempSync(join(tmpdir(), 'ralph-repo-'));
      const beadsDir = join(repoRoot, '.beads');
      mkdirSync(beadsDir, { recursive: true });
      const dbPath = join(beadsDir, 'beads.db');
      const db = new Database(dbPath);
      db.close();

      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [] }));
      process.env.RALPH_PROJECTS_FILE = configPath;

      const result = addProject({ path: repoRoot, label: 'My Repo' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.id).toBeDefined();
        const list = getProjectList();
        expect(list).toHaveLength(1);
        expect(list[0].path).toBe(repoRoot);
        expect(list[0].label).toBe('My Repo');
      }

      rmSync(repoRoot, { recursive: true, force: true });
      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns error when path is invalid', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [] }));
      process.env.RALPH_PROJECTS_FILE = configPath;

      const result = addProject({ path: '/nonexistent' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain('valid Beads database');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns error when path is empty', () => {
      const result = addProject({ path: '   ' });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain('Path is required');
    });
  });

  describe('removeProject', () => {
    it('removes a project by id', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          projects: [
            { id: 'a', path: '/a' },
            { id: 'b', path: '/b' },
          ],
        }),
      );
      process.env.RALPH_PROJECTS_FILE = configPath;

      const result = removeProject('b');
      expect(result.success).toBe(true);
      const list = getProjectList();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('a');

      rmSync(configDir, { recursive: true, force: true });
    });

    it('returns error when project not found', () => {
      const configDir = mkdtempSync(join(tmpdir(), 'ralph-config-'));
      const configPath = join(configDir, 'projects.json');
      writeFileSync(configPath, JSON.stringify({ projects: [{ id: 'a', path: '/a' }] }));
      process.env.RALPH_PROJECTS_FILE = configPath;

      const result = removeProject('other');
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain('not found');

      rmSync(configDir, { recursive: true, force: true });
    });
  });

  describe('getConfigWriteInstructions', () => {
    it('returns string containing config path', () => {
      process.env.RALPH_PROJECTS_FILE = '/custom/projects.json';
      const instructions = getConfigWriteInstructions();
      expect(instructions).toContain('/custom/projects.json');
      expect(instructions).toContain('projects');
    });
  });
});
