#!/usr/bin/env bun

/**
 * Ralph Label-Driven Task Router
 * 
 * Loads config and agent profiles, reads ready tasks, and resolves
 * the correct agent profile based on task labels.
 */

import { existsSync, readFileSync } from "fs";
import { join, dirname, isAbsolute } from "path";
import { fileURLToPath } from "url";
import type { BeadsComment, BeadsTask } from "../../../../apps/ralph-monitoring/app/db/beads.types";
import { compareHierarchicalIds } from "../../../../apps/ralph-monitoring/app/db/hierarchical-id";
import { openRalphTaskLogWriter } from "../../../../apps/ralph-monitoring/app/utils/ralph-log-writer.server";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPT_DIR = __dirname;
const REPO_ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");
const EPIC_CONTEXT_TASK_LIMIT = 50;
const EPIC_STATUS_ORDER = ["in_progress", "open", "blocked", "closed"] as const;

function resolveRalphLogDirFromConfig(config: Config): string {
  const configured = config.execution.log_dir?.trim();
  if (!configured) return join(REPO_ROOT, "logs", "ralph");
  return isAbsolute(configured) ? configured : join(REPO_ROOT, configured);
}

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

type BeadsTaskDetails = Omit<BeadsTask, 'acceptance_criteria' | 'parent_id'> & {
  // Beads CLI sometimes returns strings or arrays for acceptance_criteria
  acceptance_criteria?: string | string[] | null;
  parent_id?: string | null;
};

type SanitizedConfig = Omit<Config, "ai_tool"> & {
  ai_tool: Omit<Config["ai_tool"], "env">;
};

type SanitizedAgentProfile = Omit<AgentProfile, "ai_tool"> & {
  ai_tool: Omit<AgentProfile["ai_tool"], "env">;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes || hours) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function formatDateTimeLocal(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function toJsonPreview(input: string, maxChars = 200): string {
  const trimmed = input.trim();
  if (!trimmed) return "<empty>";
  const normalized = trimmed.replace(/\s+/g, " ");
  return normalized.length <= maxChars ? normalized : `${normalized.slice(0, maxChars)}…`;
}

function parseJsonWithContext<T>(input: string, context: string): T {
  try {
    return JSON.parse(input) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const preview = toJsonPreview(input);
    throw new Error(`Failed to parse JSON (${context}): ${message}. Output preview: ${preview}`);
  }
}

function extractExitCodeFromText(input: string): number | null {
  const match = input.match(/exit code:\s*(-?\d+)/i);
  if (!match?.[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
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
  const config = parseJsonWithContext<Config>(configContent, `config file at ${configPath}`);
  
  // Validate required fields
  if (!config.agents) {
    throw new Error("Config missing required 'agents' mapping");
  }
  
  if (!config.agents["project-manager"]) {
    throw new Error("Config missing required 'project-manager' agent in agents mapping");
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
  const profile = parseJsonWithContext<AgentProfile>(profileContent, `agent profile ${profileFilename} at ${profilePath}`);
  
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
 * Note: When running with --epic filter, we may need to query with --parent to get child tasks
 */
function getReadyTasks(epicId?: string): BeadsTask[] {
  try {
    const args = ["bd", "ready", "--json", "--limit", "200"];
    if (epicId) {
      args.push("--parent", epicId);
    }
    const result = Bun.spawnSync(args, {
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
    
    const tasks = parseJsonWithContext<BeadsTask[]>(
      output,
      `bd ready --json${epicId ? ` --parent ${epicId}` : ""}`
    );
    const readyTasks = Array.isArray(tasks) ? tasks : [];

    if (epicId && readyTasks.length === 0) {
      // Fallback: Some Beads setups don't auto-populate parent links for explicit IDs.
      // Try an unscoped ready query and let the caller filter by epic ID.
      const fallbackResult = Bun.spawnSync(["bd", "ready", "--json", "--limit", "200"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      if (fallbackResult.exitCode !== 0) {
        const stderr = fallbackResult.stderr.toString();
        throw new Error(`Failed to get ready tasks (fallback): ${stderr}`);
      }
      const fallbackOutput = fallbackResult.stdout.toString().trim();
      if (!fallbackOutput) {
        return [];
      }
      const fallbackTasks = parseJsonWithContext<BeadsTask[]>(
        fallbackOutput,
        "bd ready --json (fallback, unscoped)"
      );
      return Array.isArray(fallbackTasks) ? fallbackTasks : [];
    }

    return readyTasks;
  } catch (error) {
    // Invalid JSON or empty output should not crash the router; surface context for debugging.
    console.warn(`Warning: Failed to get ready tasks${epicId ? ` for epic ${epicId}` : ""}:`, error);
    return [];
  }
}

/**
 * Resolve agent profile for a task based on its labels
 * 
 * Strategy:
 * 1. Get task labels
 * 2. Use first label that matches an agent in config.agents
 * 3. Default to "project-manager" if no labels or no match
 */
function resolveAgentForTask(
  task: BeadsTask,
  config: Config
): {
  profile: AgentProfile;
  matchedLabel: string | null;
  labels: string[];
  fallbackReason: "no_labels" | "no_match" | null;
} {
  const labels = getTaskLabels(task.id);

  // If no labels, default to project-manager
  if (labels.length === 0) {
    const fallbackProfileFilename = config.agents["project-manager"];
    const profile = loadAgentProfile(fallbackProfileFilename);
    return { profile, matchedLabel: null, labels, fallbackReason: "no_labels" };
  }

  // Try to match first label to an agent
  for (const label of labels) {
    const profileFilename = config.agents[label];
    if (profileFilename) {
      const profile = loadAgentProfile(profileFilename);
      return { profile, matchedLabel: label, labels, fallbackReason: null };
    }
  }

  // No matching label found, default to project-manager
  const fallbackProfileFilename = config.agents["project-manager"];
  const profile = loadAgentProfile(fallbackProfileFilename);
  return { profile, matchedLabel: null, labels, fallbackReason: "no_match" };
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
    
    const comments = parseJsonWithContext<Array<{ text?: string; body?: string; created_at: string }>>(
      output,
      `bd comments ${taskId} --json`
    );

    return Array.isArray(comments)
      ? comments.map((comment) => ({
          body: comment.body ?? comment.text ?? "",
          created_at: comment.created_at,
        }))
      : [];
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
    // Skip comments without body
    if (!comment || !comment.body || typeof comment.body !== "string") {
      continue;
    }

    // Only count failures when we have a non-zero exit code marker.
    // This avoids false-positives from "exit code: 0" or generic text.
    const exitCode = extractExitCodeFromText(comment.body);
    if (exitCode !== null && exitCode !== 0) failureCount += 1;
  }
  
  return failureCount;
}

/**
 * Get full task details from Beads
 */
function getTaskDetails(taskId: string): BeadsTaskDetails {
  try {
    const result = Bun.spawnSync(["bd", "show", taskId, "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    
    if (result.exitCode !== 0) {
      throw new Error(`Failed to get task details: ${result.stderr.toString()}`);
    }
    
    const output = result.stdout.toString().trim();
    const taskData = parseJsonWithContext<unknown>(output, `bd show ${taskId} --json`);
    
    // Handle array response (Beads sometimes returns arrays)
    const task = Array.isArray(taskData) ? taskData[0] : taskData;
    return task as BeadsTaskDetails;
  } catch (error) {
    throw new Error(`Failed to get task details for ${taskId}: ${error}`);
  }
}

/**
 * Build prompt for agent execution
 */
function buildPrompt(
  task: BeadsTaskDetails,
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

  let epicContext = "";
  if (epicId) {
    const epicTasks = getEpicTasks(epicId);
    
    if (epicTasks.length > 0) {
      const statusIndex = new Map<string, number>(
        EPIC_STATUS_ORDER.map((status, index) => [status, index])
      );
      const orderedTasks = epicTasks
        .slice()
        .sort((a, b) => {
          const aIndex = statusIndex.get(a.status) ?? EPIC_STATUS_ORDER.length;
          const bIndex = statusIndex.get(b.status) ?? EPIC_STATUS_ORDER.length;
          if (aIndex !== bIndex) return aIndex - bIndex;
          return compareHierarchicalIds(a.id, b.id);
        });

      const totalTasks = orderedTasks.length;
      const visibleTasks = orderedTasks.slice(0, EPIC_CONTEXT_TASK_LIMIT);
      const remainingCount = totalTasks - visibleTasks.length;
      const taskList = visibleTasks
        .map((t) => {
          const marker = t.id === task.id ? " ← current task" : "";
          return `- ${t.id} (${t.status}): ${t.title}${marker}`;
        })
        .join("\n");

      const progressSummary = getEpicProgressSummary(epicId);
      epicContext = `
### EPIC CONTEXT: ${epicId}

${progressSummary}

**Sub-issues (context only, showing ${visibleTasks.length} of ${totalTasks}):**
${taskList}
${remainingCount > 0 ? `\n- ...and ${remainingCount} more` : ""}

**How to use sub-issues (context, not mandate):**
- Do not auto-select a child when running the parent/epic.
- Prefer plan order when available; otherwise pick the next sub-issue without extra justification.
- If a sub-issue is blocked, mark it \`blocked\` and stop.

**Cross-task notes:**
If your work affects another task in this epic, leave a brief comment:
\`bd comments add <task-id> "<message>"\`
`;
    }
  }

  return `Task: ${description}
Task ID: ${task.id}
Parent Epic ID: ${epicId || "null"}

Acceptance Criteria:
${acceptance}

${qualityInfo}
CONTEXT:
You are working on task ${task.id} which is part of Epic ${epicId || "null"}.${epicContext}
You can view full epic details using: bd show ${epicId || task.id}

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
1. If this is a sub-issue, add a short completion summary (suggested format: Summary / Struggles for revise reports / Verification)
2. Document revision learnings (see ".devagent/plugins/ralph/AGENTS.md" for format)
3. Document any screenshots captured (if applicable)
4. Add commit information after quality gates pass

See ".devagent/plugins/ralph/AGENTS.md" → Task Commenting for Traceability for detailed requirements.`;
}

/**
 * Load agent instructions from agent profile's instructions_path, with fallback to AGENTS.md
 */
function loadAgentInstructions(agentProfile?: AgentProfile): string {
  // Try to load agent-specific instructions first
  if (agentProfile?.instructions_path) {
    const agentInstructionsPath = join(REPO_ROOT, agentProfile.instructions_path);
    if (existsSync(agentInstructionsPath)) {
      try {
        const agentInstructions = readFileSync(agentInstructionsPath, "utf-8");
        // Also include base AGENTS.md for shared context
        const baseInstructions = loadBaseAgentInstructions();
        return `${agentInstructions}\n\n---\n\n## Shared Ralph Instructions\n${baseInstructions}`;
      } catch (error) {
        console.warn(`Warning: Failed to read agent instructions from ${agentInstructionsPath}: ${error}`);
      }
    }
  }
  
  // Fallback to base AGENTS.md
  return loadBaseAgentInstructions();
}

/**
 * Load base agent instructions from AGENTS.md
 */
function loadBaseAgentInstructions(): string {
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
): Promise<{ success: boolean; exitCode: number; error?: string; failureType?: "timeout" | "failed" }> {
  const logWriter = openRalphTaskLogWriter(task.id);
  logWriter.write(`\n=== ralph: start ${task.id} (${new Date().toISOString()}) ===\n`);

  const drainStreamToLogAndCaptureTail = async (
    stream: ReadableStream<Uint8Array> | null,
    maxChars: number
  ): Promise<string> => {
    if (!stream) return "";
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let captured = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;

      // Write bytes directly to file for real-time tail streaming.
      logWriter.write(value);

      // Keep a bounded tail for error comments.
      const text = decoder.decode(value, { stream: true });
      if (text) {
        captured += text;
        if (captured.length > maxChars) captured = captured.slice(captured.length - maxChars);
      }
    }

    const flushed = decoder.decode();
    if (flushed) {
      captured += flushed;
      if (captured.length > maxChars) captured = captured.slice(captured.length - maxChars);
    }

    return captured;
  };

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
    
    const MAX_CAPTURED_OUTPUT_CHARS = 30_000;
    const stdoutPromise = drainStreamToLogAndCaptureTail(proc.stdout, MAX_CAPTURED_OUTPUT_CHARS);
    const stderrPromise = drainStreamToLogAndCaptureTail(proc.stderr, MAX_CAPTURED_OUTPUT_CHARS);

    // Set timeout
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      proc.kill(9);
    }, AGENT_TIMEOUT);
    
    // Wait for process to complete
    const [exitCode, stdoutTail, stderrTail] = await Promise.all([
      proc.exited,
      stdoutPromise,
      stderrPromise,
    ]);
    clearTimeout(timeoutId);

    const normalizedExitCode = didTimeout && exitCode === 0 ? -1 : exitCode;
    
    logWriter.write(`\n=== ralph: exit ${task.id} (code: ${normalizedExitCode}) ===\n`);
    logWriter.close();
    
    if (didTimeout) {
      return {
        success: false,
        exitCode: normalizedExitCode,
        failureType: "timeout",
        error:
          stderrTail ||
          stdoutTail ||
          `Agent timed out after ${Math.round(AGENT_TIMEOUT / 1000)}s`,
      };
    }

    if (normalizedExitCode === 0) {
      return { success: true, exitCode: 0 };
    } else {
      return {
        success: false,
        exitCode: normalizedExitCode,
        failureType: "failed",
        error: stderrTail || stdoutTail || `Agent exited with code ${normalizedExitCode}`,
      };
    }
  } catch (error) {
    try {
      logWriter.write(
        `\n=== ralph: spawn error ${task.id} (${new Date().toISOString()}) ===\n${error instanceof Error ? error.message : String(error)}\n`
      );
      logWriter.close();
    } catch {
      // ignore log writer errors when already failing
    }
    return {
      success: false,
      exitCode: -1,
      failureType: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function getEpicProgressSummary(epicId: string): string {
  const tasks = getEpicTasks(epicId);
  const total = tasks.length;
  const closed = tasks.filter((t) => t.status === "closed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const open = tasks.filter((t) => t.status === "open").length;

  const completionPct = total === 0 ? 0 : Math.round((closed / total) * 100);
  return `**Epic Progress:** ${closed}/${total} closed | ${inProgress} in_progress | ${blocked} blocked | ${open} open
**Completion:** ${completionPct}%`;
}

function getEpicTasks(epicId: string): Array<{
  id: string;
  title: string;
  status: string;
}> {
  try {
    const runBdList = (args: string[]): BeadsTask[] => {
      const result = Bun.spawnSync(args, { stdout: "pipe", stderr: "pipe" });

      if (result.exitCode !== 0) {
        console.warn(`Warning: Failed to list tasks: ${result.stderr.toString()}`);
        return [];
      }

      const output = result.stdout.toString().trim();
      if (!output) return [];

      try {
        const parsed = parseJsonWithContext<unknown>(output, `bd list (${args.join(" ")})`);
        return Array.isArray(parsed) ? (parsed as BeadsTask[]) : [];
      } catch (error) {
        console.warn(`Warning: Failed to parse bd list output: ${error}`);
        return [];
      }
    };

    // 1) Hierarchical descendants (IDs like epic.1, epic.1.1). Requires scanning tasks once.
    // Use --all and --limit 0 so we don't silently omit closed tasks or truncate at 50.
    const allTasks = runBdList(["bd", "list", "--all", "--limit", "0", "--json"]);
    const hierarchicalTasks = allTasks.filter((t) => t.id.startsWith(`${epicId}.`));

    // 2) Explicit parent linkage (covers non-hierarchical IDs). One bounded call.
    const childTasks = runBdList(["bd", "list", "--parent", epicId, "--all", "--limit", "0", "--json"]);

    // Combine and deduplicate
    const allEpicTasks = Array.from(
      new Map([...hierarchicalTasks, ...childTasks].map((t) => [t.id, t])).values()
    );

    return allEpicTasks.map((task) => ({ id: task.id, title: task.title, status: task.status }));
  } catch (error) {
    console.warn(`Warning: Error fetching epic tasks for ${epicId}: ${error}`);
    return [];
  }
}

/**
 * Filter ready tasks by Epic ID (hierarchical ID pattern)
 * Note: Tasks with parent_id matching epic are checked separately in executeLoop
 * to avoid needing to fetch task details for all tasks
 */
function filterTasksByEpic(tasks: BeadsTask[], epicId: string): BeadsTask[] {
  return tasks.filter((task) => {
    // Check if task ID starts with epic ID (hierarchical IDs like epic.1, epic.1.1)
    return task.id.startsWith(epicId + ".");
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
    const epicData = parseJsonWithContext<unknown>(output, `bd show ${epicId} --json`);
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
  const MAX_FAILURES = 5;

  // Align log producer (Ralph) with log viewer (ralph-monitoring app):
  // Use the same env vars + path mapping as `getLogFilePath()` in `logs.server.ts`.
  process.env.REPO_ROOT ??= REPO_ROOT;
  process.env.RALPH_LOG_DIR ??= resolveRalphLogDirFromConfig(config);
  
  console.log("Starting Ralph execution loop...");
  console.log(`Epic ID: ${epicId}`);
  console.log(`Max failures before blocking: ${MAX_FAILURES}`);
  
  let iteration = 0;
  const maxIterations = config.execution.max_iterations || 50;
  let previousIterationDurationMs: number | null = null;
  
  while (iteration < maxIterations) {
    iteration++;
    const iterationStartedAtMs = Date.now();
    if (previousIterationDurationMs !== null) {
      console.log(`\nPrevious iteration took: ${formatDuration(previousIterationDurationMs)}`);
    }
    console.log(`\n=== Iteration ${iteration} ===`);
    console.log(`Started: ${formatDateTimeLocal(new Date(iterationStartedAtMs))}`);

    try {
      const epicTasksAll = getEpicTasks(epicId);
      if (epicTasksAll.length > 0) {
        const completed = epicTasksAll.filter((t) => t.status === "closed").length;
        const remaining = epicTasksAll.length - completed;
        console.log(`Epic tasks: ${completed} completed / ${remaining} remaining (${epicTasksAll.length} total)`);
      }

      // Check if epic is blocked/closed
      if (isEpicBlocked(epicId)) {
        console.log(`Epic ${epicId} is blocked or closed. Stopping execution.`);
        break;
      }
      
      // Get ready tasks (with epic filter if provided)
      const allReadyTasks = getReadyTasks(epicId);
      
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

      // Preserve plan order: hierarchical IDs must be compared numerically, not lexicographically.
      // Otherwise `epic.10` sorts before `epic.2`, causing out-of-order execution once an epic has 10+ steps.
      readyTasks.sort((a, b) => compareHierarchicalIds(a.id, b.id));
      
      if (readyTasks.length === 0) {
        console.log("No more ready tasks. Execution complete.");
        break;
      }

      console.log(`Ready tasks: ${readyTasks.length}`);
      
      // Process first ready task
      const task = readyTasks[0];
      
      // Get full task details
      let taskDetails: BeadsTaskDetails;
      try {
        taskDetails = getTaskDetails(task.id);
      } catch (error) {
        console.error(`Failed to get task details for ${task.id}: ${error}`);
        continue;
      }

      const taskTitle = taskDetails.title?.trim() ? taskDetails.title.trim() : "<no title>";
      console.log(`Processing task: ${task.id} — ${taskTitle}`);
      console.log(`Task started: ${formatDateTimeLocal(new Date())}`);
    
      // Check failure count
      const failureCount = getTaskFailureCount(task.id);
    
      const isDryRun = process.argv.includes("--dry-run");

      if (failureCount >= MAX_FAILURES) {
        console.log(
          `Task ${task.id} has failed ${failureCount} times. Blocking task.`
        );
        if (!isDryRun) {
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
        } else {
          console.log("Dry run: skipping task blocking mutations.");
        }
        continue;
      }
    
      // Mark task as in progress
      if (!isDryRun) {
        Bun.spawnSync(["bd", "update", task.id, "--status", "in_progress"], {
          stdout: "pipe",
          stderr: "pipe",
        });
      }
    
      // Resolve agent for task
      const { profile: agent, matchedLabel, labels, fallbackReason } = resolveAgentForTask(task, config);
      const validLabels = Object.keys(config.agents).sort();
      if (!matchedLabel) {
        if (fallbackReason === "no_labels") {
          console.log(
            `Routing fallback: task ${task.id} has no labels. Using 'project-manager'. Add exactly one label from: ${validLabels.join(", ")}.`
          );
        } else if (fallbackReason === "no_match") {
          console.log(
            `Routing fallback: task ${task.id} labels [${labels.join(", ")}] do not match config mapping keys. Using 'project-manager'. Valid labels: ${validLabels.join(", ")}.`
          );
        } else {
          console.log(`Routing fallback: task ${task.id} using 'project-manager'.`);
        }
      }
      if (matchedLabel && labels.length > 1) {
        console.log(
          `Note: multiple labels detected for ${task.id} (${labels.join(", ")}). Router uses first matching label: ${matchedLabel}.`
        );
      }
      console.log(
        `Resolved agent: ${agent.name}${matchedLabel ? ` (label: ${matchedLabel})` : " (project-manager fallback)"}`
      );
    
      // Load agent-specific instructions
      const agentInstructions = loadAgentInstructions(agent);
    
      // Build prompt
      const prompt = buildPrompt(
        taskDetails,
        taskDetails.parent_id || epicId,
        agentInstructions
      );
    
      // Execute agent
      console.log(`Executing agent: ${agent.ai_tool.name}...`);
      if (isDryRun) {
        console.log("Dry run: skipping agent execution and Beads status updates.");
        break;
      }
      const agentStartedAtMs = Date.now();
      const result = await executeAgent(task, agent, prompt, config);
      const agentDurationMs = Date.now() - agentStartedAtMs;
      console.log(`Agent runtime: ${formatDuration(agentDurationMs)}`);
    
      if (result.success) {
        console.log(`Task ${task.id} completed successfully`);
        // Agent is responsible for updating status to closed
      } else {
        const failureLabel = result.failureType === "timeout" ? "timed out" : "failed";
        console.error(`Task ${task.id} ${failureLabel} (exit code: ${result.exitCode})`);
        if (result.error) {
          console.error(`Error: ${result.error}`);
        }
        
        // Reset to open and add error comment
        Bun.spawnSync(["bd", "update", task.id, "--status", "open"], {
          stdout: "pipe",
          stderr: "pipe",
        });
        
        const prefix =
          result.failureType === "timeout"
            ? "Task implementation timed out"
            : "Task implementation failed - AI tool returned error";
        const errorMessage = `${prefix} (exit code: ${result.exitCode})${result.error ? `: ${result.error}` : ""}`;
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
    } finally {
      previousIterationDurationMs = Date.now() - iterationStartedAtMs;
    }
  }
  
  if (iteration >= maxIterations) {
    console.log(`Max iterations (${maxIterations}) reached. Stopping.`);
  }
}

function sanitizeConfigForOutput(config: Config): SanitizedConfig {
  const { env: _env, ...aiToolWithoutEnv } = config.ai_tool;
  return { ...config, ai_tool: aiToolWithoutEnv };
}

function sanitizeAgentProfileForOutput(agent: AgentProfile): SanitizedAgentProfile {
  const { env: _env, ...aiToolWithoutEnv } = agent.ai_tool;
  return { ...agent, ai_tool: aiToolWithoutEnv };
}

/**
 * Main router function
 * 
 * Loads config and profiles, reads ready tasks, and resolves
 * agent profiles for each task.
 */
export function router(): {
  config: SanitizedConfig;
  readyTasks: BeadsTask[];
  taskAgents: Array<{
    task: BeadsTask;
    agent: SanitizedAgentProfile;
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
      agent: sanitizeAgentProfileForOutput(profile),
      matchedLabel,
    };
  });
  
  return {
    config: sanitizeConfigForOutput(config),
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
