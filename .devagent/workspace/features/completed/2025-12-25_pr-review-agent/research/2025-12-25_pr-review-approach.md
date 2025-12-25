# PR Review Agent Approach Research

- Owner: DevAgent Team
- Last Updated: 2025-12-25
- Status: Research
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/`

## Classification & Assumptions

**Classification:** Implementation design research for PR review agent architecture and approach

**Assumptions:**
- PR review agent needs to analyze code changes, validate against Linear issues, and check code quality
- Should integrate with DevAgent's structured workflow model and artifact system
- Must follow DevAgent constitution principles (C3: human-in-the-loop, traceable artifacts)
- Should be tool-agnostic (C4) but can use tool-specific integrations
- Review outputs should be traceable and link to mission/requirements

## Research Plan

1. **Workflow vs Skill Decision**
   - Should PR review be a DevAgent workflow (manual invocation) or a skill (auto-discovery)?
   - How does it fit into DevAgent's lifecycle model?
   - What artifacts should it produce?

2. **Review Process Design**
   - What should the review process look like?
   - How should it integrate with feature hubs and Linear issues?
   - What review outputs are most valuable?

3. **Integration Patterns**
   - How should it use GitHub CLI and Linear MCP tools?
   - Should it leverage existing skills or be standalone?
   - How does it coordinate with other DevAgent workflows?

4. **Output and Artifact Structure**
   - Where should review artifacts be stored?
   - What format should reviews take?
   - How should reviews link to feature hubs and Linear issues?

## Sources

1. **DevAgent Constitution**: `.devagent/workspace/memory/constitution.md` (2025-12-25) — Delivery principles (C3), tool-agnostic design (C4)
2. **Workflow vs Skill Decision Guide**: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` (2025-12-25) — Decision framework for workflows vs skills
3. **DevAgent Workflow Roster**: `.devagent/core/AGENTS.md` (2025-12-25) — Available workflows and usage patterns
4. **Review Progress Workflow**: `.devagent/core/workflows/review-progress.md` (2025-12-25) — Related workflow for progress tracking
5. **GitHub/Linear Integration Skills**: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_github-linear-integration-skills.md` (2025-12-25) — Integration options research
6. **PR Review Integration Skill**: `.claude/skills/pr-review-integration/SKILL.md` (2025-12-25) — Current skill implementation
7. **External**: AI agent PR review patterns and best practices

## Findings & Tradeoffs

### Workflow vs Skill Analysis

#### Option 1: DevAgent Workflow (`devagent review-pr`)

**Characteristics:**
- Manual invocation: `devagent review-pr <pr-number>`
- Produces structured artifacts in `.devagent/workspace/`
- Follows DevAgent lifecycle patterns
- Coordinates with feature hubs and research packets
- Tool-agnostic design (C4)

**Pros:**
- ✅ Fits DevAgent's structured workflow model
- ✅ Produces traceable artifacts (C3 requirement)
- ✅ Can coordinate with feature hubs and Linear issues
- ✅ Manual control over when reviews happen
- ✅ Can produce review documents in `.devagent/workspace/features/` or `.devagent/workspace/reviews/`
- ✅ Follows existing workflow patterns (like `review-progress`)
- ✅ Tool-agnostic by default (C4)

**Cons:**
- ❌ Requires explicit invocation (not automatic)
- ❌ May be less discoverable than skills
- ❌ More structured/formal than lightweight skills

**Artifact Structure:**
```
.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md
# OR
.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/reviews/YYYY-MM-DD_pr-<number>.md
```

**Integration:**
- Uses GitHub CLI skill (`.claude/skills/github-cli-operations/`) for PR operations
- Uses Linear MCP skill (`.claude/skills/linear-mcp-integration/`) for issue operations
- Produces review artifacts that link to feature hubs and Linear issues

#### Option 2: Agent Skill (Auto-Discovery)

**Characteristics:**
- Auto-discovered when PRs are mentioned in conversation
- Standalone capability
- Cross-platform portable
- No structured artifact production

**Pros:**
- ✅ Automatic discovery and activation
- ✅ Cross-platform (Cursor, VS Code, GitHub, etc.)
- ✅ Lightweight and flexible
- ✅ Already implemented (`.claude/skills/pr-review-integration/`)

**Cons:**
- ❌ Doesn't produce structured artifacts in `.devagent/workspace/`
- ❌ Doesn't fit DevAgent's lifecycle model
- ❌ No coordination with feature hubs
- ❌ Less traceable (violates C3 requirement for traceable artifacts)
- ❌ Not tool-agnostic (relies on specific tools)

#### Option 3: Hybrid Approach (Workflow + Skills)

**Characteristics:**
- DevAgent workflow (`devagent review-pr`) that invokes manually
- Uses GitHub CLI and Linear MCP skills for tool operations
- Produces structured review artifacts
- Leverages skills for tool integration while maintaining workflow structure

**Pros:**
- ✅ Best of both worlds: structured workflow + reusable tool skills
- ✅ Produces traceable artifacts (C3)
- ✅ Tool-agnostic workflow design (C4)
- ✅ Reuses existing skills for tool operations
- ✅ Follows DevAgent patterns

**Cons:**
- ⚠️ More complex architecture
- ⚠️ Requires coordination between workflow and skills

### Review Process Design

#### Process Flow (Recommended)

1. **Invocation**: `devagent review-pr <pr-number>` or `devagent review-pr <pr-url>`
2. **Context Gathering**:
   - Fetch PR details via GitHub CLI skill
   - Extract Linear issue references from PR (if any)
   - If Linear issues found: Fetch Linear issue requirements via Linear MCP skill
   - Load relevant feature hub context if PR links to feature
3. **Analysis**:
   - **If Linear issues present:**
     - Compare PR changes against Linear issue requirements
     - Validate requirements completeness
     - Check for missing requirements or incomplete implementations
   - **If no Linear issues:**
     - Note absence of Linear issue linkage
     - Focus review on code quality and standards compliance
     - Suggest creating/attaching Linear issue if appropriate
   - **Always:**
     - Validate code quality against AGENTS.md and Cursor rules
     - Check for proper error handling, tests, documentation
     - Identify code quality issues and improvements
4. **Artifact Creation**:
   - **Always create structured review document** in `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md`
   - Link to feature hub if applicable
   - Link to Linear issues if present
   - Include requirements checklist (if Linear issues), code quality assessment, gaps/issues identified
   - Note absence of Linear issues if applicable
5. **Output Options** (all require human confirmation per C3):
   - **Primary**: Review artifact saved to `.devagent/workspace/reviews/` (always created)
   - **Optional**: Post review summary to GitHub PR comment
   - **Optional**: Post review summary to Linear issue (if Linear issues present)
   - **Optional**: Update Linear issue status (if Linear issues present)
   - **Optional**: Suggest creating Linear issue (if no Linear issues present)

#### Review Artifact Structure

**Location Options:**
- **Option A**: `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md` (general reviews)
- **Option B**: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/reviews/YYYY-MM-DD_pr-<number>.md` (feature-scoped reviews)

**Recommended**: Option A for general reviews, Option B when PR clearly links to a feature hub.

**Review Document Template:**
```markdown
# PR Review: #<number>

- PR: <pr-url>
- Author: <author>
- Date: <review-date>
- Related Feature: <feature-hub-link> (if applicable)
- Linear Issues: <issue-ids> (if present) / ⚠️ No Linear issues linked

## Requirements Validation

### Linear Issue Requirements
**If Linear issues present:**
- Issue: <issue-id>
- Acceptance Criteria:
  - [ ] <criterion 1> - ✅ Addressed / ⚠️ Partial / ❌ Missing
  - [ ] <criterion 2> - ✅ Addressed / ⚠️ Partial / ❌ Missing

**If no Linear issues:**
- ⚠️ **No Linear issues linked to this PR**
- Review focused on code quality and standards compliance
- Consider creating/attaching Linear issue for requirements traceability

### Gaps Identified
- <gap 1>
- <gap 2>

## Code Quality Assessment

### Standards Compliance
- [ ] Follows AGENTS.md guidelines
- [ ] Follows Cursor rules
- [ ] Proper error handling
- [ ] Tests included (if required)
- [ ] Documentation updated

### Issues Found
- <issue 1>
- <issue 2>

## Review Summary

### ✅ Strengths
- <strength 1>
- <strength 2>

### ⚠️ Concerns
- <concern 1>
- <concern 2>

### 🔗 Related Work
- Feature Hub: <link> (if applicable)
- Linear Issues: <links> (if present) / None linked
- Related PRs: <links>

## Next Steps
- [ ] <action item 1>
- [ ] <action item 2>
- [ ] Consider creating/attaching Linear issue (if no Linear issues present)
```

### Integration with Existing Workflows

**Coordination Points:**
- **`review-progress`**: PR reviews can inform progress reviews
- **`create-plan`**: PR reviews can validate plan execution
- **Feature Hubs**: Reviews link to feature hubs for traceability
- **Linear Issues**: Reviews validate against and update Linear issues

**Tool Integration:**
- Uses `.claude/skills/github-cli-operations/` for GitHub operations
- Uses `.claude/skills/linear-mcp-integration/` for Linear operations
- Workflow remains tool-agnostic (C4) while leveraging tool-specific skills

## Recommendation

### Primary Recommendation: DevAgent Workflow (Hybrid Approach)

**Create `devagent review-pr` workflow** that:
1. **Manual invocation** with PR number or URL
2. **Uses existing skills** for GitHub CLI and Linear MCP operations
3. **Produces structured artifacts** in `.devagent/workspace/reviews/`
4. **Links to feature hubs** and Linear issues for traceability
5. **Requires human confirmation** for all external actions (C3)
6. **Tool-agnostic design** (C4) while leveraging tool-specific skills

**Rationale:**
- ✅ Aligns with DevAgent's structured workflow model
- ✅ Produces traceable artifacts (C3 requirement)
- ✅ Coordinates with feature hubs and Linear issues
- ✅ Reuses existing skills for tool operations
- ✅ Follows DevAgent patterns (similar to `review-progress`)
- ✅ Manual control ensures reviews happen at appropriate times
- ✅ Tool-agnostic workflow design with tool-specific skill integration

### Keep Skills for Tool Operations

**Maintain existing skills:**
- `.claude/skills/github-cli-operations/` — GitHub CLI patterns
- `.claude/skills/linear-mcp-integration/` — Linear MCP functions
- **Remove or repurpose** `.claude/skills/pr-review-integration/` — This skill doesn't fit DevAgent's model (no artifact production, no coordination with feature hubs)

**Skills provide tool capabilities; workflow provides structure and artifacts.**

### Workflow Structure

**Location**: `.devagent/core/workflows/review-pr.md`

**Invocation**: `devagent review-pr <pr-number>` or `devagent review-pr <pr-url>`

**Inputs:**
- Required: PR number or URL
- Optional: Feature hub path (if known), Linear issue IDs (if known), review focus areas

**Outputs:**
- **Required**: Review artifact: `.devagent/workspace/reviews/YYYY-MM-DD_pr-<number>-review.md` (always created, regardless of Linear issue presence)
- **Optional**: GitHub PR comment (with human confirmation)
- **Optional**: Linear issue comment (with human confirmation, only if Linear issues present)
- **Optional**: Suggestion to create/attach Linear issue (if no Linear issues present)

**Integration:**
- References GitHub CLI skill for PR operations
- References Linear MCP skill for issue operations
- Links to feature hubs when applicable
- Coordinates with `review-progress` workflow

## Repo Next Steps

- [x] Research PR review approach and architecture
- [ ] Create `.devagent/core/workflows/review-pr.md` workflow definition
- [ ] Create `.agents/commands/review-pr.md` command file
- [ ] Update `.devagent/core/AGENTS.md` to include `review-pr` workflow
- [ ] Create review artifact template in `.devagent/core/templates/`
- [ ] Decide on `.claude/skills/pr-review-integration/` — remove or repurpose?
- [ ] Test workflow with sample PR
- [ ] Update PR review agent feature hub with decision

## Risks & Open Questions

**Risks:**
- Workflow may be less discoverable than auto-discovered skills
- Requires manual invocation (may be forgotten)
- More structured than lightweight skill approach

**Open Questions:**
- Should reviews be automatically linked to feature hubs, or manually specified?
- Should the workflow support batch reviews (multiple PRs)?
- ~~How should the workflow handle PRs without Linear issues?~~ **RESOLVED:** Always create review artifact in `.devagent/workspace/reviews/`; focus on code quality when no Linear issues present; optionally suggest creating Linear issue.
- ~~Should review artifacts be stored per-feature or in a central reviews directory?~~ **RESOLVED:** Central reviews directory (`.devagent/workspace/reviews/`) for all PR reviews, with optional links to feature hubs when applicable.
- Should the workflow integrate with CI/CD for automated reviews?

**Clarifications Needed:**
- [NEEDS CLARIFICATION] Preferred artifact location: central reviews directory vs feature-scoped?
- [NEEDS CLARIFICATION] Should workflow support automated/CI integration, or remain manual only?
- [NEEDS CLARIFICATION] How should workflow handle PRs that span multiple features?

## References

- DevAgent Constitution: `.devagent/workspace/memory/constitution.md` — Delivery principles (C3), tool-agnostic design (C4)
- Workflow vs Skill Guide: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` — Decision framework
- DevAgent Workflow Roster: `.devagent/core/AGENTS.md` — Available workflows and patterns
- Review Progress Workflow: `.devagent/core/workflows/review-progress.md` — Related workflow pattern
- GitHub/Linear Integration Research: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/research/2025-12-25_github-linear-integration-skills.md`
- PR Review Integration Skill: `.claude/skills/pr-review-integration/SKILL.md` — Current skill implementation (to be evaluated)
- PR Review Agent Feature: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/AGENTS.md`
