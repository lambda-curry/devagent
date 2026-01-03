# Clarified Requirement Packet — <Task Name>

- Requestor: <Name (Role)>
- Decision Maker: <Name (Role)>
- Date: <YYYY-MM-DD>
- Mode: <Task Clarification | Gap Filling | Requirements Review>
- Status: <In Progress | Complete | Pending Research>
- Related Task Hub: `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/`
- Notes: Update validation status per dimension as clarification progresses. Use checkboxes for completion tracking.

**Template Usage Notes:**
- This template is flexible—remove sections that are not applicable to your task.
- Document answers incrementally as they come during clarification sessions; don't wait for all dimensions to be complete.
- Focus on documenting what's relevant and valuable for your specific task context.

## Task Overview

### Context
- **Task name/slug:** <short identifier>
- **Business context:** <Why now? What triggered this request?>
- **Stakeholders:** <List: Name (Role, Decision Authority)>
- **Prior work:** <Links to brainstorm packets, related tasks, prior discussions>

### Clarification Sessions
- Session 1: <YYYY-MM-DD> — <Participants, topics covered>
- Session 2: <YYYY-MM-DD> — <Participants, topics covered>

---

## Validated Requirements

**Documentation approach:** Fill in sections incrementally as clarification progresses. Don't wait for all dimensions to be complete—document answers as they come during the clarification session. Remove sections that are not applicable to your task.

### 1. Problem Statement
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**What problem are we solving?**
<Describe the core problem in 1-2 sentences>

**Who experiences this problem?**
<Primary users/personas affected>

**What evidence supports this problem's importance?**
<User feedback, analytics, competitive gaps, business data>

**Why is this important now?**
<Business trigger, market timing, strategic alignment>

**Validated by:** <Stakeholder name(s), date>

---

### 2. Success Criteria
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Product metrics:**
- Metric: <What we're measuring>
- Baseline: <Current state>
- Target: <Success threshold>
- Timeline: <When we expect to hit target>

**Business metrics:**
- <Revenue, cost savings, efficiency gains>

**User experience metrics:**
- <Satisfaction, adoption, engagement>

**Definition of "good enough":**
<What is the minimum viable success?>

**What would indicate failure?**
<Conditions that would signal we should stop or pivot>

**Validated by:** <Stakeholder name(s), date>

---

### 3. Users & Personas
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Primary users:**
- Persona: <Name/description>
- Goals: <What they're trying to accomplish>
- Current pain: <How they solve this today>
- Expected benefit: <What this task enables>

**Secondary users:**
- <If applicable>

**User insights:**
- <Research findings, feedback themes, demand signals>

**Decision authority for user needs:**
<Who has final say on user requirements?>

**Validated by:** <Stakeholder name(s), date>

---

### 4. Constraints
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Timeline constraints:**
- Hard deadline: <Date and reason>
- Soft target: <Preferred timeline>
- Milestone dependencies: <Other work blocked on this>

**Technical constraints:**
- Platform limitations: <iOS/Android/Web requirements>
- Integration requirements: <Systems we must work with>
- Browser/device support: <Compatibility requirements>

**Compliance & legal constraints:**
- Regulatory requirements: <GDPR, HIPAA, accessibility>
- Legal review needed: <Privacy, terms, contracts>
- Security requirements: <Authentication, authorization, data handling>

**Resource constraints:**
- Team capacity: <Available engineers, designers>
- Budget: <Cost limitations>
- Third-party dependencies: <Vendor availability, API limits>

**Validated by:** <Stakeholder name(s), date>

---

### 5. Scope Boundaries
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Must-have (required for launch):**
- <Capability 1>
- <Capability 2>

**Should-have (important but not launch-blocking):**
- <Capability 3>
- <Capability 4>

**Could-have (nice-to-have if time permits):**
- <Capability 5>

**Won't-have (explicitly out of scope):**
- <Capability 6 — deferred to future>
- <Capability 7 — not aligned with mission>

**Ambiguous areas requiring research:**
- <Unclear capability — needs evidence>

**Scope change process:**
<How will we handle scope changes during implementation?>

**Validated by:** <Stakeholder name(s), date>

---

### 6. Solution Principles
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Quality bars:**
- Accessibility: <WCAG level, screen reader support>
- Localization: <Languages, i18n requirements>
- Error handling: <Graceful degradation, fallback behavior>

**Architecture principles:**
- <Scalability expectations>
- <Security posture>
- <Data architecture considerations>

**UX principles:**
- <Design system alignment>
- <Interaction patterns>
- <Content guidelines>

**Performance expectations:**
- Page load: <Target time>
- Response time: <API latency>
- Throughput: <Requests per second>

**Validated by:** <Stakeholder name(s), date>

---

### 7. Dependencies
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Technical dependencies:**
- System: <What we depend on>
- Status: <Available | In Development | Blocked>
- Owner: <Team/person responsible>
- Risk: <Impact if delayed>

**Cross-team dependencies:**
- Team: <Engineering, Design, Data>
- Deliverable: <What we need>
- Timeline: <When we need it>
- Status: <Confirmed | Pending>

**External dependencies:**
- Vendor/API: <Third-party service>
- Contract status: <Signed | In Negotiation>
- SLA: <Uptime, support>

**Data dependencies:**
- Data source: <Where data comes from>
- Quality requirements: <Accuracy, freshness>
- Privacy considerations: <PII, consent>

**Validated by:** <Stakeholder name(s), date>

---

### 8. Acceptance Criteria
**Validation Status:** ⬜ Complete | ⬜ Partial | ⬜ Missing

**Critical user flows:**
- Flow: <User journey description>
- Happy path: <Successful completion criteria>
- Error cases: <What happens when things go wrong>
- Edge cases: <Boundary conditions to handle>

**Error handling requirements:**
- <Specific error scenarios and expected behavior>

**Testing approach:**
- Unit testing: <Coverage expectations>
- Integration testing: <Key integration points>
- User testing: <Validation plan>
- Performance testing: <Load testing criteria>

**Launch readiness definition:**
- [ ] Task complete (all Must-haves implemented)
- [ ] Testing complete (all acceptance criteria met)
- [ ] Documentation complete (user docs, support docs)
- [ ] Monitoring in place (alerts, dashboards)
- [ ] Rollout plan approved (phasing, rollback)

**Validated by:** <Stakeholder name(s), date>

---

## Assumptions Log

Track assumptions made during clarification that require validation.

| Assumption | Owner | Validation Required | Validation Method | Due Date | Status |
| --- | --- | --- | --- | --- | --- |
| <What we're assuming to be true> | <Name> | Yes/No | <How we'll validate> | <YYYY-MM-DD> | <Pending/Validated/Invalidated> |

---

## Gaps Requiring Research

Questions that cannot be answered through stakeholder clarification and require evidence gathering.

### For #ResearchAgent

**Research Question 1:** <Specific question>
- Context: <Why we need this>
- Evidence needed: <What would answer this>
- Priority: <High | Medium | Low>
- Blocks: <What can't proceed without this>

**Research Question 2:** <Specific question>
- Context: <Why we need this>
- Evidence needed: <What would answer this>
- Priority: <High | Medium | Low>
- Blocks: <What can't proceed without this>

---

## Clarification Session Log

### Session 1: <YYYY-MM-DD>
**Participants:** <Names and roles>

**Questions Asked:**
1. <Question> → <Answer> (<Stakeholder name>)
2. <Question> → <Answer> (<Stakeholder name>)

**Ambiguities Surfaced:**
- <Vague term or unclear requirement> → <Clarification needed>

**Conflicts Identified:**
- <Conflicting requirement 1> vs. <Conflicting requirement 2>
- Resolution: <How resolved or escalated>

**Unresolved Items:**
- <Item requiring follow-up>
- Owner: <Who will resolve>
- Due: <When>

### Session 2: <YYYY-MM-DD>
<Repeat structure>

---

## Next Steps

### Spec Readiness Assessment
**Status:** ⬜ Ready for Spec | ⬜ Research Needed | ⬜ More Clarification Needed

**Readiness Score:** <X/8 dimensions complete>

**Completeness by Dimension:**
- Problem Statement: ✅ | ⚠️ | ❌
- Success Criteria: ✅ | ⚠️ | ❌
- Users: ✅ | ⚠️ | ❌
- Constraints: ✅ | ⚠️ | ❌
- Scope: ✅ | ⚠️ | ❌
- Principles: ✅ | ⚠️ | ❌
- Dependencies: ✅ | ⚠️ | ❌
- Acceptance: ✅ | ⚠️ | ❌

**Rationale:**
<Why ready or not ready for spec work>

### Recommended Actions

**If spec-ready:**
- [ ] Hand validated requirement packet to #SpecArchitect
- [ ] Provide link to this clarification packet
- [ ] Highlight key decisions and assumptions

**If research needed:**
- [ ] Hand research questions to #ResearchAgent
- [ ] Specify evidence needed and priority
- [ ] Schedule follow-up clarification after research

**If more clarification needed:**
- [ ] Schedule follow-up with <specific stakeholders>
- [ ] Focus on <specific dimensions>
- [ ] Target completion: <Date>

**If mission conflicts exist:**
- [ ] Escalate to #ProductMissionPartner
- [ ] Document specific conflicts
- [ ] Pause clarification pending resolution

---
