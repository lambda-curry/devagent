# Compare PRs

## Mission
- Primary goal: Compare multiple pull requests that accomplish the same task to determine which one is better to work with based on completeness, code quality, and ease of working with. Produce structured comparison artifacts that recommend the best PR and identify strengths from other PRs that should be considered for integration.
- Boundaries / non-goals: Do not automatically merge or close PRs; do not modify PR code; do not post to GitHub or Linear without explicit human confirmation; never expose secrets or credentials.
- Success signals: Comparison artifact ranks PRs with clear scoring rationale, recommends the best PR for working with, identifies specific items from other PRs worth pulling in, and provides actionable recommendations for improving the recommended PR.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: Two or more PR numbers or PR URLs (e.g., `123 456` or `https://github.com/owner/repo/pull/123 https://github.com/owner/repo/pull/456`). Optionally, a task description or Linear issue ID to establish the common task/requirements being accomplished.
- Optional: Task hub path (if known, for linking comparison to the task), Linear issue IDs (if known and not extractable from PRs), comparison focus areas, GitHub repository (if not inferred from context).

## Resource Strategy
- **Comparison artifacts:** `.devagent/workspace/reviews/YYYY-MM-DD_pr-comparison_<pr-numbers>.md` — storage for PR comparison artifacts.
- **Comparison template:** `.devagent/core/templates/pr-comparison-template.md` — template for consistent comparison format.
- **GitHub CLI Operations Skill:** `.codex/skills/github-cli-operations/` — **Consult this skill for detailed GitHub CLI command patterns, examples, and best practices.** Use for PR operations (view PR details, get diff, extract Linear issue references, fetch review comments). The skill contains comprehensive command reference and usage patterns.
- **Linear MCP Integration Skill:** `.codex/skills/linear-mcp-integration/` — **Consult this skill for Linear MCP function usage patterns and examples.** Use for Linear issue operations (get issue details, fetch requirements, update issues, post comments). The skill contains MCP function reference and integration patterns.
- **Project standards:** `.devagent/core/AGENTS.md` (workflow guidelines), `.cursorrules` or workspace rules (code style), `.devagent/workspace/memory/constitution.md` (principles).
- **Task hubs:** `.devagent/workspace/tasks/{status}/YYYY-MM-DD_task-slug/` — optional linking for task-scoped comparisons.
- **Code repository:** Analyze code changes via GitHub CLI diff and file inspection.

## Workflow

1. **Kickoff / readiness checks:**
   - Parse PR inputs (numbers or URLs) and extract all PR numbers
   - Verify at least 2 PRs are provided (request additional if only 1 provided)
   - Verify GitHub CLI (`gh`) is available and authenticated
   - Verify Linear MCP server is available (if Linear issue validation needed)
   - Confirm comparison template exists
   - Identify common task/feature: extract from PR descriptions, Linear issues, or use provided task description

2. **Context gathering (for each PR):**
   - **Fetch PR details** using GitHub CLI (see `.codex/skills/github-cli-operations/` for detailed command patterns):
     - Get PR title, body, author, state, base/head refs: `gh pr view <pr-number> --json title,body,author,state,baseRefName,headRefName`
     - Get changed files: `gh pr view <pr-number> --json files --jq '.files[].path'`
     - Get PR diff: `gh pr diff <pr-number>`
     - Get PR size metrics: `gh pr view <pr-number> --json additions,deletions,changedFiles`
   - **Fetch PR review comments** using GitHub CLI (see `.codex/skills/github-cli-operations/` for comment fetching patterns):
     - Get review comments: `gh pr view <pr-number> --json reviews,comments --jq '.reviews[] | select(.state != "APPROVED") | {state, body, author}'`
     - Get PR review thread comments: `gh api repos/:owner/:repo/pulls/<pr-number>/comments` (if available)
     - Analyze comment importance: identify blocking comments, critical comments, and minor comments
     - Count comments by category for scoring
   - **Extract Linear issue references** from PR (see `.codex/skills/github-cli-operations/` for extraction patterns):
     - Search PR title and body for Linear issue patterns (e.g., `LIN-123`, `[LIN-123]`)
     - Extract all issue IDs found
   - **Fetch Linear issue requirements** (if issues found; see `.codex/skills/linear-mcp-integration/` for MCP function usage):
     - For each Linear issue ID, use Linear MCP to get issue details: `mcp_Linear_get_issue({ id: "LIN-123", includeRelations: true })`
     - Extract acceptance criteria from issue description
     - Parse requirements, checkboxes, and feature specifications
   - **Identify task hub** (optional):
     - Check if PR references a task or feature in title/body
     - Check if changed files suggest task association
     - Link to task hub if identified

3. **Individual PR Analysis (for each PR):**
   - **Requirements validation:**
     - If Linear issues present: Compare PR changes against Linear issue requirements
     - Validate each acceptance criterion: ✅ Fully addressed, ⚠️ Partially addressed, ❌ Missing
     - Calculate requirements coverage score
     - If no Linear issues: Note absence and use neutral baseline
   - **Code quality assessment:**
     - Review code against AGENTS.md guidelines
     - Review code against Cursor rules
     - Check for proper error handling
     - Verify tests are included (if required)
     - Check documentation updates
     - Verify TypeScript/types are properly defined (if applicable)
     - Check for hardcoded secrets or credentials
     - Verify code follows project style conventions
     - Identify and classify issues (critical, major, minor)
     - Calculate code quality score
   - **Ease of working with assessment:**
     - Analyze open review comments (count blocking, critical, minor)
     - Assess code structure and organization
     - Evaluate documentation quality
     - Assess merge complexity (file conflicts, base branch alignment)
     - Evaluate code complexity and readability
     - Calculate ease of working with score

4. **Calculate scores (for each PR):**
   - **Completeness score (0-100, 40% weight):**
     - If Linear issues present: (fully addressed requirements × 3 + partially addressed × 1) / (total requirements × 3) × 100
     - If no Linear issues: 50% (neutral baseline)
     - Consider implementation completeness beyond requirements
   - **Code quality score (0-100, 35% weight):**
     - Start at 100, deduct for issues: critical (-20 each), major (-10 each), minor (-5 each)
     - Add for standards compliance: each standard met (+5 points, up to +25 total)
     - Consider test coverage, documentation quality
   - **Ease of working with score (0-100, 25% weight):**
     - Start at 100 if no open comments
     - Deduct for comments: blocking (-30 each), critical (-15 each), minor (-5 each)
     - Consider code structure, documentation, merge complexity
   - **Overall score:**
     - Weighted average: (Completeness × 0.4) + (Code Quality × 0.35) + (Ease of Working With × 0.25)

5. **Comparative Analysis:**
   - **Rank PRs** by overall score
   - **Identify unique strengths** in each PR (features, patterns, code quality, documentation)
   - **Identify gaps** in the top-ranked PR that are addressed in other PRs
   - **Identify overlapping implementations** and compare quality
   - **Assess merge compatibility** between PRs (can features from one be easily added to another?)

6. **Identify integration opportunities:**
   - For the recommended (top-ranked) PR:
     - List specific items from other PRs worth pulling in (code patterns, features, tests, documentation)
     - Identify improvements that would enhance completeness
     - Identify improvements that would enhance code quality
   - For each other PR:
     - List unique strengths that might benefit the recommended PR
     - Note specific files, functions, or patterns that are particularly strong

7. **Synthesize comparison artifact:**
   - Create comparison artifact using template: `.devagent/core/templates/pr-comparison-template.md`
   - Populate all sections:
     - Executive summary with recommendation
     - PR rankings with scores and summaries
     - Detailed comparison tables (requirements, code quality, ease of working with)
     - Recommendations for the recommended PR
     - Items to pull from other PRs (with specific references)
     - Unique strengths from each PR
   - Link to task hub if applicable
   - Link to Linear issues if present
   - Include specific file references for code patterns/features worth pulling in

8. **Get current date:** Before saving the comparison artifact, review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
9. **Save comparison artifact:**
   - Create reviews directory if it doesn't exist: `.devagent/workspace/reviews/`
   - Save artifact with dated filename using the date retrieved in step 8: `YYYY-MM-DD_pr-comparison_<pr-1>-<pr-2>.md` (use all PR numbers in filename)
   - Ensure artifact follows template structure

10. **Output packaging:**
   - Return chat response with:
     - Recommended PR (#<number>) with overall score
     - Ranking summary (all PRs with scores)
     - Key differentiator (why the recommended PR is best)
     - Top 3-5 items from other PRs worth considering for integration
     - Link to saved comparison artifact

11. **Post-run cleanup:**
    - Ensure comparison artifact is properly saved and linked
    - Note any follow-up actions or questions

## Storage Patterns
- **Comparison artifacts:** Save to `.devagent/workspace/reviews/YYYY-MM-DD_pr-comparison_<pr-numbers>.md`
- **Date retrieval:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for date handling.
- **Naming convention:** Review Standard Workflow Instructions in `.devagent/core/AGENTS.md` for storage patterns. Use date and all PR numbers (e.g., `2025-12-25_pr-comparison_238-239-240.md`)
- **Directory creation:** Create `.devagent/workspace/reviews/` directory if it doesn't exist
- **Linking:** Include links to task hubs and Linear issues in artifact metadata

## Scoring Methodology

**Overall Score Calculation:**
- **Completeness (40% weight):**
  - Requirements coverage: Based on fully/partially/missing requirements (if Linear issues present)
  - Implementation completeness: Assessment of how complete the implementation is
  - Range: 0-100

- **Code Quality (35% weight):**
  - Starts at 100
  - Deducts: critical issues (-20 each), major issues (-10 each), minor issues (-5 each)
  - Adds: standards compliance (+5 per standard met, up to +25)
  - Considers: test coverage, documentation quality
  - Range: 0-100

- **Ease of Working With (25% weight):**
  - Starts at 100 if no open comments
  - Deducts: blocking comments (-30 each), critical comments (-15 each), minor comments (-5 each)
  - Considers: code structure, documentation, merge complexity, code complexity
  - Range: 0-100

**Final Score:** Weighted average of all three components

**Comment Importance Classification:**
- **Blocking:** Comments containing "blocking", "must fix", "required", "critical blocker", "cannot merge"
- **Critical:** Comments with "important", "should fix", "high priority", "significant issue"
- **Minor:** Comments with "nice to have", "optional", "consider", "minor", or general suggestions

## Error Handling

- **GitHub CLI unavailable or unauthenticated:** Pause and request GitHub CLI setup; note requirement in error message
- **Linear MCP unavailable:** Proceed with comparison using code quality focus only; note absence of Linear issue validation in artifact
- **PR not found:** Pause and verify PR number/URL; request correct input; continue with remaining PRs if some are valid
- **Linear issue not found:** Note in artifact that issue reference found but issue could not be fetched; proceed with comparison
- **Template missing:** Use fallback template structure; note in artifact
- **Missing required inputs:** Pause and request at least 2 PR numbers/URLs
- **Only one PR provided:** Request at least one additional PR for comparison

## Human Confirmation Gates (C3 Requirement)

All external actions require explicit human confirmation:
- **GitHub PR comment:** "Would you like to post this comparison as a comment on the PRs? (yes/no)"
- **Linear issue comment:** "Would you like to post this comparison as a comment on Linear issue(s)? (yes/no)"
- **No automatic posting:** Never post to GitHub or Linear without explicit user confirmation

## Integration Hooks

- **Downstream workflows:** `devagent review-progress` — PR comparisons can inform progress reviews
- **Feature hubs:** Comparisons link to task hubs for traceability
- **Linear issues:** Comparisons validate against and optionally update Linear issues
- **GitHub:** Comparisons can optionally post to PR comments
- **Review PR workflow:** Comparison uses similar analysis patterns as `devagent review-pr`

## Adaptation Notes

- Keep comparisons concise but comprehensive—focus on actionable findings
- Prioritize identifying the best PR for working with
- When PRs are very similar, highlight subtle differences in code quality or implementation approach
- Use specific file references and code patterns when recommending items to pull from other PRs
- When requirements are ambiguous, note assumptions and compare based on code quality and ease of working with
- Consider PR state (draft, open, merged) but don't let it override quality assessment

## Failure & Escalation

- Missing PR numbers/URLs — pause and request at least 2 PRs for comparison
- GitHub CLI unavailable — pause and request GitHub CLI setup
- Linear MCP unavailable — proceed with comparison focusing on code quality and ease of working with
- PRs not accessible — verify repository access and PR visibility; continue with accessible PRs
- Conflicting requirements — note conflict in artifact and compare based on code quality and implementation approach

## Expected Output

- **Comparison artifact:** Markdown document saved in `.devagent/workspace/reviews/` with dated filename. Includes PR rankings, detailed comparison tables, recommendations, and items to pull from other PRs.
- **Chat response:** Succinct summary including:
  - Recommended PR (#<number>) with overall score
  - Ranking summary (all PRs ranked with scores)
  - Key differentiator (why recommended PR is best)
  - Top 3-5 items from other PRs worth considering for integration
  - Link to saved comparison artifact

## Follow-up Hooks

- Developers may reference comparison artifacts when deciding which PR to work with
- Comparison findings can inform PR review decisions
- Recommendations can guide integration of improvements from other PRs
- Comparisons can be linked to task hubs for task continuity
- Multiple comparisons may accumulate for the same set of PRs over time (dated artifacts preserve history)
