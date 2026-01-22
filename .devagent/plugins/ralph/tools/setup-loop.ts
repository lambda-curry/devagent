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

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { resolve, dirname, join, isAbsolute } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPT_DIR = __dirname;
const PLUGIN_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(PLUGIN_DIR, "..", "..", "..");

// Types
interface Task {
  id: string;
  title: string;
  objective: string;
  role: "engineering" | "qa" | "design" | "project-manager";
  acceptance_criteria?: string[];
  dependencies?: string[];
  labels?: string[];
  metadata?: Record<string, unknown>;
}

interface LoopConfig {
  extends?: string;
  loop?: {
    setupTasks?: Task[];
    teardownTasks?: Task[];
  };
  tasks: Task[];
  availableAgents?: string[];
}

interface Config {
  roles: Record<string, string>;
}

/**
 * Deep merge two objects, with source overriding target
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) {
      continue;
    }
    
    if (Array.isArray(source[key])) {
      // Arrays are replaced, not merged
      result[key] = source[key] as T[Extract<keyof T, string>];
    } else if (
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key]) &&
      target[key] !== null
    ) {
      // Recursively merge objects
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      // Primitive values or new keys: source overrides
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}

/**
 * Resolve template path (relative to templates/ or absolute)
 */
function resolveTemplatePath(templatePath: string, baseDir: string): string {
  if (isAbsolute(templatePath)) {
    if (existsSync(templatePath)) {
      return templatePath;
    }
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  // Remove leading "templates/" if present (handles both "templates/file.json" and "file.json")
  const normalizedPath = templatePath.startsWith("templates/")
    ? templatePath.substring("templates/".length)
    : templatePath;
  
  // Try relative to templates directory first
  const templatesPath = join(PLUGIN_DIR, "templates", normalizedPath);
  if (existsSync(templatesPath)) {
    return templatesPath;
  }
  
  // Try relative to base directory
  const relativePath = join(baseDir, templatePath);
  if (existsSync(relativePath)) {
    return relativePath;
  }
  
  // Try with normalized path relative to base
  const relativeNormalizedPath = join(baseDir, normalizedPath);
  if (existsSync(relativeNormalizedPath)) {
    return relativeNormalizedPath;
  }
  
  throw new Error(`Template not found: ${templatePath} (tried: ${templatesPath}, ${relativePath}, ${relativeNormalizedPath})`);
}

/**
 * Load and resolve template if extends is present
 */
function loadAndResolveConfig(filePath: string): LoopConfig {
  const resolvedPath = resolve(process.cwd(), filePath);
  const baseDir = dirname(resolvedPath);
  
  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }
  
  const config: LoopConfig = JSON.parse(readFileSync(resolvedPath, "utf-8"));
  
  // If extends is present, load template and merge
  if (config.extends) {
    const templatePath = resolveTemplatePath(config.extends, baseDir);
    const template: LoopConfig = JSON.parse(readFileSync(templatePath, "utf-8"));
    
    // Merge template into config (template as base, config overrides)
    // Special handling: preserve template's loop if config doesn't have one
    const merged: LoopConfig = {
      // Start with template
      ...template,
      // Override with config (but handle loop specially)
      ...config,
      // Merge loop property: use config.loop if present, otherwise use template.loop
      loop: config.loop
        ? {
            // Start with template loop if it exists
            ...template.loop,
            // Override with config loop
            ...config.loop,
            // Merge arrays: use config arrays if present, otherwise template arrays
            setupTasks: config.loop.setupTasks ?? template.loop?.setupTasks,
            teardownTasks: config.loop.teardownTasks ?? template.loop?.teardownTasks,
          }
        : template.loop,
      // Tasks array: config overrides template (required field)
      tasks: config.tasks,
      // availableAgents: use config if present, otherwise template
      availableAgents: config.availableAgents ?? template.availableAgents,
    };
    
    // Remove extends property from merged result
    delete merged.extends;
    
    return merged;
  }
  
  return config;
}

/**
 * Validate config against schema
 */
function validateConfig(config: LoopConfig): void {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  
  const schemaPath = join(PLUGIN_DIR, "core", "schemas", "loop.schema.json");
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema not found: ${schemaPath}`);
  }
  
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  const validate = ajv.compile(schema);
  
  const valid = validate(config);
  
  if (!valid) {
    console.error("❌ Validation failed!");
    console.error("Errors:");
    if (validate.errors) {
      validate.errors.forEach((error) => {
        console.error(`  - ${error.instancePath || "/"}: ${error.message}`);
        if (error.params) {
          console.error(`    Params: ${JSON.stringify(error.params)}`);
        }
      });
    }
    throw new Error("Configuration validation failed");
  }
  
  console.log("✅ Configuration validated against schema");
}

/**
 * Load config.json to get role mappings
 */
function loadConfig(): Config {
  const configPath = join(SCRIPT_DIR, "config.json");
  if (!existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

/**
 * Create a temporary file with content and return path
 */
function createTempFile(content: string): string {
  const tempPath = join("/tmp", `beads-desc-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`);
  writeFileSync(tempPath, content, "utf-8");
  return tempPath;
}

/**
 * Create a Beads task
 */
function createBeadsTask(task: Task, config: Config, tempFiles: string[]): string {
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
    cmd += ` --labels ${task.labels.join(",")}`;
  }
  
  // Add acceptance criteria if present
  if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
    const acceptance = task.acceptance_criteria.join("; ").replace(/"/g, '\\"');
    cmd += ` --acceptance "${acceptance}"`;
  }
  
  // Add priority if in metadata
  if (task.metadata?.priority) {
    const priority = String(task.metadata.priority);
    if (priority.match(/^P[0-4]$/)) {
      cmd += ` --priority ${priority}`;
    }
  }
  
  cmd += " --json";
  
  try {
    const result = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    const created = JSON.parse(result);
    console.log(`✅ Created task: ${created.id} - ${created.title}`);
    return created.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("already exists") || errorMessage.includes("UNIQUE constraint")) {
      console.log(`⚠️  Task ${task.id} already exists, skipping creation`);
      return task.id;
    }
    throw new Error(`Failed to create task ${task.id}: ${errorMessage}`);
  }
}

/**
 * Add dependency between tasks
 */
function addDependency(taskId: string, dependsOnId: string): void {
  try {
    execSync(`bd dep add ${taskId} ${dependsOnId}`, { encoding: "utf-8", stdio: "pipe" });
    console.log(`✅ Added dependency: ${taskId} depends on ${dependsOnId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Dependency might already exist, which is fine
    if (errorMessage.includes("already exists") || errorMessage.includes("UNIQUE constraint")) {
      console.log(`⚠️  Dependency ${taskId} -> ${dependsOnId} already exists`);
    } else {
      console.warn(`⚠️  Failed to add dependency ${taskId} -> ${dependsOnId}: ${errorMessage}`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filePath = args.find((arg) => !arg.startsWith("--"));
  
  if (!filePath) {
    console.error("Usage: bun setup-loop.ts [--dry-run] <path-to-loop.json>");
    process.exit(1);
  }
  
  if (dryRun) {
    console.log("🔍 DRY RUN MODE: No tasks will be created\n");
  }
  
  try {
    // Load and resolve config
    console.log(`📖 Loading configuration from: ${filePath}`);
    const config = loadAndResolveConfig(filePath);
    
    // Validate config
    validateConfig(config);
    
    // Load role mappings
    const roleConfig = loadConfig();
    
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
      throw new Error("No tasks to create");
    }
    
    console.log(`\n📋 Found ${allTasks.length} tasks to create`);
    console.log(`   - Setup tasks: ${config.loop?.setupTasks?.length || 0}`);
    console.log(`   - Main tasks: ${config.tasks.length}`);
    console.log(`   - Teardown tasks: ${config.loop?.teardownTasks?.length || 0}`);
    
    // Track temp files for cleanup
    const tempFiles: string[] = [];
    
    // Pass 1: Create all tasks
    console.log("\n🔨 Pass 1: Creating tasks...");
    const taskIdMap = new Map<string, string>(); // Map original ID to created ID
    
    for (const task of allTasks) {
      if (dryRun) {
        console.log(`  [DRY RUN] Would create: ${task.id} - ${task.title} (role: ${task.role})`);
        taskIdMap.set(task.id, task.id); // Use original ID for dry run
      } else {
        const createdId = createBeadsTask(task, roleConfig, tempFiles);
        taskIdMap.set(task.id, createdId);
      }
    }
    
    // Pass 2: Add dependencies
    console.log("\n🔗 Pass 2: Adding dependencies...");
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
    
    // Cleanup temp files
    console.log("\n🧹 Cleaning up temporary files...");
    for (const tempFile of tempFiles) {
      try {
        unlinkSync(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    console.log("\n✅ Loop setup completed successfully!");
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
