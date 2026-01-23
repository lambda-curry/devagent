#!/usr/bin/env bun
/**
 * Check Child Status Tool
 *
 * Checks if a child task (epic) has signaled completion by adding a specific label
 * to the orchestrator task. This enables the suspend/resume pattern for orchestrator loops.
 *
 * Usage:
 *   bun check-child-status.ts <orchestrator-task-id> <signal-label>
 *
 * Example:
 *   bun check-child-status.ts devagent-034b9i.5 review-needed
 *
 * Exit codes:
 *   0 - Signal label found (Resume: continue workflow)
 *   1 - Signal label missing (Suspend: exit workflow)
 *   2 - Error occurred (invalid arguments, Beads error, etc.)
 */

import { spawnSync } from "node:child_process";

/**
 * Get labels for a task using Beads CLI
 */
function getTaskLabels(taskId: string): string[] {
  try {
    const result = spawnSync("bd", ["label", "list", taskId], {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf-8",
    });

    if (result.status !== 0) {
      // Task has no labels or error occurred
      const stderr = result.stderr?.toString() || "";
      if (stderr.includes("has no labels")) {
        return [];
      }
      // Log error but don't throw - treat as no labels
      console.warn(`Warning: Failed to get labels for task ${taskId}: ${stderr}`);
      return [];
    }

    const output = result.stdout?.toString().trim() || "";
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
 * Check if a task has a specific label
 */
function hasLabel(taskId: string, label: string): boolean {
  const labels = getTaskLabels(taskId);
  return labels.includes(label);
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: bun check-child-status.ts <orchestrator-task-id> <signal-label>");
  console.error("Example: bun check-child-status.ts devagent-034b9i.5 review-needed");
  process.exit(2);
}

const [orchestratorTaskId, signalLabel] = args;

if (!orchestratorTaskId || !signalLabel) {
  console.error("Error: Both orchestrator-task-id and signal-label are required");
  process.exit(2);
}

try {
  const labelFound = hasLabel(orchestratorTaskId, signalLabel);

  if (labelFound) {
    console.log(`✓ Signal label "${signalLabel}" found on task ${orchestratorTaskId}`);
    console.log("→ Resume: Continue workflow execution");
    process.exit(0);
  } else {
    console.log(`✗ Signal label "${signalLabel}" not found on task ${orchestratorTaskId}`);
    console.log("→ Suspend: Exit workflow and wait for signal");
    process.exit(1);
  }
} catch (error) {
  console.error(`Error checking child status: ${error}`);
  process.exit(2);
}
