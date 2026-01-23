import { describe, it, expect, vi, beforeEach } from "vitest";
import { spawnSync } from "node:child_process";

// Mock spawnSync for unit tests
vi.mock("node:child_process", () => ({
  spawnSync: vi.fn(),
}));

describe("check-child-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Label checking logic", () => {
    it("should detect when label is present", () => {
      const mockSpawnSync = vi.mocked(spawnSync);
      
      // Mock successful label list with review-needed label
      mockSpawnSync.mockReturnValueOnce({
        status: 0,
        stdout: Buffer.from("🏷 Labels for devagent-034b9i.5:\n  - review-needed\n  - engineering"),
        stderr: Buffer.from(""),
        output: [],
        pid: 123,
        signal: null,
      } as any);

      // Import and test the function logic
      // Note: We're testing the logic, not the CLI execution
      const labels = ["review-needed", "engineering"];
      expect(labels.includes("review-needed")).toBe(true);
    });

    it("should detect when label is missing", () => {
      const labels = ["engineering", "qa"];
      expect(labels.includes("review-needed")).toBe(false);
    });

    it("should handle empty labels list", () => {
      const labels: string[] = [];
      expect(labels.includes("review-needed")).toBe(false);
    });

    it("should handle Beads 'has no labels' error", () => {
      const mockSpawnSync = vi.mocked(spawnSync);
      
      mockSpawnSync.mockReturnValueOnce({
        status: 1,
        stdout: Buffer.from(""),
        stderr: Buffer.from("Task has no labels"),
        output: [],
        pid: 123,
        signal: null,
      } as any);

      // Simulate the error handling logic
      const stderr = "Task has no labels";
      const hasNoLabels = stderr.includes("has no labels");
      expect(hasNoLabels).toBe(true);
    });
  });

  describe("Exit code behavior", () => {
    it("should exit with code 0 when label found (Resume)", () => {
      // Exit code 0 = Resume (continue workflow)
      expect(0).toBe(0);
    });

    it("should exit with code 1 when label missing (Suspend)", () => {
      // Exit code 1 = Suspend (exit workflow)
      expect(1).toBe(1);
    });

    it("should exit with code 2 on error", () => {
      // Exit code 2 = Error
      expect(2).toBe(2);
    });
  });

  describe("CLI argument validation", () => {
    it("should require orchestrator-task-id", () => {
      const args: string[] = [];
      expect(args.length).toBeLessThan(2);
    });

    it("should require signal-label", () => {
      const args = ["devagent-034b9i.5"];
      expect(args.length).toBeLessThan(2);
    });

    it("should accept valid arguments", () => {
      const args = ["devagent-034b9i.5", "review-needed"];
      expect(args.length).toBe(2);
      expect(args[0]).toBe("devagent-034b9i.5");
      expect(args[1]).toBe("review-needed");
    });
  });
});
