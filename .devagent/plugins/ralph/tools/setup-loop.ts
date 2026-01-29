#!/usr/bin/env bun
/**
 * Ralph Loop Setup Script
 *
 * Parses loop.json, resolves templates, validates against schema,
 * and creates Beads tasks with proper dependencies.
 *
 * Supports nested hierarchies (Objective -> Epics -> Tasks)
 *
 * Usage:
 *   bun setup-loop.ts <path-to-loop.json>
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
  description?: string;
  descriptionPath?: string;
  role: 'engineering' | 'qa' | 'design' | 'project-manager';
  issue_type?: 'task' | 'epic' | 'feature' | 'bug';
  parent_id?: string;
  acceptance_criteria?: string[];
  dependencies?: string[];
  labels?: string[];
  metadata?: Record<string, unknown>;
}

interface Epic {
  id: string;
  title?: string;
  description?: string;
  parent_id?: string;
}

interface RunConfig {
  git: {
    base_branch: string;
    working_branch: string;
  };
  execution: {
    max_iterations: number;
    log_dir: string;
  };
}

interface LoopConfig {
  extends?: string;
  run: RunConfig;
  loop?: {
    setupTasks?: Task[];
    teardownTasks?: Task[];
  };
  epics?: Epic[]; // Sub-epics in the objective
  tasks: Task[];
  availableAgents?: string[];
  epic?: Epic; // Main Objective Epic
}

interface Config {
  roles: Record<string, string>;
}

/**
 * Get project prefix from Beads CLI
 */
function getProjectPrefix(): string {
  try {
    const output = execSync('bd info --json', { encoding: 'utf-8', stdio: 'pipe' });
    const info = JSON.parse(output);
    return info.config.issue_prefix || 'devagent';
  } catch (error) {
    console.warn('⚠️  Failed to fetch project prefix from bd info, defaulting to "devagent"');
    return 'devagent';
  }
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    } else if (
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  return result;
}

/**
 * Resolve template path
 */
function resolveTemplatePath(templatePath: string, baseDir: string): string {
  if (isAbsolute(templatePath))
    return existsSync(templatePath)
      ? templatePath
      : (() => {
          throw new Error(`Template not found: ${templatePath}`);
        })();
  const normalizedPath = templatePath.startsWith('templates/')
    ? templatePath.substring('templates/'.length)
    : templatePath;
  const paths = [
    join(PLUGIN_DIR, 'templates', normalizedPath),
    join(baseDir, templatePath),
    join(baseDir, normalizedPath)
  ];
  for (const p of paths) if (existsSync(p)) return p;
  throw new Error(`Template not found: ${templatePath}`);
}

/**
 * Load and resolve template
 */
function loadAndResolveConfig(filePath: string): LoopConfig {
  const resolvedPath = resolve(process.cwd(), filePath);
  if (!existsSync(resolvedPath)) throw new Error(`File not found: ${resolvedPath}`);
  const config: LoopConfig = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
  if (config.extends) {
    const templatePath = resolveTemplatePath(config.extends, dirname(resolvedPath));
    const template: LoopConfig = JSON.parse(readFileSync(templatePath, 'utf-8'));
    const merged: LoopConfig = {
      ...template,
      ...config,
      loop: config.loop
        ? {
            ...template.loop,
            ...config.loop,
            setupTasks: config.loop.setupTasks ?? template.loop?.setupTasks,
            teardownTasks: config.loop.teardownTasks ?? template.loop?.teardownTasks
          }
        : template.loop,
      tasks: config.tasks,
      epics: [...(template.epics || []), ...(config.epics || [])],
      availableAgents: config.availableAgents ?? template.availableAgents
    };
    delete merged.extends;
    return merged;
  }
  return config;
}

/**
 * Validate config
 */
function validateConfig(config: LoopConfig): void {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const schemaPath = join(PLUGIN_DIR, 'core', 'schemas', 'loop.schema.json');
  if (!existsSync(schemaPath)) throw new Error(`Schema not found: ${schemaPath}`);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const validate = ajv.compile(schema);
  if (!validate(config)) {
    console.error('❌ Validation failed!');
    if (validate.errors) {
      validate.errors.forEach(error => {
        console.error(`  - ${error.instancePath || '/'}: ${error.message}`);
      });
    }
    throw new Error('Configuration validation failed');
  }
  console.log('✅ Configuration validated against schema');
}

function loadConfig(): Config {
  const configPath = join(SCRIPT_DIR, 'config.json');
  if (!existsSync(configPath)) throw new Error(`Config not found: ${configPath}`);
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

/**
 * Update config.json with run-specific settings from loop.json
 */
function updateConfigFromRun(runConfig: RunConfig): void {
  const configPath = join(SCRIPT_DIR, 'config.json');
  const currentConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

  // Merge git configuration
  currentConfig.git = {
    ...currentConfig.git,
    base_branch: runConfig.git.base_branch,
    working_branch: runConfig.git.working_branch
  };

  // Merge execution configuration
  currentConfig.execution = {
    ...currentConfig.execution,
    max_iterations: runConfig.execution.max_iterations
  };

  writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
  console.log('✅ Updated config.json with run settings');
}

function createTempFile(content: string): string {
  const tempPath = join('/tmp', `beads-desc-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`);
  writeFileSync(tempPath, content, 'utf-8');
  return tempPath;
}

/**
 * Create a Beads issue (task, epic, etc.)
 */
function createBeadsIssue(
  item: Task | Epic,
  isEpic: boolean,
  tempFiles: string[],
  prefix: string,
  rootEpicId?: string | null
): string {
  const type = isEpic ? 'epic' : (item as Task).issue_type || 'task';
  const title = (item as Task).title || (item as Epic).id;

  let body = '';
  if (isEpic) {
    body = (item as Epic).description || '';
  } else {
    const task = item as Task;
    if (task.descriptionPath) {
      const fullPath = isAbsolute(task.descriptionPath)
        ? task.descriptionPath
        : resolve(REPO_ROOT, task.descriptionPath);

      if (existsSync(fullPath)) {
        body = readFileSync(fullPath, 'utf-8');
      } else {
        console.warn(`⚠️  Description file not found: ${fullPath}`);
        body = task.description || '';
      }
    } else {
      body = task.description || '';
    }
  }

  // Ensure ID has the correct prefix
  let id = item.id;
  if (!id.startsWith(`${prefix}-`)) {
    if (rootEpicId && rootEpicId.startsWith(`${prefix}-`)) {
      id = `${rootEpicId}.${id}`;
    } else {
      id = `${prefix}-${id}`;
    }
  }

  const descFile = createTempFile(body);
  tempFiles.push(descFile);

  let cmd = `bd create --type ${type} --title "${title.replace(/"/g, '\\"')}" --id ${id} --body-file ${descFile} --force`;

  if (!isEpic) {
    const task = item as Task;
    // Combine role and additional labels into a single comma-separated string
    const allLabels = [task.role, ...(task.labels || [])].filter(Boolean);
    if (allLabels.length) cmd += ` --labels ${allLabels.join(',')}`;
    if (task.acceptance_criteria?.length)
      cmd += ` --acceptance "${task.acceptance_criteria.join('; ').replace(/"/g, '\\"')}"`;
  }

  cmd += ' --json';

  try {
    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    const created = JSON.parse(result);
    console.log(`✅ Created ${type}: ${created.id} - ${created.title}`);
    return created.id;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('already exists') || msg.includes('UNIQUE constraint')) {
      console.log(`⚠️  ${type} ${id} already exists`);
      return id;
    }
    throw new Error(`Failed to create ${type} ${id}: ${msg}`);
  }
}

function addDependency(taskId: string, dependsOnId: string): void {
  try {
    execSync(`bd dep add ${taskId} ${dependsOnId}`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ Dependency: ${taskId} -> ${dependsOnId}`);
  } catch (error) {
    if (!error.toString().includes('already exists')) console.warn(`⚠️  Failed dependency ${taskId} -> ${dependsOnId}`);
  }
}

function setParent(taskId: string, parentId: string): void {
  try {
    execSync(`bd update ${taskId} --parent ${parentId}`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ Parent: ${taskId} -> ${parentId}`);
  } catch (error) {
    if (!error.toString().includes('already set')) console.warn(`⚠️  Failed parent ${taskId} -> ${parentId}`);
  }
}

function extractEpicIdFromTaskId(taskId: string): string | null {
  const match = taskId.match(/^([^.]+)/);
  return match ? match[1] : null;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filePath = args.find(arg => !arg.startsWith('--'));
  if (!filePath) {
    console.error('Usage: bun setup-loop.ts [--dry-run] <path-to-loop.json>');
    process.exit(1);
  }

  try {
    const config = loadAndResolveConfig(filePath);
    validateConfig(config);
    
    // Update config.json with run-specific settings if not in dry-run mode
    if (!dryRun) {
      updateConfigFromRun(config.run);
    }
    
    const tempFiles: string[] = [];
    const prefix = getProjectPrefix();
    console.log(`🏷️  Project Prefix: ${prefix}`);

    // 1. Create Main Objective Epic
    let rootEpicId: string | null = null;
    if (config.epic) {
      if (!dryRun) createBeadsIssue(config.epic, true, tempFiles, prefix, null);
      rootEpicId = config.epic.id.startsWith(`${prefix}-`) ? config.epic.id : `${prefix}-${config.epic.id}`;
    }

    // 2. Create Sub-Epics
    if (config.epics) {
      for (const subEpic of config.epics) {
        if (!dryRun) {
          const subEpicId = createBeadsIssue(subEpic, true, tempFiles, prefix, rootEpicId);
          if (subEpic.parent_id) setParent(subEpicId, subEpic.parent_id);
          else if (rootEpicId) setParent(subEpicId, rootEpicId);
        }
      }
    }

    // 3. Collect and Create Tasks
    const allTasks = [...(config.loop?.setupTasks || []), ...config.tasks, ...(config.loop?.teardownTasks || [])];
    const taskIdMap = new Map<string, string>();

    for (const task of allTasks) {
      if (dryRun) {
        console.log(`[DRY RUN] Create task: ${task.id}`);
        taskIdMap.set(task.id, task.id);
      } else {
        const createdId = createBeadsIssue(task, false, tempFiles, prefix, rootEpicId);
        taskIdMap.set(task.id, createdId);

        // Link to parent
        const parentId = task.parent_id || extractEpicIdFromTaskId(createdId);
        if (parentId && parentId !== createdId) setParent(createdId, parentId);
      }
    }

    // 4. Link Dependencies
    for (const task of allTasks) {
      if (task.dependencies?.length) {
        const taskId = taskIdMap.get(task.id);
        if (!taskId) continue;

        for (const depId of task.dependencies) {
          const resolvedDepId = taskIdMap.get(depId) || depId;
          if (!dryRun) addDependency(taskId, resolvedDepId);
        }
      }
    }

    // Cleanup
    for (const f of tempFiles)
      try {
        unlinkSync(f);
      } catch {}
    console.log('\n✅ Loop setup completed!');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error: ${msg}`);
    process.exit(1);
  }
}

main();
