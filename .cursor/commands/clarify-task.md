# Clarify Task (Command)

## Instructions

1. Required inputs (provide in Input Context): task or feature concept/request, identified stakeholders and decision makers, clarification scope (full validation, gap-filling, or requirements review), mission context for alignment.
   - If the user provides **no Input Context**, infer the most likely task/feature being clarified from earlier conversation messages and any current task artifacts already in context. Start by stating an **Inferred Task Concept** and a short **Assumptions** list, then begin the interactive clarification session to validate/correct the inference.

2. Optional inputs: existing materials (brainstorm packet, partial spec, related research, prior tasks), known constraints (technical, compliance), prior requirement artifacts from similar work.

3. This workflow runs as an interactive clarification session; ask follow-up questions to resolve gaps in required inputs.

4. Using only `.devagent/**`, follow the workflow steps and write outputs under `.devagent/workspace/` as the workflow specifies.

5. Follow the `.devagent/core/workflows/clarify-task.md` workflow and execute it based on the following input:

---

**Input Context:**
