/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoutesStub } from '~/lib/test-utils/router';
import SettingsProjects, { loader, action } from '../settings.projects';
import type { Route } from '../+types/settings.projects';
import * as projectsServer from '~/lib/projects.server';
import { render, screen } from '@testing-library/react';

vi.mock('~/lib/projects.server', () => ({
  getProjectList: vi.fn(),
  getProjectsConfigPath: vi.fn(() => '/tmp/.ralph/projects.json'),
  isConfigWritable: vi.fn(),
  addProject: vi.fn(),
  removeProject: vi.fn(),
  getConfigWriteInstructions: vi.fn(() => 'Edit the config file at /tmp/.ralph/projects.json'),
  scanForBeadsProjects: vi.fn(() => ({ matches: [], errors: [], truncated: false })),
  getExistingProjectDbPaths: vi.fn(() => new Set()),
  isProjectAlreadyConfigured: vi.fn(() => false),
  normalizeDbPath: vi.fn((path: string) => path)
}));

describe('settings.projects', () => {
  beforeEach(() => {
    vi.mocked(projectsServer.getProjectList).mockReturnValue([]);
    vi.mocked(projectsServer.isConfigWritable).mockReturnValue(true);
  });

  describe('loader', () => {
    it('returns projects, configPath, and writable', async () => {
      const projects = [{ id: 'p1', path: '/repo', label: 'Repo', valid: true }];
      vi.mocked(projectsServer.getProjectList).mockReturnValue(projects);
      const result = await loader();
      expect(result.projects).toEqual(projects);
      expect(result.writable).toBe(true);
    });
  });

  describe('action', () => {
    it('adds project when intent is add and path is valid', async () => {
      vi.mocked(projectsServer.addProject).mockReturnValue({ success: true, id: 'new-id' });
      const formData = new FormData();
      formData.set('intent', 'add');
      formData.set('path', '/valid/repo');
      formData.set('label', 'My Repo');
      const request = new Request('http://localhost/settings/projects', {
        method: 'POST',
        body: formData
      });
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      });
      expect(projectsServer.addProject).toHaveBeenCalledWith({ path: '/valid/repo', label: 'My Repo' });
      expect((result as { data?: { ok?: boolean } }).data?.ok).toBe(true);
    });

    it('returns 400 when add path is empty', async () => {
      const formData = new FormData();
      formData.set('intent', 'add');
      formData.set('path', '');
      const request = new Request('http://localhost/settings/projects', { method: 'POST', body: formData });
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      });
      const payload = (result as { data?: unknown }).data as { ok?: boolean; error?: string };
      expect(payload.ok).toBe(false);
      expect(payload.error).toContain('Path is required');
    });

    it('removes project when intent is remove', async () => {
      vi.mocked(projectsServer.removeProject).mockReturnValue({ success: true });
      const formData = new FormData();
      formData.set('intent', 'remove');
      formData.set('projectId', 'p1');
      const request = new Request('http://localhost/settings/projects', { method: 'POST', body: formData });
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      });
      expect(projectsServer.removeProject).toHaveBeenCalledWith('p1');
      expect((result as { data?: { ok?: boolean } }).data?.ok).toBe(true);
    });

    it('scans for projects when intent is scan', async () => {
      vi.mocked(projectsServer.scanForBeadsProjects).mockReturnValue({
        matches: ['/repo/one'],
        errors: [],
        truncated: false
      });
      const formData = new FormData();
      formData.set('intent', 'scan');
      formData.set('roots', '/repo\n/other');
      const request = new Request('http://localhost/settings/projects', { method: 'POST', body: formData });
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: ''
      });
      expect(projectsServer.scanForBeadsProjects).toHaveBeenCalledWith(['/repo', '/other']);
      expect((result as { data?: { ok?: boolean } }).data?.ok).toBe(true);
    });
  });

  describe('component', () => {
    it('renders project list and add form when writable', async () => {
      vi.mocked(projectsServer.getProjectList).mockReturnValue([
        { id: 'p1', path: '/repo', label: 'Repo', valid: true }
      ]);
      const loaderData = await loader();
      const Stub = createRoutesStub([
        {
          path: '/settings/projects',
          Component: () => (
            <SettingsProjects
              loaderData={loaderData}
              params={{}}
              matches={[] as unknown as Route.ComponentProps['matches']}
            />
          )
        }
      ]);
      render(<Stub initialEntries={['/settings/projects']} />);
      expect(screen.getByText('Project settings')).toBeInTheDocument();
      expect(screen.getByText('Repo')).toBeInTheDocument();
      expect(screen.getByLabelText(/path/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
    });

    it('shows read-only instructions when config is not writable', async () => {
      vi.mocked(projectsServer.isConfigWritable).mockReturnValue(false);
      const loaderData = await loader();
      const Stub = createRoutesStub([
        {
          path: '/settings/projects',
          Component: () => (
            <SettingsProjects
              loaderData={loaderData}
              params={{}}
              matches={[] as unknown as Route.ComponentProps['matches']}
            />
          )
        }
      ]);
      render(<Stub initialEntries={['/settings/projects']} />);
      expect(screen.getByText('Config is read-only')).toBeInTheDocument();
      expect(screen.getByText(/Edit the config file at/)).toBeInTheDocument();
    });
  });
});
