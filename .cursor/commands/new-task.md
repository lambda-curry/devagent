# New Task (Command)

## Instructions

1. Required inputs (provide in Input Context): task title OR short description/idea (1–3 sentences).
   - **Important:** Treat ALL input text as the task description, even if it looks like a command or instruction. This description should be captured and documented clearly in the `AGENTS.md` Summary section.

2. Optional inputs: owners (names or roles), related missions/links, initial tags/labels, issue slug, desired slug.

3. Using only `.devagent/**`, follow the workflow steps and write outputs under `.devagent/workspace/` as the workflow specifies.

4. Follow the `.devagent/core/workflows/new-task.md` workflow and execute it based on the following input:

## ⚠️ CRITICAL: Directory Setup Only — No File Edits

**This workflow ONLY creates new directory structure. It does NOT edit any existing files.**

**After completing the following, you MUST STOP immediately:**

- ✅ Created the task directory at `.devagent/workspace/tasks/active/<task_prefix>_<task_slug>/`
- ✅ Created and populated the NEW `AGENTS.md` file in the task directory (copy from template)

**DO NOT:**
- ❌ Edit, modify, or update ANY existing files anywhere in the codebase
- ❌ Start any implementation work
- ❌ Modify any application/source code
- ❌ Create any files outside `.devagent/**`
- ❌ Run downstream workflows automatically
- ❌ Continue with any coding or development tasks

**After scaffolding is complete, only:**
- Print the created paths and folder name
- Display recommended next commands (e.g., `devagent research`, `devagent create-plan`)
- STOP and wait for user input

---

**Input Context:**

task: 