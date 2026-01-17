#!/usr/bin/env bun

/**
 * Ralph Label-Driven Task Router
 * 
 * Loads config and agent profiles, reads ready tasks, and resolves
 * the correct agent profile based on task labels.
 */

import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPT_DIR = __dirname;

// Types
interface AgentProfile {
  name: string;
  label: string;
  ai_tool: {
    name: string;
    command: string;
    env?: Record<string, string>;
  };
  model_tier: string;
  instructions_path: string;
}

interface Config {
  beads: {
    database_path: string;
    project: string;
  };
  ai_tool: {
    name: string;
    command: string;
    env: Record<string, string>;
  };
  quality_gates: {
    template: string;
    overrides: Record<string, unknown>;
  };
  beads_payload: string;
  git: {
    base_branch: string;
    working_branch: string;
  };
  execution: {
    require_confirmation: boolean;
    max_iterations: number;
    log_dir?: string;
  };
  agents: Record<string, string>; // label -> profile filename
}

interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  issue_type: string;
  owner?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  parent_id?: string;
}

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
  const configPath = join(SCRIPT_DIR, "config.json");
  
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`);
  }
  
  const configContent = readFileSync(configPath, "utf-8");
  const config = JSON.parse(configContent) as Config;
  
  // Validate required fields
  if (!config.agents) {
    throw new Error("Config missing required 'agents' mapping");
  }
  
  if (!config.agents.general) {
    throw new Error("Config missing required 'general' agent in agents mapping");
  }
  
  return config;
}

/**
 * Load agent profile from JSON file
 */
function loadAgentProfile(profileFilename: string): AgentProfile {
  const profilePath = join(SCRIPT_DIR, "..", "agents", profileFilename);
  
  if (!existsSync(profilePath)) {
    throw new Error(`Agent profile not found at ${profilePath}`);
  }
  
  const profileContent = readFileSync(profilePath, "utf-8");
  const profile = JSON.parse(profileContent) as AgentProfile;
  
  // Validate required fields
  if (!profile.name || !profile.label || !profile.ai_tool || !profile.instructions_path) {
    throw new Error(`Invalid agent profile: missing required fields in ${profileFilename}`);
  }
  
  return profile;
}

/**
 * Get labels for a task using Beads CLI
 */
function getTaskLabels(taskId: string): string[] {
  try {
    const result = Bun.spawnSync(["bd", "label", "list", taskId], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      // Task has no labels or error occurred
      const stderr = result.stderr.toString();
      if (stderr.includes("has no labels")) {
        return [];
      }
      // Log error but don't throw - treat as no labels
      console.warn(`Warning: Failed to get labels for task ${taskId}: ${stderr}`);
      return [];
    }
    
    const output = result.stdout.toString().trim();
    if (!output) {
      return [];
    }
    
    // Parse labels from output
    // Format: "🏷 Labels for <task-id>:\n  - label1\n  - label2"
    const lines = output.split("\n");
    const labels: string[] = [];
    
    for (const line of lines) {
      // Skip header line and empty lines
      if (line.includes("🏷") || line.trim().length === 0) {
        continue;
      }
      
      // Extract label from lines like "  - label" or "- label"
      const match = line.match(/^\s*-\s*(.+)$/);
      if (match && match[1]) {
        labels.push(match[1].trim());
      }
    }
    
    return labels;
  } catch (error) {
    console.warn(`Warning: Error getting labels for task ${taskId}: ${error}`);
    return [];
  }
}

/**
 * Read ready tasks from Beads
 */
function getReadyTasks(): BeadsTask[] {
  try {
    const result = Bun.spawnSync(["bd", "ready", "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString();
      throw new Error(`Failed to get ready tasks: ${stderr}`);
    }
    
    const output = result.stdout.toString().trim();
    if (!output) {
      return [];
    }
    
    const tasks = JSON.parse(output) as BeadsTask[];
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Empty output or invalid JSON
      return [];
    }
    throw error;
  }
}

/**
 * Resolve agent profile for a task based on its labels
 * 
 * Strategy:
 * 1. Get task labels
 * 2. Use first label that matches an agent in config.agents
 * 3. Default to "general" if no labels or no match
 */
function resolveAgentForTask(
  task: BeadsTask,
  config: Config
): { profile: AgentProfile; matchedLabel: string | null } {
  const labels = getTaskLabels(task.id);
  
  // If no labels, default to general
  if (labels.length === 0) {
    const generalProfileFilename = config.agents.general;
    const profile = loadAgentProfile(generalProfileFilename);
    return { profile, matchedLabel: null };
  }
  
  // Try to match first label to an agent
  for (const label of labels) {
    const profileFilename = config.agents[label];
    if (profileFilename) {
      const profile = loadAgentProfile(profileFilename);
      return { profile, matchedLabel: label };
    }
  }
  
  // No matching label found, default to general
  const generalProfileFilename = config.agents.general;
  const profile = loadAgentProfile(generalProfileFilename);
  return { profile, matchedLabel: null };
}

/**
 * Main router function
 * 
 * Loads config and profiles, reads ready tasks, and resolves
 * agent profiles for each task.
 */
export function router(): {
  config: Config;
  readyTasks: BeadsTask[];
  taskAgents: Array<{
    task: BeadsTask;
    agent: AgentProfile;
    matchedLabel: string | null;
  }>;
} {
  // Load configuration
  const config = loadConfig();
  
  // Read ready tasks
  const readyTasks = getReadyTasks();
  
  // Resolve agent for each task
  const taskAgents = readyTasks.map((task) => {
    const { profile, matchedLabel } = resolveAgentForTask(task, config);
    return {
      task,
      agent: profile,
      matchedLabel,
    };
  });
  
  return {
    config,
    readyTasks,
    taskAgents,
  };
}

// CLI entrypoint
if (import.meta.main) {
  try {
    const result = router();
    
    // Output results as JSON for programmatic use
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
