**Revision Learning:**
- **Category:** Process
- **Priority:** Low
- **Issue:** Research doc path in task referenced `research/2026-01-31_multi-project-support-research.md`; the actual file lives under the task folder `.devagent/workspace/tasks/active/2026-01-30_multi-project-support/research/2026-01-31_multi-project-support-research.md`. Context was located via grep and plan doc.
- **Recommendation:** When task references "research/<name>" or "plan/<name>", clarify in task template or AGENTS whether path is repo-relative or task-folder-relative; or link the full path in the task description.
- **Files/Rules Affected:** Task description templates, Beads task creation for epics with research/plan docs.

Signed: Engineering Agent — Code Wizard
