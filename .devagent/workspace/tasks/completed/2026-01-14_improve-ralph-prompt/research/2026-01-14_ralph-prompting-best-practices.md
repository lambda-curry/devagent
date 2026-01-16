# Research Packet — Ralph Prompting Best Practices

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-14
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-14_improve-ralph-prompt/research/2026-01-14_ralph-prompting-best-practices.md`
- Stakeholders: Jake Ruesink (Owner)
- Related PR: https://github.com/lambda-curry/devagent/pull/31/changes

## Request Overview

Review PR #31 changes to Ralph's AGENTS.md. Current concerns:
- Too verbose and not concise
- Not well-guided for high-level task execution
- Doesn't effectively guide Ralph to execute work fully and pass quality gates before marking tasks complete
- Goal: Enable single-agent execution (execution + review) rather than separate execution and review agents through better prompting

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What are best practices for structuring prompts for autonomous AI agents that need to execute tasks end-to-end? | Answered | Focus on explicit task completion rules, validation gates, and self-review mechanisms |
| RQ2 | How should prompts balance high-level guidance with detailed execution steps? | Answered | Use hierarchical structure: high-level strategy first, then detailed steps with explicit verification |
| RQ3 | What techniques ensure agents verify quality gates before marking tasks complete? | Answered | Explicit validation gates, mandatory checklists, and "do not skip silently" rules |
| RQ4 | How can prompts enable self-review capabilities without requiring separate review agents? | Answered | Build verification steps into the execution flow with explicit status update requirements |

## Key Findings

1. **Explicit Task Completion Rules**: Agents must have explicit rules that prevent silent task omissions. Every action must either execute or provide justification for skipping.

2. **Validation Gates Between Steps**: Quality gates should be integrated as mandatory checkpoints, not optional steps. Agents need explicit instructions to verify work before proceeding.

3. **Hierarchical Prompt Structure**: Start with high-level strategy and objectives, then provide detailed execution steps. This helps agents understand the "why" before the "how".

4. **Self-Diagnosis and Adaptation**: Agents should be instructed to self-diagnose project-specific commands and adapt verification to context, rather than relying on static templates.

5. **Explicit Status Management**: Agents must be explicitly told when and how to update task status, with clear criteria for success, failure, and retry states.

6. **Error Handling and Debugging**: Build debugging mechanisms into prompts by requiring logging of decisions, state changes, and tool call outcomes.

## Detailed Findings

### RQ1: Best Practices for Autonomous Agent Prompts

**Summary:** Autonomous agents require explicit task completion rules, validation gates, and self-review mechanisms built into the execution flow.

**Supporting Evidence:**

From PromptingGuide.ai Context Engineering for AI Agents:
- **Explicit Task Execution Rules**: "For each search task you create, you MUST either: 1. Execute a web search and document findings, OR 2. Explicitly state why the search is unnecessary and mark it as completed with justification"
- **No Silent Skipping**: "Do NOT skip tasks silently or make assumptions about task redundancy"
- **Status Updates**: "Update task status in the spreadsheet after each action"

From dair-ai Prompt Engineering Guide:
- **Autonomous Task Execution** requires: Tool Access, Memory, Reasoning Engine, and Autonomy (self-directed execution without predefined control flow)
- **ReAct Pattern**: Shows agents should follow a cycle of Thought → Action → Observation, with explicit reasoning before each action

**Current Ralph Implementation:**
- Ralph's `ralph.sh` builds prompts with task context, acceptance criteria, and quality gate instructions
- AGENTS.md is loaded in full and injected into the prompt
- Quality gates are mentioned but not enforced as mandatory checkpoints

**Implication:** Ralph's prompt should enforce explicit "execute or justify" rules for each verification step, not just list them.

### RQ2: Balancing High-Level Guidance with Detailed Steps

**Summary:** Use hierarchical structure: high-level strategy and objectives first, then detailed execution steps with explicit verification requirements.

**Supporting Evidence:**

From PromptingGuide.ai Context Engineering Best Practices:
- **Don't assume the agent knows what you want**: "Be explicit about required vs. optional actions, quality standards, output formats, and decision-making criteria"
- **Clear Step Definition**: Each stage should be well-documented with clear boundaries

**Current Ralph AGENTS.md Structure:**
- Starts with detailed commit messaging guidelines (very specific)
- Then task context reading (detailed)
- Then quality gates (checklist format)
- Lacks high-level "how to approach a task" guidance at the top

**Implication:** AGENTS.md should start with a high-level execution strategy section that explains Ralph's role and approach, then provide detailed guidelines.

### RQ3: Ensuring Quality Gate Verification

**Summary:** Quality gates must be integrated as mandatory validation checkpoints with explicit "do not proceed until verified" rules.

**Supporting Evidence:**

From PromptingGuide.ai Error Handling Instructions:
- **Validation Gates**: "Add checks between critical steps"
- **Error Handling**: "If task cannot be completed, mark status as 'failed' with reason"
- **Never proceed silently**: "Never proceed silently when operations fail"

From dair-ai Prompt Engineering Guide:
- **Validation Gates** are a best practice for AI Workflows: "Add checks between critical steps"

**Current Ralph Implementation:**
- 7-Point Checklist exists but is presented as a list to "generate and verify"
- No explicit "do not mark task complete until all items verified" rule
- Quality gate instructions are embedded in the prompt but not enforced as blockers

**Implication:** The checklist should be reframed as mandatory validation gates that block task completion, not optional verification steps.

### RQ4: Self-Review Without Separate Agents

**Summary:** Build verification and review steps directly into the execution flow with explicit status update requirements and decision criteria.

**Supporting Evidence:**

From PromptingGuide.ai Context Engineering:
- **Build debugging mechanisms**: "Logging all agent decisions and reasoning, tracking state changes in external storage, recording tool calls and their outcomes"
- **Explicit Status Management**: Agents should update status after each action with clear criteria

**Current Ralph Implementation:**
- Ralph has separate Setup and Final Review agents
- Main execution agent is responsible for quality gates but may not enforce them strictly
- Status updates are mentioned but not tied to verification completion

**Implication:** The main execution prompt should include a mandatory "self-review" phase before status updates, with explicit criteria for what "complete" means.

## Comparative Analysis

### Current Approach (Separate Execution + Review Agents)
- **Pros:** Clear separation of concerns, review agent can catch execution agent mistakes
- **Cons:** Adds complexity, requires coordination, may miss issues if review agent doesn't run
- **Use Case:** When tasks are complex enough to warrant separate review

### Single-Agent Approach (Execution + Built-in Review)
- **Pros:** Simpler architecture, faster execution, review happens immediately after work
- **Cons:** Requires better prompting to ensure review actually happens
- **Use Case:** When prompts can enforce self-review as part of execution flow

**Recommendation:** Single-agent approach is viable if prompts are structured to enforce self-review as mandatory checkpoints.

## Implications for Implementation

### 1. Restructure AGENTS.md with Hierarchical Organization

**Current Structure:**
- Commit Messaging Guidelines (detailed)
- Task Context & Beads Integration (detailed)
- Quality Gates & Verification (checklist)
- Task Commenting (detailed)
- Decision-Making Expectations (brief)
- Failure Management (brief)

**Recommended Structure:**
1. **High-Level Execution Strategy** (NEW - concise overview of Ralph's role and approach)
2. **Task Execution Flow** (NEW - step-by-step high-level flow)
3. **Quality Gates & Verification** (reframed as mandatory validation checkpoints)
4. **Task Context & Beads Integration** (keep, but simplify)
5. **Commit Messaging Guidelines** (keep, but move later)
6. **Status Management** (enhanced with explicit completion criteria)
7. **Error Handling** (enhanced with explicit rules)

### 2. Make Quality Gates Mandatory Blockers

**Current:** "At the start of each task, you must generate a dynamic checklist... All checklist items must be checked off"

**Recommended:** 
- Reframe as "Validation Gates" that block task completion
- Add explicit rule: "You MUST NOT update task status to 'closed' until ALL validation gates pass"
- Include explicit failure handling: "If any validation gate fails, you MUST fix the issue or mark task as 'blocked' with reason"

### 3. Add High-Level Execution Strategy Section

**Recommended Content:**
- Ralph's role: Execute tasks autonomously with built-in quality verification
- Approach: Read context → Plan → Implement → Verify → Review → Commit → Update Status
- Key principle: No task is complete until all quality gates pass and work is verified

### 4. Enhance Status Management with Explicit Criteria

**Current:** Brief mention of status transitions

**Recommended:**
- Explicit criteria for each status:
  - `closed`: All acceptance criteria met, all quality gates passed, work committed
  - `blocked`: Cannot proceed due to external dependency or unresolvable issue (with reason)
  - `in_progress`: Work in progress, retry needed, or waiting for next iteration

### 5. Simplify Verbose Sections

**Current Issues:**
- Commit messaging guidelines are very detailed (21 lines)
- Task commenting section is very detailed (33 lines)
- Some sections repeat information

**Recommended:**
- Consolidate commit messaging into concise rules with examples
- Simplify task commenting to essential requirements
- Remove redundancy between sections

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Will single-agent approach miss issues that separate review agent would catch? | Risk | Jake Ruesink | Test with real tasks and compare outcomes | TBD |
| How to balance conciseness with completeness? | Question | Jake Ruesink | Iterate on AGENTS.md structure and test with Ralph execution | TBD |
| Should quality gates be configurable per task type? | Question | Jake Ruesink | Research task-type-specific quality gate patterns | TBD |

## Recommended Follow-ups

1. **Restructure AGENTS.md** following the hierarchical structure recommended above
2. **Test with Real Tasks**: Run Ralph with restructured AGENTS.md on actual tasks to validate effectiveness
3. **Compare Outcomes**: If possible, compare single-agent execution results with previous separate-agent approach
4. **Iterate Based on Feedback**: Refine prompts based on Ralph's execution patterns and revision learnings

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| [PromptingGuide.ai - Context Engineering for AI Agents](https://www.promptingguide.ai/agents/context-engineering) | Web Documentation | 2024 | Public, authoritative source for AI agent prompting |
| [PromptingGuide.ai - Context Engineering Best Practices](https://www.promptingguide.ai/agents/context-engineering) | Web Documentation | 2024 | Public, best practices section |
| [dair-ai Prompt Engineering Guide - ReAct Pattern](https://github.com/dair-ai/prompt-engineering-guide/blob/main/ar-pages/techniques/react.ar.mdx) | GitHub Documentation | 2024 | Public, ReAct agent execution patterns |
| [dair-ai Prompt Engineering Guide - AI Agents](https://github.com/dair-ai/prompt-engineering-guide/blob/main/pages/agents/ai-workflows-vs-ai-agents.en.mdx) | GitHub Documentation | 2024 | Public, autonomous task execution patterns |
| `.devagent/plugins/ralph/AGENTS.md` | Internal Documentation | Current | Current Ralph agent instructions (140 lines) |
| `.devagent/plugins/ralph/tools/ralph.sh` | Internal Code | Current | Ralph prompt construction logic (lines 231-280) |
| `.devagent/plugins/ralph/workflows/execute-autonomous.md` | Internal Documentation | Current | Ralph execution workflow documentation |
