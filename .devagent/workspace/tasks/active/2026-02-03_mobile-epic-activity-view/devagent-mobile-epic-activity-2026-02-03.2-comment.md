**Summary**
- Loader now exposes `prUrl` and `repoUrl` for the epic. `prUrl` is read from the run file’s `epic.pr_url` when a single run file matches the epic ID; otherwise `prUrl` is null. `repoUrl` comes from `RALPH_REPO_URL` (optional).
- Added `epic-metadata.server.ts` with `getEpicMetadata(epicId)` and `getRepoUrl()`. Extended `loop-start.server.ts` with `RunFileEpic.pr_url` and `readRunFileEpic(runFilePath)`.
- Unit tests: run file parsing with/without `pr_url`, invalid JSON, missing epic; metadata helper for no run file, with `pr_url`, empty `pr_url`, throw handling; `getRepoUrl` env behavior.

**Verification**
- `bun run typecheck` and `bun run lint` passed. `bun run test` (378 tests) passed.

**Commit:** 82b013c0 - feat(ralph-monitoring): expose pr_url and repo URL in epic loader [skip ci]

Signed: Engineering Agent — Code Wizard
