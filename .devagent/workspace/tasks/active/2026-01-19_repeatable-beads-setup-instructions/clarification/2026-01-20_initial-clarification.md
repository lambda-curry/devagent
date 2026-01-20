# Clarified Requirement Packet — Repeatable Beads Setup Instructions (Low-Noise Sync)

- Requestor: Jake Ruesink
- Decision Maker: Jake Ruesink
- Date: 2026-01-20
- Mode: Task Clarification
- Status: In Progress
- Related Task Hub: `.devagent/workspace/tasks/active/2026-01-19_repeatable-beads-setup-instructions/`

## Task Overview

### Context
- **Task name/slug:** `2026-01-19_repeatable-beads-setup-instructions`
- **Goal:** Sync Beads tasks while **not muddying commit history** (avoid Beads-only commits mixed into normal work), avoid `.beads/issues.jsonl` merge noise, and keep Beads artifacts out of code PR diffs.
- **Current direction:** Explore putting Beads state into a **separate repository** that is included as a **git submodule** in the code repo; keep `.beads/issues.jsonl` in that submodule so agents can work “within the submodule”.
- **Pain point:** “Drift” where Beads changes appear **post-commit** (unexpected `.beads/issues.jsonl` changes after you thought you committed everything).
- **Desired doc location:** `.devagent/core/…` (portable kit docs).
- **Submodule commit policy:** Submodule SHA updates are acceptable **only when bundled with “real code” commits** (avoid standalone “Beads pointer bump” commits).
- **Preferred ergonomics:** Prefer a **simple wrapper command** from the code repo that runs Beads operations inside the submodule; fall back to “`cd` into submodule” if wrapper would be complex.
- **Optimization target:** Human dev workflow + agent/automation workflow (both).
- **Submodule path decision:** Put the Beads repo **at `.beads/`** (i.e., `.beads/` becomes the submodule).
- **Source of truth (git-synced):** `.beads/issues.jsonl` should live **in the submodule repo** (the code repo should not track it).
- **Daemon posture (tentative):** Daemon seems acceptable if Beads state is kept in the separate Beads repo (still need to confirm how this interacts with drift + submodule pointer updates).
- **Submodule pointer policy (clarified):** Update the code repo’s submodule SHA **only when bundled with a real code commit**. It’s acceptable that the code repo often shows `.beads` as “modified (new commits)”.
- **Beads sync responsibility (tentative):** Preference is that Beads handles committing/syncing “automagically” so agents don’t have to think about it (needs explicit documented configuration to be reliable).

### Clarification Sessions
- Session 1: 2026-01-20 — Jake Ruesink + agent

---

## Clarified Requirements

### Scope & End Goal
**What needs to be done?**
- Produce copy/paste-friendly setup instructions for a “low-noise” Beads setup.

**What's the end goal state?**
- A documented recommendation + decision tree for keeping Beads task sync reliable while keeping Beads history/artifacts **out of the main code repo’s commit/PR stream** as much as possible.

**In-scope (must-have):**
- Document the recommended default (current leaning: separate Beads repo as a git submodule) and at least one fallback (likely sync-branch).
- Include verification + troubleshooting steps, especially for the “post-commit drift” problem.

**Out-of-scope (won’t-have / deferred unless needed):**
- Application code changes (this is documentation/process unless a tiny helper script is explicitly chosen later).

---

### Acceptance Criteria & Verification
- The recommended workflow **does not** produce routine Beads-only commits in the main code repo history.
- `.beads/issues.jsonl` changes should **not** commonly show up in code PR diffs.
- The workflow provides a clear mitigation for “post-commit drift” (changes appearing after commit).
 - Submodule SHA bumps should **not** be common as standalone commits (bundled-only policy).

---

## Gaps Requiring Research

### For #ResearchAgent
**Research Question 1:** Does Beads work well with git submodules? If so, what’s the canonical pattern for keeping `.beads/issues.jsonl` and sync history in the submodule repo while running day-to-day from the code repo?
- Priority: High
- Blocks: Selecting the default setup.

**Research Question 2:** What causes the “post-commit drift” (Beads changes after commit), and what is the most reliable mitigation in a submodule or sync-branch workflow?
- Priority: High
- Blocks: A workflow that actually feels low-noise.

---

## Question Tracker
1. Target “low-noise” outcome (what must be avoided). — ✅ answered (avoid Beads-only commits in code history; avoid `.beads/issues.jsonl` merge noise; avoid Beads artifacts in code PR diffs)
2. Where should docs live? — ✅ answered (`.devagent/core/…`)
3. Preferred default approach? — ⏳ in progress (leaning “separate repo via git submodule”)
4. How should day-to-day Beads operations happen? — ✅ answered (mostly from code repo; agents can work within the submodule)
5. How do we handle the “post-commit drift” issue? — 🔍 needs research (root cause + mitigation)
6. Are standalone submodule “pointer bump” commits acceptable? — ✅ answered (no; bundled-only)
7. How should Beads commands be run (submodule `cd` vs wrapper)? — ✅ answered (prefer wrapper if simple; else `cd`)
8. Which environment are we optimizing for (human vs automation)? — ✅ answered (both)
9. Where should the Beads submodule live? — ✅ answered (`.beads/` becomes the submodule)
10. What should be the git-synced source of truth? — ✅ answered (the submodule’s `.beads/issues.jsonl`)
11. Should daemon be allowed by default? — ⏳ in progress (user leaning yes; need to reconcile with drift + submodule pointer behavior)
12. If the submodule advances, how should the code repo pointer be updated? — ✅ answered (bundled-only)
13. Is it acceptable that `git status` often shows the submodule as modified? — ✅ answered (yes)
14. Should agents worry about pushing/syncing Beads? — ⏳ in progress (preference: no; need to define required automation)

---

## Change Log
- 2026-01-20: Re-created clarification packet after deletion; captured latest answers (Jake Ruesink + agent).

