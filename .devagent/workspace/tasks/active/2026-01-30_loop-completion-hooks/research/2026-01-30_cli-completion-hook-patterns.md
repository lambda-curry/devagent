# Research: CLI Completion Hook and Callback Patterns

- **Filename:** `2026-01-30_cli-completion-hook-patterns.md`
- **Task:** Loop Completion Hooks
- **Classification:** Implementation design (external pattern validation)
- **Assumptions:** Task needs push-based notification when a loop/delegate run finishes; shell script hook (`--on-complete`) is primary; payload is JSON. This research validates patterns from established CLIs and orchestration tools.

---

## Research Plan (What Was Validated)

1. **Lifecycle / post-completion hooks** — How npm, GitHub Actions, and Git expose “run after X completes” behavior.
2. **Data passing to hooks** — Stdin vs env vs args vs files; conventions for structured payloads.
3. **Sync vs async and timeout** — Whether tools block on hooks and if timeouts are used.
4. **Exit semantics** — Whether hook exit code affects the parent (e.g. post-* vs pre-*).

---

## Sources

| Source | Version / Date | Link |
|--------|----------------|------|
| npm scripts (lifecycle) | v8 / v11 | [docs.npmjs.com – using-npm/scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts) |
| GitHub Actions (always, failure) | Current | [docs.github.com – expressions](https://docs.github.com/en/actions/learn-github-actions/expressions), [use-jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs) |
| Git githooks | 2.46.1 (2024-09-13) | [git-scm.com/docs/githooks](https://git-scm.com/docs/githooks) |
| Husky | Current | [typicode.github.io/husky](https://typicode.github.io/husky/) |
| pre-commit | 4.5.x | [pre-commit.com](https://pre-commit.com/) |

---

## Findings & Tradeoffs

### 1. Lifecycle and Post-Completion Invocation

- **npm:** Uses **named lifecycle scripts** (`pre*`, `post*`). For `npm run compress`, npm runs `precompress` → `compress` → `postcompress` in order. No separate “callback path”; the same script name convention gives pre/post. Scripts are **synchronous**; npm waits for each. The current phase is exposed as `process.env.npm_lifecycle_event` (e.g. `postcompress`).
- **GitHub Actions:** Completion is modeled as **conditional steps/jobs**, not a callback binary. Use `if: ${{ always() }}` so a step runs whether previous steps succeeded or failed (e.g. cleanup, notifications). Use `if: ${{ failure() }}` for failure-only. For “when another workflow finishes,” use `workflow_run` with `types: [completed]` and branch on `github.event.workflow_run.conclusion`. No stdin/env payload from the platform; you pass data via outputs/artifacts or env.
- **Git githooks:** **post-*** hooks (e.g. `post-commit`, `post-receive`, `post-update`) are documented as “notification” hooks that **cannot affect the outcome** of the command. They run after the main operation. Pre-* hooks can abort (non-zero exit); post-* cannot.

**Implication for Ralph/delegate-agent:** A “completion hook” is conceptually a **post-*** hook: run after the loop/delegate exits, for notification only. Parent exit code should not be overridden by the hook (aligns with existing task decision).

### 2. Passing Data to Hooks (Stdin, Env, Args, Files)

- **Git githooks:** “Hooks can get their arguments via the **environment**, **command-line arguments**, and **stdin**.” For example, `pre-receive` and `post-receive` receive ref update lines on **stdin** (one line per ref). Other hooks get **arguments** (e.g. file path for commit message) or **env** (e.g. `GIT_DIR`). So Git uses **stdin for structured, multi-line or bulk data** and args/env for small, fixed data.
- **npm:** Scripts are invoked with **env** (`npm_lifecycle_event`, etc.); no standard way to pass a JSON payload. Scripts are named, not arbitrary paths.
- **pre-commit:** Hooks receive **args** (from config) plus **filenames** as arguments. Optional `pass_filenames: false` and custom `args`. No stdin-based payload contract; data is “which files to check.”
- **Husky:** Just runs Git hooks (scripts); data contract is whatever Git defines (args, env, stdin per hook type).

**Implication:** Using **stdin for a single JSON payload** is consistent with Git’s use of stdin for structured ref data and avoids env size limits and escaping. Passing JSON on stdin to `--on-complete ./script` is a solid, established pattern.

### 3. Sync vs Async and Timeout

- **npm:** Runs scripts **synchronously**; no documented timeout. A hanging script blocks the install/run.
- **Git:** Runs hooks **synchronously**; no documented timeout. A hanging hook blocks the Git command.
- **GitHub Actions:** Steps run in sequence; a step that “always” runs still runs in the same job; no per-step timeout in the pattern (job timeout exists at job level).
- **pre-commit:** Runs hooks **synchronously**; hook failure (or first failure with `fail_fast`) stops the run. No standard timeout for individual hooks.

**Implication:** Most CLIs run hooks **synchronously**. None of the sources document a standard **per-hook timeout**. Adding a **timeout (e.g. 30s)** for the completion hook is a reasonable safeguard so a broken or slow hook does not block the parent indefinitely; this aligns with the existing task recommendation (sync with 30s timeout).

### 4. Exit Code Semantics

- **Git post-* hooks:** “Cannot affect the outcome.” So the parent command’s success/failure is already decided; hook exit code is typically not used to change it.
- **pre-commit:** Pre-* hooks’ non-zero exit aborts the commit; post-* hooks (e.g. post-commit) are for notification and do not change the commit result.
- **npm:** Script exit code can fail the run; pre/post are the same as any script.

**Implication:** For a **completion notification** hook, **do not** let the hook’s exit code override the process exit code. Exit with the **run’s** exit code (success/failure of the loop/delegate). Log hook failures but proceed. This matches the task decision: “hook exit code does not override process exit code.”

---

## Recommendation

1. **Invoke hook synchronously with a timeout (e.g. 30s).** Consistent with how npm/Git/pre-commit run hooks; timeout avoids indefinite blocking. On timeout or hook error, log and exit with the **run’s** exit code.
2. **Pass payload on stdin.** One JSON object on stdin; no env/arg size limits; matches Git’s use of stdin for structured data. Document that the hook must read stdin once.
3. **Ignore hook exit code for process exit.** Completion hook is “post-*” style: notification only. Parent always exits with the delegate/loop exit code.
4. **Shell script as primary contract.** `--on-complete ./script` receiving JSON on stdin is simple, scriptable, and consistent with CLI hook patterns (Git, pre-commit entry points). Webhook can be a separate transport for the same payload later.

These recommendations align with the existing task research (`2026-01-30_completion-hooks-and-callbacks-research.md`) and support the chosen design (shell hook, JSON on stdin, sync with timeout, exit code from run).

---

## Repo Next Steps

- [ ] Implement `--on-complete <script>` per existing plan; ensure payload is written to hook stdin and timeout is applied.
- [ ] Document hook contract: single JSON object on stdin, timeout, exit-code semantics (notification only).
- [ ] Optional: add `--webhook-url` as alternate transport using same payload shape.

---

## Risks & Open Questions

| Item | Type | Note |
|------|------|------|
| No universal CLI standard for “completion callback” | Observation | Patterns are per-tool (npm lifecycle, Git post-* , Actions conditionals). Our design is consistent with post-* + stdin. |
| Timeout value | Open | 30s is a reasonable default; could make configurable if needed. |
| Stdin vs temp file | Tradeoff | Stdin avoids cleanup and is atomic; temp file can help debugging (inspect file). Prefer stdin; document for debugging that hook can `cat` to a file. |
