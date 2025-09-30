# Auto-Scaling Agent Workflow

- Owner: SpecArchitect (Jake Ruesink)
- Last Updated: 2025-09-30
- Status: Draft
- Related Feature Hub: `.devagent/features/auto-scaling-agent-workflow/`
- Stakeholders: Jake Ruesink (Executing Developer, Primary User)

## Summary

Replace the current two-lane workflow model with a single, intelligent entry point where agents self-determine their necessity based on the work's inherent complexity. This eliminates user cognitive load around "which path to take" while maintaining appropriate rigor for high-risk work. Agents will embed risk-assessment logic to auto-invoke or skip themselves, defaulting to lightweight execution for most tasks.

## Context & Problem

The current DevAgent system requires users to classify work as "Simple" or "Complex" before execution, creating unnecessary decision overhead. Developers want to say "I need X" and have the system figure out the right level of process automatically. The existing `simple-vs-complex-feature-workflows` spec introduces a two-lane model, but this still forces users to choose a path upfront. 

The real need is a **zero-choice workflow** where complexity scales naturally based on risk signals inherent in the work itself—not based on user classification. This is especially critical for a self-building system where the agent needs to work on itself without meta-confusion about which workflow to follow.

Current pain points from conversation analysis:
- "Which lane do I use?" creates cognitive overhead
- Lane terminology feels like project management ceremony
- Agents reference stakeholders, reviewers, and approval gates even for solo dev work
- The system should be smart enough to know when rigor is needed

## Objectives & Success Metrics

- **Eliminate classification step**: Zero user decisions about workflow paths; single entry point for all work
- **Auto-invocation accuracy**: ≥90% of agent invocations feel appropriate (not too heavy, not too light) based on developer feedback after 10 uses
- **Reduced friction**: Developers report that simple tasks ship faster without ceremony (baseline: current cycle time TBD via #ResearchAgent)
- **Maintained rigor**: High-risk work still gets proper vetting (0 compliance/security incidents from skipped rigor)
- **Self-referential clarity**: When DevAgent works on itself, the workflow feels natural without meta-confusion

## Users & Insights

**Primary User**: Solo developer (Jake Ruesink) working on DevAgent itself and Lambda Curry client projects

**Key Insights** (from conversation):
- "I don't want lanes or paths to choose from"
- "The user shouldn't need to worry about which workflow to take"
- "It's a fine line to instruct an agent that's helping build itself"
- Need: "Just tell me what you need, and the system figures out the rest"

**Mental Model Shift**:
- Before: "Is this simple or complex?" → Choose lane → Execute
- After: "I need to add auth" → System assesses → Right agents auto-invoke

## Solution Principles

1. **Single entry point**: One workflow, not multiple paths to choose between
2. **Agents self-determine**: Each agent has built-in "Should I run?" logic
3. **Default lightweight**: Bias toward execution; add rigor only when risk signals detected
4. **Risk-driven escalation**: Complexity emerges from the work itself, not user declaration
5. **Solo-dev-first**: Assume single developer unless work inherently requires coordination
6. **No ceremony by default**: Approvals, stakeholders, reviewers are exceptions, not defaults
7. **Self-referential consistency**: The system should work on itself using the same workflow it provides to users

## Scope Definition

- **In Scope:**
  - Remove "Simple vs Complex" classification system
  - Embed risk-assessment logic in each agent prompt
  - Define objective risk triggers that auto-invoke agents
  - Update `AGENTS.md` to describe auto-scaling behavior
  - Revise all agent prompts to remove team/stakeholder assumptions
  - Create decision tree for "when does each agent run?"
  - Update governance docs to reflect single-workflow model

- **Out of Scope / Future:**
  - Automated tooling or CLI changes (manual agent invocation remains)
  - Analytics dashboard for workflow metrics
  - Multi-developer coordination patterns (stay focused on solo dev)
  - Integration with external project management tools

## Functional Narrative

### Universal Entry Point

**Trigger**: Developer identifies any need (feature, fix, refactor, research)

**Experience narrative**: Developer states their goal naturally: "Add OAuth support," "Fix the login bug," "Research deployment options." No classification step. The system documentation shows a single workflow with embedded decision logic that developers can reference if curious, but they don't need to think about it actively.

**Acceptance criteria**:
- Documentation presents one workflow, not multiple paths
- No "classify your work" step exists
- Developers can state needs in natural language
- System behavior is predictable based on risk signals

### Agent Self-Assessment: #ResearchAgent

**Trigger**: Request involves unknowns, new technology, or evidence gaps

**Auto-invocation logic** (embedded in agent prompt):
```
Run #ResearchAgent if:
- Request mentions technology/pattern not currently used in codebase
- Developer explicitly asks "research X" or "investigate Y"
- Spec references missing evidence or unvalidated assumptions
- Request involves compliance, security, or regulatory considerations

Skip #ResearchAgent if:
- Work is routine maintenance or minor updates to existing code
- All required context is already documented
- Developer has already provided research/context
```

**Experience narrative**: When risk signals trigger research needs, the agent invokes itself. For "Add a button to homepage," no research needed—skip. For "Evaluate Supabase vs Firebase for auth," research auto-invokes.

**Acceptance criteria**:
- Agent prompt includes clear "Should I run?" decision tree
- Research happens only when unknowns exist
- Developers can manually invoke if they disagree with auto-assessment

### Agent Self-Assessment: #SpecArchitect

**Trigger**: Work has significant scope, cross-system impact, or irreversibility

**Auto-invocation logic**:
```
Run #SpecArchitect if:
- Changes affect >3 files or multiple system boundaries
- Work involves database schema changes or data migrations
- Irreversible decisions (e.g., public API design, architectural patterns)
- Compliance, security, or accessibility requirements present
- Developer explicitly requests a spec
- #ResearchAgent output flags high-impact unknowns

Skip #SpecArchitect if:
- Single-file changes or isolated bug fixes
- Work is reversible and low-risk
- Context fits in a task prompt (< 500 words)
```

**Experience narrative**: For "Refactor authentication system," spec auto-invokes due to cross-system impact. For "Fix typo in button text," skip—no spec needed.

**Acceptance criteria**:
- Spec creation happens for high-impact work only
- Low-risk work skips directly to execution
- Clear documentation of what triggers spec creation

### Agent Self-Assessment: #TaskPlanner

**Trigger**: Spec is complex enough to need sequencing or has dependency chains

**Auto-invocation logic**:
```
Run #TaskPlanner if:
- Spec defines >5 acceptance criteria
- Work has external dependencies or sequencing constraints
- Multiple phases or rollout stages exist
- Parallel work streams need coordination
- Developer explicitly requests task breakdown

Skip #TaskPlanner if:
- Spec is straightforward single-phase work
- #TaskExecutor can derive steps from spec directly
- Work fits in a single implementation session
```

**Experience narrative**: For multi-phase migrations or features with dependencies, planning auto-invokes. For straightforward implementations, skip to execution.

**Acceptance criteria**:
- Planning happens only when complexity demands it
- Simple specs skip directly to execution
- Developers can request planning even if auto-assessment says skip

### Agent Self-Assessment: #TaskExecutor

**Trigger**: Always runs—this is the default endpoint

**Auto-invocation logic**:
```
#TaskExecutor always runs.
Inputs vary based on upstream agents:
- With full chain: Consumes spec + task plan
- With spec only: Derives tasks from spec
- With research only: Uses research + task prompt
- Standalone: Works from minimal prompt

Execution rigor scales to input:
- Full chain: Follow detailed acceptance criteria
- Lightweight: Focus on core functionality, document assumptions
```

**Experience narrative**: Whether "Add OAuth" came through full chain or standalone prompt, #TaskExecutor always executes. The difference is input quality and validation depth, not whether execution happens.

**Acceptance criteria**:
- All work paths lead to execution
- Executor adapts to available context
- Lightweight work doesn't block on missing ceremony

### Escalation During Execution

**Trigger**: New risk signals emerge during any agent's work

**Experience narrative**: While executing a "simple" task, developer discovers it touches authentication, triggers compliance review, or reveals data migration needs. Any agent can pause and auto-invoke upstream agents. Log the escalation reason. Continue with appropriate rigor.

**Acceptance criteria**:
- Agents can invoke other agents mid-stream
- Escalation reason is documented
- Work doesn't get stuck; it adapts

## Experience References

### Decision Tree (Visual)

```
Developer Request
       ↓
   Need research? (auto-check: unknowns, new tech, compliance)
   ↓ YES                    ↓ NO
#ResearchAgent              ↓
       ↓                    ↓
   Need spec? (auto-check: scope, irreversibility, multi-system)
   ↓ YES                    ↓ NO
#SpecArchitect              ↓
       ↓                    ↓
   Need planning? (auto-check: dependencies, phases, >5 criteria)
   ↓ YES                    ↓ NO
#TaskPlanner                ↓
       ↓ ← ← ← ← ← ← ← ← ← ↓
           #TaskExecutor (always runs)
```

### Example Flows

**Example 1: Simple Task**
- Request: "Fix login button color"
- Auto-assessment: No unknowns, single-file, reversible → Skip to #TaskExecutor
- Flow: Request → Execute

**Example 2: Medium Complexity**
- Request: "Add email validation to signup form"
- Auto-assessment: Touches 2-3 files, minor validation logic → Skip research, minimal spec or direct to #TaskExecutor with clear prompt
- Flow: Request → (Optional quick spec) → Execute

**Example 3: High Complexity**
- Request: "Implement OAuth authentication"
- Auto-assessment: New tech (research), multi-system (spec), dependencies (planning)
- Flow: Request → Research → Spec → Plan → Execute

**Example 4: Meta-Complexity (Self-Building)**
- Request: "Update #SpecArchitect agent prompt to remove stakeholder language"
- Auto-assessment: Changes agent behavior (spec to document why), affects system (planning for rollout)
- Flow: Request → Spec (this document!) → Plan → Execute

## Technical Notes & Dependencies

### Agent Prompt Updates Required

Each agent prompt needs a new section:

```markdown
## Self-Assessment Logic

Before running, evaluate:
[Risk triggers specific to this agent]

If no triggers match AND developer hasn't explicitly invoked you:
- Log: "Skipping [AgentName] - no risk triggers detected"
- Pass context to next agent in chain or to #TaskExecutor

If any trigger matches OR developer explicitly invoked you:
- Proceed with full workflow
- Log: "Running [AgentName] due to: [trigger list]"
```

### Changes to AGENTS.md

- Remove "simple vs complex" language
- Add "How Agents Self-Determine" section
- Document risk triggers per agent
- Emphasize default lightweight path

### Changes to Agent Guides

- Remove: "stakeholder," "mandatory reviewers," "approval gates" as defaults
- Change: "workshops," "facilitation" → "async decision capture"
- Add: "Should I run?" decision tree
- Emphasize: Solo developer as default, team coordination as exception

### Governance Updates

- Update `.devagent/governance/assumptions.md` to remove lane-based assumptions
- Simplify decision journal to quick-log format
- Remove ceremony around classification

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Risk triggers might be too permissive (agents skip when they shouldn't) | Risk | Jake | Start conservative (lower thresholds), monitor escalation rate, tune based on feedback. Manual override always available. | 2025-10-07 |
| Risk triggers might be too strict (agents run when unnecessary) | Risk | Jake | Monitor for ceremony complaints, track agent invocations per request type, adjust triggers | 2025-10-07 |
| Developers might not trust auto-assessment | Risk | Jake | ✅ MITIGATED: Provide override mechanism (use agent hash), clear logging of decisions, and feedback loop after 10 uses | 2025-10-05 |
| Self-referential confusion when DevAgent works on itself | Question | Jake | ✅ RESOLVED: Document meta-workflow example (like this spec!). See Example 4 in Functional Narrative. | 2025-10-03 |
| How to handle mid-execution escalation cleanly? | Question | Jake | ✅ RESOLVED: Documented in "Mid-Stream Escalation Protocol" section above | 2025-10-04 |
| Baseline metrics for current cycle time missing | Question | #ResearchAgent | ✅ IN PROGRESS: Recommend 2-week baseline capture. Metrics: time to first commit, agents invoked, escalation rate, satisfaction. See research packet. | 2025-10-05 |
| False negatives (work seems simple but isn't) | Risk | Jake | Mid-stream escalation handles this. Monitor escalation rate as key metric—high rate indicates triggers need tuning. | 2025-10-10 |
| Context handoff format undefined | Question | Jake | ✅ PROPOSED: Lightweight structure in "Mid-Stream Escalation Protocol". Review after Phase 1. | 2025-10-06 |

## Delivery Plan

**Phase 1: Documentation & Logic (Days 1-3)**
- Update AGENTS.md with auto-scaling model
- Add "Self-Assessment Logic" section to each agent prompt
- Document risk triggers and decision trees
- Remove lane-based language from all docs

**Phase 2: Governance Cleanup (Days 3-5)**
- Audit `.devagent/governance/assumptions.md`
- Simplify decision journal format
- Remove stakeholder/reviewer ceremony from agent prompts
- Update constitution if needed

**Phase 3: Validation (Days 5-7)**
- Test on 3-5 real tasks of varying complexity
- Verify auto-assessment feels natural
- Adjust risk triggers based on feedback
- Document examples of each flow

**Phase 4: Meta-Test (Day 7+)**
- Use new workflow to implement itself (next iteration of improvements)
- Validate self-referential clarity
- Capture lessons learned

## Approval & Ops Readiness

- **Approval**: Jake Ruesink (executing developer) sign-off after Phase 3 validation
- **Ops Readiness**: Update onboarding docs, create quick-start guide showing the single entry point
- **Communication**: Slack update to Lambda Curry team explaining new model

## Self-Assessment Logic Pattern (Common to All Agents)

All agents use this common pattern to determine if they should run:

```
1. Parse Request
   - Extract keywords, scope indicators, and risk signals
   - Identify explicit agent invocations (e.g., "research X")

2. Query Context
   - Codebase impact: file count, directories touched, pattern presence
   - Dependencies: external systems, data migrations, API changes
   - Existing artifacts: specs, research, prior decisions

3. Evaluate Risk Triggers
   - Check agent-specific trigger list (see below)
   - Calculate quantifiable metrics (file count, criteria count, etc.)
   - Detect semantic patterns (security keywords, compliance terms)

4. Make Decision
   - IF any trigger matches OR developer explicitly invoked → RUN
   - ELSE → SKIP and pass context to next agent

5. Log Decision
   - Record: agent name, decision (run/skip), trigger matches, timestamp
   - Format: "Running [Agent] due to: [trigger list]" OR "Skipping [Agent] - no triggers"
   - Store in decision journal or feature hub
```

### Manual Override

Developers can always invoke agents explicitly by using the agent hash (e.g., `#ResearchAgent`) in their request, which bypasses auto-assessment. This is the escape hatch for when auto-assessment misses nuance.

## Mid-Stream Escalation Protocol

**When**: Any agent discovers new risk signals during execution that weren't apparent at intake

**Process**:
1. Agent pauses current work
2. Documents the new trigger (what was discovered and why it matters)
3. Logs escalation: "Escalating from [CurrentAgent] to [UpstreamAgent] due to: [reason]"
4. Packages context handoff with:
   - Request summary
   - Work completed so far
   - New risk trigger details
   - Links to artifacts created
   - Recommended next steps
5. Invokes upstream agent(s) as needed
6. Resumes work once upstream agents complete (or terminates if pivot required)

**Example**: TaskExecutor discovers during implementation that "simple" form change actually requires database migration → Escalates to SpecArchitect to properly spec the migration → Returns to execution with full spec

## Risk Trigger Examples & Non-Examples

### ResearchAgent Triggers

**Trigger: New Technology/Pattern**
- ✅ Match: "Add OAuth authentication" (OAuth not currently in codebase)
- ✅ Match: "Integrate Stripe payment" (Stripe not present)
- 🚫 Skip: "Update login button color" (existing pattern)

**Trigger: Compliance/Security Keywords**
- ✅ Match: "Add GDPR consent flow"
- ✅ Match: "Implement user data export"
- ✅ Match: "Add security headers"
- 🚫 Skip: "Fix button alignment"

### SpecArchitect Triggers

**Trigger: Multi-File Changes (>3 files)**
- ✅ Match: Refactoring that touches auth, user model, permissions, middleware
- 🚫 Skip: Single component bug fix
- 🚫 Skip: Update two related files for feature

**Trigger: Database Changes**
- ✅ Match: "Add user preferences table"
- ✅ Match: "Migrate sessions to Redis"
- 🚫 Skip: "Update UI component state"

**Trigger: Irreversible Decisions**
- ✅ Match: "Design public REST API endpoints"
- ✅ Match: "Choose between MongoDB and Postgres"
- 🚫 Skip: "Refactor internal helper function"

### TaskPlanner Triggers

**Trigger: >5 Acceptance Criteria**
- ✅ Match: Spec with 8 acceptance criteria across multiple flows
- 🚫 Skip: Spec with 3 straightforward acceptance criteria

**Trigger: External Dependencies**
- ✅ Match: "Depends on API team shipping v2 endpoint first"
- ✅ Match: "Requires staging environment setup"
- 🚫 Skip: "Standalone feature, no external deps"

## Industry Pattern References

This auto-scaling approach aligns with emerging patterns in production AI agent systems:

- **RobustFlow** (arXiv:2509.21834): Emphasizes workflow consistency through invariant triggers rather than brittle classification
- **GraphScout** (OrKA-reasoning): Self-discovering paths based on graph structure vs. static routing
- **Hierarchical Supervisor Patterns**: Adaptive delegation based on dynamic complexity assessment

These patterns validate our approach: *intelligent workflows should explore their context and decide dynamically, not follow pre-written classification rules.*

**Citations**:
- RobustFlow: https://arxiv.org/abs/2509.21834
- GraphScout: https://dev.to/marcosomma/graphscout-self-discovering-paths-in-orka-348k
- Adaptive Cybersecurity: https://arxiv.org/abs/2509.20640

## Appendices & References

- Conversation thread: Jake's Slack messages on 2025-09-30 re: complexity concerns
- Existing spec: `.devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md` (superseded by this approach)
- Research packet: `.devagent/features/auto-scaling-agent-workflow/research/2025-09-30_auto-scaling-workflow-research.md`
- Product mission: `.devagent/product/mission.md`
- Agent roster: `AGENTS.md`

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2025-09-30 | Initial draft based on conversation with Jake re: removing lane concept | SpecArchitect (Jake Ruesink) |
| 2025-09-30 | Research completed: Added industry pattern validation (RobustFlow, GraphScout), quantified risk triggers, validated current agent readiness | #ResearchAgent (Jake Ruesink) |
| 2025-09-30 | Enhanced spec: Added Self-Assessment Logic Pattern section, Mid-Stream Escalation Protocol, Risk Trigger Examples, Industry Pattern References, updated Risks & Open Questions with research findings | SpecArchitect (Jake Ruesink) |
