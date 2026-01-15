import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as beadsServer from '~/db/beads.server';

// Mock the database module
vi.mock('~/db/beads.server', () => ({
	getAllTasks: vi.fn(),
}));

describe('_index route', () => {
	const mockTasks: beadsServer.BeadsTask[] = [
		{
			id: 'task-1',
			title: 'Task 1',
			description: 'Description 1',
			status: 'in_progress',
			priority: 'P1',
			parent_id: null,
			created_at: '2026-01-15T10:00:00Z',
			updated_at: '2026-01-15T11:00:00Z'
		},
		{
			id: 'task-2',
			title: 'Task 2',
			description: 'Description 2',
			status: 'open',
			priority: 'P2',
			parent_id: null,
			created_at: '2026-01-15T09:00:00Z',
			updated_at: '2026-01-15T10:00:00Z'
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks without filters', async () => {
		vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

		const routeModule = await import('../_index');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		
		expect(loaderData).toHaveProperty('tasks');
		expect(loaderData).toHaveProperty('filters');
		expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
			status: undefined,
			priority: undefined,
			search: undefined
		});
	});

	it('loads tasks with status filter', async () => {
		vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

		const routeModule = await import('../_index');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/?status=in_progress'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		
		expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
			status: 'in_progress',
			priority: undefined,
			search: undefined
		});
	});

	it('loads tasks with search filter', async () => {
		vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

		const routeModule = await import('../_index');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/?search=Task'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		
		expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
			status: undefined,
			priority: undefined,
			search: 'Task'
		});
	});

	it('loads tasks with priority filter', async () => {
		vi.mocked(beadsServer.getAllTasks).mockReturnValue([mockTasks[0]]);

		const routeModule = await import('../_index');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/?priority=P1'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		
		expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
			status: undefined,
			priority: 'P1',
			search: undefined
		});
	});

	it('handles "all" status filter as undefined', async () => {
		vi.mocked(beadsServer.getAllTasks).mockReturnValue(mockTasks);

		const routeModule = await import('../_index');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/?status=all'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		
		expect(beadsServer.getAllTasks).toHaveBeenCalledWith({
			status: undefined,
			priority: undefined,
			search: undefined
		});
	});
});
