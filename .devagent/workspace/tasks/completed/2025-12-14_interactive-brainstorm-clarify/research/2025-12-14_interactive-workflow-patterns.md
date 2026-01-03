# Interactive Workflow Patterns Research — Prompt Engineering Focus

- Research Date: 2025-12-14
- Feature: Interactive Brainstorm and Clarify Workflows
- Researcher: Research workflow execution
- Classification: Prompt Engineering Research

## Problem Statement

Transform `devagent brainstorm` and `devagent clarify-feature` workflows from file-generating processes into interactive, question-driven conversations. Instead of immediately creating output files, these workflows should engage users through conversation, asking a few thoughtful questions at a time that help them think about their feature or brainstorm topic from different angles. The conversation should progressively build toward complete documents without overwhelming the user.

**Key Constraint:** This is purely a prompt engineering challenge. Workflows are conversation prompts, not code. We need to structure the workflow prompts to guide the AI to have better conversations.

## Research Plan

**Validation Targets:**
1. Prompt patterns for asking questions incrementally (2-3 at a time)
2. How to structure workflow prompts to maintain conversation context
3. Progressive disclosure patterns in conversational prompts
4. Question sequencing strategies in prompt instructions
5. How to guide AI to build documents incrementally through conversation
6. Prompt patterns for ensuring completeness while staying conversational

## Sources

### Internal Context

**Current Workflow Structure:**
- `.devagent/core/workflows/brainstorm.md` (2025-12-14) — Current workflow generates brainstorm packets via structured ideation phases (divergent → clustering → convergent → prioritization)
- `.devagent/core/workflows/clarify-feature.md` (2025-12-14) — Current workflow uses 8-dimension question framework to generate clarification packets
- `.devagent/core/templates/brainstorm-packet-template.md` (2025-12-14) — Structured output template with sections: Problem Statement, Ideas, Clustered Themes, Evaluation Matrix, Prioritized Candidates, Research Questions
- `.devagent/core/templates/clarification-packet-template.md` (2025-12-14) — Structured output template with 8 requirement dimensions, each with validation status tracking
- `.devagent/core/templates/clarification-questions-framework.md` (2025-12-14) — Systematic question sets organized by dimension with ambiguity detection patterns

**Key Observations:**
- Both workflows currently execute immediately and produce complete files
- Clarify-feature already has a structured question framework (8 dimensions with core questions and probes)
- Brainstorm workflow has clear phases that could map to question sequences
- Templates provide structure that conversations must eventually populate
- Constitution C3 emphasizes "human-in-the-loop defaults" — interactive conversations align with this principle
- Workflows are markdown files with prompt instructions; we modify the prompts, not build systems

### External Research

**1. Progressive Disclosure in Conversations**
- **Source:** UX/design sources (designdino.ai, pocr.ai, ui-patterns.com)
- **Key Findings:**
  - Progressive disclosure involves revealing information gradually to prevent overwhelm
  - Questions should be sequenced logically: start broad, move to specific (sequential refinement)
  - Present 2-3 questions at a time to maintain focus
  - Use clear, simple language for each question
  - Allow iterative refinement — users should be able to revisit previous answers
- **Relevance:** Directly applicable to structuring question sequences in workflow prompts

**2. Conversational AI Prompt Patterns**
- **Source:** Prompt engineering guides, conversational AI best practices
- **Key Findings:**
  - Maintain context through explicit references to previous conversation turns
  - Use structured prompts that guide the AI to ask questions systematically
  - Provide clear instructions on when to ask questions vs. when to generate output
  - Use conditional logic in prompts (e.g., "If the user hasn't answered X, ask about X")
  - Track progress explicitly in prompts ("We've covered Problem and Users, now ask about Success Criteria")
- **Relevance:** Core to how we structure workflow prompts for interactive mode

**3. Cognitive Load and Question Pacing**
- **Source:** UX pattern libraries (ui-patterns.com, akendi.com)
- **Key Findings:**
  - Progressive disclosure reduces cognitive overload by limiting initial information
  - Begin with essential information only, reveal complexity on-demand
  - 2-3 questions per interaction is optimal for maintaining focus
  - Clear progress indicators help users understand where they are
- **Relevance:** Informs how many questions to ask per conversation turn

## Findings & Recommendations

### Prompt Engineering Strategy

**Core Principle:** Structure workflow prompts to guide the AI to have a conversation rather than generate a file immediately.

**Key Prompt Patterns:**

1. **Question Batching Instructions**
   - Instruct AI: "Ask 2-3 questions at a time, not all at once"
   - Provide explicit guidance: "After the user answers, ask the next 2-3 questions from the current dimension"
   - Use conditional prompts: "If the user has answered questions 1-3 of Problem Validation, proceed to questions 4-6"

2. **Progress Tracking in Prompts**
   - Include explicit tracking: "Keep track of which dimensions/phases have been covered"
   - Use structured reminders: "You've covered: Problem Validation ✅, Users & Stakeholders ✅, Success Criteria ⏳ (in progress)"
   - Guide completion: "Before generating the final document, ensure all 8 dimensions are complete"

3. **Conversation Flow Control**
   - Start with: "Begin by asking 2-3 context-setting questions about [topic]"
   - Progress with: "After receiving answers, ask the next 2-3 questions from [dimension/phase]"
   - Complete with: "Once all questions are answered, generate the final document using the template"

4. **Context Maintenance**
   - Reference previous answers: "Based on the user's answer about [previous topic], ask about [related topic]"
   - Build incrementally: "As you receive answers, mentally build the document structure but don't write it yet"
   - Finalize when ready: "After all questions are answered, generate the complete document"

### For Clarify-Feature Workflow

**Prompt Structure:**
```
1. Start with context: "I'll help you clarify this feature through a conversation. Let's start with a few questions."

2. Dimension-by-dimension progression:
   - "First, let's understand the problem. I'll ask 2-3 questions about this."
   - Ask 2-3 questions from Problem Validation dimension
   - "Good, now let's talk about users. I'll ask 2-3 questions about who this affects."
   - Ask 2-3 questions from Users & Stakeholders dimension
   - Continue through all 8 dimensions

3. Track progress explicitly:
   - "We've covered Problem Validation ✅ and Users & Stakeholders ✅. Now let's discuss Success Criteria."
   - Show completion status as you go

4. Finalize when complete:
   - "Great! We've covered all 8 dimensions. Let me generate the complete clarification packet now."
   - Generate document using template
```

**Key Prompt Instructions:**
- "Maintain a running list of all questions from the 8-dimension framework, tracking each question's status: ✅ answered, ⏳ in progress, ❓ unknown, 🚫 not applicable, ⏭️ deferred, 🔍 needs research, ⚠️ not important, or 🚧 blocked"
- "After each answer, update your question list with the appropriate status label and identify the next 2-3 questions to ask from the current dimension"
- "Ask questions in batches of 2-3, grouped by dimension"
- "Wait for user answers before moving to the next batch"
- "Show progress explicitly: 'We've answered questions 1-3 of Problem Validation ✅. Next, I'll ask questions 4-6.'"
- "Track which dimensions are complete: [list with checkmarks and question counts]"
- "If the user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important. If it doesn't apply, mark as 🚫 not applicable."
- "Questions marked as ❓ unknown can be resolved by the person executing the workflow or by the AI agent using best judgment"
- "Questions marked as 🔍 needs research should be routed to devagent research"
- "Questions marked as ⚠️ not important are explicitly out of scope"
- "Only generate the final document when all questions have a status label (answered, unknown, needs research, not important, not applicable, deferred, or blocked)"

### For Brainstorm Workflow

**Prompt Structure:**
```
1. Start with problem/mode: "Let's brainstorm together. First, tell me about the problem or opportunity you're exploring."

2. Phase-by-phase progression:
   - "Now let's generate some ideas. I'll help you think through this from different angles."
   - Ask 1-2 ideation prompts, wait for responses
   - "Good ideas! Let's generate a few more from a different perspective."
   - Continue generating ideas incrementally (5-10 at a time)
   - "Now let's group these ideas into themes..."
   - "Let's evaluate the top candidates..."
   - "Finally, let's prioritize the best options..."

3. Build incrementally:
   - "As we go, I'm keeping track of your ideas. We have [X] so far."
   - Show progress: "We've generated ideas ✅, now clustering them..."

4. Finalize when ready:
   - "Perfect! We've completed all phases. Let me create the brainstorm packet now."
   - Generate document using template
```

**Key Prompt Instructions:**
- "Maintain a running list of all phases and their status: Problem Statement (✅ complete), Ideas Generation (⏳ in progress, 8/15 ideas generated), Clustering (⏭️ pending), etc."
- "After each interaction, update your phase tracking and identify what to ask next"
- "Generate ideas incrementally, 5-10 at a time, not all at once"
- "Wait for user feedback before moving to the next phase"
- "Show progress explicitly: 'We've generated 8 ideas so far. Let's generate 5-7 more before moving to clustering.'"
- "Track progress through phases: Problem → Ideas → Clustering → Evaluation → Prioritization"
- "If the user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important. If it doesn't apply, mark as 🚫 not applicable."
- "Items marked as ❓ unknown can be resolved by the person executing or by the AI agent using best judgment"
- "Items marked as 🔍 needs research should be routed to devagent research"
- "Items marked as ⚠️ not important are explicitly out of scope"
- "Only generate the final document when all phases have items with status labels (complete, unknown, needs research, not important, not applicable, deferred, or blocked)"
- "Allow the user to refine ideas before moving to clustering"

### Question Sequencing in Prompts

**Pattern: Sequential Within Dimension**
- "Work through each dimension systematically"
- "Complete one dimension before moving to the next"
- "Within each dimension, ask questions 1-3 first, then 4-6, etc."

**Pattern: Conditional Logic**
- "If the user mentions [X], ask follow-up questions about [related topic]"
- "If the user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important. If it doesn't apply, mark as 🚫 not applicable."
- "Skip questions that aren't relevant based on previous answers"

**Pattern: Adaptive Pacing**
- "If the user gives detailed answers, you can ask 3 questions. If answers are brief, ask 2."
- "If the user seems overwhelmed, pause and ask if they want to continue"
- "If the user wants to move faster, you can ask more questions per batch"

### Document Building Through Conversation

**Incremental Building Pattern:**
- "As you receive answers, mentally organize them into the template structure"
- "Don't write the document yet, but keep track of what sections are filling in"
- "Track which questions are answered and which have other status labels (unknown, needs research, not important, etc.)"
- "When all sections have content (all questions have status labels), generate the complete document"
- "In the final document, clearly mark questions by status: unknown ❓ questions can be resolved by the person executing or by the AI agent; needs research 🔍 questions should be routed to devagent research; not important ⚠️ questions are explicitly out of scope"

**Partial Completion Handling:**
- "If the user wants to stop early, generate a partial document with clearly marked gaps"
- "Note which dimensions/phases are incomplete: [list]"
- "Mark unanswered questions with appropriate status labels: unknown ❓ (can be resolved by person executing or AI agent), needs research 🔍 (route to devagent research), not important ⚠️ (explicitly out of scope), etc."

### Conversation Context Maintenance

**Question Tracking and Updates:**
- "Keep a running list of all questions from the framework, marking each with a status label:"
  - **✅ answered** - User provided a clear answer
  - **⏳ in progress** - Currently being discussed
  - **❓ unknown** - User doesn't know the answer (needs to be answered by someone or researched)
  - **🚫 not applicable** - Question doesn't apply to this specific feature/context
  - **⏭️ deferred** - User wants to address this later (not now)
  - **🔍 needs research** - Requires evidence gathering (should route to devagent research)
  - **⚠️ not important** - User has decided this isn't relevant/important for their use case
  - **🚧 blocked** - Can't answer due to dependencies or blockers
- "After each answer, update your question list: mark the answered questions as ✅ and identify the next 2-3 questions to ask"
- "Before asking the next batch, show progress: 'We've answered questions 1-3 of Problem Validation ✅. Next, I'll ask questions 4-6.'"
- "If a question becomes irrelevant based on previous answers, mark it as 🚫 not applicable and note why"
- "If user says they don't know, mark as ❓ unknown. If they say it needs research, mark as 🔍 needs research. If they say it's not important, mark as ⚠️ not important."
- "Maintain this question tracking throughout the conversation to avoid losing context"

**Explicit Context References:**
- "Earlier you mentioned [X], so now I'm asking about [related Y]"
- "Building on your answer about [previous topic], let's explore [next topic]"
- "We've established [summary], now let's clarify [next area]"

**Progress Summaries:**
- "So far we've covered: [list completed items with question counts]. Next, we'll explore [upcoming items with remaining question counts]."
- "We're about halfway through. We've covered [X] of [Y] dimensions, with [Z] questions answered ✅, [A] unknown ❓, [B] needs research 🔍, [C] not important ⚠️."
- "Here's our progress: Problem Validation (3/6 answered ✅, 1 unknown ❓, 1 needs research 🔍, 1 remaining), Users & Stakeholders (0/5 answered, 5 remaining)"

**Completion Check:**
- "Before we finish, let me check our question list: [show status of all questions with labels]"
- "We have [X] questions answered ✅, [Y] unknown ❓, [Z] needs research 🔍, [W] not important ⚠️, [V] not applicable 🚫, and [U] remaining. Should we continue or generate the document now?"
- "Questions marked as 🔍 needs research should be routed to devagent research. Questions marked as ❓ unknown can be resolved by the person executing or by the AI agent using best judgment."
- "Is there anything else you'd like to clarify before I generate the final document?"

## Recommendations

### Workflow Prompt Modifications

**1. Update Workflow Files for Interactive Conversation**

Both `brainstorm.md` and `clarify-feature.md` should be updated to use interactive conversation as the default behavior. The workflows should follow this conversation pattern:

1. **Start with context:** Explain that you'll ask questions incrementally
2. **Ask in batches:** Present 2-3 questions at a time, grouped by dimension/phase
3. **Track progress:** Explicitly state which dimensions/phases are complete
4. **Wait for answers:** Don't proceed to next batch until user responds
5. **Handle unanswered questions:** If user doesn't know, mark as ❓ unknown. If needs research, mark as 🔍 needs research. If not important, mark as ⚠️ not important. If not applicable, mark as 🚫 not applicable.
6. **Build incrementally:** Keep track of answers but don't generate document yet
7. **Finalize when complete:** Generate document only when all required sections are covered (all questions have status labels)

**2. Question Sequencing Instructions**

Add explicit sequencing guidance:
- "Work through dimensions in order: Problem → Users → Success → Scope → Constraints → Principles → Dependencies → Acceptance"
- "Within each dimension, ask questions 1-3 first, wait for answers, then ask 4-6"
- "Show progress: 'We've completed Problem Validation ✅. Now let's discuss Users & Stakeholders.'"

**3. Completion Validation**

Add validation instructions:
- "Before generating final document, verify all dimensions are covered"
- "If any dimensions are incomplete, note them clearly in the document"
- "Questions marked with different status labels should be included in the document with appropriate notes: ❓ unknown (can be resolved by person executing or AI agent), 🔍 needs research (route to devagent research), ⚠️ not important (explicitly out of scope)"
- "Ask user if they want to continue with incomplete sections or generate document with questions marked by status"

### Prompt Engineering Best Practices

**1. Explicit Instructions Over Implicit**
- ✅ "Ask 2-3 questions at a time"
- ❌ "Ask a few questions" (too vague)

**2. Progress Visibility**
- ✅ "We've covered 3 of 8 dimensions: Problem ✅, Users ✅, Success ⏳"
- ❌ "Continue asking questions" (no context)

**3. Clear Completion Criteria**
- ✅ "Generate the document when all 8 dimensions are complete"
- ❌ "When done, create the document" (unclear when done)

**4. Handling Unanswered Questions**
- ✅ "If you don't know, say 'unknown' (❓). If it needs research, say 'needs research' (🔍). If it's not important, say 'not important' (⚠️). If it doesn't apply, say 'not applicable' (🚫)."
- ❌ Assume user must answer every question

## Risks & Open Questions

### Prompt Engineering Risks

1. **AI May Still Generate Files Too Early**
   - **Risk:** AI might generate document before all questions are answered
   - **Mitigation:** Explicit instruction: "Do not generate the document until explicitly told to do so or until all dimensions are complete"

2. **Context Loss Across Turns**
   - **Risk:** AI might forget what was covered in previous conversation turns
   - **Mitigation:** Explicit progress tracking in prompts: "Remember we've covered: [list]. Now ask about [next topic]"

3. **Inconsistent Question Batching**
   - **Risk:** AI might ask 1 question or 5 questions instead of 2-3
   - **Mitigation:** Very explicit: "Ask exactly 2-3 questions. Count them. Do not ask more than 3."

### Open Questions

1. **How to handle early document generation?**
   - If user wants to generate document before all questions are answered
   - **Recommendation:** Prompt instruction: "If user asks to generate document now, create it with current answers and mark incomplete sections with appropriate status labels (unknown, needs research, not important, not applicable, etc.)"

2. **How to handle unanswered or unimportant questions?**
   - If user doesn't know the answer, says it needs research, says it's not important, or says it doesn't apply
   - **Recommendation:** Prompt instruction: "Use specific status labels: ❓ unknown (user doesn't know - can be resolved by person executing or AI agent), 🔍 needs research (requires evidence - route to devagent research), ⚠️ not important (user decided it's not relevant - explicitly out of scope), 🚫 not applicable (question doesn't fit this context). Continue to the next question after marking with appropriate label."

3. **How to handle user wanting to skip sections?**
   - If user wants to skip a dimension or phase
   - **Recommendation:** Prompt instruction: "If user wants to skip a section, ask why: is it not applicable 🚫, not important ⚠️, needs research 🔍, or deferred ⏭️? Mark all questions in that section with the appropriate status label and continue, but flag the section in final document"

4. **How to ensure completeness?**
   - Making sure all required sections are covered
   - **Recommendation:** Explicit checklist in prompt: "Before finalizing, verify: [list all dimensions/phases]. If any are missing, ask about them or mark them with appropriate status labels. Questions marked as 🔍 needs research should be routed to devagent research. Questions marked as ❓ unknown can be resolved by the person executing or AI agent. Questions marked as ⚠️ not important are explicitly out of scope."

## Repo Next Steps

- [ ] Review this research with feature owner (Jake Ruesink)
- [ ] Modify `brainstorm.md` workflow to use interactive conversation as default behavior
- [ ] Modify `clarify-feature.md` workflow to use interactive conversation as default behavior
- [ ] Test interactive mode with real conversations
- [ ] Refine prompts based on testing
- [ ] Document interactive mode usage patterns

## References

**Internal:**
- `.devagent/core/workflows/brainstorm.md` — Current brainstorm workflow (needs update to use interactive conversation as default)
- `.devagent/core/workflows/clarify-feature.md` — Current clarify-feature workflow (needs update to use interactive conversation as default)
- `.devagent/core/templates/clarification-questions-framework.md` — Question framework (source for question sequences)
- `.devagent/workspace/memory/constitution.md` — C3: Human-in-the-loop defaults

**External:**
- Progressive Disclosure Patterns: https://ui-patterns.com/patterns/ProgressiveDisclosure
- Sequential Refinement in AI Workflows: https://www.pocr.ai/prompting.html
- Cognitive Load Management: https://www.akendi.com/ux-glossary/details/progressive-disclosure.php
