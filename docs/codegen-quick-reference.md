# Codegen Background Workflow - Quick Reference

## Setup (One-Time)

**Install Codegen CLI:**
```bash
uv tool install codegen
```

**Authenticate:**
```bash
# Set token in environment
export CODEGEN_API_TOKEN='your-token-here'

# Login to CLI
codegen login --token $CODEGEN_API_TOKEN
```

Make token permanent:
```bash
echo 'export CODEGEN_API_TOKEN="your-token"' >> ~/.zshrc
source ~/.zshrc
```

## How It Works

The `devagent deploy-codegen-agent` workflow takes your task specifications and creates comprehensive, execution-ready prompts for [Codegen](https://docs.codegen.com/introduction/cli). It gathers research, specs, and file context to build prompts that background workflows can execute independently using the Codegen CLI.

## Invocation

```
devagent deploy-codegen-agent
- Task: feature-auth-001
- Include research from: .devagent/features/2025-10-01_auth/research/
- Repo ID: 456 (optional)
```

## What You Get

1. **Optimized Prompt** - Comprehensive execution plan with:
   - Task overview and context
   - Research findings and spec excerpts
   - Step-by-step implementation plan
   - Acceptance criteria and constraints
   - Reference files and code patterns
   - Expected deliverables

2. **Workflow Run Created** - Output with:
   - Workflow run ID (e.g., 789)
   - Web URL for monitoring (e.g., https://app.codegen.com/runs/789)
   - Initial status
   - Context sources included

3. **Next Steps** - Guidance on:
   - Monitoring via CLI TUI (`codegen` command)
   - Pulling results when complete (`codegen pull`)
<<<<<<< HEAD
   - Integrating outputs with devagent execute-tasks
=======
   - Integrating outputs with your workflow
>>>>>>> e8f865826ff365f4a74deb164e99279829526d9c

## Prompt Structure

The agent builds prompts following this template:

```markdown
# Task: [Clear objective]

## Context
[Background on what this achieves and why]

## Research Summary
- Key finding 1 (from research packet)
- Key finding 2 (from spec)
- Key finding 3 (from architecture decisions)

## Implementation Plan

### Step 1: [Setup/scaffolding]
- Create: `path/to/file.ts`
- Key functions: `functionName()`

### Step 2: [Core implementation]
- Modify: `path/to/existing.ts`
- Integration points: [list]

### Step 3: [Testing & validation]
- Test files: `tests/file.test.ts`
- Coverage: >90%

## Acceptance Criteria
✓ Criterion 1 (testable)
✓ Criterion 2 (testable)
✓ Criterion 3 (testable)

## Reference Files
- `src/patterns/example.ts` - Follow this pattern
- `docs/spec.md` - Full specification

## Constraints
- Framework: Express.js v4.18+
- Style: TypeScript functional patterns
- Security: OWASP compliance

## Expected Deliverables
1. `src/main.ts` - Core implementation
2. `tests/main.test.ts` - Test suite
3. Summary of approach
```

## CLI Commands

**Create workflow run:**
```bash
# From file
codegen create /tmp/prompt.md

# From stdin
echo "# Task: ..." | codegen create -
```

**Monitor workflows:**
```bash
# Interactive TUI
codegen

# Update CLI
codegen update
```

**Pull results:**
```bash
# Download completed work
codegen pull
```

**Rate Limit:** 10 requests per minute  
**Documentation:** https://docs.codegen.com/introduction/cli

## Example Workflow

```bash
# 1. Create task spec with devagent plan-tasks
# devagent plan-tasks
- Spec: .devagent/features/2025-10-01_auth/spec/core.md

# 2. Gather research with devagent research (if needed)
# devagent research
- Mode: task
- Task: auth-001

# 3. Create workflow run with optimized prompt
# devagent deploy-codegen-agent
- Task: auth-001
- Repo ID: 456

# Output:
# ✅ Workflow run created!
# 📝 Run ID: 789
# 🔗 Monitor: https://app.codegen.com/runs/789
# 📦 Prompt includes:
#   - Research from .devagent/features/.../research/jwt-comparison.md
#   - Spec from .devagent/features/.../spec/core.md
#   - File hints: src/middleware/auth.ts, tests/auth.test.ts
#
# ⏭️  Next steps:
#   - Monitor: codegen (interactive TUI)
#   - Or visit: https://app.codegen.com/runs/789
#   - Pull results: codegen pull (when complete)

# 4. Monitor in CLI
codegen  # Opens interactive TUI

# 5. Pull results when complete
codegen pull

<<<<<<< HEAD
# 6. Integrate with devagent execute-tasks
# devagent execute-tasks
- Task: auth-001
- Source: Codegen workflow run 789
=======
# 6. Review and integrate results into your project
# Results available in pulled directory
>>>>>>> e8f865826ff365f4a74deb164e99279829526d9c
```

## Tips for Better Prompts

1. **Complete task specs:** Ensure task has clear description, file hints, and acceptance criteria
2. **Include research:** Link relevant research packets for context
3. **Specify patterns:** Reference existing code patterns to follow
4. **Clear deliverables:** Explicitly list expected output files
5. **Testability:** Include test requirements and coverage targets

## Troubleshooting

**"codegen: command not found"**
```bash
uv tool install codegen
```

**"Not authenticated"**
```bash
export CODEGEN_API_TOKEN='your-token'
codegen login --token $CODEGEN_API_TOKEN
```

**"Incomplete task context"**
- Run devagent research first to gather missing context
- Update task spec with file hints and acceptance criteria

**"Rate limit exceeded"**
- Wait 60 seconds between requests
- Current limit: 10 requests/minute

**"CLI errors"**
```bash
# Check version and update
codegen update
```

**"Need more research"**
```
# devagent research
- Mode: task
- Task: <task-id>
- Focus: <specific area>
```

## See Also

- Full workflow documentation: `.devagent/core/workflows/run-codegen-background-agent.md`
- Codegen CLI docs: https://docs.codegen.com/introduction/cli
<<<<<<< HEAD
- Workflow roster: `.devagent/core/AGENTS.md`

=======
- Agent roster: `AGENTS.md`
>>>>>>> e8f865826ff365f4a74deb164e99279829526d9c
