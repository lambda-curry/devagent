# QA Verification: Epic Metadata Surfacing (devagent-mobile-epic-activity-2026-02-03.2-qa)

## What was verified

| Criterion | Status | Evidence |
|-----------|--------|----------|
| prUrl included when present in run file | **PASS** | `epic-metadata.server.test.ts`: "returns prUrl from run file when present" — `getEpicMetadata` returns `prUrl: 'https://github.com/org/repo/pull/90'` when `readRunFileEpic` returns epic with `pr_url`. |
| Null handling when pr_url is missing | **PASS** | `epic-metadata.server.test.ts`: "returns prUrl null when run file epic has no pr_url", "returns prUrl null when readRunFileEpic returns null", "trims pr_url and rejects empty string". `loop-start.server.test.ts`: "returns epic without pr_url when run file has no pr_url". |
| Ambiguous/missing run files don't break epic view | **PASS** | `epic-metadata.server.test.ts`: "returns prUrl null and repoUrl from env when no run file found" (findRunFileByEpicId returns null); "does not break when readRunFileEpic throws". `loop-start.server.ts`: findRunFileByEpicId returns null when runs dir missing or when multiple files match epic id (ambiguous). No throws; loader always receives `{ prUrl, repoUrl }`. |
| Repo URL derivation logic | **PASS** | `epic-metadata.server.test.ts` getRepoUrl: "returns null when RALPH_REPO_URL is not set", "returns null when RALPH_REPO_URL is empty or whitespace", "returns trimmed URL when RALPH_REPO_URL is set". Source is explicit: env `RALPH_REPO_URL`. |

## Commands run

```bash
cd apps/ralph-monitoring
bun run typecheck   # exit 0
bun run lint        # exit 0
bun run test        # 38 files, 378 tests passed
```

## Implementation references

- **Loader**: `app/routes/epics.$epicId.tsx` — calls `getEpicMetadata(epicId)` and returns `{ prUrl, repoUrl }` (lines 55, 64–65).
- **Metadata**: `app/utils/epic-metadata.server.ts` — `getEpicMetadata()` returns `prUrl` from run file when present, else null; `repoUrl` from `RALPH_REPO_URL`; catch returns `{ prUrl: null, repoUrl }` so epic view never breaks.
- **Run file parsing**: `app/utils/loop-start.server.ts` — `readRunFileEpic` returns epic with optional `pr_url`; `findRunFileByEpicId` returns null when dir missing or ambiguous (multiple matches).

## Conclusion

All acceptance criteria for epic metadata surfacing are met. Unit tests cover prUrl presence/absence, null handling, missing/ambiguous run files, and repo URL derivation. Quality gates (typecheck, lint, test) pass.

Signed: QA Agent — Bug Hunter
