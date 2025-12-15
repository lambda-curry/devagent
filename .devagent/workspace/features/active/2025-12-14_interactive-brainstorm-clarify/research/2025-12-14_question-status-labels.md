# Question Status Labels Reference

- Created: 2025-12-14
- Purpose: Reference guide for question status labels used in interactive workflows

## Status Labels

When tracking questions throughout interactive conversations, use these specific status labels to distinguish different scenarios:

### ✅ answered
**Meaning:** User provided a clear answer to the question.

**Usage:** Mark questions as answered when the user gives a complete response.

**Example:** "What problem are we solving?" → User: "Users can't find relevant content" → Status: ✅ answered

---

### ⏳ in progress
**Meaning:** Question is currently being discussed or answered.

**Usage:** Mark questions as in progress when actively asking or receiving answers.

**Example:** "Who experiences this problem?" → Currently asking → Status: ⏳ in progress

---

### ❓ unknown
**Meaning:** User doesn't know the answer right now.

**Resolution:** Can be resolved by:
- The person executing the workflow (later)
- The AI agent using best judgment

**Usage:** When user explicitly says "I don't know" or "I'm not sure."

**Example:** "What evidence supports this problem's importance?" → User: "I don't know" → Status: ❓ unknown

---

### 🚫 not applicable
**Meaning:** Question doesn't apply to this specific feature/context.

**Resolution:** Question is skipped because it's not relevant to this use case.

**Usage:** When the question doesn't fit the context or feature being discussed.

**Example:** "What compliance requirements apply?" → User: "This feature doesn't handle user data" → Status: 🚫 not applicable

---

### ⏭️ deferred
**Meaning:** User wants to address this question later, not now.

**Resolution:** Will be handled in a future session or later in the workflow.

**Usage:** When user says "let's come back to this" or "not right now."

**Example:** "What are the technical constraints?" → User: "Let's defer this until we know more" → Status: ⏭️ deferred

---

### 🔍 needs research
**Meaning:** Question requires evidence gathering or investigation.

**Resolution:** Should be routed to `devagent research` workflow.

**Usage:** When the answer requires data, user research, competitive analysis, or other evidence-based investigation.

**Example:** "What do analytics tell us about this problem?" → User: "We need to research this" → Status: 🔍 needs research

**Routing:** Questions marked as 🔍 needs research should be included in the final document with a note to route to devagent research.

---

### ⚠️ not important
**Meaning:** User has decided this question isn't relevant or important for their use case.

**Resolution:** Explicitly out of scope for this feature.

**Usage:** When user says "this isn't important" or "we don't need to worry about this."

**Example:** "What localization requirements exist?" → User: "Not important for this feature" → Status: ⚠️ not important

**Note:** This is different from "not applicable" - "not applicable" means the question doesn't fit the context, while "not important" means the user is making a decision that it's not relevant.

---

### 🚧 blocked
**Meaning:** Can't answer due to dependencies or blockers.

**Resolution:** Must wait for dependencies to be resolved or blockers to be cleared.

**Usage:** When external factors prevent answering the question.

**Example:** "What APIs do we need to integrate with?" → User: "We're waiting on vendor approval" → Status: 🚧 blocked

---

## Label Selection Guide

**User says:** "I don't know" → Use: ❓ unknown

**User says:** "This needs research" or "We need data on this" → Use: 🔍 needs research

**User says:** "This isn't important" or "We don't need this" → Use: ⚠️ not important

**User says:** "This doesn't apply" or "Not relevant to our case" → Use: 🚫 not applicable

**User says:** "Let's come back to this" or "Not now" → Use: ⏭️ deferred

**User says:** "We can't answer because of [dependency]" → Use: 🚧 blocked

**User provides clear answer** → Use: ✅ answered

---

## Routing Rules

- **🔍 needs research** → Route to `devagent research` workflow
- **❓ unknown** → Can be resolved by person executing or AI agent using best judgment
- **⚠️ not important** → Explicitly out of scope, document as such
- **🚫 not applicable** → Document why it doesn't apply
- **⏭️ deferred** → Note for future follow-up
- **🚧 blocked** → Document blocker and dependencies

---

## Benefits of Specific Labels

1. **Clear routing:** Questions marked 🔍 needs research can be automatically routed to the research workflow
2. **Better documentation:** Final documents clearly show why questions weren't answered
3. **Actionable:** Each label indicates what should happen next
4. **Reduces ambiguity:** "Unknown" vs "needs research" vs "not important" are clearly different scenarios
5. **Better tracking:** Can see at a glance what types of gaps exist (research gaps vs knowledge gaps vs scope decisions)
