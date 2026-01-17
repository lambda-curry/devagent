import type Database from 'better-sqlite3';

/**
 * Task data structure for seed scenarios.
 * Matches the issues table schema (parent_id is computed, not stored).
 */
export interface SeedTask {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed' | 'blocked';
  priority: string | null;
  created_at: string; // RFC3339 timestamp
  updated_at: string; // RFC3339 timestamp
}

/**
 * Seed data scenarios for testing.
 * 
 * Each scenario provides a set of tasks with specific characteristics:
 * - `basic`: Tasks with mixed statuses and priorities
 * - `search`: Tasks with specific keywords in titles/descriptions
 * - `hierarchy`: Tasks with parent-child relationships (via hierarchical IDs)
 */
export const seedScenarios = {
  /**
   * Basic scenario: Tasks with mixed statuses and priorities.
   * 
   * Includes:
   * - Tasks with all statuses: open, in_progress, closed, blocked
   * - Tasks with different priorities: P0, P1, P2, P3, and null
   * - Mix of tasks with and without descriptions
   */
  basic: (): SeedTask[] => {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    return [
      {
        id: 'bd-1001',
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        status: 'open',
        priority: 'P1',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
      {
        id: 'bd-1002',
        title: 'Fix critical security vulnerability',
        description: 'Address SQL injection risk in user input',
        status: 'in_progress',
        priority: 'P0',
        created_at: twoDaysAgo,
        updated_at: yesterday,
      },
      {
        id: 'bd-1003',
        title: 'Update documentation',
        description: 'Refresh API documentation with latest changes',
        status: 'closed',
        priority: 'P3',
        created_at: twoDaysAgo,
        updated_at: now,
      },
      {
        id: 'bd-1004',
        title: 'Refactor database queries',
        description: null,
        status: 'open',
        priority: 'P2',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: 'bd-1005',
        title: 'Investigate performance issue',
        description: 'Page load times are slow on mobile devices',
        status: 'blocked',
        priority: 'P1',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: 'bd-1006',
        title: 'Add unit tests',
        description: 'Increase test coverage for core modules',
        status: 'in_progress',
        priority: 'P2',
        created_at: yesterday,
        updated_at: now,
      },
      {
        id: 'bd-1007',
        title: 'Design new feature',
        description: null,
        status: 'open',
        priority: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'bd-1008',
        title: 'Deploy to production',
        description: 'Final deployment checklist and rollout',
        status: 'closed',
        priority: 'P0',
        created_at: twoDaysAgo,
        updated_at: now,
      },
    ];
  },

  /**
   * Search scenario: Tasks with specific keywords in titles/descriptions.
   * 
   * Includes:
   * - Tasks with "authentication" keyword
   * - Tasks with "database" keyword
   * - Tasks with "test" keyword
   * - Tasks with "API" keyword
   * - Mix of statuses and priorities for realistic search testing
   */
  search: (): SeedTask[] => {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    return [
      {
        id: 'bd-2001',
        title: 'Implement authentication system',
        description: 'Add OAuth2 authentication flow',
        status: 'in_progress',
        priority: 'P1',
        created_at: twoDaysAgo,
        updated_at: yesterday,
      },
      {
        id: 'bd-2002',
        title: 'Fix authentication bug',
        description: 'Users cannot log in after password reset',
        status: 'open',
        priority: 'P0',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: 'bd-2003',
        title: 'Database migration script',
        description: 'Create migration for user table schema changes',
        status: 'open',
        priority: 'P2',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
      {
        id: 'bd-2004',
        title: 'Optimize database queries',
        description: 'Add indexes to improve query performance',
        status: 'in_progress',
        priority: 'P1',
        created_at: yesterday,
        updated_at: now,
      },
      {
        id: 'bd-2005',
        title: 'Write unit tests',
        description: 'Add test coverage for authentication module',
        status: 'open',
        priority: 'P2',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: 'bd-2006',
        title: 'Integration test suite',
        description: 'Create end-to-end tests for API endpoints',
        status: 'closed',
        priority: 'P1',
        created_at: twoDaysAgo,
        updated_at: now,
      },
      {
        id: 'bd-2007',
        title: 'API documentation',
        description: 'Update REST API documentation with examples',
        status: 'open',
        priority: 'P3',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: 'bd-2008',
        title: 'API rate limiting',
        description: 'Implement rate limiting for API endpoints',
        status: 'in_progress',
        priority: 'P1',
        created_at: twoDaysAgo,
        updated_at: now,
      },
    ];
  },

  /**
   * Hierarchy scenario: Tasks with parent-child relationships.
   * 
   * Uses hierarchical IDs where child tasks have parent ID as prefix:
   * - Parent: 'bd-3001'
   * - Children: 'bd-3001.1', 'bd-3001.2', etc.
   * 
   * Includes:
   * - Multiple parent tasks with different statuses
   * - Child tasks with various statuses and priorities
   * - Nested hierarchy (grandchildren: 'bd-3001.1.1')
   */
  hierarchy: (): SeedTask[] => {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    return [
      // Parent task 1: Feature implementation epic
      {
        id: 'bd-3001',
        title: 'Implement user dashboard feature',
        description: 'Complete dashboard with analytics and widgets',
        status: 'in_progress',
        priority: 'P1',
        created_at: threeDaysAgo,
        updated_at: yesterday,
      },
      // Children of bd-3001
      {
        id: 'bd-3001.1',
        title: 'Design dashboard layout',
        description: 'Create wireframes and mockups',
        status: 'closed',
        priority: 'P2',
        created_at: threeDaysAgo,
        updated_at: twoDaysAgo,
      },
      {
        id: 'bd-3001.2',
        title: 'Implement analytics widget',
        description: 'Build real-time analytics display',
        status: 'in_progress',
        priority: 'P1',
        created_at: threeDaysAgo,
        updated_at: yesterday,
      },
      {
        id: 'bd-3001.3',
        title: 'Add user preferences',
        description: 'Allow users to customize dashboard',
        status: 'open',
        priority: 'P2',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
      // Grandchild of bd-3001 (child of bd-3001.2)
      {
        id: 'bd-3001.2.1',
        title: 'Optimize analytics queries',
        description: 'Improve performance of data aggregation',
        status: 'open',
        priority: 'P1',
        created_at: yesterday,
        updated_at: yesterday,
      },
      // Parent task 2: Bug fix epic
      {
        id: 'bd-3002',
        title: 'Fix critical bugs in payment system',
        description: 'Address multiple issues in payment processing',
        status: 'open',
        priority: 'P0',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
      // Children of bd-3002
      {
        id: 'bd-3002.1',
        title: 'Fix payment validation error',
        description: 'Credit card validation failing for some cards',
        status: 'in_progress',
        priority: 'P0',
        created_at: twoDaysAgo,
        updated_at: yesterday,
      },
      {
        id: 'bd-3002.2',
        title: 'Fix refund processing bug',
        description: 'Refunds not completing correctly',
        status: 'open',
        priority: 'P1',
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
      {
        id: 'bd-3002.3',
        title: 'Add payment logging',
        description: 'Improve audit trail for payment operations',
        status: 'closed',
        priority: 'P2',
        created_at: twoDaysAgo,
        updated_at: now,
      },
      // Parent task 3: Documentation epic
      {
        id: 'bd-3003',
        title: 'Update project documentation',
        description: 'Comprehensive documentation refresh',
        status: 'closed',
        priority: 'P3',
        created_at: threeDaysAgo,
        updated_at: now,
      },
      // Children of bd-3003
      {
        id: 'bd-3003.1',
        title: 'Write API documentation',
        description: 'Document all REST endpoints',
        status: 'closed',
        priority: 'P2',
        created_at: threeDaysAgo,
        updated_at: twoDaysAgo,
      },
      {
        id: 'bd-3003.2',
        title: 'Update README',
        description: 'Refresh project README with latest info',
        status: 'closed',
        priority: 'P3',
        created_at: threeDaysAgo,
        updated_at: now,
      },
    ];
  },
};

/**
 * Populates a test database with seed data for a given scenario.
 * 
 * @param db - The SQLite database instance (must have issues table created)
 * @param scenario - The seed scenario to use ('basic', 'search', or 'hierarchy')
 * @throws Error if scenario is invalid or database operation fails
 */
export function seedDatabase(
  db: Database.Database,
  scenario: keyof typeof seedScenarios,
): void {
  const tasks = seedScenarios[scenario]();

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT INTO issues (id, title, description, status, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Use transaction for atomicity
  const insertMany = db.transaction((tasks: SeedTask[]) => {
    for (const task of tasks) {
      insert.run(
        task.id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.created_at,
        task.updated_at,
      );
    }
  });

  try {
    insertMany(tasks);
  } catch (error) {
    throw new Error(
      `Failed to seed database with scenario '${scenario}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
