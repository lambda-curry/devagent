#!/usr/bin/env bun
/**
 * Objective Plan Sync Script
 * 
 * Parses objective-plan.md and syncs it to Beads tasks.
 * Creates/updates epic tasks and sets dependencies based on the plan document.
 * 
 * Usage:
 *   bun sync-objective.ts <plan-path> <objective-epic-id>
 * 
 * Example:
 *   bun sync-objective.ts .devagent/workspace/tasks/active/2026-01-22_objective-orchestrator-layer/plan/objective-plan.md devagent-034b9i
 */

import { readFileSync, existsSync } from "fs";
import { resolve, isAbsolute } from "path";
import { execSync } from "child_process";

// Types
interface ParsedTask {
  id: string; // e.g., "Task 1", "Task 2"
  title: string;
  objective?: string;
  impactedModules?: string;
  references?: string;
  dependencies?: string;
  acceptanceCriteria?: string;
  testingCriteria?: string;
  validationPlan?: string;
}

interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  parent_id?: string | null;
}

/**
 * Parse markdown plan document to extract tasks
 */
function parsePlanMarkdown(planContent: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  
  // Find the "Implementation Tasks" section
  // Match until next ## section or end of string
  // Use a more permissive pattern that captures everything after the header
  const implementationTasksMatch = planContent.match(/##\s+Implementation\s+Tasks\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!implementationTasksMatch) {
    throw new Error("Could not find 'Implementation Tasks' section in plan document");
  }
  
  let tasksSection = implementationTasksMatch[1];
  // Remove trailing whitespace/newlines
  tasksSection = tasksSection.trim();
  
  // Match task blocks (#### Task N: Title or ### Task N: Title)
  // Split by task headers to get individual task blocks
  const taskHeaderRegex = /(?:####|###)\s+Task\s+\d+:/g;
  const taskHeaders = [...tasksSection.matchAll(taskHeaderRegex)];
  
  for (let i = 0; i < taskHeaders.length; i++) {
    const headerMatch = taskHeaders[i];
    if (!headerMatch || headerMatch.index === undefined) continue;
    
    const startIndex = headerMatch.index;
    const endIndex = i < taskHeaders.length - 1 && taskHeaders[i + 1].index !== undefined
      ? taskHeaders[i + 1].index 
      : tasksSection.length;
    
    const taskContent = tasksSection.slice(startIndex, endIndex);
    
    // Extract task ID and title from header
    const headerLineMatch = taskContent.match(/(?:####|###)\s+Task\s+(\d+):\s*(.+?)(?:\n|$)/);
    if (!headerLineMatch) continue;
    
    const taskId = headerLineMatch[1];
    const taskTitle = headerLineMatch[2].trim();
    
    const task: ParsedTask = {
      id: `Task ${taskId}`,
      title: taskTitle,
    };
    
    // Extract Objective
    const objectiveMatch = taskContent.match(/-?\s*\*\*Objective:\*\*\s*(.+?)(?:\n|$)/i);
    if (objectiveMatch) {
      task.objective = objectiveMatch[1].trim();
    }
    
    // Extract Impacted Modules/Files
    const impactedMatch = taskContent.match(/-?\s*\*\*Impacted\s+Modules\/Files:\*\*\s*([\s\S]*?)(?:\n-?\s*\*\*|$)/i);
    if (impactedMatch) {
      task.impactedModules = impactedMatch[1].trim();
    }
    
    // Extract References
    const referencesMatch = taskContent.match(/-?\s*\*\*References:\*\*\s*(.+?)(?:\n|$)/i);
    if (referencesMatch) {
      task.references = referencesMatch[1].trim();
    }
    
    // Extract Dependencies
    const depsMatch = taskContent.match(/-?\s*\*\*Dependencies?:\*\*\s*(.+?)(?:\n|$)/i);
    if (depsMatch) {
      task.dependencies = depsMatch[1].trim();
    }
    
    // Extract Acceptance Criteria
    const acceptanceMatch = taskContent.match(/-?\s*\*\*Acceptance\s+Criteria:\*\*\s*([\s\S]*?)(?:\n-?\s*\*\*|$)/i);
    if (acceptanceMatch) {
      task.acceptanceCriteria = acceptanceMatch[1].trim();
    }
    
    // Extract Testing Criteria
    const testingMatch = taskContent.match(/-?\s*\*\*Testing\s+Criteria:\*\*\s*(.+?)(?:\n|$)/i);
    if (testingMatch) {
      task.testingCriteria = testingMatch[1].trim();
    }
    
    // Extract Validation Plan
    const validationMatch = taskContent.match(/-?\s*\*\*Validation\s+Plan:\*\*\s*(.+?)(?:\n|$)/i);
    if (validationMatch) {
      task.validationPlan = validationMatch[1].trim();
    }
    
    tasks.push(task);
  }
  
  return tasks;
}

/**
 * Build description from parsed task
 */
function buildTaskDescription(task: ParsedTask): string {
  const parts: string[] = [];
  
  if (task.objective) {
    parts.push(`**Objective:** ${task.objective}`);
  }
  
  if (task.impactedModules) {
    parts.push(`**Impacted Modules/Files:**\n${task.impactedModules}`);
  }
  
  if (task.references) {
    parts.push(`**References:** ${task.references}`);
  }
  
  if (task.acceptanceCriteria) {
    parts.push(`**Acceptance Criteria:**\n${task.acceptanceCriteria}`);
  }
  
  if (task.testingCriteria) {
    parts.push(`**Testing Criteria:** ${task.testingCriteria}`);
  }
  
  if (task.validationPlan) {
    parts.push(`**Validation Plan:** ${task.validationPlan}`);
  }
  
  return parts.join("\n\n");
}

/**
 * Parse dependency string (e.g., "Tasks 1-4" or "Task 1, Task 2")
 */
function parseDependencies(depsStr: string): string[] {
  const deps: string[] = [];
  
  // Handle "Tasks 1-4" format
  const rangeMatch = depsStr.match(/Tasks?\s+(\d+)\s*-\s*(\d+)/i);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    for (let i = start; i <= end; i++) {
      deps.push(`Task ${i}`);
    }
    return deps;
  }
  
  // Handle "Task 1, Task 2" format - extract all task numbers
  const allTaskMatches = depsStr.match(/Task\s+(\d+)/gi);
  if (allTaskMatches && allTaskMatches.length > 0) {
    return allTaskMatches.map(m => m.replace(/\s+/g, ' '));
  }
  
  return deps;
}

/**
 * Execute Beads CLI command and return JSON result
 */
function bdCommand(args: string[]): unknown {
  const cmd = `bd ${args.join(' ')} --json`;
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    const lines = output.trim().split('\n');
    // Find the last line that looks like JSON (Beads may output warnings)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('[') || line.startsWith('{')) {
        return JSON.parse(line);
      }
    }
    throw new Error(`No JSON output found in: ${output}`);
  } catch (error) {
    if (error instanceof Error && 'stdout' in error) {
      const output = (error as { stdout?: string }).stdout || '';
      const lines = output.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('[') || line.startsWith('{')) {
          return JSON.parse(line);
        }
      }
    }
    throw error;
  }
}

/**
 * Get existing Beads tasks for the objective epic
 */
function getExistingTasks(objectiveEpicId: string): Map<string, BeadsTask> {
  const result = bdCommand(['list', '--parent', objectiveEpicId, '--json']) as BeadsTask[];
  const taskMap = new Map<string, BeadsTask>();
  
  for (const task of result) {
    // Try to match by title pattern "Task N: ..."
    const titleMatch = task.title.match(/^Task\s+(\d+):/i);
    if (titleMatch) {
      const taskId = `Task ${titleMatch[1]}`;
      taskMap.set(taskId, task);
    }
  }
  
  return taskMap;
}

/**
 * Create or update a Beads task
 */
function createOrUpdateTask(
  task: ParsedTask,
  objectiveEpicId: string,
  existingTask?: BeadsTask
): string {
  const description = buildTaskDescription(task);
  const title = task.title;
  
  if (existingTask) {
    // Update existing task
    bdCommand([
      'update',
      existingTask.id,
      '--title', `"${title}"`,
      '--description', `"${description}"`,
    ]);
    return existingTask.id;
  } else {
    // Create new task
    const result = bdCommand([
      'create',
      `"${title}"`,
      '--type', 'task',
      '--parent', objectiveEpicId,
      '--description', `"${description}"`,
      '--priority', '2',
    ]) as { id: string } | BeadsTask[];
    
    // Handle both single object and array responses
    const taskId = Array.isArray(result) ? result[0]?.id : result.id;
    if (!taskId) {
      throw new Error(`Failed to create task: ${title}`);
    }
    return taskId;
  }
}

/**
 * Set dependencies between tasks
 */
function setDependencies(
  taskId: string,
  dependencyTaskIds: string[],
  taskIdMap: Map<string, string>
): void {
  for (const depTaskId of dependencyTaskIds) {
    const depBeadsId = taskIdMap.get(depTaskId);
    if (!depBeadsId) {
      console.warn(`Warning: Dependency task "${depTaskId}" not found, skipping dependency`);
      continue;
    }
    
    try {
      bdCommand(['dep', 'add', taskId, depBeadsId]);
    } catch (error) {
      console.warn(`Warning: Failed to add dependency ${depBeadsId} to ${taskId}: ${error}`);
    }
  }
}

/**
 * Main sync function
 */
function syncObjectivePlan(planPath: string, objectiveEpicId: string): void {
  // Read plan file
  if (!existsSync(planPath)) {
    throw new Error(`Plan file not found: ${planPath}`);
  }
  
  const planContent = readFileSync(planPath, 'utf-8');
  
  // Parse plan
  const parsedTasks = parsePlanMarkdown(planContent);
  console.log(`Parsed ${parsedTasks.length} tasks from plan document`);
  
  // Get existing tasks
  const existingTasks = getExistingTasks(objectiveEpicId);
  console.log(`Found ${existingTasks.size} existing tasks in Beads`);
  
  // Create/update tasks and build ID mapping
  const taskIdMap = new Map<string, string>(); // Parsed task ID -> Beads task ID
  const dependencyMap = new Map<string, string[]>(); // Beads task ID -> dependency task IDs
  
  for (const task of parsedTasks) {
    const existingTask = existingTasks.get(task.id);
    const beadsId = createOrUpdateTask(task, objectiveEpicId, existingTask);
    taskIdMap.set(task.id, beadsId);
    
    // Parse dependencies
    if (task.dependencies && task.dependencies.toLowerCase() !== 'none') {
      const deps = parseDependencies(task.dependencies);
      if (deps.length > 0) {
        dependencyMap.set(beadsId, deps);
      }
    }
    
    console.log(`${existingTask ? 'Updated' : 'Created'} task: ${task.title} (${beadsId})`);
  }
  
  // Set dependencies
  for (const [beadsId, depTaskIds] of dependencyMap.entries()) {
    setDependencies(beadsId, depTaskIds, taskIdMap);
    console.log(`Set dependencies for ${beadsId}: ${depTaskIds.join(', ')}`);
  }
  
  console.log(`\nSync complete: ${parsedTasks.length} tasks processed`);
}

// Main execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: bun sync-objective.ts <plan-path> <objective-epic-id>');
    process.exit(1);
  }
  
  const [planPath, objectiveEpicId] = args;
  
  // Resolve plan path (relative to repo root or absolute)
  const resolvedPath = isAbsolute(planPath)
    ? planPath
    : resolve(process.cwd(), planPath);
  
  try {
    syncObjectivePlan(resolvedPath, objectiveEpicId);
  } catch (error) {
    console.error('Error syncing objective plan:', error);
    process.exit(1);
  }
}

export { parsePlanMarkdown, parseDependencies, syncObjectivePlan };
