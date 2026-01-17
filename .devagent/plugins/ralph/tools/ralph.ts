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
 * Get task comments from Beads
 */
function getTaskComments(taskId: string): Array<{ body: string; created_at: string }> {
  try {
    const result = Bun.spawnSync(["bd", "comments", taskId, "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      return [];
    }
    
    const output = result.stdout.toString().trim();
    if (!output) {
      return [];
    }
    
    const comments = JSON.parse(output) as Array<{ body: string; created_at: string }>;
    return Array.isArray(comments) ? comments : [];
  } catch (error) {
    console.warn(`Warning: Failed to get comments for task ${taskId}: ${error}`);
    return [];
  }
}

/**
 * Get failure count for a task by parsing comments
 * Looks for comments containing "Task implementation failed" or similar failure markers
 */
function getTaskFailureCount(taskId: string): number {
  const comments = getTaskComments(taskId);
  let failureCount = 0;
  
  for (const comment of comments) {
    // Count comments that indicate failure
    if (
      comment.body.includes("Task implementation failed") ||
      comment.body.includes("AI tool returned error") ||
      comment.body.includes("exit code:")
    ) {
      failureCount++;
    }
  }
  
  return failureCount;
}

/**
 * Get full task details from Beads
 */
function getTaskDetails(taskId: string): BeadsTask & {
  description?: string;
  acceptance_criteria?: string | string[];
  parent_id?: string;
} {
  try {
    const result = Bun.spawnSync(["bd", "show", taskId, "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      throw new Error(`Failed to get task details: ${result.stderr.toString()}`);
    }
    
    const output = result.stdout.toString().trim();
    const taskData = JSON.parse(output);
    
    // Handle array response (Beads sometimes returns arrays)
    const task = Array.isArray(taskData) ? taskData[0] : taskData;
    return task as BeadsTask & {
      description?: string;
      acceptance_criteria?: string | string[];
      parent_id?: string;
    };
  } catch (error) {
    throw new Error(`Failed to get task details for ${taskId}: ${error}`);
  }
}

/**
 * Build prompt for agent execution
 */
function buildPrompt(
  task: BeadsTask & { description?: string; acceptance_criteria?: string | string[]; parent_id?: string },
  epicId: string | null,
  agentInstructions: string
): string {
  const description = task.description || "";
  const acceptance = Array.isArray(task.acceptance_criteria)
    ? task.acceptance_criteria.join("; ")
    : task.acceptance_criteria || "";
  
  const qualityInfo = `
QUALITY GATES & VERIFICATION:
1. **Self-Diagnosis**: You MUST read 'package.json' scripts to determine the correct commands for testing, linting, and typechecking. Do NOT assume defaults like 'npm test' work unless verified.
2. **7-Point Checklist**: For every task, you must generate and verify a checklist covering:
   [ ] 1. Read task & context
   [ ] 2. Self-diagnose verification commands
   [ ] 3. Implementation
   [ ] 4. Run standard checks (test/lint/typecheck)
   [ ] 5. UI Verification (if applicable: agent-browser + screenshots)
   [ ] 6. Add/Update tests (if logic changed)
   [ ] 7. Commit & Push
`;

  return `Task: ${description}
Task ID: ${task.id}
Parent Epic ID: ${epicId || "null"}

Acceptance Criteria:
${acceptance}

${qualityInfo}
CONTEXT:
You are working on task ${task.id} which is part of Epic ${epicId || "null"}.
You can view the epic details and other tasks using: bd show ${epicId || task.id}

### AGENT OPERATING INSTRUCTIONS
${agentInstructions}

### EXECUTION INSTRUCTIONS
Please implement this task following the instructions above and the project's coding standards.

FAILURE MANAGEMENT & STATUS UPDATES:
1. You are responsible for verifying your work. Run tests/lints if possible.
2. If you complete the task successfully, YOU MUST run: bd update ${task.id} --status closed
3. If you cannot fix the task, mark it blocked: bd update ${task.id} --status blocked
4. If you need to retry, leave it in_progress.

After completing the implementation, you must add comments to this task (bd-${task.id}):
1. Document revision learnings (see ".devagent/plugins/ralph/AGENTS.md" for format)
2. Document any screenshots captured (if applicable)
3. Add commit information after quality gates pass

See ".devagent/plugins/ralph/AGENTS.md" → Task Commenting for Traceability for detailed requirements.`;
}

/**
 * Load agent instructions from AGENTS.md
 */
function loadAgentInstructions(): string {
  const agentsPath = join(SCRIPT_DIR, "..", "AGENTS.md");
  
  if (!existsSync(agentsPath)) {
    console.warn(`Warning: AGENTS.md not found at ${agentsPath}`);
    return "";
  }
  
  try {
    return readFileSync(agentsPath, "utf-8");
  } catch (error) {
    console.warn(`Warning: Failed to read AGENTS.md: ${error}`);
    return "";
  }
}

/**
 * Execute agent for a task using Bun.spawn
 */
async function executeAgent(
  task: BeadsTask,
  agent: AgentProfile,
  prompt: string,
  config: Config
): Promise<{ success: boolean; exitCode: number; error?: string }> {
  const command = agent.ai_tool.command;
  const args: string[] = [];
  
  // Build command arguments based on AI tool type
  if (agent.ai_tool.name === "agent" || agent.ai_tool.name === "cursor") {
    args.push("-p", "--force", "--output-format", "text", prompt);
  } else if (agent.ai_tool.name === "opencode") {
    args.push("run", prompt);
  } else {
    // Generic fallback - assume command takes prompt as last arg
    args.push(prompt);
  }
  
  // Setup environment
  const env = {
    ...process.env,
    ...agent.ai_tool.env,
    ...config.ai_tool.env,
  };
  
  // For OpenCode, set OPENCODE_CLI=1
  if (agent.ai_tool.name === "opencode") {
    env.OPENCODE_CLI = "1";
  }
  
  // Agent timeout: 2 hours (7200 seconds)
  const AGENT_TIMEOUT = 7200 * 1000; // milliseconds
  
  try {
    const proc = Bun.spawn([command, ...args], {
      env,
      stdout: "pipe",
      stderr: "pipe",
    });
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      proc.kill(9);
    }, AGENT_TIMEOUT);
    
    // Wait for process to complete
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);
    
    // Read output (for logging/debugging)
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    
    if (exitCode === 0) {
      return { success: true, exitCode: 0 };
    } else {
      return {
        success: false,
        exitCode,
        error: stderr || stdout || `Agent exited with code ${exitCode}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      exitCode: -1,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Filter ready tasks by Epic ID
 */
function filterTasksByEpic(tasks: BeadsTask[], epicId: string): BeadsTask[] {
  return tasks.filter((task) => {
    // Check if task ID starts with epic ID (hierarchical IDs like epic.1.1)
    if (task.id.startsWith(epicId + ".")) {
      return true;
    }
    
    // Check parent_id if available (need to get full task details)
    // For now, we'll check this in the execution loop
    return false;
  });
}

/**
 * Check if epic is blocked or closed
 */
function isEpicBlocked(epicId: string): boolean {
  try {
    const result = Bun.spawnSync(["bd", "show", epicId, "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      return false; // Can't determine, assume not blocked
    }
    
    const output = result.stdout.toString().trim();
    const epicData = JSON.parse(output);
    const epic = Array.isArray(epicData) ? epicData[0] : epicData;
    const status = epic?.status;
    
    return status === "blocked" || status === "closed";
  } catch (error) {
    console.warn(`Warning: Failed to check epic status for ${epicId}: ${error}`);
    return false;
  }
}

/**
 * Main execution loop
 * 
 * Executes agents sequentially, re-checking ready tasks after each run.
 * Handles failures by resetting to open and blocking after 5 failures.
 */
export async function executeLoop(epicId: string): Promise<void> {
  const config = loadConfig();
  const agentInstructions = loadAgentInstructions();
  const MAX_FAILURES = 5;
  
  console.log("Starting Ralph execution loop...");
  console.log(`Epic ID: ${epicId}`);
  console.log(`Max failures before blocking: ${MAX_FAILURES}`);
  
  let iteration = 0;
  const maxIterations = config.execution.max_iterations || 50;
  
  while (iteration < maxIterations) {
    iteration++;
    console.log(`\n=== Iteration ${iteration} ===`);
    
    // Check if epic is blocked/closed
    if (isEpicBlocked(epicId)) {
      console.log(`Epic ${epicId} is blocked or closed. Stopping execution.`);
      break;
    }
    
    // Get ready tasks
    const allReadyTasks = getReadyTasks();
    
    // Filter by epic ID
    const epicTasks = filterTasksByEpic(allReadyTasks, epicId);
    
    // Also check tasks with parent_id matching epic
    const tasksWithParent = allReadyTasks.filter((task) => {
      try {
        const details = getTaskDetails(task.id);
        return details.parent_id === epicId;
      } catch {
        return false;
      }
    });
    
    // Combine and deduplicate
    const readyTasks = Array.from(
      new Map([...epicTasks, ...tasksWithParent].map((t) => [t.id, t])).values()
    );
    
    if (readyTasks.length === 0) {
      console.log("No more ready tasks. Execution complete.");
      break;
    }
    
    // Process first ready task
    const task = readyTasks[0];
    console.log(`Processing task: ${task.id}`);
    
    // Get full task details
    let taskDetails;
    try {
      taskDetails = getTaskDetails(task.id);
    } catch (error) {
      console.error(`Failed to get task details for ${task.id}: ${error}`);
      continue;
    }
    
    // Check failure count
    const failureCount = getTaskFailureCount(task.id);
    
    if (failureCount >= MAX_FAILURES) {
      console.log(
        `Task ${task.id} has failed ${failureCount} times. Blocking task.`
      );
      Bun.spawnSync(["bd", "update", task.id, "--status", "blocked"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      Bun.spawnSync(
        [
          "bd",
          "comments",
          "add",
          task.id,
          `Task blocked after ${failureCount} failures. Manual intervention required.`,
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      continue;
    }
    
    // Mark task as in progress
    Bun.spawnSync(["bd", "update", task.id, "--status", "in_progress"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    // Resolve agent for task
    const { profile: agent, matchedLabel } = resolveAgentForTask(task, config);
    console.log(
      `Resolved agent: ${agent.name}${matchedLabel ? ` (label: ${matchedLabel})` : " (general fallback)"}`
    );
    
    // Build prompt
    const prompt = buildPrompt(
      taskDetails,
      taskDetails.parent_id || epicId,
      agentInstructions
    );
    
    // Execute agent
    console.log(`Executing agent: ${agent.ai_tool.name}...`);
    const result = await executeAgent(task, agent, prompt, config);
    
    if (result.success) {
      console.log(`Task ${task.id} completed successfully`);
      // Agent is responsible for updating status to closed
    } else {
      console.error(`Task ${task.id} failed (exit code: ${result.exitCode})`);
      if (result.error) {
        console.error(`Error: ${result.error}`);
      }
      
      // Reset to open and add error comment
      Bun.spawnSync(["bd", "update", task.id, "--status", "open"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      
      const errorMessage = `Task implementation failed - AI tool returned error (exit code: ${result.exitCode})${result.error ? `: ${result.error}` : ""}`;
      Bun.spawnSync(
        ["bd", "comments", "add", task.id, errorMessage],
        {
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      
      const newFailureCount = failureCount + 1;
      console.log(
        `Task ${task.id} failure count: ${newFailureCount}/${MAX_FAILURES}`
      );
      
      if (newFailureCount >= MAX_FAILURES) {
        console.log(`Blocking task ${task.id} after ${MAX_FAILURES} failures`);
        Bun.spawnSync(["bd", "update", task.id, "--status", "blocked"], {
          stdout: "pipe",
          stderr: "pipe",
        });
        Bun.spawnSync(
          [
            "bd",
            "comments",
            "add",
            task.id,
            `Task blocked after ${MAX_FAILURES} failures. Manual intervention required.`,
          ],
          {
            stdout: "pipe",
            stderr: "pipe",
          }
        );
      }
    }
    
    // Re-check ready tasks after each run (loop will restart)
  }
  
  if (iteration >= maxIterations) {
    console.log(`Max iterations (${maxIterations}) reached. Stopping.`);
  }
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
  const args = process.argv.slice(2);
  
  // Check for --epic flag
  const epicIndex = args.indexOf("--epic");
  if (epicIndex !== -1 && epicIndex + 1 < args.length) {
    const epicId = args[epicIndex + 1];
    // Execute loop
    executeLoop(epicId)
      .then(() => {
        console.log("\nExecution loop completed.");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Error in execution loop:", error);
        process.exit(1);
      });
  } else {
    // Default: router mode (for testing/dry-run)
    try {
      const result = router();
      
      // Output results as JSON for programmatic use
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}
