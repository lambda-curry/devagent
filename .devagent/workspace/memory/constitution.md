# DevAgent Constitution

Use these clauses as the long-term guardrails for product discovery, research, and specification work. Each clause notes its steward, refresh cadence, and where to trace supporting evidence. Reference clause IDs inside task hubs and research packets.

## How to Amend

1. Draft the proposed change in a task hub or `.devagent/workspace/research/drafts/` with rationale and impacted clauses.
2. Run the steps in `constitution_update_checklist.md` to validate coverage.
3. Secure sign-off from the steward(s) listed on the impacted clauses.
4. Archive the prior version under `.devagent/workspace/memory/_archive/` and record a summary in the `Amendment Log` below.

## Clauses

### C1. Mission & Stakeholder Fidelity
- **Statement:** All discovery and specs must articulate how the work advances the mission (`.devagent/workspace/product/mission.md`) and name the stakeholders accountable for outcomes.
- **Steward:** ProductMissionPartner (or delegate).
- **Refresh cadence:** Quarterly review aligned with roadmap updates.
- **Traceability:** Task hub READMEs must include a "Mission Link" subsection referencing this clause.

### C2. Chronological Task Artifacts
- **Statement:** Task hubs catalogue artifacts using ISO-date prefixes and consistent slugs so teammates can reconstruct decision history without a roadmap meeting.
- **Steward:** SpecArchitect.
- **Refresh cadence:** Review during each task kickoff and retro.
- **Traceability:** Verify folder structure matches `.devagent/workspace/tasks/README.md` and that research/plan files include `Related Clauses: C2` in their footer.

### C3. Delivery Principles
- **Statement:** Delivery work must honor the following principles:
  1. **Human-in-the-loop defaults:** Every agent interaction produces drafts that require explicit human confirmation before downstream automation proceeds.
  2. **Traceable artifacts:** All agent outputs must link to mission metrics and cite research inputs. All code changes must be traceable to specific tasks via commit messages and comments.
  3. **Iterate in thin slices:** Limit planning waves to five tasks and ensure each slice can deliver observable value within a week.
  4. **Guardrails before generation:** Establish constraints (tools, permissions, review gates) prior to code generation to prevent scope drift.
  5. **Teach by doing:** Prioritize automations that keep DevAgent building DevAgent so the system continuously validates itself.
- **Steward:** AgentBuilder in partnership with ProductMissionPartner.
- **Refresh cadence:** Review quarterly or when emerging practices shift delivery behavior.
- **Traceability:** Task and plan templates must include a "Delivery Principles" check confirming adherence; deviations require an explicit waiver captured in the decision journal.

### C4. Tool-Agnostic Design
- **Statement:** Agents, workflows, and tooling must be designed to be tool-agnostic by default, enabling use across any AI development tool (Cursor, Codegen, Codex, GitHub Copilot, etc.). Tool-specific implementations must be organized under clearly labeled tool-specific directory structures (e.g., `.devagent/tools/codegen/`, `.devagent/tools/cursor/`).
- **Steward:** AgentBuilder.
- **Refresh cadence:** Review when new tools or integrations are considered.
- **Traceability:** Tool-specific code must be in dedicated directories; core workflows remain tool-agnostic.

### C5. Evolution Without Backwards Compatibility
- **Statement:** Backwards compatible workflows add too much cruft—avoid compatibility shims, aliases, or dual naming. DevAgent workflows and templates evolve to serve current best practices without maintaining backwards compatibility. When a workflow is superseded or a template is revised, remove it entirely. Update all documentation and roster references to the new approach. Teams adopting DevAgent should expect to adapt their local copies when pulling updates.
- **Steward:** AgentBuilder.
- **Refresh cadence:** Review quarterly when major workflow updates occur.
- **Traceability:** The primary documentation (AGENTS.md, this constitution) reflects only active workflows; obsolete versions are deleted without archive or deprecation notices.

## Clause Directory

| Clause | Last Reviewed | Next Review Due | Notes |
|--------|----------------|-----------------|-------|
| C1 | 2025-09-29 | 2025-12-31 | Initial seeding.
| C2 | 2025-09-29 | 2025-10-31 | Align `_template` defaults with clause expectations.
| C3 | 2025-09-29 | 2025-12-31 | Validate delivery principles in task templates.
| C4 | 2025-09-30 | 2025-12-31 | Ensure tool-agnostic design principles are followed.
| C5 | 2025-12-10 | 2025-12-31 | New clause: DevAgent evolves forward without backwards compatibility.

## Related Artifacts

- `.devagent/workspace/memory/constitution_update_checklist.md`
- `.devagent/workspace/tasks/README.md`
- `.devagent/core/agents/ResearchAgent.md`
- `.devagent/workspace/memory/README.md`

## Amendment Log

| Date | Change Summary | Clauses | Notes |
|------|----------------|---------|-------|
| 2025-09-29 | Initial constitution seeded with clauses C1-C6 and clause directory cadence. | C1-C6 | Baseline created during memory layering setup.
| 2025-09-29 | Removed evidence freshness, cross-agent handoffs, and compliance clauses; renumbered remaining clauses to C1-C3. | C1-C3 | Simplified guardrails to mission alignment, chronological hubs, and delivery principles.
| 2025-09-30 | Added tool-agnostic design principles to ensure workflows and agents work across multiple AI development tools. | C4 | Establishes requirement for tool-agnostic design with tool-specific implementations organized in dedicated directories.
| 2025-12-10 | Added C5 (Evolution Without Backwards Compatibility) to establish DevAgent's forward-only evolution model. | C5 | Clarifies that obsolete workflows are deleted without archive; no deprecation warnings or compatibility shims.
