# Execute Full Task Test Notes

- Date: 2026-01-06
- Purpose: Validate routing logic and execution guidance for execute-full-task.

## Test Run 1: Simple (routing validation)

**Prompt:** Add a "Copy" button to the user profile page that copies the user's ID to clipboard.

**Inputs:**
- Complexity hint: none
- Pause points: none
- Overrides: none

**Complexity Assessment:** Simple
- Single UI change, scoped to one page
- Clear, unambiguous requirement
- No architectural decisions

**Selected Chain:**
`new-task -> research (quick, if needed) -> create-plan -> implement-plan -> mark-task-complete`

**Notes:**
- clarify-task skipped based on clarity and scope
- brainstorm omitted due to low solution-space complexity
- Execution summary should capture the chain selection rationale and link any artifacts created

## Test Run 2: Standard (routing validation)

**Prompt:** Implement user authentication with email/password login and JWT tokens, including password reset flow. Pause after plan for review.

**Inputs:**
- Complexity hint: none
- Pause points: pause after plan
- Overrides: none

**Complexity Assessment:** Standard
- Multiple components (auth flows, tokens, reset)
- User-facing and API changes
- Requirement validation needed

**Selected Chain:**
`new-task -> clarify-task -> research -> create-plan -> implement-plan -> mark-task-complete`

**Notes:**
- clarify-task required for requirements/edge cases
- Pause point honored after create-plan
- Execution summary should capture pause and pending continuation

## Test Run 3: Complex (routing validation)

**Prompt:** Redesign the user dashboard to improve engagement metrics. Current dashboard has low retention. Complexity: complex.

**Inputs:**
- Complexity hint: complex
- Pause points: none
- Overrides: none

**Complexity Assessment:** Complex (user override honored)
- Significant UX scope
- Multiple stakeholders / product impact
- Solution exploration required

**Selected Chain:**
`new-task -> clarify-task -> research -> brainstorm -> create-plan -> implement-plan -> mark-task-complete`

**Notes:**
- brainstorm included to explore solution space
- Extended research expected before planning
