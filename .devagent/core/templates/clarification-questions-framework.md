# Clarification Questions Framework

**This framework is a completeness checklist, not a question template.** Use it to identify gaps in existing documentation, not to systematically ask every question.

## How to Use This Framework

1. **Analyze existing context first:** Before asking questions, analyze the task hub (AGENTS.md, existing research, plans, specs) to understand what's already documented.
2. **Identify gaps:** Compare existing documentation against the 8 dimensions below to identify missing or incomplete sections.
3. **Use for gap analysis, not questioning:** Ask targeted questions that fill the most critical gaps identified, rather than following the framework systematically.
4. **Select relevant dimensions:** Not all dimensions apply to every task. Focus on dimensions where gaps exist or where critical information is missing.
5. **Adapt questions to context:** Frame questions specifically to the task being clarified, referencing existing context where relevant.
6. **Document answers with attribution:** Record who provided each answer and when.
7. **Probe vague language:** Use ambiguity detection patterns to identify unclear requirements.
8. **Surface assumptions:** Make implicit assumptions explicit and assign validation ownership.
9. **Track unresolved items:** Document questions that require follow-up or research.

**Key principles:**
- **Gap analysis tool, not question template:** Use the framework to identify gaps in existing documentation, not to generate questions systematically.
- **Guide, not mandate:** The framework dimensions are guides for completeness, not mandates to ask every question. Adapt to task context—some dimensions may not apply.

---

## 8-Dimension Question Framework

### 1. Problem Validation

**Goal:** Validate that we're solving a real, important problem for the right people at the right time.

**Core Questions:**
1. **What specific problem are we solving?**
   - Probe: Can you describe a recent example of someone experiencing this problem?
   - Probe: What happens today when someone encounters this problem?

2. **Who experiences this problem?**
   - Probe: Can you describe the primary user persona(s)?
   - Probe: Are there secondary users affected?
   - Probe: How many users are impacted? (quantify if possible)

3. **What evidence supports this problem's importance?**
   - Probe: What user feedback have we received?
   - Probe: What do analytics tell us?
   - Probe: What competitive gaps exist?
   - Probe: What business impact does this problem have?

4. **Why is this important now?**
   - Probe: What changed to make this urgent?
   - Probe: What happens if we don't solve this?
   - Probe: What's the cost of delay?

5. **How do users currently work around this problem?**
   - Probe: What tools or processes do they use today?
   - Probe: Why are current workarounds insufficient?

6. **What would "solved" look like from the user's perspective?**
   - Probe: How would their workflow change?
   - Probe: What would they stop doing?
   - Probe: What would they start doing?

**Ambiguity Flags:**
- Watch for: "Users want this" without specifying which users
- Watch for: "It's a pain point" without quantifying impact
- Watch for: "Competitors have it" without validating user demand

---

### 2. Users & Stakeholders

**Goal:** Clearly identify all affected users, their goals, and who has decision authority.

**Core Questions:**
1. **Who are the primary users?**
   - Probe: Can you describe their role, goals, and context?
   - Probe: What are their technical skill levels?
   - Probe: What devices/platforms do they use?

2. **Who are the secondary users or affected parties?**
   - Probe: Who else interacts with this task indirectly?
   - Probe: Who supports or administers this task?

3. **What are the users' goals or jobs to be done?**
   - Probe: What are they trying to accomplish?
   - Probe: What metrics do they care about?
   - Probe: What would make them successful?

4. **What user research exists?**
   - Probe: Have we talked to users about this?
   - Probe: What insights do we have from past research?
   - Probe: What demand signals exist (support tickets, feature requests)?

5. **Who has decision authority for user needs?**
   - Probe: Who defines what users need?
   - Probe: Who can approve tradeoffs that affect users?
   - Probe: Who should validate the final solution?

6. **Are there conflicting user needs?**
   - Probe: Do different user segments want different things?
   - Probe: How will we prioritize conflicting needs?

**Ambiguity Flags:**
- Watch for: Generic "users" without specific personas
- Watch for: Assumed user needs without validation
- Watch for: Conflicting needs without prioritization

---

### 3. Success Criteria

**Goal:** Define measurable outcomes that indicate the task is achieving its intended impact.

**Core Questions:**
1. **How will we measure success?**
   - Probe: What product metrics matter? (adoption, usage, retention)
   - Probe: What business metrics matter? (revenue, cost, efficiency)
   - Probe: What user experience metrics matter? (satisfaction, task completion)

2. **What are the baseline and target metrics?**
   - Probe: What's the current state?
   - Probe: What's the success threshold?
   - Probe: What's the timeline to achieve targets?

3. **What does "good enough" look like?**
   - Probe: What's the minimum viable success?
   - Probe: What tradeoffs are acceptable to hit launch?
   - Probe: What can be deferred to v2?

4. **What would indicate failure?**
   - Probe: At what point would we stop or pivot?
   - Probe: What negative outcomes would we track?
   - Probe: What risks could undermine success?

5. **How will we track these metrics?**
   - Probe: What instrumentation is needed?
   - Probe: What dashboards or reports will we use?
   - Probe: Who will monitor and report on metrics?

6. **What's the definition of done?**
   - Probe: What must be true before we launch?
   - Probe: What validation is required?
   - Probe: Who approves launch readiness?

**Ambiguity Flags:**
- Watch for: "Improve" or "increase" without quantification
- Watch for: Metrics without baselines or targets
- Watch for: Success criteria that can't be measured
- Watch for: Vague timelines like "soon" or "eventually"

---

### 4. Scope Definition (MoSCoW Framework)

**Goal:** Establish clear boundaries for what's in scope, out of scope, and why.

**Core Questions:**
1. **What capabilities are Must-have (required for launch)?**
   - Probe: Why is each capability non-negotiable?
   - Probe: What happens if we launch without it?
   - Probe: Can any Must-haves be simplified to Should-haves?

2. **What capabilities are Should-have (important but not launch-blocking)?**
   - Probe: What value does each capability add?
   - Probe: What's the cost of deferring to v2?
   - Probe: Can we launch without these and iterate?

3. **What capabilities are Could-have (nice-to-have if time permits)?**
   - Probe: What's the incremental value?
   - Probe: What's the effort vs. impact tradeoff?

4. **What capabilities are Won't-have (explicitly out of scope)?**
   - Probe: Why are these out of scope?
   - Probe: Are these deferred to future or permanently excluded?
   - Probe: Do stakeholders agree on what's excluded?

5. **Are there ambiguous areas requiring research?**
   - Probe: What unknowns could affect scope?
   - Probe: What evidence would help us scope more accurately?

6. **How will we handle scope changes during implementation?**
   - Probe: Who can approve scope changes?
   - Probe: What's the process for evaluating change requests?

**Ambiguity Flags:**
- Watch for: Vague capabilities like "make it better"
- Watch for: Disagreement on Must-haves vs. Should-haves
- Watch for: Hidden scope in phrases like "and related tasks or features"
- Watch for: Scope creep signals like "while we're at it"

---

### 5. Constraint Validation

**Goal:** Identify and validate all timeline, technical, compliance, and resource constraints.

**Core Questions:**
1. **What timeline constraints exist?**
   - Probe: Is there a hard deadline? Why?
   - Probe: What milestones must we hit?
   - Probe: What work is blocked on this delivery?

2. **What technical constraints exist?**
   - Probe: What platform limitations apply? (browser, device, OS)
   - Probe: What performance requirements must we meet? (latency, throughput)
   - Probe: What integration requirements exist? (APIs, systems)
   - Probe: What technology stack must we use or avoid?

3. **What compliance and legal constraints exist?**
   - Probe: What regulatory requirements apply? (GDPR, HIPAA, accessibility)
   - Probe: What legal review is needed? (privacy, terms, contracts)
   - Probe: What security requirements exist? (authentication, authorization, encryption)

4. **What resource constraints exist?**
   - Probe: What team capacity is available? (engineers, designers, PMs)
   - Probe: What budget limitations apply?
   - Probe: What third-party dependencies exist? (vendors, APIs)

5. **Are these constraints negotiable?**
   - Probe: Which constraints are hard vs. soft?
   - Probe: What's the cost of relaxing constraints?
   - Probe: Who can approve constraint changes?

6. **How will constraints affect scope?**
   - Probe: What tradeoffs are required to meet constraints?
   - Probe: What's the impact if we can't meet a constraint?

**Ambiguity Flags:**
- Watch for: Deadlines without clear rationale
- Watch for: Assumed technical constraints without validation
- Watch for: Vague terms like "fast," "scalable," "secure" without quantification
- Watch for: Unvalidated assumptions about team capacity

---

### 6. Solution Principles

**Goal:** Establish guiding principles and quality bars that inform implementation decisions.

**Core Questions:**
1. **What quality bars must we meet?**
   - Probe: What accessibility level is required? (WCAG 2.1 Level AA)
   - Probe: What localization is needed? (languages, i18n)
   - Probe: What error handling is expected? (graceful degradation, fallbacks)
   - Probe: What browser/device support is required?

2. **What architecture principles apply?**
   - Probe: What scalability expectations exist?
   - Probe: What security posture is required?
   - Probe: What data architecture considerations exist?
   - Probe: What reusability or modularity is expected?

3. **What UX principles guide this work?**
   - Probe: What design system must we follow?
   - Probe: What interaction patterns should we use?
   - Probe: What content guidelines apply?
   - Probe: What consistency requirements exist?

4. **Are there non-functional requirements?**
   - Probe: What logging and monitoring is needed?
   - Probe: What backup and recovery is required?
   - Probe: What testing coverage is expected?

5. **What patterns or technologies should we prefer or avoid?**
   - Probe: What existing patterns should we reuse?
   - Probe: What technologies are encouraged or discouraged?
   - Probe: What technical debt should we avoid creating?

**Ambiguity Flags:**
- Watch for: Quality bars without specific criteria
- Watch for: Performance expectations without quantification
- Watch for: Conflicting principles (e.g., speed vs. reliability)
- Watch for: Unstated assumptions about technical approach

---

### 7. Dependency & Risk

**Goal:** Identify all dependencies (technical, organizational, external) and risks that could derail the task.

**Core Questions:**
1. **What system or technical dependencies exist?**
   - Probe: What systems must we integrate with?
   - Probe: What APIs or services do we depend on?
   - Probe: What's the status of each dependency? (available, in development, blocked)
   - Probe: Who owns each dependency?

2. **What cross-team dependencies exist?**
   - Probe: What deliverables do we need from other teams? (engineering, design, data)
   - Probe: What's the timeline for each deliverable?
   - Probe: What's the process for coordinating with other teams?

3. **What external dependencies exist?**
   - Probe: What third-party vendors or services are involved?
   - Probe: What's the contract or SLA status?
   - Probe: What's the fallback if an external dependency fails?

4. **What data dependencies exist?**
   - Probe: Where does required data come from?
   - Probe: What data quality requirements exist? (accuracy, freshness)
   - Probe: What privacy considerations apply? (PII, consent)

5. **What technical risks exist?**
   - Probe: What unknowns could delay implementation?
   - Probe: What proof-of-concepts or spikes are needed?
   - Probe: What performance or scalability risks exist?

6. **What UX or product risks exist?**
   - Probe: What user adoption risks exist?
   - Probe: What usability unknowns need validation?
   - Probe: What market or competitive risks exist?

**Assumptions to Surface:**
- What are we assuming about dependencies?
- What are we assuming about technical feasibility?
- What are we assuming about user behavior?
- Who owns validating each assumption?

**Ambiguity Flags:**
- Watch for: Unidentified dependencies
- Watch for: Risks without mitigation plans
- Watch for: Assumptions presented as facts
- Watch for: Circular dependencies between tasks

---

### 8. Acceptance Criteria

**Goal:** Define specific, testable criteria that indicate the task is complete and working as intended.

**Core Questions:**
1. **What are the critical user flows?**
   - Probe: What's the happy path for each flow?
   - Probe: What's the step-by-step user journey?
   - Probe: What's the expected outcome of each flow?

2. **What error cases must we handle?**
   - Probe: What happens when something goes wrong?
   - Probe: What error messages should users see?
   - Probe: What fallback behavior is expected?
   - Probe: How do we handle partial failures?

3. **What edge cases must we handle?**
   - Probe: What boundary conditions exist? (empty states, max limits)
   - Probe: What happens with unusual inputs?
   - Probe: What happens under high load or degraded performance?

4. **What testing is required?**
   - Probe: What unit test coverage is expected?
   - Probe: What integration tests are needed?
   - Probe: What user acceptance testing is required?
   - Probe: What performance testing is needed?

5. **What does launch readiness look like?**
   - Probe: What must be complete before launch? (tasks, testing, docs)
   - Probe: What monitoring and alerting is needed?
   - Probe: What rollout plan exists? (phasing, rollback)
   - Probe: What documentation is required? (user docs, support docs)

6. **Who approves launch?**
   - Probe: What stakeholders must sign off?
   - Probe: What criteria determine approval?
   - Probe: What's the process if issues are found?

**Ambiguity Flags:**
- Watch for: Vague acceptance criteria like "works well"
- Watch for: Missing error case handling
- Watch for: Untestable criteria
- Watch for: Unclear definition of "done"

---

## Ambiguity Detection Patterns

Use these patterns to identify and flag unclear requirements during clarification sessions.

### 1. Quantification Missing
**Pattern:** Vague qualitative terms without measurable criteria

**Examples:**
- "Fast" → How fast? (milliseconds, seconds)
- "Scalable" → How many users/requests?
- "Easy to use" → What usability metric?
- "Better" → Better than what? By how much?
- "Many users" → How many exactly?

**Clarifying Question:** "Can you quantify that?" or "What specific metric would indicate success?"

---

### 2. Subject Unclear
**Pattern:** Pronouns or generic references without clear antecedent

**Examples:**
- "They need..." → Who is "they"?
- "The system should..." → Which system?
- "Users want..." → Which user segment?
- "It should support..." → What is "it"?

**Clarifying Question:** "Who specifically?" or "Which component exactly?"

---

### 3. Temporal Ambiguity
**Pattern:** Time references without specific dates or conditions

**Examples:**
- "Soon" → By what date?
- "Eventually" → What triggers this?
- "Later" → In what release or timeframe?
- "Real-time" → What latency is acceptable?
- "Quickly" → How quickly?

**Clarifying Question:** "Can you specify a date or condition?" or "What timeline are you thinking?"

---

### 4. Conditional Gaps
**Pattern:** Requirements with conditions but unclear triggers

**Examples:**
- "If possible" → What makes it possible?
- "When ready" → What defines readiness?
- "As needed" → What triggers the need?
- "If time permits" → Must-have or Should-have?

**Clarifying Question:** "What determines whether this happens?" or "Is this required or optional?"

---

### 5. Undefined Terms
**Pattern:** Domain jargon, acronyms, or ambiguous terminology without definition

**Examples:**
- Technical jargon: "Use microservices" without architecture specifics
- Business jargon: "Increase engagement" without defining engagement
- Acronyms: "Must support SSO" without specifying protocols
- Ambiguous terms: "Modern UI" without design criteria

**Clarifying Question:** "Can you define what you mean by [term]?" or "What specifically does [term] entail?"

---

### 6. Logical Conflicts
**Pattern:** Requirements that contradict each other or create impossible conditions

**Examples:**
- "Must be simple and feature-rich"
- "Zero latency and full audit logging"
- "Instant results and comprehensive validation"
- "Minimal UI and show all information"

**Clarifying Question:** "These requirements seem to conflict—which takes priority?" or "How should we balance these tradeoffs?"

---

## Completeness Scoring Guide

Use this guide to assess requirement completeness and determine spec readiness.

### Scoring Criteria

For each of the 8 dimensions, assess completeness:
- **Complete (✅):** All core questions answered, minimal ambiguity, stakeholder validation documented
- **Partial (⚠️):** Some questions answered but significant gaps remain, moderate ambiguity, partial validation
- **Missing (❌):** Most questions unanswered, high ambiguity, no stakeholder validation

### Spec Readiness Assessment

**Overall Score:** X/8 dimensions complete

**Ready for Spec (7-8/8 complete):**
- All critical dimensions have complete or partial status
- No major ambiguities or conflicts
- Stakeholder alignment documented
- Assumptions logged with validation plan
- Handoff: Provide requirement packet to #SpecArchitect

**Research Needed (4-6/8 complete):**
- Multiple dimensions missing or have significant gaps
- Evidence gaps that stakeholders can't answer
- Technical or market unknowns requiring investigation
- Handoff: Formulate research questions for #ResearchAgent, resume clarification after research

**More Clarification Needed (0-3/8 complete):**
- Most dimensions missing or highly ambiguous
- Major stakeholder conflicts unresolved
- Scope unclear or changing
- Handoff: Schedule follow-up clarification session with specific stakeholder questions

---

## Handoff Criteria

### To #SpecArchitect (Spec-Ready Requirements)
**Criteria:**
- [ ] Problem statement complete and validated
- [ ] Success criteria defined with metrics
- [ ] Users and personas identified
- [ ] Scope boundaries clear (MoSCoW complete)
- [ ] Constraints documented and validated
- [ ] Dependencies identified with owners
- [ ] No major stakeholder conflicts
- [ ] Completeness score: 7-8/8

**Deliverable:** Clarified requirement packet with all validated requirements, assumptions log, spec readiness assessment

---

### To #ResearchAgent (Evidence Needed)
**Criteria:**
- [ ] Clarifiable requirements exhausted
- [ ] Specific research questions formulated
- [ ] Evidence gaps documented
- [ ] Research priority assigned
- [ ] Blockers identified (what can't proceed without research)

**Deliverable:** Research question list with context, evidence needed, priority, and blockers

---

### To #ProductMissionPartner (Mission Conflicts)
**Criteria:**
- [ ] Specific mission conflict identified
- [ ] Stakeholder positions documented
- [ ] Impact of conflict assessed
- [ ] Decision authority unclear or disputed

**Deliverable:** Conflict summary with positions, impact, and requested decision

---

### Follow-up Clarification (More Clarification Needed)
**Criteria:**
- [ ] Specific gaps identified
- [ ] Stakeholders for follow-up identified
- [ ] Focused question set prepared
- [ ] Target completion date set

**Deliverable:** Updated clarification packet with gap-specific questions and follow-up plan
