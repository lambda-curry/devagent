# Research Packet — Agent Handoff Feature (Implement Agent Handoff)

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-02
- Storage Path: `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/research/2026-01-02_agent-handoff-research.md`
- Stakeholders: Jake Ruesink (Owner)
- Notes: No related plan yet.

## Request Overview
Create a handoff workflow feature that generates a prompt for a new agent with a clean token window, summarizing current work context, surfacing relevant resources, and providing clear continuation instructions. Inspired by Amp’s Handoff feature; must align with DevAgent principles (traceable artifacts, human-in-the-loop, tool-agnostic design).

## Classification & Assumptions
- Classification: Implementation design + product workflow research.
- Assumptions:
  - The handoff artifact should be a portable, tool-agnostic prompt template usable across editors/CLIs (Constitution C4).
  - Handoff prompts must remain human-reviewable and require explicit confirmation before use (Constitution C3).
  - Initial implementation targets DevAgent task hubs and AGENTS.md-driven workflows.

## Research Plan (What Was Validated)
1. How Amp’s Handoff feature behaves (goal-driven extraction, new thread, user review).
2. OpenAI Agents SDK handoff mechanics and prompt guidance (handoffs as tools, input filters, recommended handoff prompt prefix).
3. Cross-framework guidance on handoff ownership and context preservation (Microsoft Agent Framework).
4. Existing DevAgent internal handoff expectations and guardrails.

## Context Snapshot
- Task hub: `.devagent/workspace/tasks/active/2026-01-02_implement-agent-handoff/AGENTS.md`
- Mission: `.devagent/workspace/product/mission.md`
- Constitution: `.devagent/workspace/memory/constitution.md`
- Task prompt template: `.devagent/core/templates/task-prompt-template.md`
- Internal workflow references: `.devagent/core/workflows/clarify-task.md`, `.devagent/workspace/research/2025-10-01_feature-clarify-agent.md`

## Research Questions
| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What context should be included in a handoff prompt? | Answered | Use goal + distilled decisions + current state + relevant files. |
| RQ2 | How should handoff prompts be structured for clarity and token efficiency? | Answered | Goal-first, structured sections, filtered history. |
| RQ3 | Should handoffs be workflow-specific or generic? | Partial | Recommend generic core with workflow-specific extensions. |
| RQ4 | How do we ensure handoff prompts maintain token efficiency? | Answered | Filter history + include only relevant artifacts + summary extraction. |
| RQ5 | What are external best practices or examples for handoff features? | Answered | Amp Handoff feature; OpenAI Agents SDK handoffs; Microsoft handoff orchestration. |

## Key Findings
- Amp’s Handoff replaces compaction by extracting relevant context into a new, focused thread based on a user-specified goal, then drafts a prompt the user can edit before sending. This is the closest direct analogue to the desired feature. (Source: Amp Handoff + Context Management guides)
- OpenAI Agents SDK models handoffs as tools, supports input filters to customize what gets passed, and recommends explicit handoff instructions in agent prompts. This supports a token-efficient handoff design with configurable filtering. (Source: OpenAI Agents SDK Handoffs docs)
- Handoff orchestration in Microsoft’s agent framework treats handoff as transfer of task ownership with full context preservation; it also emphasizes human approval for sensitive tools and checkpointing for resumable workflows. (Source: Microsoft Agent Framework docs)
- DevAgent’s constitution emphasizes traceable artifacts, human-in-the-loop defaults, and tool-agnostic design; handoff outputs must be stored as dated artifacts in task hubs and should include explicit references to research, mission, and decisions. (Source: DevAgent constitution, mission, and task templates)

## Detailed Findings

### RQ1: What context should be included in a handoff prompt?
**Summary:** Include (1) the new goal, (2) distilled work summary (state, decisions, progress), (3) key artifacts and file references, (4) open questions/risks, and (5) explicit next actions. Amp’s handoff flow explicitly extracts relevant messages, tool calls, and files into a new prompt for a fresh thread. OpenAI’s handoff support implies you can filter what passes, suggesting we should include only what’s relevant, not raw history. Microsoft’s handoff model emphasizes context preservation and ownership transfer, so the handoff should clearly state ownership and expected output.

**Evidence:**
- Amp: Handoff extracts relevant info from the current thread (messages, tool calls, files), drafts a new prompt for a new focused thread, and encourages goal-specific extraction.
- OpenAI Agents SDK: handoffs are tools; input filters can remove tool calls or tailor the history; recommended prompt prefix for handoffs.
- Microsoft Agent Framework: handoff transfers task ownership and preserves conversation context.

**Freshness notes:** Publish dates not listed for Amp/OpenAI pages; accessed 2026-01-02. Microsoft page shows 2025-12-08.

### RQ2: How should handoff prompts be structured for clarity and token efficiency?
**Summary:** Use a goal-first prompt with sectioned fields (e.g., Goal, Current State, Decisions, Artifacts, Next Steps, Risks). Token efficiency comes from filtering history (remove tool calls/noise), including only relevant artifacts, and drafting a compact summary. Amp’s Handoff explicitly aims to keep threads small and focused. OpenAI’s input filters and handoff prompt prefix provide a template for efficient payloads.

**Evidence:**
- Amp: Handoff encourages small, focused threads; goal-driven extraction; user can edit the drafted prompt.
- OpenAI Agents SDK: input filters (e.g., remove tool calls) and recommended prompt prefix for handoff-aware agents.

### RQ3: Should handoffs be workflow-specific or generic?
**Summary:** Prefer a generic core schema (Goal, Summary, Artifacts, Next Actions) with optional workflow-specific extensions. DevAgent workflows already have clear handoff conventions (e.g., clarify-task handing to research/plan). A generic handoff prompt can be reused across workflows; workflow-specific appendices can add required artifacts (e.g., plans, task lists).

**Evidence:**
- DevAgent workflows include explicit handoff steps but no unified handoff artifact structure.
- OpenAI handoffs allow different agent specializations via tool-like handoffs, suggesting generic core with specialization.

### RQ4: How do we ensure handoff prompts maintain token efficiency?
**Summary:** Build a filtering step (drop tool call logs, repeated context) and only include (1) summary, (2) minimal file list, (3) critical decisions, and (4) current blockers. Amp notes that large context windows degrade quality and encourages handoff to distill relevant content. OpenAI filters enable dropping unnecessary history.

**Evidence:**
- Amp context management guide: large context windows degrade quality; handoff distills to a new, focused thread.
- OpenAI Agents SDK: `input_filter` can remove tool calls; history wrappers can be customized.

### RQ5: What are external best practices/examples for handoff features?
**Summary:**
- Amp: Handoff replaces compaction by generating a goal-specific prompt for a new thread and includes relevant files.
- OpenAI Agents SDK: Handoffs modeled as tool calls with recommended prompt prefix and input filters.
- Microsoft Agent Framework: Handoff transfers full task ownership; supports context preservation and optional checkpointing; human approval for sensitive tools.

## Comparative / Alternatives Analysis
- **Handoff vs. Compaction:** Amp explicitly replaced compaction with handoff to avoid summary stacking and encourage focused threads. Handoff keeps user intent explicit and creates a new prompt rather than replacing history.
- **Handoff vs. Agent-as-tools:** Microsoft distinguishes handoff (ownership transfer, full context) from agent-as-tools (primary agent retains ownership and selectively shares context). For DevAgent, handoff should transfer ownership to the new agent and bundle only what’s needed.
- **Generic vs. workflow-specific:** Generic template lowers maintenance and supports portability, while workflow-specific addenda can enforce required artifacts (e.g., plan/task references).

## Implications for Implementation
- Provide a **Handoff Prompt Template** with explicit sections: Goal, Current State, Decisions/Assumptions, Artifacts & Files, Next Steps, Risks/Open Questions, Validation/Tests.
- Include a **filtering step** that removes irrelevant history and tool noise; consider a minimal “handoff history wrapper.”
- Preserve **human review** by generating a draft prompt that requires explicit confirmation before execution.
- Record handoff artifacts as dated files in the task hub (C2 traceability) and include mission links (C1) + research references.
- Ensure tool-agnostic structure (C4) so CLI/editor handoff features can use the same template.

## Recommendation
Adopt a **goal-driven handoff artifact** modeled after Amp’s handoff flow: a new-thread prompt that is drafted from extracted context, editable by the user, and scoped by a goal statement. Implement a **core template** plus optional workflow-specific sections. Build a **history filter** option to drop tool calls and irrelevant context (mirroring OpenAI handoff filters), and log the handoff artifact in the task hub for traceability.

## Repo Next Steps (Checklist)
- [ ] Create a handoff prompt template file under `.devagent/core/templates/` with sections above.
- [ ] Draft a handoff workflow file in `.devagent/core/workflows/` that generates the template and stores it in task hubs.
- [ ] Decide where handoff artifacts live in task hubs (e.g., `handoff/` or `research/`).
- [ ] Add a minimal “handoff filter” spec to clarify what content to exclude (tool logs, raw transcripts).
- [ ] Validate with one DevAgent task by producing a handoff prompt and testing usability.

## Risks & Open Questions
| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Handoff prompt becomes too long for token budgets | Risk | Owner | Enforce strict section length and file list cap | TBD |
| Tool-agnostic template conflicts with tool-specific needs | Risk | Owner | Add optional tool-specific appendix blocks | TBD |
| Ambiguity in ownership transfer between agents | Question | Owner | Define explicit “handoff ownership” language in template | TBD |
| Storage location for handoff artifacts | Question | Owner | Decide on `handoff/` vs `research/` and document | TBD |
| How to auto-detect relevant files without over-including | Question | Owner | Start with manual file list; explore heuristics later | TBD |

## Recommended Follow-ups
- Run `devagent clarify-task` to confirm handoff prompt requirements (workflow-specific vs generic).
- Run `devagent create-plan` once template and storage location decisions are set.

## Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| https://ampcode.com/guides/context-management | External | 2025-12 | Public | 
| https://ampcode.com/news/handoff | External | 2025-12 | Public |
| https://openai.github.io/openai-agents-python/handoffs/ | External | 2025-12 | Public |
| https://openai.github.io/openai-agents-python/ref/extensions/handoff_prompt/ | External | 2025-12 | Public |
| https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/handoff | External | 2025-12-08 | Public |
| `.devagent/workspace/product/mission.md` | Internal | 2026-01-02 | Repo |
| `.devagent/workspace/memory/constitution.md` | Internal | 2026-01-02 | Repo |
| `.devagent/core/templates/task-prompt-template.md` | Internal | 2026-01-02 | Repo |
| `.devagent/core/workflows/clarify-task.md` | Internal | 2026-01-02 | Repo |
| `.devagent/workspace/research/2025-10-01_feature-clarify-agent.md` | Internal | 2025-10-01 | Repo |

Related Clauses: C2, C3, C4
