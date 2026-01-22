# Standard Workflow Instructions

Before executing any workflow, review and follow these standard instructions:

## Date Handling
- When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format
- Use the output for YYYY-MM-DD portions of filenames (e.g., `YYYY-MM-DD_<descriptor>.md`)
- Do not infer or assume the date

## Metadata Retrieval
- To determine owner/author for metadata: run `git config user.name`
- Use this value when owner is not explicitly provided in inputs

## Context Gathering (Standard Order)
When gathering context, review in this order:
1. Internal agent documentation: `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
2. Workflow definitions: `.devagent/core/workflows/**/*.md`
3. Rules & conventions: cursor rules, `.github/*.md` policy docs
4. DevAgent workspace:
   - `.devagent/workspace/product/**` (mission, roadmap, guiding-questions)
   - `.devagent/workspace/tasks/**` (task hubs, specs, task plans)
   - `.devagent/workspace/memory/**` (constitution, decisions, tech stack)
   - `.devagent/workspace/research/**` (prior research packets)
5. Fallback: `README.*` or `docs/**` if above are insufficient

## Standard Guardrails
- Prefer authoritative sources and project-internal context first
- Never expose secrets or credentials; redact as `{{SECRET_NAME}}`
- Tag uncertainties with `[NEEDS CLARIFICATION: ...]`
- Cite file paths with anchors when available

## Handling Command File References
When you encounter a reference to a command file (e.g., `@.agents/commands/research.md` or `.agents/commands/create-plan.md`), **DO NOT attempt to execute it as a shell command**. These are instructional markdown files.

**Correct Protocol:**
1. **Read**: Use the `read_file` tool to retrieve the content of the referenced markdown file
2. **Interpret**: Analyze the steps and workflows defined within the file
3. **Execute**: Autonomously perform the actions described in the file using your standard toolset (e.g., `write_file`, `run_terminal_cmd`, `search_replace`)

Command files in `.agents/commands/` are templates that reference workflows in `.devagent/core/workflows/` and provide structured input placeholders. They are meant to be read and followed, not executed as commands.

## Execution Directive (Standard)
When invoked with `devagent [workflow-name]` and required inputs, **EXECUTE IMMEDIATELY**. 
- Do not summarize, describe, or request approval—perform the work using available tools
- The executing developer has standing approval to invoke workflows
- Only pause for missing REQUIRED inputs, blocking errors, or when explicit human confirmation is required for external actions
- Note exceptional findings in the response rather than blocking the run

## Storage Patterns
- Dated artifacts: Use `YYYY-MM-DD_<descriptor>.md` format (date from `date +%Y-%m-%d`)
- Quick clarifications: reply inline only
- Significant outputs: Creating artifacts (files) is good practice when they serve a purpose beyond communication—for example, when they're referenced by downstream workflows, need to persist for future sessions, or provide structured data. However, some workflows are designed to provide outputs in responses only (e.g., `devagent handoff`, `devagent update-devagent`). Always follow the workflow's specific instructions when they explicitly specify where outputs should go.
- Task-scoped artifacts: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`
- General artifacts: `.devagent/workspace/research/` or `.devagent/workspace/reviews/`
