# Loop Completion Hooks Progress Tracker

- Owner: Jake Ruesink
- Last Updated: 2026-01-30
- Status: Active
- Task Hub: `.devagent/workspace/tasks/active/2026-01-30_loop-completion-hooks/`

## Summary

Implement **completion triggers/hooks** for Ralph loops so users (or orchestrating scripts) can reliably react when a loop finishes, fails, or gets blocked.

### Problem Statement

Currently, when a Ralph loop runs (via `delegate-agent.ts` or similar orchestration), there's no reliable way to get notified when it completes. This forces upstream systems (like Clawdbot) to rely on polling/heartbeats to detect loop status changes—a blunt and expensive approach.

We need a **push-based mechanism** where the loop execution script can invoke a configurable callback on exit, passing structured data about the loop outcome.

### Proposed Approach

When the Ralph loop exits (success, failure, or blocked), the orchestration script invokes a configurable callback with structured data:

```json
{
  "loopId": "uuid",
  "title": "MI-1234: Add payment validation",
  "repo": "~/projects/medusa-app",
  "status": "completed | blocked | failed",
  "iterations": 4,
  "summary": "Implemented validation, added tests, PR ready",
  "branch": "feature/payment-validation",
  "exitReason": "All acceptance criteria met",
  "durationSec": 342
}
```

### Configuration Options

1. **Shell script hook**: `--on-complete ./my-hook.sh` — receives JSON on stdin
2. **URL webhook**: `--webhook-url https://...` — POSTs the payload
3. **Built-in Clawdbot wake**: `--notify-clawdbot` — calls `cron wake` with the summary

### Implementation Sketch

Modify `scripts/delegate-agent.ts` (in `~/clawd`) to accept `--on-complete <script|url>`:
- Capture loop outcome + metadata during execution
- On exit, serialize payload → invoke the hook
- Built-in default: if running under Clawdbot, auto-wake the session

## Agent Update Instructions
- Always update "Last Updated" to today's date (ISO: YYYY-MM-DD) when editing this file. **Get the current date by explicitly running `date +%Y-%m-%d` first, then use the output for the "Last Updated" field.**
- Progress Log: Append a new entry at the end in the form `- [YYYY-MM-DD] Event: concise update, links to files`. Do not rewrite or delete prior entries.
- Implementation Checklist: Mark items as `[x]` when complete, `[~]` for partial with a short note. Add new items if discovered; avoid removing items—strike through only when obsolete.
- Key Decisions: Record important decisions as `- [YYYY-MM-DD] Decision: rationale, links`.
- References: Keep links current to latest spec, research, and tasks. Add additional references as they are created.
- Scope: Edits here should reflect coordination/progress only; do not include application code changes. Preserve history.

## Key Decisions
- [2026-01-30] Decision: Start with shell script hook (`--on-complete`) as the primary mechanism; webhook and Clawdbot-native options can follow as extensions.
- [2026-01-30] Decision: Invoke hook synchronously with a 30s timeout (per research); hook exit code does not override process exit code.

## Progress Log
- [2026-01-30] Initiated: Task hub created from voice discussion about reliable status updates when loops complete. Core payload shape and configuration options defined.
- [2026-01-30] Event: Completed devagent research — patterns for completion hooks, two boundaries (delegate run vs Ralph loop), payload availability, sync-with-timeout recommendation. Research: `research/2026-01-30_completion-hooks-and-callbacks-research.md`.
- [2026-01-30] Event: Completed devagent create-plan — implementation plan with Phase 1 (delegate-agent.ts minimal payload) and Phase 2 (Ralph loop rich payload). Plan: `plan/2026-01-30_loop-completion-hooks-plan.md`.
- [2026-01-30] Event: Completed devagent research — CLI completion hook patterns and delegate-agent.ts integration context. Research: `research/2026-01-30_delegate-agent-completion-hook-context.md`. Plan updated with insertion point, payload build, and optional lib.ts helper; references new research in Task 1 and Implementation Guidance.

## Implementation Checklist
- [ ] Add `--on-complete <script>` flag to `delegate-agent.ts`
- [ ] Capture loop metadata during execution (loopId, title, repo, branch, iterations)
- [ ] Serialize structured payload on loop exit
- [ ] Invoke shell hook with JSON on stdin
- [ ] Test with simple echo script to validate payload shape
- [ ] (Extension) Add `--webhook-url` option for HTTP POST
- [ ] (Extension) Add `--notify-clawdbot` option that calls `cron wake`
- [ ] Document new flags in delegate-agent skill/README

## Open Questions
- Should the hook be invoked synchronously (blocking) or fire-and-forget? Owner: Jake
- What additional metadata would be valuable in the payload (e.g., PR URL if created, commit SHA)?
- Should there be a timeout for hook execution to prevent blocking indefinitely?

## References
- delegate-agent.ts: `~/clawd/scripts/delegate-agent.ts`
- Ralph loop delegation skill: `~/clawd/skills/ralph-loop-delegation/SKILL.md`
- Clawdbot cron wake: `cron wake` action in Clawdbot tooling
- Product mission (DevAgent): `.devagent/workspace/product/mission.md` (freshness: 2026-01-30)
- Research: `research/2026-01-30_completion-hooks-and-callbacks-research.md`
- Research (CLI patterns): `research/2026-01-30_cli-completion-hook-patterns.md`
- Research (delegate-agent context): `research/2026-01-30_delegate-agent-completion-hook-context.md`
- Plan: `plan/2026-01-30_loop-completion-hooks-plan.md`

## Next Steps

Recommended follow-up workflows:

```bash
# Execute implementation from plan
devagent implement-plan
```
