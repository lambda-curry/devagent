# Handoff Prompt Template

## Usage Notes
- This is a draft prompt for **manual copy/paste** into a new agent thread.
- Keep the prompt tool-agnostic and focused on the stated intent.
- Include only context needed to continue; avoid raw logs or full transcripts.

## Reference Guidance
- If a task hub exists, include the task hub `AGENTS.md` as a reference.
- Add additional references only if they are necessary for continuation or validation.

## Handoff Prompt
**Goal / Intent**
<user-provided intent or the goal the new agent should pursue>

**Current State**
<succinct summary of progress, what was completed, and what is in flight>

**Quick Status (Optional)**
- Tasks completed: X/Y
- Critical issues: [count]
- **Screenshots**: `.devagent/workspace/reviews/[epic-id]/screenshots/` (if available)
- **See Improvement Report**: `.devagent/workspace/reviews/[epic-id]-improvements.md` (if available)

**Top Improvements (Optional - Full list in improvement report)**
1. **[Priority] [Category]**: [improvement description] - [impact]
2. **[Priority] [Category]**: [improvement description] - [impact]
3. **[Priority] [Category]**: [improvement description] - [impact]

**Decisions / Assumptions**
<key decisions, constraints, and assumptions the new agent must respect>

**References**
- <file path> — <why it matters>
- <file path> — <why it matters>

**Next Steps**
1. <step>
2. <step>
3. <step>

**Risks / Open Questions (Optional)**
<include only if there are known risks, blockers, or open questions that need to be addressed>

**Workflow Continuation**
<if relevant, state which DevAgent workflow to continue and why>

**Workflow-Specific Appendix (Optional)**
<include only when a specific workflow requires extra context>

**Execution Notes (Optional)**
<include only if specific execution guidance is needed beyond the context above>
