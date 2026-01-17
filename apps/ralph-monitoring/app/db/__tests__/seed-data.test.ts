import { describe, it, expect } from 'vitest';
import { createTestDatabase } from '../../lib/test-utils/testDatabase';
import { seedDatabase, seedScenarios } from './seed-data';

describe('seed-data', () => {
  describe('seedDatabase', () => {
    it('populates database with basic scenario', () => {
      const { db, cleanup } = createTestDatabase();
      
      try {
        seedDatabase(db, 'basic');
        
        // Verify data was inserted by querying directly
        const tasks = db.prepare('SELECT * FROM issues').all() as Array<{
          id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string | null;
        }>;
        
        expect(tasks.length).toBe(8);
        
        // Verify mixed statuses
        const statuses = tasks.map(t => t.status);
        expect(statuses).toContain('open');
        expect(statuses).toContain('in_progress');
        expect(statuses).toContain('closed');
        expect(statuses).toContain('blocked');
        
        // Verify priorities
        const priorities = tasks.map(t => t.priority).filter(Boolean);
        expect(priorities.length).toBeGreaterThan(0);
      } finally {
        cleanup();
      }
    });

    it('populates database with search scenario', () => {
      const { db, cleanup } = createTestDatabase();
      
      try {
        seedDatabase(db, 'search');
        
        const tasks = db.prepare('SELECT * FROM issues').all() as Array<{
          id: string;
          title: string;
          description: string | null;
        }>;
        
        expect(tasks.length).toBe(8);
        
        // Verify search keywords are present
        const titlesAndDescriptions = tasks
          .map(t => `${t.title} ${t.description || ''}`)
          .join(' ')
          .toLowerCase();
        
        expect(titlesAndDescriptions).toContain('authentication');
        expect(titlesAndDescriptions).toContain('database');
        expect(titlesAndDescriptions).toContain('test');
        expect(titlesAndDescriptions).toContain('api');
      } finally {
        cleanup();
      }
    });

    it('populates database with hierarchy scenario', () => {
      const { db, cleanup } = createTestDatabase();
      
      try {
        seedDatabase(db, 'hierarchy');
        
        const tasks = db.prepare('SELECT * FROM issues').all() as Array<{
          id: string;
        }>;
        
        expect(tasks.length).toBe(12);
        
        // Verify parent-child relationships exist (IDs with dots indicate children)
        const taskIds = tasks.map(t => t.id);
        expect(taskIds).toContain('bd-3001');
        expect(taskIds).toContain('bd-3001.1');
        expect(taskIds).toContain('bd-3001.2');
        expect(taskIds).toContain('bd-3001.2.1'); // Grandchild
      } finally {
        cleanup();
      }
    });

    it('throws error for invalid scenario', () => {
      const { db, cleanup } = createTestDatabase();
      
      try {
        expect(() => {
          seedDatabase(db, 'invalid' as keyof typeof seedScenarios);
        }).toThrow();
      } finally {
        cleanup();
      }
    });
  });

  describe('seedScenarios', () => {
    it('basic scenario returns tasks with mixed statuses and priorities', () => {
      const tasks = seedScenarios.basic();
      
      expect(tasks.length).toBeGreaterThan(0);
      
      const statuses = new Set(tasks.map(t => t.status));
      expect(statuses.has('open')).toBe(true);
      expect(statuses.has('in_progress')).toBe(true);
      expect(statuses.has('closed')).toBe(true);
      expect(statuses.has('blocked')).toBe(true);
      
      const hasPriority = tasks.some(t => t.priority !== null);
      const hasNullPriority = tasks.some(t => t.priority === null);
      expect(hasPriority).toBe(true);
      expect(hasNullPriority).toBe(true);
    });

    it('search scenario returns tasks with keywords', () => {
      const tasks = seedScenarios.search();
      
      expect(tasks.length).toBeGreaterThan(0);
      
      const allText = tasks
        .map(t => `${t.title} ${t.description || ''}`)
        .join(' ')
        .toLowerCase();
      
      expect(allText).toContain('authentication');
      expect(allText).toContain('database');
      expect(allText).toContain('test');
      expect(allText).toContain('api');
    });

    it('hierarchy scenario returns tasks with parent-child relationships', () => {
      const tasks = seedScenarios.hierarchy();
      
      expect(tasks.length).toBeGreaterThan(0);
      
      // Check for hierarchical IDs
      const hasParent = tasks.some(t => !t.id.includes('.'));
      const hasChild = tasks.some(t => t.id.includes('.'));
      const hasGrandchild = tasks.some(t => t.id.split('.').length > 2);
      
      expect(hasParent).toBe(true);
      expect(hasChild).toBe(true);
      expect(hasGrandchild).toBe(true);
    });
  });
});
