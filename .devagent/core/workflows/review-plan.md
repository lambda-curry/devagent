# Review Plan

## Mission
- Primary goal: Enable users to interactively review plan documents before implementation, providing high-level summaries and walking through Implementation Tasks to validate alignment with expectations (what each task will do, the approach, architecture, and details).
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
- **⚠️ CRITICAL: When user chooses step-by-step, walk through Implementation Tasks (Task 1, Task 2, etc.), not plan document sections.** For each task, explain what it will do, the approach, architecture, and details so the user can review those. Focus on reviewing actual work, NOT nitpicking plan document structure or formatting. See Constitution C6 (Simplicity Over Rigidity).

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
- Optional: Review scope preference (specific tasks or sections, full walkthrough, or adaptive), known concerns or areas to focus on.
- Request missing info by: If plan document path is not provided, request it. If plan document cannot be found, pause and request correct path. Proceed best-effort if optional inputs are missing.

## Resource Strategy
- Plan document — located at `.devagent/workspace/tasks/{status}/<task_prefix>_<task_slug>/plan/` or path provided in input. Read the plan document to analyze structure and content.
- `.devagent/core/templates/plan-document-template.md` (Plan Document Template) — reference for plan structure to understand where Implementation Tasks are located (in PART 2: IMPLEMENTATION PLAN).
- `.devagent/core/workflows/clarify-task.md` (Interactive Session Model Pattern) — reference for question batching, progress tracking, incremental saving patterns.
- `.devagent/core/workflows/brainstorm.md` (Interactive Session Model Pattern) — reference for adaptive interaction patterns.
- `.devagent/core/workflows/create-plan.md` (Plan Creation Workflow) — reference for understanding plan structure and context.
- `.devagent/core/AGENTS.md` — standard workflow instructions for date handling, metadata retrieval, context gathering.
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.

## Knowledge Sources
- Internal: Plan document structure, existing workflow patterns (clarify-task, brainstorm), constitution delivery principles (`.devagent/workspace/memory/constitution.md` C3, C4).
- External: None directly—this workflow focuses on validating internal plan documents.
- Retrieval etiquette: Reference plan document sections and tasks with clear names, cite specific content when asking validation questions, update plan document with review notes.

## Workflow

### Review Flow
The flow is simple: analyze the plan, present an overview, offer options, then review based on the user's choice. Keep it natural—no rigid modes or mandatory steps beyond the initial overview.

### Core Workflow

**Natural flow: analyze → overview → offer options → review**

1. **Analyze the plan:**
   - Read the plan document and understand its structure
   - Identify the Implementation Tasks (Task 1, Task 2, etc.) in PART 2: IMPLEMENTATION PLAN
   - Note key sections, Implementation Task count, and any notable complexity (dependencies, risks)

2. **Present high-level overview:**
   - Start with a clear overview: what the plan covers, key sections, Implementation Task count, and any notable complexity
   - This gives context before diving into details
   - Mention the Implementation Tasks that will be reviewed if user chooses step-by-step

3. **Offer review options:**
   - After the overview, naturally offer: "Would you like to walk through the implementation tasks step-by-step (I'll explain what each task will do, the approach, and architecture), or dive into specific parts?"
   - Adapt the phrasing based on plan complexity, but keep it simple and natural
   - Make it clear that "step-by-step" means walking through each Implementation Task

4. **Review based on user choice:**
   - **Step-by-step:** Walk through each **Implementation Task** (Task 1, Task 2, etc.) in the plan. For each task:
     - Present the task: what it will do (Objective), which files/modules it impacts, dependencies
     - Explain the approach: how it will be implemented, architecture decisions, technical strategy
     - Review details: acceptance criteria, testing approach, validation plan
     - Ask for feedback: "Does this approach look good? Any concerns about the architecture or implementation details?"
     - Wait for user feedback before moving to the next task
   - **Specific parts:** Ask what they want to focus on (specific tasks, product context sections, technical notes), then dive into those
   - **⚠️ CRITICAL:** Focus on reviewing the actual work (tasks, approach, architecture, details), NOT nitpicking plan document structure or formatting. Only mention structure issues if they actually block understanding.
   - Update the plan document with review notes as you go
   - Save the plan document after each interaction
   - Let the user change direction naturally—if they want to switch approaches or jump to a different task, accommodate that

5. **Completion:**
   - When the user indicates they're done, save the plan document with any final notes
   - Present a brief summary of what was reviewed

## Adaptation Notes
- **Helpful over systematic (Constitution C6):** Focus on reviewing actual work (tasks, approach, architecture), not plan document structure. Only mention structure issues if they block understanding.
- Keep it simple and natural—adapt to what the user wants, don't force systematic coverage
- **Step-by-step means tasks:** When user chooses step-by-step, walk through Implementation Tasks (Task 1, Task 2, etc.), not plan document sections. For each task, explain what it will do, the approach, and architecture so the user can review those details.
- Questions are optional—only ask when helpful, not as a mandate
- Let users guide the flow—they can jump around, change direction, or focus on what matters to them
- Update the plan document naturally with review notes when feedback is provided
- Avoid nitpicking: Don't point out minor formatting issues or structure nitpicks unless they actually prevent understanding the plan

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
- Metrics / signals: Track review completion rate, tasks/sections most commonly reviewed, feedback patterns, plan revision rate after review
- Decision tracing: All review feedback logged in plan document with user attribution

## Start Here (First Turn)
If required inputs are present:
1. Briefly confirm the plan document being reviewed
2. Analyze the plan structure (sections, Implementation Tasks, complexity)
3. Present a high-level overview: what the plan covers, key sections, Implementation Task count, notable complexity
4. Offer review options naturally: "Would you like to walk through the implementation tasks step-by-step (I'll explain what each task will do, the approach, and architecture), or dive into specific parts?"
5. Wait for the user's preference and proceed accordingly

**⚠️ CRITICAL: When user chooses step-by-step, walk through each Implementation Task (Task 1, Task 2, etc.), not plan document sections. For each task, explain:**
- What it will do (Objective)
- Which files/modules it impacts
- The approach/architecture
- Dependencies
- Acceptance criteria and testing
- Then ask for feedback before moving to the next task

**Focus on reviewing the actual work, NOT nitpicking plan document structure or formatting.**
