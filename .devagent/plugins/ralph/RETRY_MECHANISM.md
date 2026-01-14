# Ralph Network Retry Mechanism

## Overview

Ralph includes a built-in retry mechanism to handle transient network failures that can occur during autonomous execution. This feature ensures robustness when network connectivity is unreliable.

## How It Works

### Retry Logic
- **Exponential Backoff**: Retry delay increases exponentially (5s, 10s, 20s, 40s...)
- **Smart Detection**: Only retries commands that are likely to fail due to network issues
- **Configurable Limits**: Maximum retry attempts and base delay can be customized

### Protected Operations

The following operations are automatically retried on network failures:

#### Beads CLI Commands
- `bd ready` - Getting next available task
- `bd show` - Retrieving task/epic details  
- `bd update` - Updating task status
- `bd comment` - Adding comments to tasks

#### Git Operations
- `git fetch` - Updating remote references
- `git worktree add` - Creating new worktrees

### Error Detection

The retry mechanism specifically targets these error scenarios:
- **Exit Code 2**: Generic network connectivity issues
- **Exit Code 7**: Failed to connect to host
- **Exit Code 28**: Operation timeout
- **Command-based detection**: Any `bd` or `git` command failure

Non-network errors (syntax errors, permission issues, etc.) are not retried and fail immediately.

## Configuration

Add retry settings to `config.json`:

```json
{
  "retry": {
    "max_retries": 3,        // Maximum retry attempts (default: 3)
    "delay_seconds": 5       // Base delay between retries (default: 5)
  }
}
```

### Retry Delay Calculation
- Attempt 1: 5s delay
- Attempt 2: 10s delay  
- Attempt 3: 20s delay
- Attempt 4: 40s delay
- ... (continues exponentially)

## Logging

When retries occur, you'll see output like:
```
Executing: bd ready bd-1234 --json
bd command failed (exit code: 7). This appears to be network-related.
Retrying Beads command: bd ready bd-1234 --json in 5s (attempt 2/4)...
```

## What's Not Retried

- **AI Tool Execution**: The main task implementation is not automatically retried to avoid inconsistent results
- **Non-network errors**: Permission issues, syntax errors, or other local failures
- **Intentional failures**: Commands that fail due to invalid state/data

## Troubleshooting

### Frequent Retries
If you see many retry attempts:
1. Check network stability
2. Verify Beads server connectivity
3. Consider increasing `max_retries` or `delay_seconds`

### Persistent Failures
After all retries are exhausted:
1. Check for genuine issues (invalid task IDs, permission problems)
2. Manually verify network connectivity
3. Review the specific error messages in the logs

## Implementation Details

The retry mechanism uses bash functions:
- `retry_command()` - Generic retry with exponential backoff
- `bd_retry()` - Wrapper for Beads CLI commands
- `git_retry()` - Wrapper for Git commands

These functions are defined in `ralph.sh` and automatically invoked for the protected operations listed above.