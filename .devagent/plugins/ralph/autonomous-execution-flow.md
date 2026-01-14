# Ralph Autonomous Execution Flow

This diagram illustrates the new autonomous Ralph execution flow with the integrated Setup and Final Review agents.

```mermaid
sequenceDiagram
    participant User
    participant RalphScript as ralph.sh
    participant SetupAgent as Setup Agent
    participant BeadsDB as Beads DB
    participant Git as Git/GitHub
    participant Execution as Main Execution Loop
    participant FinalAgent as Final Review Agent

    User->>RalphScript: ./ralph.sh --epic <ID>

    rect rgb(240, 248, 255)
        Note over RalphScript, SetupAgent: 1. Setup Phase
        RalphScript->>SetupAgent: Invoke setup-workspace.md
        SetupAgent->>BeadsDB: Validate Epic & Tasks
        SetupAgent->>Git: Check/Create Branch (ralph/<ID>)
        SetupAgent->>Git: Create Draft PR (for progress monitoring)
        SetupAgent-->>RalphScript: Success / Fail (PR URL)
    end

    alt Setup Failed
        RalphScript-->>User: Exit (Stop)
    else Setup Success
        rect rgb(255, 250, 240)
            Note over RalphScript, Execution: 2. Execution Phase
            loop Until Max Iterations or Stop
                RalphScript->>BeadsDB: Get Next Ready Task
                RalphScript->>Execution: AI Agent Implements Task
                Execution->>BeadsDB: Update Status & Comments
            end
        end

        rect rgb(240, 255, 240)
            Note over RalphScript, FinalAgent: 3. Final Review Phase (Runs on Trap/Exit)
            RalphScript->>FinalAgent: Invoke final-review.md (with Stop Reason)
            FinalAgent->>BeadsDB: Fetch Task Comments & Status
            FinalAgent->>Git: Check for Existing Revise Reports
            FinalAgent->>Git: Generate Summary & Update Existing PR (or Create if Missing)
            FinalAgent-->>RalphScript: PR URL
        end

        RalphScript-->>User: Execution Complete (PR Link)
    end
```

## Key Changes from Previous Workflow

1. **Pre-Flight Check (Setup Agent)**: Instead of `ralph.sh` blindly starting, the Setup Agent now intelligently validates the Epic and ensures the git workspace is clean and on the correct branch. It also creates a draft PR at initialization for progress monitoring. If this fails (e.g., Epic doesn't exist), the script stops immediately.

2. **Main Loop**: Remains largely the same (AI tool executing tasks), but relies on the environment prepared by the Setup Agent. The draft PR created during setup provides visibility into execution progress.

3. **Guaranteed Reporting (Final Review Agent)**: Previously, PR creation was a static shell script at the end. Now, a Final Review Agent runs via a trap (meaning it runs even if the script crashes or is interrupted), ensuring the draft PR created during setup is updated with a comprehensive summary of what happened, why it stopped, and any "Revise Reports" generated during the run.
