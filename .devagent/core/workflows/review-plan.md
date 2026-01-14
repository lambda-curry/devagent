# Review Plan

## Mission
- Primary goal: Enable users to interactively review plan documents before implementation, providing high-level summaries and adaptive suggestions for walking through plans to validate alignment with expectations.
- Boundaries / non-goals: Do not automatically approve or reject plans (must remain human decision), do not create separate review artifacts (update plan document directly), do not integrate with external issue trackers, do not batch review multiple plans. Focus on interactive validation of single plan documents.
- Success signals: Users can efficiently validate plans before implementation, workflow feels natural and helpful during use, users report it helps catch alignment issues early, reduces need for plan revisions after implementation starts.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- **Start immediately**—analyze the plan, present a high-level overview, then offer review options (step-by-step walkthrough or dive into specific parts).

## Interactive Session Model
This workflow runs as a natural conversation to review plan documents. The flow is simple: analyze the plan, present a high-level overview, offer review options, then guide the user through their chosen approach. Update the plan document directly during review (not a separate artifact).

**Progress preservation:** Save the plan document after each interaction so users can pause and resume later. Remind users they can end the session anytime by saying "all done" or similar.

**Natural interaction:**
- Ask 2-3 questions at a time when helpful, but don't force questions if the user just wants to review content
- Show what's been reviewed naturally (no complex status systems needed)
- Update the plan document with review notes when the user provides feedback
- Let the conversation flow naturally—users can change direction mid-session

## Inputs
- Required: Plan document path (or plan document content provided in input context).
- Optional: Review scope preference (specific sections, full walkthrough, or adaptive), known concerns or areas to focus on.
- Request missing info by: If plan document path is not provided, request it. If plan document cannot be found, pause and request correct path. Proceed best-effort if optional inputs are missing.

## Resource Strategy
- Plan document — located at `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/plan/` or path provided in input. Read the plan document to analyze structure and content.
- `.devagent/core/templates/plan-document-template.md` (Plan Document Template) — reference for plan structure to understand sections to review.
- `.devagent/core/workflows/clarify-task.md` (Interactive Session Model Pattern) — reference for question batching, progress tracking, incremental saving patterns.
- `.devagent/core/workflows/brainstorm.md` (Interactive Session Model Pattern) — reference for adaptive interaction patterns.
- `.devagent/core/workflows/create-plan.md` (Plan Creation Workflow) — reference for understanding plan structure and context.
- `.devagent/core/AGENTS.md` — standard workflow instructions for date handling, metadata retrieval, context gathering.
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.

## Knowledge Sources
- Internal: Plan document structure, existing workflow patterns (clarify-task, brainstorm), constitution delivery principles (`.devagent/workspace/memory/constitution.md` C3, C4).
- External: None directly—this workflow focuses on validating internal plan documents.
- Retrieval etiquette: Reference plan document sections with clear section names, cite specific content when asking validation questions, update plan document with review status and notes.

## Workflow

### Review Flow
The flow is simple: analyze the plan, present an overview, offer options, then review based on the user's choice. Keep it natural—no rigid modes or mandatory steps beyond the initial overview.

### Core Workflow

**Natural flow: analyze → overview → offer options → review**

1. **Analyze the plan:**
   - Read the plan document and understand its structure
   - Note key sections, task count, and any notable complexity (dependencies, risks)

2. **Present high-level overview:**
   - Start with a clear overview: what the plan covers, key sections, task count, and any notable complexity
   - This gives context before diving into details

3. **Offer review options:**
   - After the overview, naturally offer: "Would you like to walk through the plan step-by-step, or dive into specific parts?"
   - Adapt the phrasing based on plan complexity, but keep it simple and natural

4. **Review based on user choice:**
   - **Step-by-step:** Walk through sections naturally, presenting content and asking questions when helpful
   - **Specific parts:** Ask what they want to focus on, then dive into those sections
   - Update the plan document with review notes as you go
   - Save the plan document after each interaction
   - Let the user change direction naturally—if they want to switch approaches or jump to a different section, accommodate that

5. **Completion:**
   - When the user indicates they're done, save the plan document with any final notes
   - Present a brief summary of what was reviewed

## Adaptation Notes
- Keep it simple and natural—adapt to what the user wants, don't force systematic coverage
- Questions are optional—only ask when helpful, not as a mandate
- Let users guide the flow—they can jump around, change direction, or focus on what matters to them
- Update the plan document naturally with review notes when feedback is provided

## Failure & Escalation
- Plan document not found or unreadable: pause and request correct path
- Cannot parse plan structure: pause and report parsing error; suggest verifying plan document follows template structure
- User provides conflicting feedback: document both positions in plan document, ask for clarification
- Plan document update fails (write error): report error to user, suggest manual update, continue if possible or pause if atomic update required

## Expected Output

### Primary Artifact
**Updated Plan Document** (same location as input plan document) — plan document with review status and notes added during review process.

**Plan document updates include:**
- Review notes added inline within sections (as comments or notes) when user provides feedback
- Any summary or status updates the user requests

### Communication
- Summarize what was reviewed and any key feedback or concerns
- Note next steps if relevant

## Follow-up Hooks
- Downstream workflows: devagent implement-plan (primary consumer of reviewed plans)
- Upstream workflows: devagent create-plan (predecessor that creates plans for review)
- Metrics / signals: Track review completion rate, sections most commonly reviewed, feedback patterns, plan revision rate after review
- Decision tracing: All review feedback logged in plan document with user attribution

## Start Here (First Turn)
If required inputs are present:
1. Briefly confirm the plan document being reviewed
2. Analyze the plan structure (sections, tasks, complexity)
3. Present a high-level overview: what the plan covers, key sections, task count, notable complexity
4. Offer review options naturally: "Would you like to walk through the plan step-by-step, or dive into specific parts?"
5. Wait for the user's preference and proceed accordingly
