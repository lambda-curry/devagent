#!/usr/bin/env bun
/**
 * Ralph Loop Setup Script
 *
 * Parses loop.json, resolves templates, validates against schema,
 * and creates Beads tasks with proper dependencies.
 *
 * Usage:
 *   bun setup-loop.ts <path-to-loop.json>
 *
 * Example:
 *   bun setup-loop.ts .devagent/plugins/ralph/runs/sample-loop.json
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, isAbsolute, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPT_DIR = __dirname;
const PLUGIN_DIR = resolve(__dirname, '..');
const REPO_ROOT = resolve(PLUGIN_DIR, '..', '..', '..');

// Types
interface Task {
  id: string;
  title: string;
  objective: string;
  role: 'engineering' | 'qa' | 'design' | 'project-manager';
  acceptance_criteria?: string[];
  dependencies?: string[];
  labels?: string[];
  metadata?: Record<string, unknown>;
}

interface Epic {
  id: string;
  title?: string;
  description?: string;
}

interface LoopConfig {
  extends?: string;
  loop?: {
    setupTasks?: Task[];
    teardownTasks?: Task[];
  };
  tasks: Task[];
  availableAgents?: string[];
  epic?: Epic;
}

interface Config {
  roles: Record<string, string>;
}

/**
 * Load and resolve config
 */
function loadAndResolveConfig(filePath: string): LoopConfig {
  const resolvedPath = resolve(process.cwd(), filePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  const config: LoopConfig = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
  return config;
}

/**
 * Validate config against schema
 */
function validateConfig(config: LoopConfig): void {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);

  const schemaPath = join(PLUGIN_DIR, 'core', 'schemas', 'loop.schema.json');
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema not found: ${schemaPath}`);
  }

  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const validate = ajv.compile(schema);

  const valid = validate(config);

  if (!valid) {
    console.error('❌ Validation failed!');
    console.error('Errors:');
    if (validate.errors) {
      validate.errors.forEach(error => {
        console.error(`  - ${error.instancePath || '/'}: ${error.message}`);
        if (error.params) {
          console.error(`    Params: ${JSON.stringify(error.params)}`);
        }
      });
    }
    throw new Error('Configuration validation failed');
  }

  console.log('✅ Configuration validated against schema');
}

/**
 * Create a temporary file with content and return path
 */
function createTempFile(content: string): string {
  const tempPath = join('/tmp', `beads-desc-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`);
  writeFileSync(tempPath, content, 'utf-8');
  return tempPath;
}

/**
 * Create a Beads task
 */
function createBeadsTask(task: Task, tempFiles: string[]): string {
  // Build description from objective
  const description = task.objective;

  // Create temp file for description (multiline-safe)
  const descFile = createTempFile(description);
  tempFiles.push(descFile);

  // Map role to label (use role value as label)
  const roleLabel = task.role;

  // Build bd create command
  let cmd = `bd create --type task --title "${task.title.replace(/"/g, '\\"')}" --id ${task.id} --body-file ${descFile} --force`;

  // Add role label
  cmd += ` --labels ${roleLabel}`;

  // Add additional labels if present
  if (task.labels && task.labels.length > 0) {
    cmd += ` --labels ${task.labels.join(',')}`;
  }

  // Add acceptance criteria if present
  if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
    const acceptance = task.acceptance_criteria.join('; ').replace(/"/g, '\\"');
    cmd += ` --acceptance "${acceptance}"`;
  }

  // Add priority if in metadata
  if (task.metadata?.priority) {
    const priority = String(task.metadata.priority);
    if (priority.match(/^P[0-4]$/)) {
      cmd += ` --priority ${priority}`;
    }
  }

  cmd += ' --json';

  try {
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    const created = JSON.parse(result);
    console.log(`✅ Created task: ${created.id} - ${created.title}`);
    return created.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already exists') || errorMessage.includes('UNIQUE constraint')) {
      console.log(`⚠️  Task ${task.id} already exists, skipping creation`);
      return task.id;
    }
    throw new Error(`Failed to create task ${task.id}: ${errorMessage}`);
  }
}

/**
 * Create a Beads Epic
 */
function createBeadsEpic(epic: Epic, tempFiles: string[]): string {
  console.log(`🔨 Creating Epic: ${epic.id}...`);

  // Create temp file for description if present
  let descFile: string | null = null;
  if (epic.description) {
    descFile = createTempFile(epic.description);
    tempFiles.push(descFile);
  }

  // Build bd create command
  let cmd = `bd create --type epic --id ${epic.id} --title "${(epic.title || epic.id).replace(/"/g, '\\"')}" --force`;

  if (descFile) {
    cmd += ` --body-file ${descFile}`;
  }

  cmd += ' --json';

  try {
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    const created = JSON.parse(result);
    console.log(`✅ Created Epic: ${created.id} - ${created.title}`);
    return created.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already exists') || errorMessage.includes('UNIQUE constraint')) {
      console.log(`⚠️  Epic ${epic.id} already exists, skipping creation`);
      return epic.id;
    }
    throw new Error(`Failed to create Epic ${epic.id}: ${errorMessage}`);
  }
}

/**
 * Add dependency between tasks
 */
function addDependency(taskId: string, dependsOnId: string): void {
  try {
    execSync(`bd dep add ${taskId} ${dependsOnId}`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ Added dependency: ${taskId} depends on ${dependsOnId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Dependency might already exist, which is fine
    if (errorMessage.includes('already exists') || errorMessage.includes('UNIQUE constraint')) {
      console.log(`⚠️  Dependency ${taskId} -> ${dependsOnId} already exists`);
    } else {
      console.warn(`⚠️  Failed to add dependency ${taskId} -> ${dependsOnId}: ${errorMessage}`);
    }
  }
}

/**
 * Extract Epic ID from task ID (e.g., "devagent-a217.1" -> "devagent-a217")
 */
function extractEpicIdFromTaskId(taskId: string): string | null {
  // Task IDs are hierarchical: <epic-id>.<task-number>[.<subtask-number>...]
  // Extract the epic ID (everything before the first dot)
  const match = taskId.match(/^([^.]+)/);
  return match ? match[1] : null;
}

/**
 * Validate Epic exists in Beads
 */
function validateEpicExists(epicId: string): boolean {
  try {
    execSync(`bd show ${epicId} --json`, { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Set parent relationship for a task
 */
function setParent(taskId: string, parentId: string): void {
  try {
    execSync(`bd update ${taskId} --parent ${parentId}`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ Set parent: ${taskId} -> ${parentId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Parent might already be set, which is fine
    if (errorMessage.includes('already') || errorMessage.includes('UNIQUE constraint')) {
      console.log(`⚠️  Parent ${taskId} -> ${parentId} already set`);
    } else {
      console.warn(`⚠️  Failed to set parent ${taskId} -> ${parentId}: ${errorMessage}`);
    }
  }
}

/**
 * Determine Epic ID from config or task IDs
 */
function determineEpicId(config: LoopConfig, allTasks: Task[]): string {
  // Option 1: Epic ID explicitly defined in config
  if (config.epic?.id) {
    return config.epic.id;
  }

  // Option 2: Extract from task IDs (backward compatibility)
  // Look for hierarchical IDs (format: <epic-id>.<number>)
  // Prefer main tasks over setup/teardown tasks
  const tasksToCheck = [...config.tasks, ...allTasks];

  for (const task of tasksToCheck) {
    // Check if task ID has hierarchical format (contains a dot)
    if (task.id.includes('.')) {
      const epicId = extractEpicIdFromTaskId(task.id);
      if (epicId && epicId !== task.id) {
        // Found a valid epic ID (different from task ID itself)
        return epicId;
      }
    }
  }

  // If no hierarchical IDs found, we can't determine Epic ID
  // This is OK - parent relationships will be skipped
  throw new Error(
    'Cannot determine Epic ID: no epic.id in config and no hierarchical task IDs found (format: <epic-id>.<number>)'
  );
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filePath = args.find(arg => !arg.startsWith('--'));

  if (!filePath) {
    console.error('Usage: bun setup-loop.ts [--dry-run] <path-to-loop.json>');
    process.exit(1);
  }

  if (dryRun) {
    console.log('🔍 DRY RUN MODE: No tasks will be created\n');
  }

  try {
    // Load and resolve config
    console.log(`📖 Loading configuration from: ${filePath}`);
    const config = loadAndResolveConfig(filePath);

    // Validate config
    validateConfig(config);

    // Load role mappings
    // (Removed config.json requirement for task creation)

    // Collect all tasks in order: setupTasks, tasks, teardownTasks
    const allTasks: Task[] = [];

    if (config.loop?.setupTasks) {
      allTasks.push(...config.loop.setupTasks);
    }

    allTasks.push(...config.tasks);

    if (config.loop?.teardownTasks) {
      allTasks.push(...config.loop.teardownTasks);
    }

    if (allTasks.length === 0) {
      throw new Error('No tasks to create');
    }

    // Track temp files for cleanup
    const tempFiles: string[] = [];

    // Determine Epic ID (may throw if not found)
    let epicId: string | null = null;
    let epicIdSource = 'unknown';

    try {
      epicId = determineEpicId(config, allTasks);
      epicIdSource = config.epic?.id ? 'config' : 'task-ids';
      console.log(`\n📦 Epic ID: ${epicId} (from ${epicIdSource})`);

      // Validate Epic exists
      if (dryRun) {
        console.log(`  [DRY RUN] Would validate Epic ${epicId} exists`);
      } else {
        if (validateEpicExists(epicId)) {
          console.log(`✅ Epic ${epicId} exists in Beads`);
        } else if (config.epic) {
          // Epic doesn't exist but we have config for it - create it
          createBeadsEpic(config.epic, tempFiles);
        } else {
          console.warn(`⚠️  Epic ${epicId} not found in Beads. Parent relationships may fail.`);
          console.warn(`   Note: Epic should be defined in loop.json or created manually.`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  ${errorMessage}`);
      console.warn(`   Parent relationships will be skipped.`);
      console.warn(`   To enable parent relationships, either:`);
      console.warn(`   1. Add "epic": {"id": "<epic-id>"} to loop.json, or`);
      console.warn(`   2. Use hierarchical task IDs (format: <epic-id>.<number>)`);
    }

    console.log(`\n📋 Found ${allTasks.length} tasks to create`);
    console.log(`   - Setup tasks: ${config.loop?.setupTasks?.length || 0}`);
    console.log(`   - Main tasks: ${config.tasks.length}`);
    console.log(`   - Teardown tasks: ${config.loop?.teardownTasks?.length || 0}`);

    // Pass 1: Create all tasks
    console.log('\n🔨 Pass 1: Creating tasks...');
    const taskIdMap = new Map<string, string>(); // Map original ID to created ID

    for (const task of allTasks) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would create: ${task.id} - ${task.title} (role: ${task.role})`);
        taskIdMap.set(task.id, task.id); // Use original ID for dry run
      } else {
        const createdId = createBeadsTask(task, tempFiles);
        taskIdMap.set(task.id, createdId);
      }
    }

    // Pass 2: Add dependencies
    console.log('\n🔗 Pass 2: Adding dependencies...');
    for (const task of allTasks) {
      if (task.dependencies && task.dependencies.length > 0) {
        const taskId = taskIdMap.get(task.id);
        if (!taskId) {
          console.warn(`⚠️  Task ID ${task.id} not found in created tasks`);
          continue;
        }

        for (const depId of task.dependencies) {
          const depTaskId = taskIdMap.get(depId);
          if (!depTaskId) {
            console.warn(`⚠️  Dependency ID ${depId} not found in created tasks`);
            continue;
          }

          if (dryRun) {
            console.log(`  [DRY RUN] Would add dependency: ${taskId} depends on ${depTaskId}`);
          } else {
            addDependency(taskId, depTaskId);
          }
        }
      }
    }

    // Pass 3: Set parent relationships (for epic-scoped queries)
    if (epicId) {
      console.log('\n👨‍👩‍👧 Pass 3: Setting parent relationships...');
      for (const task of allTasks) {
        const taskId = taskIdMap.get(task.id);
        if (!taskId) {
          continue;
        }

        // Only set parent for direct epic children (tasks with format <epic-id>.<number>)
        const extractedEpicId = extractEpicIdFromTaskId(task.id);
        if (extractedEpicId === epicId) {
          if (dryRun) {
            console.log(`  [DRY RUN] Would set parent: ${taskId} -> ${epicId}`);
          } else {
            setParent(taskId, epicId);
          }
        }
      }
    } else {
      console.log('\n⏭️  Pass 3: Skipping parent relationships (Epic ID not determined)');
    }

    // Cleanup temp files
    console.log('\n🧹 Cleaning up temporary files...');
    for (const tempFile of tempFiles) {
      try {
        unlinkSync(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    console.log('\n✅ Loop setup completed successfully!');
    if (dryRun) {
      console.log(`   [DRY RUN] Would create ${allTasks.length} tasks`);
    } else {
      console.log(`   Created ${allTasks.length} tasks`);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
