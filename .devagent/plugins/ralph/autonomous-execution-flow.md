# Ralph Autonomous Execution Flow

This diagram illustrates the simplified autonomous Ralph execution flow with direct validation and configuration-based branch management.

```mermaid
sequenceDiagram
    participant User
    participant RalphScript as ralph.sh
    participant Config as config.json
    participant BeadsDB as Beads DB
    participant Git as Git
    participant Execution as Main Execution Loop

    User->>RalphScript: ./ralph.sh --epic <ID>

    rect rgb(240, 248, 255)
        Note over RalphScript, Git: 1. Validation Phase
        RalphScript->>Config: Read git.base_branch & git.working_branch
        RalphScript->>BeadsDB: Validate Epic exists (bd show <ID>)
        RalphScript->>Git: Check working_branch exists
        RalphScript->>Git: Verify current branch matches working_branch
    end

    alt Validation Failed
        RalphScript-->>User: Exit with clear error message
    else Validation Success
        rect rgb(255, 250, 240)
            Note over RalphScript, Execution: 2. Execution Phase
            loop Until Max Iterations or Stop
                RalphScript->>BeadsDB: Get Next Ready Task
                RalphScript->>Execution: AI Agent Implements Task
                Execution->>BeadsDB: Update Status & Comments
            end
        end

        RalphScript-->>User: Execution Complete
    end
```

## Key Changes from Previous Workflow

1. **Direct Validation**: `ralph.sh` now validates Epic existence and branch state directly (no Setup Agent). Configuration is read from `config.json` which includes required `git.base_branch` and `git.working_branch` fields.

2. **Configuration-Based Branch Management**: Branch configuration is explicit in `config.json`. The script validates that:
   - The `git` section exists with `base_branch` and `working_branch`
   - The `working_branch` exists locally
   - The current branch matches `working_branch`

3. **Simplified Flow**: Setup and Final Review agents have been removed. Epic validation is performed directly via `bd show`, and branch validation uses git commands directly.

4. **Branch Setup**: When using `setup-ralph-loop` workflow, Step 7 creates the working branch from the base branch (if it doesn't exist) and writes the git configuration to `config.json` using the plan title slug for branch naming (`ralph-<plan-title-slug>`).
