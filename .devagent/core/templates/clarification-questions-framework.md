# Clarification Questions Framework

**⚠️ CRITICAL: This is an inspiration pool for generating helpful questions, NOT a checklist to validate against. Do NOT ask questions dimensionally or systematically. Use these examples to inspire context-aware questions that flow naturally from what you've learned about the task.**

## Core Principle: Helpful Questions Over Systematic Coverage

**What NOT to do:**
- ❌ Systematically going through dimensions or topics
- ❌ Asking questions just to "cover" a topic
- ❌ Validating status of dimensions
- ❌ Following a rigid checklist

**What TO do:**
- ✅ Ask helpful, context-aware questions that flow naturally
- ✅ Use these examples as inspiration when you're stuck or need ideas
- ✅ Focus on what's actually unclear or missing for this specific task
- ✅ Questions should build on existing context and advance understanding

**These examples are organized by topic for easy reference, but you should NOT systematically cover all topics. Pick and choose based on what's actually needed for the task at hand.**

---

## How to Use This Framework

1. **Analyze existing context first:** Read the task hub (AGENTS.md, existing research, plans, specs) to understand what's already documented. Acknowledge what you've learned before asking questions.

2. **Identify what's unclear:** Based on the context, identify what information is actually missing or ambiguous. Don't force yourself to find gaps—only identify real gaps.

3. **Generate helpful questions:** Use the examples below as inspiration to craft questions that:
   - Reference the task name, type, or existing documentation
   - Fill actual gaps in understanding
   - Flow naturally from what you've learned
   - Advance understanding rather than just filling out a form

4. **Skip irrelevant topics:** If a topic doesn't apply to this task, don't ask about it. These are examples, not requirements.

---

## Example Questions by Topic (Inspiration Pool)

**Use these as inspiration when you need ideas for helpful questions. Don't systematically cover all topics—only ask about what's actually unclear for this specific task.**

### Scope & End Goal

**When useful:** If it's unclear what needs to be done or what the end state should look like.

**Example questions to inspire helpful clarification:**
- "I see you're working on [task]. What specific work needs to be done?"
- "What should the code/system look like when this is complete?"
- "Which items from your checklist are critical vs. nice-to-have?"
- "What's explicitly out of scope for this work?"
- "Are there related tasks we should be aware of, or is this self-contained?"

---

### Technical Approach & Patterns

**When useful:** If the implementation approach, patterns, or technical strategy is unclear.

**Example questions to inspire helpful clarification:**
- "For this [task type], what approach should we take?"
- "Are there existing patterns in the codebase we should follow?"
- "What architecture or design principles should guide this work?"
- "Are there specific technologies or patterns we should use or avoid?"
- "How does this fit with the existing codebase structure?"

---

### Dependencies & Blockers

**When useful:** If dependencies or blockers could affect the work.

**Example questions to inspire helpful clarification:**
- "Are there other systems or processes that depend on this?"
- "What needs to be in place before we can start this work?"
- "Are there any blockers we should be aware of?"
- "What happens if [dependency] isn't ready in time?"
- "Are there technical unknowns that might delay implementation?"

---

### Constraints & Requirements

**When useful:** If constraints or requirements are unclear. **Note:** Don't over-focus on platform/performance unless they're actually relevant.

**Example questions to inspire helpful clarification:**
- "Are there any technical limitations we should be aware of?"
- "What integration requirements exist?" (if relevant)
- "Are there quality standards we need to meet?" (if relevant)
- "What error handling is expected?" (if relevant)
- "Are there specific requirements we need to follow?" (if relevant)

**Skip platform/performance questions unless they're actually relevant to the task.**

---

### Verification & Testing

**When useful:** If it's unclear how to verify the work is complete or working correctly.

**Example questions to inspire helpful clarification:**
- "How should we verify this is working correctly?"
- "Are there specific test cases or scenarios we should check?"
- "What does 'done' look like for this work?"
- "What edge cases or error scenarios should we handle?"
- "What testing approach should we use?"

---

### Problem & Context (Business - Optional)

**When useful:** Only for new features or user-facing changes. Skip for pure technical tasks.

**Example questions to inspire helpful clarification:**
- "What problem does this solve?" (only for new features)
- "Who will benefit from this?" (only for user-facing changes)
- "Why is this important now?" (only if business context is relevant)

**Skip for:** Bug fixes, refactoring, infrastructure work, technical improvements.

---

### Success & Outcomes (Business - Optional)

**When useful:** Only for new features with measurable outcomes. Skip for technical tasks.

**Example questions to inspire helpful clarification:**
- "How will we know this is successful?" (only for features with measurable impact)
- "What does 'good enough' look like?" (only if relevant)

**Skip for:** Bug fixes, refactoring, infrastructure work, tasks where success is binary (it works or it doesn't).

---

## Ambiguity Detection Patterns

Use these patterns to identify unclear requirements and generate clarifying questions.

### Quantification Missing
**Pattern:** Vague qualitative terms without measurable criteria

**Examples:**
- "Fast" → How fast? (if actually relevant)
- "Scalable" → How many users/requests? (if actually relevant)
- "Better" → Better than what? By how much?

**Clarifying approach:** "Can you quantify that?" or "What specific metric would indicate success?" (only if quantification is actually needed)

---

### Subject Unclear
**Pattern:** Pronouns or generic references without clear antecedent

**Examples:**
- "The system should..." → Which system?
- "It should support..." → What is "it"?
- "Users want..." → Which user segment? (if user-facing)

**Clarifying approach:** "Who specifically?" or "Which component exactly?"

---

### Undefined Terms
**Pattern:** Domain jargon, acronyms, or ambiguous terminology without definition

**Examples:**
- Technical jargon: "Use microservices" without architecture specifics
- Acronyms: "Must support SSO" without specifying protocols
- Ambiguous terms: "Modern UI" without design criteria

**Clarifying approach:** "Can you define what you mean by [term]?" or "What specifically does [term] entail?"

---

### Logical Conflicts
**Pattern:** Requirements that contradict each other or create impossible conditions

**Examples:**
- "Must be simple and feature-rich"
- "Zero latency and full audit logging"
- "Instant results and comprehensive validation"

**Clarifying approach:** "These requirements seem to conflict—which takes priority?" or "How should we balance these tradeoffs?"

---

## Task Type Guidance

**Technical Tasks (bug fixes, refactoring, infrastructure):**
- Focus on: Scope, Approach, Dependencies, Verification
- Skip: Problem & Context, Success Metrics (unless relevant)

**New Features (user-facing changes):**
- Focus on: All topics as needed, but prioritize technical topics first
- Include: Problem & Context, Success Metrics (if measurable)

**Active Development Work:**
- Focus on: What needs to be done, how to do it, how to verify it
- Skip: Extensive business validation, timeline questions (work is ongoing)

---

## Key Principles (Constitution C6: Simplicity Over Rigidity)

- **Natural flow over rigid structure:** Questions should flow from context analysis → gap identification → helpful inquiry, not from a template
- **Helpful over complete:** Better to ask 3 helpful questions that advance understanding than 10 questions that feel like a form
- **Context-aware over systematic:** Adapt questions to the task context rather than following the same pattern for all tasks
- **Gap-driven over dimensional:** Ask questions that fill actual gaps, not questions that "cover a topic"
- **Technical by default:** Most DevAgent work is technical/architectural. Business questions are optional and only relevant for new features
