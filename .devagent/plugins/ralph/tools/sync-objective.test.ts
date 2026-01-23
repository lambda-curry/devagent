import { describe, it, expect, vi, beforeEach } from "vitest";
import { parsePlanMarkdown, parseDependencies } from "./sync-objective";

describe("sync-objective", () => {
  describe("parsePlanMarkdown", () => {
    it("should parse tasks from Implementation Tasks section", () => {
      const markdown = `
# Objective Plan

## Implementation Tasks

#### Task 1: Define Orchestrator Schema & Roles
- **Objective:** Create the template and role definitions for the Admin Loop.
- **Impacted Modules/Files:**
  - \`.devagent/plugins/ralph/templates/orchestrator-loop.json\` (New)
  - \`.devagent/plugins/ralph/roles/objective-planner.md\` (New)
- **References:** Clarification Packet
- **Acceptance Criteria:**
  - \`orchestrator-loop.json\` defines the standard Admin tasks.
  - Role prompts include specific instructions for Git Stacking and Plan Sync.
- **Testing Criteria:** Unit test with sample markdown.

#### Task 2: Implement Plan Sync Logic
- **Objective:** Build the logic to sync objective-plan.md to Beads tasks.
- **Impacted Modules/Files:**
  - \`.devagent/plugins/ralph/tools/sync-objective.ts\` (New)
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - Script parses markdown list/graph.
  - Creates/Updates Beads tasks to match.
  - Sets correct dependencies in Beads.
- **Testing Criteria:** Unit test with sample markdown.
`;

      const tasks = parsePlanMarkdown(markdown);

      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toMatchObject({
        id: "Task 1",
        title: "Define Orchestrator Schema & Roles",
        objective: "Create the template and role definitions for the Admin Loop.",
      });
      expect(tasks[0].acceptanceCriteria).toContain("orchestrator-loop.json");
      expect(tasks[1]).toMatchObject({
        id: "Task 2",
        title: "Implement Plan Sync Logic",
        dependencies: "Task 1",
      });
    });

    it("should handle tasks with no dependencies", () => {
      const markdown = `
## Implementation Tasks

#### Task 1: First Task
- **Objective:** Do something.
- **Dependencies:** None
`;

      const tasks = parsePlanMarkdown(markdown);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].dependencies).toBe("None");
    });

    it("should handle tasks with range dependencies", () => {
      const markdown = `
## Implementation Tasks

#### Task 5: End-to-End Test
- **Objective:** Run full test.
- **Dependencies:** Tasks 1-4
`;

      const tasks = parsePlanMarkdown(markdown);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].dependencies).toBe("Tasks 1-4");
    });

    it("should handle tasks with multiple dependencies", () => {
      const markdown = `
## Implementation Tasks

#### Task 3: Integration
- **Objective:** Integrate components.
- **Dependencies:** Task 1, Task 2
`;

      const tasks = parsePlanMarkdown(markdown);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].dependencies).toBe("Task 1, Task 2");
    });

    it("should throw error if Implementation Tasks section not found", () => {
      const markdown = `
# Some Other Plan

## Different Section
- No tasks here
`;

      expect(() => parsePlanMarkdown(markdown)).toThrow(
        "Could not find 'Implementation Tasks' section"
      );
    });

    it("should handle tasks with ### headers", () => {
      const markdown = `
## Implementation Tasks

### Task 1: Test Task
- **Objective:** Test parsing.
`;

      const tasks = parsePlanMarkdown(markdown);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe("Task 1");
      expect(tasks[0].title).toBe("Test Task");
    });
  });

  describe("parseDependencies", () => {
    it("should parse range dependencies (Tasks 1-4)", () => {
      const deps = parseDependencies("Tasks 1-4");

      expect(deps).toEqual(["Task 1", "Task 2", "Task 3", "Task 4"]);
    });

    it("should parse list dependencies (Task 1, Task 2)", () => {
      const deps = parseDependencies("Task 1, Task 2");

      expect(deps).toEqual(["Task 1", "Task 2"]);
    });

    it("should parse single task dependency", () => {
      const deps = parseDependencies("Task 1");

      expect(deps).toEqual(["Task 1"]);
    });

    it("should handle 'None' dependencies", () => {
      const deps = parseDependencies("None");

      expect(deps).toEqual([]);
    });

    it("should handle empty string", () => {
      const deps = parseDependencies("");

      expect(deps).toEqual([]);
    });

    it("should parse multiple task references", () => {
      const deps = parseDependencies("Task 1 and Task 2");

      expect(deps).toEqual(["Task 1", "Task 2"]);
    });
  });
});
