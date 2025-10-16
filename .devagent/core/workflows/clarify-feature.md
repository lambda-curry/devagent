# Clarify Feature

## Mission
- Primary goal: Conduct structured requirement clarification sessions that validate completeness, surface ambiguities, track assumptions, and produce spec-ready requirement packets for devagent architect-spec, while maintaining full traceability of all requirement decisions and changes.
- Boundaries / non-goals: Do not make technical architecture decisions (defer to devagent architect-spec or devagent plan-tasks), do not conduct evidence-based research (escalate to devagent research-feature), do not commit to delivery dates or resource allocations. Focus solely on validating requirement completeness and clarity.
- Success signals: devagent architect-spec can draft specs without major requirement gaps, stakeholders agree on what's being built before spec work begins, requirement decisions are traceable with documented assumptions, rework due to unclear or incomplete requirements decreases over time.

## Execution Directive
When invoked with `devagent clarify-feature` and required inputs, **EXECUTE IMMEDIATELY**. Do not summarize, describe, or request approval—perform the work using available tools. The executing developer has standing approval to trigger clarification sessions immediately without scheduling separate meetings. Only pause for missing REQUIRED inputs or blocking errors.

## Inputs
- Required: Feature concept or request (from devagent brainstorm-features, ad-hoc request, or escalation from devagent architect-spec), identified stakeholders and decision makers, clarification scope (full feature validation, gap-filling, or requirements review), mission context for alignment validation.
- Optional: Existing materials (brainstorm packet, partial spec, related research, prior features), known constraints (timeline, technical, compliance), prior requirement artifacts from similar features.
- Request missing info by: Compile a structured gaps checklist mapped to the 8 clarification dimensions (Problem, Users, Success, Scope, Constraints, Principles, Dependencies, Acceptance), ping stakeholders with specific questions, and document unresolved items in the clarification packet for follow-up.

## Resource Strategy
- `.devagent/core/templates/clarification-packet-template.md` (Clarification Packet Template) — duplicate per feature and use as the output structure.
- `.devagent/core/templates/clarification-questions-framework.md` (Question Framework) — systematic question sets covering 8 requirement dimensions with ambiguity detection patterns.
- `.devagent/core/templates/spec-document-template.md` (Spec Template as Checklist) — use to validate that clarified requirements cover all sections needed for spec work.
- `.devagent/workspace/product/mission.md` — validate requirement alignment with product mission and strategic direction.
- `.devagent/workspace/memory/constitution.md` — check requirement decisions against organizational principles.
- `.devagent/workspace/features/YYYY-MM-DD_feature-slug/clarification/` — canonical storage location for clarification sessions and outputs.
- devagent create-spec — primary downstream consumer of validated requirements; escalation source for gap-filling mode.
- devagent research-feature — receives research questions for evidence gaps identified during clarification.
- devagent update-product-mission — escalation point for mission conflicts or strategic alignment questions.
- devagent brainstorm — upstream source of prioritized feature candidates requiring validation.

## Knowledge Sources
- Internal: Mission artifacts, constitution, existing specs and ADRs, feature decision logs, prior clarification sessions, analytics and user feedback archives.
- External: None directly—defer external research to devagent research-feature to maintain clear separation between clarification (what do stakeholders want) and research (what does evidence say).
- Retrieval etiquette: Reference internal artifacts with file paths, cite stakeholder decisions with names and dates, update clarification packets when new information surfaces, maintain change log for requirement evolution.

## Workflow

### Mode Selection
Choose operating mode based on invocation context:

**1. Feature Clarification (Primary Mode):**
- Trigger: New feature idea from brainstorm or ad-hoc request needs validation before spec work
- Duration: 1-3 clarification sessions depending on complexity
- Output: Complete clarified requirement packet with validation status per dimension

**2. Gap Filling (Escalation Mode):**
- Trigger: devagent create-spec or devagent research-feature identifies missing or ambiguous requirements mid-stream
- Duration: Single focused session on specific gaps
- Output: Gap-fill supplement to existing clarification packet

**3. Requirements Review (Validation Mode):**
- Trigger: Existing requirements need completeness check before proceeding to spec
- Duration: Automated scan + follow-up session if issues found
- Output: Validation report with flagged issues and completeness score

### Core Workflow (Feature Clarification Mode)

1. **Kickoff:**
   - Receive feature concept and identify invocation mode
   - Identify stakeholders (requestor, decision maker, subject matter experts)
   - Confirm clarification scope and expected timeline
   - Log initial context and trigger in clarification packet header

2. **Initial Assessment:**
   - Review existing materials (brainstorm packet, related features, prior discussions)
   - Use spec template as checklist to identify obvious gaps
   - Use question framework to prepare targeted question set
   - Classify gaps: clarifiable (ask stakeholders) vs. researchable (need evidence)

3. **Structured Inquiry:**
   - Work through 8-dimension question framework systematically:
     1. **Problem Validation:** What, who, why, evidence, why now
     2. **Users & Stakeholders:** Primary/secondary users, goals, insights
     3. **Success Criteria:** Metrics, baselines, targets, failure definition
     4. **Scope Definition:** MoSCoW (Must/Should/Could/Won't have)
     5. **Constraint Validation:** Timeline, technical, compliance, resources
     6. **Solution Principles:** Quality bars, architecture, UX, performance
     7. **Dependency & Risk:** Systems, data, technical/UX risks, assumptions
     8. **Acceptance Criteria:** Flows, error cases, testing, launch readiness
   - Document answers with stakeholder attribution
   - Probe vague language (detect: quantification missing, subject unclear, temporal ambiguity, conditional gaps, undefined terms, logical conflicts)
   - Surface and log assumptions with validation requirements
   - Identify and escalate stakeholder conflicts immediately

4. **Completeness Validation:**
   - Check clarified requirements against spec template sections
   - Score completeness per dimension (Complete / Partial / Missing)
   - Flag remaining gaps with classification (clarifiable vs. researchable)
   - Assess overall spec readiness (Ready / Research Needed / More Clarification Needed)
   - Generate completeness score (X/8 dimensions complete)

5. **Gap Triage:**
   - **Clarifiable gaps:** Schedule follow-up with specific stakeholders
   - **Researchable gaps:** Formulate research questions for devagent research-feature
   - **Mission conflicts:** Escalate to devagent update-product-mission with specific questions
   - **Technical unknowns:** Flag for devagent create-spec to address in technical notes
   - Document all gaps in clarification packet

6. **Output Packaging:**
   - Complete clarified requirement packet using template
   - Document assumption log with owners and validation methods
   - Generate research question list for devagent research-feature
   - Provide spec readiness assessment with rationale
   - Create session log with questions, answers, stakeholders, unresolved items

7. **Handoff:**
   - **For spec-ready requirements:** Hand to devagent architect-spec with validated requirement packet
   - **For research-needed requirements:** Hand to devagent research-feature with specific research questions
   - **For mission conflicts:** Escalate to devagent create-product-mission with alignment questions
   - **For clarification gaps:** Schedule follow-up session with specific stakeholder questions
   - Log handoff decisions in feature decision journal

8. **Iteration & Change Management:**
   - When new information surfaces (from research, stakeholders, or implementation), update requirement packet
   - Track all changes in packet change log with date, change description, author
   - Assess change impact: Does this affect spec? Does it require re-validation?
   - Re-run completeness validation if major changes occur
   - Notify downstream agents (devagent architect-spec) of material requirement changes

### Workflow Adaptations by Mode

**Gap Filling Mode:**
- Skip steps 1-2 (context already established)
- Focus inquiry on specific gaps identified by escalating agent
- Produce gap-fill supplement rather than full packet
- Fast-track handoff back to escalating agent

**Requirements Review Mode:**
- Start with automated completeness scan using spec template
- Flag issues: missing dimensions, ambiguous language, logical conflicts
- If scan passes: Produce validation report and proceed to spec
- If scan fails: Conduct targeted clarification session on flagged issues

## Adaptation Notes
- For simple enhancements or bug fixes, use Requirements Review mode to validate minimal requirements before spec work.
- For complex multi-stakeholder features, plan for multiple clarification cycles and document conflicts explicitly for escalation.
- For time-sensitive work, prioritize Must-have clarification and defer Should/Could-have validation to later cycles.
- When stakeholders are unavailable, document assumptions explicitly with "Validation Required: Yes" and schedule follow-up.
- For features with heavy technical uncertainty, clarify user requirements first, then escalate technical unknowns to devagent architect-spec for research coordination.

## Failure & Escalation
- **Stakeholder conflicts (disagreement on requirements):** Document both positions in clarification packet, escalate to devagent create-product-mission or decision maker, do not proceed to spec until resolved.
- **Boundary issues (clarification vs. research):** If questions require evidence gathering (user research, competitive analysis, technical spikes), stop clarification and formulate research questions for devagent research-feature.
- **Scope creep during clarification:** If stakeholders expand requirements significantly, pause clarification, document new scope, escalate to devagent create-product-mission for mission alignment check.
- **Unavailable stakeholders:** Document questions with "Unresolved - Stakeholder Unavailable," set follow-up date, proceed with partial clarification if remaining dimensions are complete.
- **Iteration limits:** If clarification cycles exceed 3 iterations without convergence, escalate to devagent create-product-mission with summary of unresolved items and request decision intervention.
- **Mission conflicts:** If requirements conflict with product mission or constitution, escalate immediately to devagent create-product-mission with specific conflict details—do not attempt to resolve.

## Expected Output

### Feature Clarification Mode
**Primary artifact:** Clarified Requirement Packet (`.devagent/workspace/features/YYYY-MM-DD_feature-slug/clarification/YYYY-MM-DD_initial-clarification.md`)

**Packet structure:**
- Feature Overview (name, requestor, stakeholders, business context, trigger)
- Validated Requirements (8 sections with validation status per dimension):
  - Problem Statement (what, who, why, evidence, validation status)
  - Success Criteria (metrics, baselines, targets, failure definition, validation status)
  - Users & Personas (primary/secondary users, goals, insights, validation status)
  - Constraints (timeline, technical, compliance, resources, validation status)
  - Scope Boundaries (in-scope, out-of-scope, ambiguous areas, validation status)
  - Solution Principles (quality bars, architecture, UX, performance, validation status)
  - Dependencies (technical, cross-team, external, validation status)
  - Acceptance Criteria (flows, error cases, testing, launch readiness, validation status)
- Assumptions Log (table: assumption, owner, validation required, validation method)
- Gaps Requiring Research (questions for devagent research-feature, evidence needed)
- Clarification Session Log (questions asked, answers, stakeholders consulted, unresolved items)
- Next Steps (spec readiness assessment, research tasks, additional consultations)
- Change Log (track requirement evolution)

### Gap Filling Mode
**Primary artifact:** Gap-Fill Supplement (`.devagent/workspace/features/YYYY-MM-DD_feature-slug/clarification/YYYY-MM-DD_gap-fill-<topic>.md`)

**Supplement structure:**
- Reference to original clarification packet
- Specific gaps addressed (dimension, original question, clarified answer)
- Updated assumptions (if any)
- Updated spec readiness assessment
- Handoff note to escalating agent

### Requirements Review Mode
**Primary artifact:** Validation Report (`.devagent/workspace/features/YYYY-MM-DD_feature-slug/clarification/YYYY-MM-DD_validation-report.md`)

**Report structure:**
- Completeness score (X/8 dimensions)
- Issues found (missing dimensions, ambiguous language, conflicts)
- Pass/fail recommendation
- Required follow-up actions (if failed)

### Communication
- Status note summarizing: clarification outcome, completeness score, spec readiness, key assumptions, unresolved items, next steps
- Stakeholder attribution for all requirement decisions
- Clear handoff to downstream workflows with specific artifacts and actions

## Follow-up Hooks
- Downstream workflows: devagent architect-spec (primary consumer of validated requirements), devagent research-feature (receives research questions from gaps), devagent plan-tasks (may reference clarification for task context)
- Upstream workflows: devagent brainstorm-features (feeds prioritized candidates), devagent create-product-mission (escalation for mission conflicts)
- Metrics / signals: Track clarification cycle count, completeness scores over time, spec rework rate due to unclear requirements, stakeholder conflict escalations
- Decision tracing: All requirement decisions logged with stakeholder attribution in clarification packet and feature decision journal
- Change impact: Track requirement changes after initial clarification, assess impact on downstream work (spec, tasks), notify affected workflows

