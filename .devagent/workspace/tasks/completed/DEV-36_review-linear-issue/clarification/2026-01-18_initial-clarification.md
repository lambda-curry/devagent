# Clarified Requirement Packet — DEV-36 Improving Agent Profiles + Consistent Test Loop

- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Date: 2026-01-18
- Mode: Task Clarification
- Status: Pending Research
- Related Task Hub: `.devagent/workspace/tasks/completed/DEV-36_review-linear-issue/`
- Source: Linear issue `DEV-36` — `https://linear.app/lambdacurry/issue/DEV-36/improving-agent-profiles-consistent-test-loop`

## Progress (Question Tracker)
- **Q1 (Must-have deliverables for DEV-36)**: ✅ answered — D (Design agent + QA agent + resettable test loop)
- **Q2 (Decision maker / stakeholders for sign-off)**: ✅ answered — A (Jake Ruesink)
- **Q3 (Clarification scope for this session)**: ✅ answered — A (Full task validation; plan-ready packet)
- **Q4 (“Skills” deliverable format/location)**: ✅ answered — A (Skill docs under `.devagent/plugins/**` — terminology: call them “skills”, not “plugins”)
- **Q5 (Minimum viable resettable test loop)**: ✅ answered — Plan-driven end-to-end run with explicit per-stage expectations; evaluate Beads setup from the plan and evaluate each agent’s performance against expectations
- **Q6 (QA agent allowed action on fail)**: ✅ answered — C (Move Beads task back to “In Progress”) — ⚠️ superseded by Q33 (use `open`)
- **Q7 (Which stages covered by expectations doc)**: ✅ answered — E (All of the above: Plan→Beads setup, Task execution, QA verification, Post-run summary)
- **Q8 (QA “pass” evidence requirements)**: ✅ answered — D (Checklist + screenshots + links to relevant framework/library docs)
- **Q9 (Design agent Storybook expectations)**: ✅ answered — D (Create/update Storybook stories/docs + add design guidance as comments on engineering tasks)
- **Q10 (Where the plan + expectations docs live)**: ✅ answered — Proposed `.devagent/workspace/tests/` (needs confirmation/finalization)
- **Q11 (“Agent browser” tool definition)**: ✅ answered — `vercel-labs/agent-browser` (used for automation + screenshots)
- **Q12 (Where design guidance comments are posted)**: ✅ answered — A (Beads task comments)
- **Q13 (Canonical home for reusable test loop artifacts)**: ✅ answered — A (Create `.devagent/workspace/tests/` as canonical home)
- **Q14 (Beads status update semantics on QA fail)**: ✅ answered — A (Always set to `In Progress` on fail) — ⚠️ superseded by Q33 (use `open`)
- **Q15 (Minimum viable QA output artifact per run)**: ✅ answered — B (Screenshots only + Beads comments; no separate report file required)
- **Q16 (Canonical test loop folder under `.devagent/workspace/tests/`)**: ✅ answered — A (`.devagent/workspace/tests/ralph-e2e/`; optionally support plan-specific variants when reviewing a different plan)
- **Q17 (Where screenshots are stored)**: ✅ answered — A (Store under the same tests folder; e.g. per-run `screenshots/` under `.devagent/workspace/tests/...`)
- **Q18 (Use of “Blocked” on QA failure)**: ✅ answered — A (MVP: never set `blocked`) — ⚠️ superseded by Q33 (use `open` on fail)
- **Q19 (Screenshot storage policy: task hubs vs tests)**: ✅ answered — Screenshots should live in a task hub; for the resettable test loop, each run’s “task hub” lives under the tests area (e.g., `.devagent/workspace/tests/ralph-e2e/...`)
- **Q20 (Multi-plan support for `ralph-e2e`)**: ✅ answered — A (one canonical plan only)
- **Q21 (How to split `.devagent/plugins/` skills)**: ✅ answered — C (more granular skills) — ⚠️ superseded by Q23 (no plugins; use simple prompting)
- **Q22 (How QA references screenshot evidence in Beads comments)**: ✅ answered — A (link to repo file paths under `.devagent/workspace/tests/ralph-e2e/...`)
- **Q23 (Do we actually want `.devagent/plugins/` plugins/skills?)**: ✅ answered — Use **skills**, but avoid calling them “plugins” (term collision with Ralph plugin concept)
- **Q24 (Run folder naming)**: ✅ answered — Use date + Beads epic id
- **Q25 (Minimum Beads fail comment format)**: ✅ answered — A (fail reason, expected vs actual, screenshot links, doc links) — keep suggested format aligned to Constitution C6 (simplicity)
- **Q26 (Skills vs agent instructions separation)**: ✅ answered — Use tool-focused **skills** (Beads, agent-browser, Storybook) so any agent can reuse them; process-specific prompts belong in agent instructions
- **Q27 (Run folder naming exact pattern)**: ✅ answered — A (`runs/YYYY-MM-DD_<beads-epic-id>/`)
- **Q28 (Canonical skill home)**: ✅ answered — A (use `.devagent/plugins/ralph/skills/**`)
- **Q29 (Cursor skill copying behavior)**: ✅ answered — if the Ralph plugin is installed, ensure install/setup copies skills into `.cursor/skills/`
- **Q30 (Skill portability rule)**: ✅ answered — skills should be tool-focused and portable across projects; avoid referencing project-specific files
- **Q31 (Where process prompts should live)**: ✅ answered — process prompts live in agent instruction files; agent instructions can reference skills
- **Q32 (Which skills to update/create for DEV-36)**: ✅ answered — D + agent-instruction updates (create Storybook skill; adjust agent instructions to use skills)
- **Q33 (Beads status on QA fail)**: ✅ answered — B (set task back to `open`)
- **Q34 (Screenshot path decision rule)**: ✅ answered — A (special-case `ralph-e2e` run hubs; otherwise use initiating task hub screenshots)
- **Q35 (Storybook skill canonical path)**: ✅ answered — A (`.devagent/plugins/ralph/skills/storybook/SKILL.md`)
- **Q36 (`ralph-e2e` canonical layout)**: ✅ answered — A (`plan/` + `expectations/` + `runs/YYYY-MM-DD_<epic-id>/`)
- **Q37 (Which agent instruction docs to update)**: ✅ answered — “all of the agents” (needs mapping to actual files in repo)
- **Q38 (Which agent instruction docs to update - mapped)**: ✅ answered — B (update existing 4 + create `design-agent-instructions.md`)
- **Q39 (Where design agent process prompts live)**: ✅ answered — A (create `.devagent/plugins/ralph/agents/design-agent-instructions.md`; keep `design-agent.json` config-only)
- **Q40 (`ralph-e2e` expectations doc strictness)**: ✅ answered — B (guidelines; may partially apply hybrid strictness for QA gates)
- **Q41 (Per-run hub contents: screenshots vs run notes)**: ✅ answered — screenshots-only; review should compare final results against expectations doc
- **Q42 (Storybook: what if not set up?)**: ✅ answered — Storybook skill doesn’t need to handle this; instead create a task to set up Storybook for `apps/ralph-monitoring` (inspired by neighboring Reportory project)
- **Q43 (Copy skills into `.cursor/skills/`)**: ✅ answered — include in an install/setup script (assume existing script can be extended)
- **Q44 (How final run results are reviewed vs expectations)**: ⏭️ deferred (not answered in this session)
- **Q45 (Expectations doc versioning strategy)**: ⏭️ deferred (not answered in this session)
- **Q46 (Reportory Storybook setup reference source)**: ⏭️ deferred (not answered in this session)

## Task Overview

### Context
- **Task name/slug:** `DEV-36` — Improving Agent Profiles + Consistent Test Loop
- **Trigger / why now:** Linear issue created/updated on 2026-01-18; goal is to improve agent roles and establish a repeatable evaluation loop.
- **Stakeholders (initial):**
  - Jake Ruesink (requestor; authored Linear issue)
  - Jake Ruesink (decision maker for scope/sign-off)
- **Related work (initial references):**
  - `.devagent/workspace/tasks/completed/2025-12-25_pr-review-agent/research/2025-12-25_pr-review-approach.md` (context on QA/review and Linear integration)
  - `.devagent/workspace/product/mission.md` (mission alignment: reusable workflows that preserve standards)
  - `.devagent/workspace/memory/constitution.md` (C1 mission/stakeholders, C3 delivery principles, C6 simplicity)

### Clarification Sessions
- Session 1: 2026-01-18 — Participants: Jake Ruesink — Topics: kickoff, scope, stakeholders, deliverables, evidence, storage conventions

---

## Clarified Requirements

### Scope & End Goal

**What needs to be done?**
- Review and clarify DEV-36 into a plan-ready set of requirements and acceptance criteria for:
  - A stronger “design agent” role that references reusable skills (UI component awareness, design-language adherence, design references, Storybook usage, and posting guidance/comments for engineers).
  - A stronger “QA agent” role that performs quality review (framework/library doc alignment, “AI code slop” detection), verifies behavior in an agent browser, and reports pass/fail with evidence (e.g., screenshots), returning failed tasks back to `open` with rationale.
  - A consistent, resettable test loop / test project that exercises the Beads epic + Ralph flow end-to-end so we can continuously evaluate the system against expectations and identify friction points.

**What's the end goal architecture or state?**
- A repeatable agent workflow/toolkit setup where design + QA behaviors are clearly specified, packaged as skills the agents can reference, and a consistent test harness exists to validate the system continuously.

**In-scope (must-have):**
- Design agent profile improvements + skill references (as described in DEV-36)
- QA agent profile improvements + consistent QA/test loop outputs (as described in DEV-36)
- Resettable end-to-end test project/loop to evaluate Beads epic + Ralph flow (as described in DEV-36)

**Out-of-scope (won't-have):**
- ❓ unknown (to be confirmed in session)

**Nice-to-have (could be deferred):**
- ❓ unknown (to be confirmed in session)

---

### Technical Constraints & Requirements

**Constraints known so far:**
- QA agent does **not** need to make code changes; it should communicate pass/fail with evidence and rationale.
- Prefer **tool-focused skills** that agents can reference in their toolkit (usable by any agent when relevant):
  - Examples: how to work with Beads, how to run agent-browser, how to use Storybook effectively
- **Skill home (canonical):** `.devagent/plugins/ralph/skills/**` (call these “skills”, not “plugins”)
- **Cursor integration:** if the Ralph plugin is installed, ensure install/setup copies skills into `.cursor/skills/` for discovery
- **Skill portability:** skills should be reusable across projects and should not reference project-specific files
- Keep process-specific prompts in **agent instruction** files (these can reference skills).
- QA agent is allowed to move a Beads task back to **open** when it fails expectations.
- On QA “fail”, set Beads task status back to **open** (returned to the queue).
- MVP behavior: **do not** set `blocked`; use `open` for failures.
  - Note: Earlier we discussed `in_progress`; updated decision is `open` on failures.

---

### Dependencies & Blockers

**Known dependencies:**
- Linear issue `DEV-36` details (captured above)
- The “agent browser” tooling referenced in the issue:
  - `https://github.com/vercel-labs/agent-browser` (automation + screenshot capture)
  - Runbook / integration details: 🔍 needs research
- Storybook usage expectations (needs definition: existing Storybook? where? how used in this repo?)
  - Deliverable for DEV-36: a new Storybook skill doc at `.devagent/plugins/ralph/skills/storybook/SKILL.md`
  - Follow-up deliverable: set up Storybook for `apps/ralph-monitoring` to make the design-agent workflow practical (inspiration: neighboring Reportory Storybook setup)
- The definition of the “resettable test loop” plan and the “per-stage expectations” artifact format/location
  - Canonical location: `.devagent/workspace/tests/ralph-e2e/` (see layout below)

---

### Implementation Approach

**Initial approach (tentative):**
- Capture requirements and acceptance criteria for each of the three themes in DEV-36.
- Convert the “design agent” and “QA agent” expectations into reusable skill docs/patterns.
- Define a resettable “test loop” plan that can be run repeatedly to evaluate end-to-end quality.

---

### Acceptance Criteria & Verification

**How will we verify this works?**
- ❓ unknown (to be defined; likely includes:
  - design agent produces actionable UX guidance tied to existing components + references
  - QA agent produces pass/fail reports with evidence and correctly routes tasks back when failing
  - test loop can be run repeatedly and yields comparable outcomes)

**Resettable test loop intent (clarified):**
- Use a **set plan** that can be rerun through the full workflow.
- Maintain an **expectations-for-each-stage** document so we can evaluate:
  - how well the “setup beads from the plan” step went, and
  - how well each agent performed on tasks (did it do what we expect?).
- Minimum viable stages to evaluate:
  - Plan → Beads epic setup (task creation / hierarchy / metadata)
  - Task execution (engineering agent output quality)
  - QA verification (agent browser checks + screenshots + pass/fail)
  - Post-run summary (what went well, what failed, top friction points)

**QA “pass” evidence (minimum viable):**
- A written checklist + rationale
- Screenshots from the agent browser for key flows
- Links to relevant framework/library docs justifying expectations

**QA output artifacts (minimum viable):**
- Screenshots are required (captured via `vercel-labs/agent-browser`).
- Beads task comments are required (to communicate pass/fail + rationale + evidence links).
- A standalone markdown QA report file is **not required** for the MVP (can be added later if useful).
  - Screenshot storage policy: screenshots should live in a **task hub**.
    - For the resettable loop, that “task hub” is expected to live under `.devagent/workspace/tests/ralph-e2e/` (per-run), rather than under a normal feature task hub.
  - Evidence links in Beads comments: QA should link to repo file paths under `.devagent/workspace/tests/ralph-e2e/...` for screenshots and supporting artifacts.
  - Beads “fail” comment (minimum structure):
    - Fail reason
    - Expected vs actual
    - Screenshot links
    - Doc links
    - Note: keep the format simple and lightweight (Constitution C6)

**Canonical “test loop” location (clarified):**
- Canonical home: `.devagent/workspace/tests/ralph-e2e/`
- Note: You may want optional variants when reviewing a different plan (details TBD).

**Canonical `ralph-e2e` layout (clarified):**
- `.devagent/workspace/tests/ralph-e2e/plan/` (canonical plan document(s))
- `.devagent/workspace/tests/ralph-e2e/expectations/` (per-stage expectations doc)
- `.devagent/workspace/tests/ralph-e2e/runs/YYYY-MM-DD_<epic-id>/` (per-run “task hub” including screenshots)
  - Updated: per-run hubs should be **screenshots-only** (no required `run.md`), but we must still have a consistent way to review final results against the expectations doc.

**Expectations doc strictness (clarified):**
- Default: guidelines (evaluative, not a strict checklist for every stage)
- Possible hybrid: keep QA gates/evidence requirements more checklist-like while keeping design/engineering expectations looser (C6-friendly)

**Design agent output expectations (Storybook + task comments):**
- Create/update Storybook stories/docs as the artifact of design decisions
- Add design guidance as comments on engineering tasks:
  - Target: Beads task comments (source of truth for task-level guidance)

**Screenshot path rule (clarified):**
- If the epic/run is part of `ralph-e2e`, screenshots should be written under:
  - `.devagent/workspace/tests/ralph-e2e/runs/YYYY-MM-DD_<epic-id>/...`
- Otherwise, screenshots should be written under the initiating task hub:
  - `.devagent/workspace/tasks/active/YYYY-MM-DD_task-slug/screenshots/`

---

## Assumptions Log

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| DEV-36 is primarily workflow/skill + process improvements, not app feature work. | Jake Ruesink | Yes | Confirm scope during clarification | 2026-01-18 | Pending |
| “Agent browser” is available and suitable for QA evidence capture (screenshots). | ❓ unknown | Yes | Identify tool + runbook location | 2026-01-18 | Pending |

---

## Gaps Requiring Research

### For #ResearchAgent

**Research Question 1:** What existing “skills” structure/pattern should DEV-36 extend for a design agent + QA agent toolkit?
- Context: DEV-36 asks to “set up as skills” for agents to reference.
- Evidence needed: Current skill layout, conventions, and how agents discover/reference skills.
- Priority: High
- Blocks: Turning requirements into implementable artifacts.

**Research Question 2:** What is the current state of Storybook (if any) in this repo, and how should it be used to document design decisions for engineers?
- Context: DEV-36 suggests Storybook as a tool for documenting decisions and adding comments.
- Evidence needed: Existing Storybook setup and prior patterns.
- Priority: Medium
- Blocks: Defining realistic deliverables for “design agent” behavior.

**Research Question 3:** What is the current recommended pattern for implementing “skills” in this repo (structure, required files, how agents discover/reference them)?
- Context: DEV-36 wants design/QA expectations to be setup as reusable “skills”.
- Evidence needed: Existing skill conventions under `.devagent/plugins/ralph/skills/**` (e.g., `SKILL.md` layout) and how agent instruction files reference skills.
- Priority: High
- Blocks: Implementing/updating skills in the intended format.

**Research Question 4:** How should we integrate and run `vercel-labs/agent-browser` in this repo for the DEV-36 resettable loop (commands, environment, outputs, screenshot storage)?
- Context: QA verification depends on automated browser checks + screenshots.
- Evidence needed: Current local setup, scripts, CI feasibility, output locations, and any prior runs.
- Priority: High
- Blocks: Defining runnable verification and evidence artifacts.

---

## Clarification Session Log

### Session 1: 2026-01-18
**Participants:** Jake Ruesink

**Questions Asked:**
1. Must-have deliverables for DEV-36? → D (All three: design agent + QA agent + resettable test loop) (Jake Ruesink)
2. Who is the decision maker? → A (Jake Ruesink) (Jake Ruesink)
3. Clarification scope right now? → A (Full task validation) (Jake Ruesink)
4. “Skills” deliverable format/location? → A (New skill docs under `.devagent/plugins/`) (Jake Ruesink)
5. Minimum viable resettable loop? → Plan-driven full workflow run + per-stage expectations doc; evaluate Beads setup and agent performance against expectations (Jake Ruesink)
6. QA on failure: what action beyond commenting? → C (Move Beads task back to In Progress) (Jake Ruesink)
7. Stages covered by “expectations for each stage” doc? → E (All of the above: Plan→Beads setup, Task execution, QA verification, Post-run summary) (Jake Ruesink)
8. QA “pass” evidence required? → D (Checklist + screenshots + doc links) (Jake Ruesink)
9. Design agent Storybook expectations? → D (Storybook stories/docs + engineering task comments) (Jake Ruesink)
10. Where should the plan + per-stage expectations docs live? → Proposed `.devagent/workspace/tests/` (Jake Ruesink)
11. What “agent browser” tool is QA using? → `https://github.com/vercel-labs/agent-browser` (Jake Ruesink)
12. Where should design guidance comments be posted? → A (Beads task comments) (Jake Ruesink)
13. Canonical home for the reusable test loop docs? → A (Yes, standardize on `.devagent/workspace/tests/`) (Jake Ruesink)
14. On QA fail, what Beads status should be set? → A (Always set to `In Progress`; “Blocked” possibly when not fixable, criteria unknown) (Jake Ruesink)
15. Minimum viable QA output artifact? → B (Screenshots only + Beads comments) (Jake Ruesink)
16. Canonical tests path under `.devagent/workspace/tests/`? → A (`.devagent/workspace/tests/ralph-e2e/`; optional plan-specific variants) (Jake Ruesink)
17. Screenshot storage location? → A (under the same tests folder; per-run `screenshots/`) (Jake Ruesink)
18. Should QA ever set `Blocked`? → A (MVP: never set `blocked`) (Jake Ruesink)
19. Screenshot storage policy? → Screenshots should live in a task hub; for resettable test loop runs, the task hub lives under the tests area (Jake Ruesink)
20. Multi-plan support for `ralph-e2e`? → A (No; one canonical plan only) (Jake Ruesink)
21. How should we split `.devagent/plugins/` skills? → C (More granular skills) (Jake Ruesink)
22. How should QA reference screenshot evidence in Beads comments? → A (Link to repo file paths under `.devagent/workspace/tests/ralph-e2e/...`) (Jake Ruesink)
23. Do we need plugins/skills for these behaviors? → No; prefer simple prompting (especially for QA agent) (Jake Ruesink)
24. Run folder naming? → Date + Beads epic id (Jake Ruesink)
25. Minimum Beads “fail” comment format? → A (fail reason, expected vs actual, screenshot links, doc links; keep it simple per C6) (Jake Ruesink)
26. Should we use “skills” and where do process prompts live? → Use tool-focused skills (Beads/agent-browser/Storybook) for reuse; process-specific prompts live in agent instructions (Jake Ruesink)
27. Run folder naming exact pattern? → A (`runs/YYYY-MM-DD_<beads-epic-id>/`) (Jake Ruesink)
28. Where should skills live? → A (use `.devagent/plugins/ralph/skills/**`) (Jake Ruesink)
29. Should skills be copied into `.cursor/skills/`? → Yes, when Ralph plugin is installed (Jake Ruesink)
30. Should skills reference project-specific files? → No; keep skills portable/tool-focused (Jake Ruesink)
31. Where should process prompts live? → In agent instruction files; agent instructions can reference skills (Jake Ruesink)
32. Which skills to update/create? → D + adjust agent instructions to use skills (create Storybook skill; update agent instructions) (Jake Ruesink)
33. On QA fail, what Beads status? → B (`open`) (Jake Ruesink)
34. Screenshot path decision rule? → A (special-case `ralph-e2e` run hubs; otherwise initiating task hub) (Jake Ruesink)
35. Where should the Storybook skill live? → A (`.devagent/plugins/ralph/skills/storybook/SKILL.md`) (Jake Ruesink)
36. What should the canonical `ralph-e2e` layout be? → A (`plan/` + `expectations/` + `runs/YYYY-MM-DD_<epic-id>/`) (Jake Ruesink)
37. Which agent instruction files should be updated? → All of the agents (Jake Ruesink)
38. Which agent instruction docs should be updated (mapped set)? → B (update 4 existing + create `design-agent-instructions.md`) (Jake Ruesink)
39. For design agent, where should prompts live? → A (create `design-agent-instructions.md`; keep `design-agent.json` config-only) (Jake Ruesink)
40. Expectations doc strictness? → B (guidelines; maybe partially hybrid strict for QA gates) (Jake Ruesink)
41. For `ralph-e2e`, per-run hub contents? → Screenshots-only; ensure we can review final run results against expectations doc (Jake Ruesink)
42. Storybook fallback if not set up? → Skill doesn’t handle; instead create task to set up Storybook for `apps/ralph-monitoring` (inspired by Reportory) (Jake Ruesink)
43. Copy skills into `.cursor/skills/`: auto vs manual? → Make it part of an install/setup script (Jake Ruesink)

**Unanswered (deferred):**
- How do we review final run results vs expectations without a run report artifact? → ⏭️ deferred
- How should the expectations doc be versioned (single canonical vs per-run snapshot)? → ⏭️ deferred
- Where is the Reportory Storybook setup reference (repo/path/snippets)? → ⏭️ deferred

**Unresolved Items:**
- Define where the resettable plan + per-stage expectations doc(s) should live and how they are versioned (clarification)
- Define what “agent browser” tooling is and how screenshots/evidence are captured and stored (clarification)
- Decide where design agent comments should be posted (Beads vs Linear vs both) (clarification)
- Define the folder structure and naming conventions under `.devagent/workspace/tests/` for the resettable loop and screenshot outputs (clarification)
- Define the rule for when QA should mark a task as “Blocked” (if ever) vs returning it to “In Progress” (clarification)
- Decide the exact scope/content of the new Storybook skill and which agent instruction files should reference it (clarification)
- Decide the concrete files to update:
  - Agent instructions: `general-agent-instructions.md`, `implementation-agent-instructions.md`, `qa-agent-instructions.md`, `project-manager-agent-instructions.md`, plus new `design-agent-instructions.md`
  - Skills: new `skills/storybook/SKILL.md` and any updates to existing skills (agent-browser, beads-integration, plan-to-beads-conversion) (clarification)
- Define how to “review the final results of a run” against the expectations doc when the run hub itself contains only screenshots (clarification)
- Identify the Reportory Storybook setup reference (path or repo link) to copy patterns from (clarification)

---

## Next Steps

### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ✅ Research Needed | ⬜ More Clarification Needed

**Plan Readiness Assessment (current):**
- We have the scope, owners, evidence requirements, and target storage layout.
- Remaining gaps are primarily implementation details (existing skill conventions, agent-browser runbook integration, Storybook setup reference) and a missing decision on run review/expectations versioning.

**Recommended Actions (immediate):**
- `devagent research`:
  - Confirm existing Ralph skill conventions and how the install/setup copies skills into `.cursor/skills/`
  - Confirm how `vercel-labs/agent-browser` is run today in this repo (commands, outputs, screenshot paths)
  - Identify Reportory Storybook setup reference (repo/path) to replicate for `apps/ralph-monitoring`
- `devagent create-plan`:
  - Include a task to add `.devagent/plugins/ralph/skills/storybook/SKILL.md`
  - Include a task to create `.devagent/plugins/ralph/agents/design-agent-instructions.md`
  - Include a task to implement `.devagent/workspace/tests/ralph-e2e/` layout (plan/expectations/runs)
  - Include a task to set up Storybook for `apps/ralph-monitoring` (inspired by Reportory)
  - Resolve deferred items Q44–Q46 during planning

