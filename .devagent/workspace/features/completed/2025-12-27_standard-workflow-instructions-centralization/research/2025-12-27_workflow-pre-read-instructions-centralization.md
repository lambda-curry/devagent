# Workflow Pre-Read Instructions Centralization

**Date:** 2025-12-27  
**Classification:** Workflow architecture improvement, pattern analysis  
**Status:** Research Complete

## Research Plan

This research investigates:
1. Whether Builder Methods AgentOS or similar systems use pre-read instructions in reference files
2. What common instructions are currently repeated across DevAgent workflows
3. Whether DevAgent should centralize common workflow instructions in AGENTS.md
4. Recommendations for implementation approach

## Sources

### External Sources
- Builder.io AGENTS.md documentation pattern (via web search)
- AgentsMD.io best practices for AGENTS.md files (via web search)
- Factory.ai AGENTS.md configuration guidance (via web search)

### Internal Sources
- `.devagent/core/workflows/**/*.md` - All 14 workflow files analyzed
- `.devagent/core/AGENTS.md` - Current workflow roster documentation
- `.devagent/core/templates/agent-brief-template.md` - Template showing common patterns
- `.devagent/workspace/features/completed/2025-12-27_consistent-date-handling-workflows/` - Recent pattern standardization example

## Findings & Tradeoffs

### 1. Builder Methods / AGENTS.md Pattern

**Key Finding:** The Builder Methods pattern (via Builder.io and similar tools) uses `AGENTS.md` files as centralized configuration for AI agents. This pattern:

- **Provides centralized guidance** on essential setup commands, build steps, and development server instructions
- **Reduces repetition** by consolidating common instructions that multiple agents need
- **Improves maintainability** by having a single source of truth for shared patterns
- **Enhances consistency** across workflows by referencing the same instructions

This pattern aligns with DevAgent's goal of reducing repetition and improving consistency across workflows.

### 2. Common Instructions Currently Repeated Across Workflows

Analysis of all 14 workflow files reveals the following patterns that are repeated across multiple workflows:

#### A. Execution Directive Pattern (14/14 workflows)
**Current pattern:** Each workflow has its own "Execution Directive" section with slight variations:
- "When invoked with `devagent [workflow-name]` and required inputs, **EXECUTE IMMEDIATELY**"
- Variations include: "Do not summarize, describe, or request approval"
- Some include: "The executing developer has standing approval"
- Some include: "Only pause for missing REQUIRED inputs or blocking errors"

**Recommendation:** Centralize standard execution directive language in AGENTS.md, allow workflows to reference it with workflow-specific customizations.

#### B. Date Retrieval Instructions (8/14 workflows)
**Current pattern:** Multiple workflows include explicit date retrieval instructions:
- "Before creating any [dated document], explicitly run `date +%Y-%m-%d` to get the current date in ISO format (YYYY-MM-DD)"
- This was recently standardized (see completed feature `2025-12-27_consistent-date-handling-workflows`)

**Status:** Already standardized, but instruction is repeated in each workflow file.

**Recommendation:** Move to AGENTS.md as a standard pre-read instruction: "When creating dated documents, always run `date +%Y-%m-%d` first and use output for YYYY-MM-DD portions of filenames."

#### C. Git User Retrieval (2/14 workflows)
**Current pattern:** `create-plan.md` and `new-feature.md` include:
- "Determine owner by running `git config user.name` (to be used in metadata)"
- "Otherwise, get the current git user by running `git config user.name` and use that as the owner"

**Recommendation:** Centralize as standard metadata retrieval pattern in AGENTS.md.

#### D. Context Gathering Patterns (14/14 workflows)
**Current pattern:** Most workflows include "Context gathering" steps that reference:
- `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
- `.devagent/core/workflows/**/*.md`
- `.devagent/workspace/{product,features,memory,research}/**`
- Rules & conventions (cursor rules, `.github/*.md`)
- Constitution and memory artifacts

**Variations:** Each workflow lists these slightly differently, with some workflows more comprehensive than others.

**Recommendation:** Standardize context gathering order and location hierarchy in AGENTS.md, have workflows reference it.

#### E. Guardrails Pattern (Multiple workflows)
**Current pattern:** Common guardrails repeated across workflows:
- "Prefer authoritative sources and project-internal context first"
- "Never expose secrets or credentials; redact as `{{SECRET_NAME}}`"
- "Tag uncertainties with `[NEEDS CLARIFICATION: ...]`"

**Found in:** `agent-brief-template.md`, `research.md`, and implied in other workflows.

**Recommendation:** Centralize standard guardrails in AGENTS.md.

#### F. Storage Policy Patterns (14/14 workflows)
**Current pattern:** Each workflow defines:
- Primary artifact path/pattern
- Inline vs file rules
- Naming conventions (especially dated filenames)

**Recommendation:** Document standard storage patterns in AGENTS.md (e.g., dated filenames use `YYYY-MM-DD_<descriptor>.md`), but keep workflow-specific paths in individual workflows since they vary significantly.

### 3. Current AGENTS.md Structure

**Current state:** `.devagent/core/AGENTS.md` contains:
- Project context
- How workflows work (conceptual guidance)
- Workflow roster (list of workflows with brief descriptions)
- Workflow naming conventions

**Observation:** AGENTS.md is currently more of a "workflow catalog" than a "workflow instruction reference." It doesn't contain the technical instructions that workflows should follow.

### 4. Tradeoffs of Centralization

**Benefits:**
- **Reduced duplication:** Common instructions written once, referenced many times
- **Easier maintenance:** Update common patterns in one place
- **Consistency:** All workflows reference the same standard instructions
- **Alignment with industry patterns:** Matches Builder.io AGENTS.md pattern
- **Better onboarding:** New workflows can reference standard patterns

**Risks:**
- **Workflow readability:** Workflows need to reference external file, which could reduce self-contained clarity
- **Dependency management:** Workflows become dependent on AGENTS.md structure
- **Versioning concerns:** If AGENTS.md changes, all workflows may need review
- **Cognitive overhead:** Developers need to know to check AGENTS.md for standard instructions

**Mitigation strategies:**
- Keep workflow-specific instructions in workflows
- Use clear references like "See `.devagent/core/AGENTS.md` → Standard Workflow Instructions"
- Maintain backward compatibility when updating AGENTS.md
- Document reference pattern in workflow template

## Recommendation

### Recommended Approach: Hybrid Centralization

**1. Add "Standard Workflow Instructions" section to `.devagent/core/AGENTS.md`**

Create a new section that contains common pre-read instructions:

```markdown
## Standard Workflow Instructions

Before executing any workflow, review and follow these standard instructions:

### Date Handling
- When creating dated documents, always run `date +%Y-%m-%d` first to get current date in ISO format
- Use the output for YYYY-MM-DD portions of filenames (e.g., `YYYY-MM-DD_<descriptor>.md`)
- Do not infer or assume the date

### Metadata Retrieval
- To determine owner/author for metadata: run `git config user.name`
- Use this value when owner is not explicitly provided in inputs

### Context Gathering (Standard Order)
When gathering context, review in this order:
1. Internal agent documentation: `AGENTS.md` (root) and `.devagent/core/AGENTS.md`
2. Workflow definitions: `.devagent/core/workflows/**/*.md`
3. Rules & conventions: cursor rules, `.github/*.md` policy docs
4. DevAgent workspace:
   - `.devagent/workspace/product/**` (mission, roadmap, guiding-questions)
   - `.devagent/workspace/features/**` (feature hubs, specs, task plans)
   - `.devagent/workspace/memory/**` (constitution, decisions, tech stack)
   - `.devagent/workspace/research/**` (prior research packets)
5. Fallback: `README.*` or `docs/**` if above are insufficient

### Standard Guardrails
- Prefer authoritative sources and project-internal context first
- Never expose secrets or credentials; redact as `{{SECRET_NAME}}`
- Tag uncertainties with `[NEEDS CLARIFICATION: ...]`
- Cite file paths with anchors when available

### Execution Directive (Standard)
When invoked with `devagent [workflow-name]` and required inputs, **EXECUTE IMMEDIATELY**. 
- Do not summarize, describe, or request approval—perform the work using available tools
- The executing developer has standing approval to invoke workflows
- Only pause for missing REQUIRED inputs, blocking errors, or when explicit human confirmation is required for external actions
- Note exceptional findings in the response rather than blocking the run

### Storage Patterns
- Dated artifacts: Use `YYYY-MM-DD_<descriptor>.md` format (date from `date +%Y-%m-%d`)
- Quick clarifications: reply inline only
- Significant outputs: create a file and include an inline summary with a link
- Feature-scoped artifacts: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/`
- General artifacts: `.devagent/workspace/research/` or `.devagent/workspace/reviews/`
```

**2. Update workflow files to reference AGENTS.md**

In each workflow, add a reference at the top (after Purpose & Scope, before Execution Directive):

```markdown
## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval  
- Context gathering order
- Standard guardrails
- Storage patterns
```

Then simplify Execution Directive sections to:
```markdown
## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions, with the following workflow-specific customizations:
- [Workflow-specific variations if any]
```

**3. Update workflow template**

Update `.devagent/core/templates/agent-brief-template.md` to include the standard instructions reference pattern.

**4. Gradual migration strategy**

- Start by adding the section to AGENTS.md
- Update new workflows to reference it
- Gradually update existing workflows during normal maintenance
- Don't require immediate migration of all workflows (low risk)

### Rationale

This hybrid approach:
- **Centralizes** truly common instructions (date handling, git user, guardrails)
- **Preserves** workflow-specific details in workflows (paths, specific steps)
- **Maintains** workflow readability with clear references
- **Aligns** with Builder.io AGENTS.md pattern
- **Enables** gradual adoption without breaking existing workflows

## Repo Next Steps

- [ ] Create feature or plan item for implementing this centralization
- [ ] Add "Standard Workflow Instructions" section to `.devagent/core/AGENTS.md`
- [ ] Update `.devagent/core/templates/agent-brief-template.md` with reference pattern
- [ ] Update 1-2 existing workflows as proof-of-concept (e.g., `research.md`, `create-plan.md`)
- [ ] Document migration pattern in workflow template for future workflows
- [ ] Consider updating other workflows during normal maintenance cycles

## Risks & Open Questions

- **Q:** Should we require all workflows to reference AGENTS.md, or make it optional?
  - **A:** Make it recommended but not required for backward compatibility. New workflows should follow the pattern.

- **Q:** How do we handle workflow-specific variations of standard instructions?
  - **A:** Keep variations in workflows, but note them as exceptions to standard. Standard should be the default.

- **Q:** Should we create a separate file like `.devagent/core/WORKFLOW-STANDARDS.md` instead of adding to AGENTS.md?
  - **A:** No—keep in AGENTS.md to maintain single reference file pattern and reduce file proliferation. AGENTS.md is already the workflow reference file.

- **Q:** What about instructions that are common but not universal (e.g., only used by 3-4 workflows)?
  - **A:** Only centralize if used by majority (≥7 workflows) or if they're foundational (like date handling, context gathering). Otherwise, keep in workflows or create workflow subgroups.

## Related Artifacts

- `.devagent/core/AGENTS.md` - Current workflow roster (target for addition)
- `.devagent/core/workflows/**/*.md` - All workflow files (targets for reference updates)
- `.devagent/core/templates/agent-brief-template.md` - Workflow template (target for pattern inclusion)
- `.devagent/workspace/features/completed/2025-12-27_consistent-date-handling-workflows/` - Example of pattern standardization
