import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as beadsServer from '~/db/beads.server';

// Mock the database module
vi.mock('~/db/beads.server', () => ({
	getTaskById: vi.fn(),
}));

describe('tasks.$taskId route loader', () => {
	const mockTask: beadsServer.BeadsTask = {
		id: 'test-task-1',
		title: 'Test Task',
		description: 'Test description',
		status: 'in_progress',
		priority: 'P1',
		parent_id: null,
		created_at: '2026-01-15T10:00:00Z',
		updated_at: '2026-01-15T11:00:00Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns task data when task is found', async () => {
		vi.mocked(beadsServer.getTaskById).mockReturnValue(mockTask);

		const routeModule = await import('../tasks.$taskId');
		
		const loaderArgs = {
			params: { taskId: 'test-task-1' },
			request: new Request('http://localhost/tasks/test-task-1'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const loaderData = await routeModule.loader(loaderArgs);
		expect(loaderData).toEqual({ task: mockTask });
		expect(beadsServer.getTaskById).toHaveBeenCalledWith('test-task-1');
	});

	it('throws 404 error when task is not found', async () => {
		vi.mocked(beadsServer.getTaskById).mockReturnValue(null);

		const routeModule = await import('../tasks.$taskId');

		const loaderArgs = {
			params: { taskId: 'non-existent' },
			request: new Request('http://localhost/tasks/non-existent'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const thrown = await routeModule.loader(loaderArgs).catch(error => error);
		expect(thrown).toMatchObject({
			type: 'DataWithResponseInit',
			init: { status: 404 }
		});
	});

	it('throws 400 error when taskId is missing', async () => {
		const routeModule = await import('../tasks.$taskId');

		const loaderArgs = {
			params: {},
			request: new Request('http://localhost/tasks/'),
			context: {},
			unstable_pattern: undefined
		} as any;

		const thrown = await routeModule.loader(loaderArgs).catch(error => error);
		expect(thrown).toMatchObject({
			type: 'DataWithResponseInit',
			init: { status: 400 }
		});
	});
});
