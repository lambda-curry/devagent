# Context-Aware Questioning Patterns Research

- Research Date: 2025-12-30
- Feature: Improve Interactive Workflows
- Researcher: Research workflow execution
- Classification: Prompt Engineering Research

## Problem Statement

Update both `clarify-feature` and `brainstorm` workflows to use targeted, context-aware questions that are specific to the feature hub or artifact being worked on. Instead of following rigid templates (8-dimension framework for clarify-feature, phase-based structure for brainstorm), workflows should analyze existing context first, then ask thoughtful questions 2-3 at a time that are relevant to what's already known, updating the clarification/brainstorm document after each round until the user indicates they're done.

**Key Constraint:** This is a prompt engineering challenge. Workflows are conversation prompts, not code. We need to structure prompts to guide the AI to analyze context before asking questions, then adapt questions based on what's already documented.

## Research Plan

**Validation Targets:**
1. Prompt patterns for context analysis before questioning (reading feature hubs, existing artifacts)
2. How to structure prompts to guide AI to identify gaps and ask targeted questions
3. Patterns for adaptive questioning based on feature type, complexity, and existing documentation
4. How to balance structure (ensuring completeness) with flexibility (context-aware adaptation)
5. Question prioritization strategies (what to ask first based on context gaps)
6. Patterns for updating documents incrementally during conversation

## Sources

### Internal Context

**Current Workflow Structure:**
- `.devagent/core/workflows/clarify-feature.md` (2025-12-30) — Uses 8-dimension question framework systematically, asks questions in batches of 2-3 but follows rigid template
- `.devagent/core/workflows/brainstorm.md` (2025-12-30) — Uses phase-based structure with templated questions (Problem → Ideas → Clustering → Evaluation → Prioritization)
- `.devagent/core/templates/clarification-questions-framework.md` (2025-12-30) — Systematic question sets covering 8 requirement dimensions with core questions and probes
- `.devagent/core/templates/clarification-packet-template.md` (2025-12-30) — Structured output template with 8 requirement dimensions
- `.devagent/core/templates/brainstorm-packet-template.md` (2025-12-30) — Structured output template with phases

**Previous Work:**
- `.devagent/workspace/features/completed/2025-12-14_interactive-brainstorm-clarify/` (2025-12-14) — Made workflows interactive with question batching and progress tracking, but still used rigid templates
- Key finding from previous work: Interactive batching (2-3 questions at a time) works well, but questions still followed systematic frameworks rather than adapting to context

**Key Observations:**
- Current workflows use systematic frameworks (8 dimensions, 5 phases) that ensure completeness but may ask irrelevant questions
- Feature hubs contain rich context (AGENTS.md, existing research, plans, specs) that could inform which questions are most relevant
- Constitution C3 emphasizes "human-in-the-loop defaults" — context-aware questions align with this principle
- Workflows should analyze existing artifacts before asking questions to avoid redundant or irrelevant inquiries

### External Research

**1. Context Analysis in Conversational AI**
- **Source:** Prompt engineering best practices, conversational AI design patterns
- **Key Findings:**
  - Before asking questions, AI should analyze available context (documents, previous conversations, artifacts)
  - Identify what's already known vs. what's missing
  - Prioritize questions that fill the most critical gaps
  - Adapt question depth based on existing documentation quality
- **Relevance:** Directly applicable to making workflows context-aware

**2. Adaptive Questioning Patterns**
- **Source:** UX research, interview techniques, conversational design
- **Key Findings:**
  - Start with broad context-gathering questions, then narrow based on responses
  - Skip questions that are already answered in existing documentation
  - Ask follow-up questions based on what the user reveals, not just a template
  - Use "tell me more about X" patterns when context suggests a topic needs deeper exploration
- **Relevance:** Informs how to structure prompts for adaptive questioning

**3. Gap Analysis in Requirements Gathering**
- **Source:** Requirements engineering, business analysis practices
- **Key Findings:**
  - Compare existing documentation against a completeness checklist
  - Identify missing dimensions or incomplete sections
  - Prioritize questions that address the highest-risk gaps first
  - Use existing artifacts to infer answers where possible, then confirm with user
- **Relevance:** Helps structure context analysis before questioning

## Findings & Recommendations

### Prompt Engineering Strategy

**Core Principle:** Structure workflow prompts to guide the AI to analyze existing context first, identify gaps, then ask targeted questions that fill those gaps rather than following a rigid template.

**Key Prompt Patterns:**

1. **Context Analysis Instructions**
   - Instruct AI: "Before asking any questions, analyze the feature hub and existing artifacts to understand what's already known"
   - Provide explicit guidance: "Read the feature hub's AGENTS.md, any existing research, plans, or specs to identify what information is already documented"
   - Use gap analysis: "Compare existing documentation against the template structure to identify missing or incomplete sections"
   - Prioritize gaps: "Focus questions on the most critical gaps first, especially those that block downstream work"

2. **Adaptive Question Selection**
   - Instruct AI: "Based on what you've learned from the context, ask 2-3 targeted questions that address the most important gaps"
   - Provide guidance: "If the feature hub already has a clear problem statement, skip problem validation questions and focus on other gaps"
   - Use conditional logic: "If existing research covers user needs, ask about implementation constraints instead"
   - Adapt depth: "If documentation is sparse, ask foundational questions. If documentation is detailed, ask clarifying or validation questions"

3. **Context-Aware Question Framing**
   - Reference existing context: "I see from your feature hub that you've already documented [X]. Let me ask about [Y] to build on that"
   - Build on previous answers: "Based on your answer about [previous topic], I'm curious about [related topic]"
   - Skip redundant questions: "I notice your AGENTS.md already covers [topic], so I'll focus on [other topic]"
   - Validate assumptions: "From your existing documentation, it looks like [assumption]. Is that correct, or should we clarify?"

4. **Incremental Document Updates**
   - Instruct AI: "After each round of questions and answers, update the clarification/brainstorm document with the new information"
   - Provide structure: "Add answers to the appropriate sections, mark questions as answered, and identify the next gaps to address"
   - Track progress: "Show what's been filled in and what gaps remain before asking the next batch of questions"

### For Clarify-Feature Workflow

**Prompt Structure:**
```
1. Context Analysis Phase:
   - "Let me first review your feature hub to understand what's already documented"
   - Read AGENTS.md, existing research, plans, specs, or other artifacts
   - Identify what's already covered vs. what's missing
   - Compare against the 8-dimension framework to find gaps

2. Targeted Questioning Phase:
   - "Based on what I've reviewed, I see you've already documented [X]. Let me ask about [Y] to fill in the gaps"
   - Ask 2-3 questions targeting the most critical gaps
   - Frame questions specifically to the feature context (e.g., "For this workflow improvement feature, what specific user pain points are you addressing?")

3. Incremental Updates:
   - After each round of answers, update the clarification document
   - Show progress: "I've updated the clarification document with your answers about [topic]. We still need to cover [remaining gaps]"
   - Continue until user indicates done or all critical gaps are filled
```

**Key Prompt Instructions:**
- "Before asking questions, analyze the feature hub at [path] to understand existing context"
- "Read AGENTS.md, research files, plans, or specs to identify what's already documented"
- "Compare existing documentation against the 8-dimension framework to identify gaps"
- "Prioritize questions that address the most critical gaps, especially those blocking downstream work"
- "If a dimension is already well-documented, skip it or ask validation questions instead of foundational ones"
- "Frame questions specifically to the feature being clarified (e.g., reference the feature name, type, or context)"
- "After each round of answers, update the clarification document and show what's been filled in"
- "Continue asking targeted questions until the user indicates they're done or all critical gaps are addressed"

### For Brainstorm Workflow

**Prompt Structure:**
```
1. Context Analysis Phase:
   - "Let me first understand the context for this brainstorm"
   - If feature-specific: Read feature hub to understand the problem, constraints, or existing ideas
   - If general: Review mission, roadmap, or guiding questions
   - Identify what's already known about the problem/opportunity

2. Adaptive Questioning Phase:
   - "I see from [context] that [observation]. Let me ask about [gap]"
   - Ask 2-3 questions that help explore the problem or generate ideas based on what's missing
   - Adapt ideation prompts to the specific context (e.g., "For this workflow improvement, what user frustrations have you observed?")

3. Incremental Ideation:
   - Generate ideas in batches of 5-10, building on previous answers
   - Update brainstorm document after each batch
   - Show progress: "We've generated [X] ideas so far. Let me explore [new angle] based on your feedback"
```

**Key Prompt Instructions:**
- "Before starting ideation, analyze the context (feature hub, mission, or problem statement) to understand what's already known"
- "If brainstorming for a specific feature, read the feature hub to understand the problem, constraints, and existing ideas"
- "Adapt your ideation prompts to the specific context rather than using generic templates"
- "Ask 2-3 context-setting questions first if the problem statement is unclear, then move to ideation"
- "Generate ideas in batches of 5-10, building on previous answers and context"
- "After each batch, update the brainstorm document and ask for feedback before continuing"
- "Continue until the user indicates they're done or you've covered all phases"

### Context Analysis Patterns

**Pattern 1: Feature Hub Analysis**
- Read AGENTS.md to understand feature status, decisions, and progress
- Check for existing research, plans, or specs that might answer questions
- Identify what dimensions/phases are already covered
- Prioritize questions for missing or incomplete dimensions

**Pattern 2: Gap Identification**
- Compare existing documentation against template structure
- Identify missing sections or incomplete information
- Classify gaps by priority (blocking vs. nice-to-have)
- Focus questions on high-priority gaps first

**Pattern 3: Contextual Question Framing**
- Reference specific details from existing context
- Ask questions that build on what's already known
- Skip questions that are already answered
- Validate assumptions inferred from context

**Pattern 4: Adaptive Depth**
- If documentation is sparse: Ask foundational questions
- If documentation is detailed: Ask clarifying or validation questions
- If a dimension is complete: Skip it or ask "anything else to add?"
- If a dimension is missing: Ask comprehensive questions

### Balancing Structure with Flexibility

**Challenge:** How to ensure completeness (all dimensions covered) while being flexible (context-aware questions)?

**Solution:**
- Use the framework as a **checklist** for completeness, not a **template** for questions
- Analyze context first to see what's already covered
- Ask targeted questions to fill gaps, not systematic questions from a template
- At the end, validate completeness: "Let me check if we've covered all dimensions. We've discussed [list]. Anything else to add about [missing dimensions]?"
- Allow dimensions to be marked as "not applicable" or "already covered" based on context

**Prompt Pattern:**
```
1. Analyze context → Identify gaps
2. Ask targeted questions to fill gaps (2-3 at a time)
3. Update document after each round
4. Continue until user indicates done
5. Final completeness check: "We've covered [list]. Any other dimensions to discuss?"
```

## Recommendations

### Workflow Prompt Modifications

**1. Add Context Analysis Phase**

Both workflows should start with explicit context analysis instructions:

**For clarify-feature:**
- "Before asking questions, analyze the feature hub at [path]"
- "Read AGENTS.md, existing research, plans, or specs"
- "Identify what's already documented vs. what's missing"
- "Compare against 8-dimension framework to find gaps"
- "Prioritize questions for the most critical gaps"

**For brainstorm:**
- "Before starting ideation, understand the context"
- "If feature-specific: Read feature hub to understand problem, constraints, existing ideas"
- "If general: Review mission, roadmap, or guiding questions"
- "Adapt your approach based on what's already known"

**2. Replace Template-Driven Questions with Gap-Driven Questions**

Instead of:
- "Ask questions 1-3 from Problem Validation dimension"

Use:
- "Based on context analysis, identify gaps in Problem Validation"
- "Ask 2-3 targeted questions to fill the most critical gaps"
- "Frame questions specifically to this feature's context"

**3. Add Incremental Document Updates**

Both workflows should update documents after each round:
- "After each round of answers, update the clarification/brainstorm document"
- "Show what's been filled in and what gaps remain"
- "Continue until user indicates done or all critical gaps are addressed"

**4. Make Question Framework a Checklist, Not a Template**

Update the clarification-questions-framework.md to emphasize:
- Use as a **completeness checklist**, not a question template
- Analyze context first to see what's already covered
- Ask targeted questions to fill gaps
- Skip questions that are already answered in existing documentation

### Template Updates

**1. Update Clarification Questions Framework**

Add guidance at the top:
- "This framework provides a completeness checklist. Before asking questions, analyze existing context to identify gaps. Ask targeted questions to fill those gaps rather than following the framework systematically."

**2. Update Clarification Packet Template**

Make it more flexible:
- Remove prescriptive section headers if they don't apply
- Add guidance: "Include only sections that are relevant to this feature"
- Emphasize: "Document answers as they come, don't wait for all dimensions to be complete"

## Risks & Open Questions

### Prompt Engineering Risks

1. **AI May Skip Important Dimensions**
   - **Risk:** If context analysis misses something, AI might skip critical questions
   - **Mitigation:** Add final completeness check: "Before finishing, verify all 8 dimensions have been considered (even if marked as not applicable)"

2. **Context Analysis May Be Incomplete**
   - **Risk:** AI might not read all relevant files or might misinterpret context
   - **Mitigation:** Explicit instructions: "Read AGENTS.md, all files in research/, plan/, and clarification/ directories"

3. **Questions May Become Too Generic**
   - **Risk:** Without template guidance, questions might lack structure
   - **Mitigation:** Provide examples of context-aware questions: "For a workflow improvement feature, ask: 'What specific user frustrations with the current workflow are you addressing?'"

### Open Questions

1. **How to handle features with no existing context?**
   - If feature hub is empty or new, should workflows fall back to template-driven questions?
   - **Recommendation:** Yes, but still frame questions to the feature type/name. Use templates as fallback, not primary approach.

2. **How to ensure completeness without rigid templates?**
   - How do we know when all critical gaps are filled?
   - **Recommendation:** Final completeness check: "We've covered [list of dimensions]. Any other areas to discuss?" Use framework as checklist, not template.

3. **How to balance user control with AI guidance?**
   - Should users be able to skip dimensions entirely, or should AI always check completeness?
   - **Recommendation:** AI should check completeness but allow dimensions to be marked as "not applicable" or "deferred" based on user input.

4. **How to handle conflicting information in context?**
   - What if existing documentation contradicts what user says?
   - **Recommendation:** Surface the conflict: "I see in your AGENTS.md that [X], but you're saying [Y]. Can we clarify which is correct?"

## Repo Next Steps

- [ ] Review this research with feature owner (Jake Ruesink)
- [ ] Update `clarify-feature.md` workflow to add context analysis phase and gap-driven questioning
- [ ] Update `brainstorm.md` workflow to add context analysis and adaptive questioning
- [ ] Update `clarification-questions-framework.md` to emphasize it's a checklist, not a template
- [ ] Update `clarification-packet-template.md` to be more flexible
- [ ] Test context-aware mode with real feature hubs
- [ ] Refine prompts based on testing
- [ ] Document context-aware questioning patterns for future workflow development

## References

**Internal:**
- `.devagent/core/workflows/clarify-feature.md` (2025-12-30) — Current workflow using 8-dimension framework
- `.devagent/core/workflows/brainstorm.md` (2025-12-30) — Current workflow using phase-based structure
- `.devagent/core/templates/clarification-questions-framework.md` (2025-12-30) — Question framework (should be used as checklist, not template)
- `.devagent/core/templates/clarification-packet-template.md` (2025-12-30) — Output template (should be more flexible)
- `.devagent/workspace/features/completed/2025-12-14_interactive-brainstorm-clarify/` (2025-12-14) — Previous work on making workflows interactive
- `.devagent/workspace/memory/constitution.md` (2025-12-30) — C3: Human-in-the-loop defaults
- `.devagent/workspace/product/mission.md` (2025-12-30) — DevAgent mission context

**External:**
- Context Analysis in Conversational AI: Prompt engineering best practices
- Adaptive Questioning Patterns: UX research, interview techniques
- Gap Analysis in Requirements Gathering: Requirements engineering practices
