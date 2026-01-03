# Review PR

## Mission
- Primary goal: Review pull requests by analyzing code changes, validating against Linear issue requirements (when present), and checking code quality against project standards (AGENTS.md and Cursor rules). Produce structured review artifacts in `.devagent/workspace/reviews/` for traceability, linking to task hubs and Linear issues.
- Boundaries / non-goals: Do not automatically approve or merge PRs; do not modify PR code; do not post to GitHub or Linear without explicit human confirmation; never expose secrets or credentials.
- Success signals: Review artifacts are created with comprehensive requirements validation (when Linear issues present), code quality assessment, identified gaps, and actionable next steps; reviews are traceable and link to task hubs and Linear issues; human confirmation required for all external actions (C3 requirement).

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customization:
- Only pause for missing REQUIRED inputs, blocking errors, or when explicit human confirmation is required for external actions (GitHub PR comments, Linear issue comments).

## Inputs
- Required: PR number or PR URL (e.g., `123` or `https://github.com/owner/repo/pull/123`).
- Optional: Task hub path (if known, for linking review to the task), Linear issue IDs (if known and not extractable from PR), review focus areas, GitHub repository (if not inferred from context).

## Resource Strategy
- **Review artifacts:** `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md` — storage for all PR review artifacts.
- **Review artifact template:** `.devagent/core/templates/review-artifact-template.md` — template for consistent review format.
- **GitHub CLI Operations Skill:** `.codex/skills/github-cli-operations/` — **Consult this skill for detailed GitHub CLI command patterns, examples, and best practices.** Use for PR operations (view PR details, get diff, extract Linear issue references, fetch review comments). The skill contains comprehensive command reference and usage patterns.
- **Linear MCP Integration Skill:** `.codex/skills/linear-mcp-integration/` — **Consult this skill for Linear MCP function usage patterns and examples.** Use for Linear issue operations (get issue details, fetch requirements, update issues, post comments). The skill contains MCP function reference and integration patterns.
- **Project standards:** `.devagent/core/AGENTS.md` (workflow guidelines), `.cursorrules` or workspace rules (code style), `.devagent/workspace/memory/constitution.md` (principles).
- **Task hubs:** `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/` — optional linking for task-scoped reviews.
- **Code repository:** Analyze code changes via GitHub CLI diff and file inspection.

## Workflow

1. **Kickoff / readiness checks:**
   - Parse PR input (number or URL) and extract PR number
   - Verify GitHub CLI (`gh`) is available and authenticated
   - Verify Linear MCP server is available (if Linear issue validation needed)
   - Confirm review artifact template exists

2. **Context gathering:**
   - **Fetch PR details** using GitHub CLI (see `.codex/skills/github-cli-operations/` for detailed command patterns):
     - Get PR title, body, author, state, base/head refs: `gh pr view <pr-number> --json title,body,author,state,baseRefName,headRefName`
     - Get changed files: `gh pr view <pr-number> --json files --jq '.files[].path'`
     - Get PR diff: `gh pr diff <pr-number>`
   - **Fetch PR review comments** using GitHub CLI (see `.codex/skills/github-cli-operations/` for comment fetching patterns):
     - Get review comments: `gh pr view <pr-number> --json reviews,comments --jq '.reviews[] | select(.state != "APPROVED") | {state, body, author}'`
     - Get PR review thread comments: `gh api repos/:owner/:repo/pulls/<pr-number>/comments` (if available)
     - Analyze comment importance: identify blocking comments (e.g., "blocking", "must fix", "critical"), critical comments (e.g., "important", "should fix"), and minor comments (e.g., "nice to have", "optional")
   - **Extract Linear issue references** from PR (see `.codex/skills/github-cli-operations/` for extraction patterns):
     - Search PR title and body for Linear issue patterns (e.g., `LIN-123`, `[LIN-123]`)
     - Extract all issue IDs found
   - **Fetch Linear issue requirements** (if issues found; see `.codex/skills/linear-mcp-integration/` for MCP function usage):
     - For each Linear issue ID, use Linear MCP to get issue details: `mcp_Linear_get_issue({ id: "LIN-123", includeRelations: true })`
     - Extract acceptance criteria from issue description
     - Parse requirements, checkboxes, and feature specifications
   - **Identify task hub** (optional):
     - Check if PR references a task or feature in title/body
     - Check if changed files suggest task association (e.g., files in task directory)
     - Link to task hub if identified

3. **Analysis:**
   - **Analyze open review comments:**
     - Review fetched PR review comments and classify by importance (blocking, critical, minor)
     - Extract key concerns and requirements from comments
     - Note any blocking comments that prevent merge
     - Count total comments by category for confidence score calculation
   - **If Linear issues present:**
     - Compare PR changes against Linear issue requirements
     - Validate each acceptance criterion:
       - ✅ Fully addressed (code changes clearly implement requirement)
       - ⚠️ Partially addressed (requirement partially implemented)
       - ❌ Missing (requirement not addressed)
     - Identify gaps: requirements not addressed or incompletely implemented
     - Check for missing requirements or incomplete implementations
   - **If no Linear issues:**
     - Note absence of Linear issue linkage
     - Focus review on code quality and standards compliance
     - Consider suggesting creating/attaching Linear issue for traceability
   - **Code quality assessment (always):**
     - Review code against AGENTS.md guidelines
     - Review code against Cursor rules (`.cursorrules` or workspace rules)
     - Check for proper error handling
     - Verify tests are included (if required by project standards)
     - Check documentation updates (code comments, README, etc.)
     - Verify TypeScript/types are properly defined (if applicable)
     - Check for hardcoded secrets or credentials
     - Verify code follows project style conventions
     - Identify code quality issues and improvements
     - Classify issues by severity (critical, major, minor) for confidence score calculation

4. **Calculate confidence score:**
   - **Requirements coverage score (0-100):**
     - If Linear issues present: Calculate based on fully addressed vs. total requirements (fully addressed = +3 points each, partially addressed = +1 point each, missing = 0 points), normalize to 0-100
     - If no Linear issues: Use 50% as baseline (neutral score)
   - **Code quality score (0-100):**
     - Start at 100, deduct points for each issue found (critical issues = -20 points, major issues = -10 points, minor issues = -5 points)
     - Add points for standards compliance (each standard met = +5 points)
     - Cap at 0-100 range
   - **Open comments score (0-100):**
     - Start at 100 if no open comments
     - Deduct points: blocking comments = -30 each, critical comments = -15 each, minor comments = -5 each
     - Cap at 0-100 range
   - **Overall confidence score:**
     - Weighted average: Requirements coverage (40%), Code quality (35%), Open comments (25%)
     - Classify as: High (80-100), Medium (50-79), Low (0-49)
     - Determine recommendation based on score and critical blockers

5. **Synthesize review artifact:**
   - Create review artifact using template: `.devagent/core/templates/review-artifact-template.md`
   - Populate all sections:
     - PR metadata (PR number, URL, author, date)
     - Requirements validation (with Linear issue validation if present, or note absence)
     - **Open review comments** (analysis of existing comments by importance)
     - Code quality assessment (standards compliance checklist, issues found)
     - Review summary (strengths, concerns, related work)
     - **Confidence score** (overall score, breakdown, recommendation)
     - Next steps (actionable items)
   - Link to task hub if applicable
   - Link to Linear issues if present
   - Include specific file references for code quality issues
   - Include analysis of open review comments with classification (blocking, critical, minor)

6. **Get current date:** Before saving the review artifact, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
7. **Save review artifact:**
   - Create reviews directory if it doesn't exist: `.devagent/workspace/reviews/`
   - Save artifact with dated filename using the date retrieved in step 6: `YYYY-MM-DD_pr-<number>-review.md`
   - Ensure artifact follows template structure

8. **Optional external actions (require human confirmation per C3):**
   - **Post to GitHub PR:** Present review summary for posting as PR comment (require explicit confirmation)
   - **Post to Linear issue(s):** Present review summary for posting to Linear issue comments (require explicit confirmation, only if Linear issues present)
   - **Suggest creating Linear issue:** If no Linear issues present, suggest creating/attaching Linear issue for traceability

9. **Output packaging:**
   - Return chat response with:
     - Brief review summary (requirements validation status, code quality status)
     - **Confidence score** (overall score 0-100 and label: High/Medium/Low)
     - Key findings (top 3-5 items: gaps, issues, strengths)
     - Recommendation (Ready to merge / Needs minor fixes / Needs significant work / Blocked)
     - Link to saved review artifact
     - Optional actions requiring confirmation (if applicable)

10. **Post-run cleanup:**
   - Ensure review artifact is properly saved and linked
   - Note any follow-up actions or questions

## Storage Patterns
- **Review artifacts:** Always save to `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md`
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- **Naming convention:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for storage patterns. Use date and PR number (e.g., `2025-12-25_pr-123-review.md`)
- **Directory creation:** Create `.devagent/workspace/reviews/` directory if it doesn't exist
- **Linking:** Include links to task hubs and Linear issues in artifact metadata

## Confidence Score Calculation

The confidence score provides a quantitative assessment of PR readiness based on requirements coverage, code quality, and open review comments. Scores are calculated as follows:

**Score Components (weighted average):**
1. **Requirements Coverage (40% weight):**
   - If Linear issues present: (fully addressed requirements × 3 + partially addressed × 1) / (total requirements × 3) × 100
   - If no Linear issues: 50% (neutral baseline)
   - Range: 0-100

2. **Code Quality (35% weight):**
   - Start at 100, deduct for issues: critical (-20 each), major (-10 each), minor (-5 each)
   - Add for standards compliance: each standard met (+5 points, up to +25 total)
   - Range: 0-100

3. **Open Comments (25% weight):**
   - Start at 100 if no open comments
   - Deduct for comments: blocking (-30 each), critical (-15 each), minor (-5 each)
   - Range: 0-100

**Overall Score:**
- Weighted average: (Requirements × 0.4) + (Code Quality × 0.35) + (Open Comments × 0.25)
- Classification:
  - **High (80-100):** Ready to merge, minimal concerns
  - **Medium (50-79):** Some issues, addressable before merge
  - **Low (0-49):** Significant issues, needs work before merge

**Comment Importance Classification:**
- **Blocking:** Comments containing terms like "blocking", "must fix", "required", "critical blocker", "cannot merge"
- **Critical:** Comments with "important", "should fix", "high priority", "significant issue"
- **Minor:** Comments with "nice to have", "optional", "consider", "minor", or general suggestions

**Recommendation Logic:**
- High score + no blockers → "Ready to merge"
- Medium score + minor issues → "Needs minor fixes"
- Medium/Low score + critical issues → "Needs significant work"
- Any score + blocking comments → "Blocked"

## Linear Issue Reference Extraction

When extracting Linear issue references from PR:
- Search PR title for patterns: `LIN-123`, `[LIN-123]`, `(LIN-123)`
- Search PR body for patterns: `LIN-123`, `[LIN-123]`, `(LIN-123)`, `https://linear.app/.../issue/LIN-123`
- Extract all unique issue IDs found
- Handle multiple issues in single PR (validate against all issues)

## Error Handling

- **GitHub CLI unavailable or unauthenticated:** Pause and request GitHub CLI setup; note requirement in error message
- **Linear MCP unavailable:** Proceed with code quality review only; note absence of Linear issue validation in artifact
- **PR not found:** Pause and verify PR number/URL; request correct input
- **Linear issue not found:** Note in artifact that issue reference found but issue could not be fetched; proceed with code quality review
- **Template missing:** Use fallback template structure; note in artifact
- **Missing required inputs:** Pause and request PR number/URL

## Human Confirmation Gates (C3 Requirement)

All external actions require explicit human confirmation:
- **GitHub PR comment:** "Would you like to post this review as a comment on the PR? (yes/no)"
- **Linear issue comment:** "Would you like to post this review as a comment on Linear issue(s)? (yes/no)"
- **No automatic posting:** Never post to GitHub or Linear without explicit user confirmation

## Integration Hooks

- **Downstream workflows:** `devagent review-progress` — PR reviews can inform progress reviews
- **Feature hubs:** Reviews link to task hubs for traceability
- **Linear issues:** Reviews validate against and optionally update Linear issues
- **GitHub:** Reviews can optionally post to PR comments

## Adaptation Notes

- Keep reviews concise but comprehensive—focus on actionable findings
- Prioritize requirements validation when Linear issues are present
- When Linear issues are missing, emphasize code quality and suggest traceability improvements
- Use specific file references and line numbers when identifying code quality issues
- Group related findings to maintain readability
- When requirements are ambiguous, note assumptions and request clarification

## Failure & Escalation

- Missing PR number/URL — pause and request required input
- GitHub CLI unavailable — pause and request GitHub CLI setup
- Linear MCP unavailable — proceed with code quality review only, note limitation in artifact
- PR not accessible — verify repository access and PR visibility
- Conflicting requirements — note conflict in artifact and flag for human review

## Expected Output

- **Review artifact:** Markdown document saved in `.devagent/workspace/reviews/` with dated filename. Includes requirements validation (when Linear issues present), code quality assessment, identified gaps, and actionable next steps.
- **Chat response:** Succinct summary including:
  - **Confidence score** (overall score 0-100 and label: High/Medium/Low)
  - Requirements validation status (✅/⚠️/❌ summary when Linear issues present, or note absence)
  - Code quality status (key issues found, compliance status)
  - Top findings (3-5 key items: gaps, issues, strengths)
  - Recommendation (Ready to merge / Needs minor fixes / Needs significant work / Blocked)
  - Link to saved review artifact
  - Optional actions requiring confirmation (if applicable)

## Follow-up Hooks

- Developers may reference review artifacts when addressing feedback
- Reviews can inform `devagent review-progress` for progress tracking
- Reviews can be linked to task hubs for task continuity
- Multiple reviews may accumulate for same PR over time (dated artifacts preserve history)
