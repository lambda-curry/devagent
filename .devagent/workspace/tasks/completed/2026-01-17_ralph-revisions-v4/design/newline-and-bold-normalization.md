# Markdown normalization spec: newlines + bold

Task: `devagent-69fc.9` (Ralph Monitoring UI)

## Problem statement

In the monitoring UI, some Beads-provided text renders with **literal escape sequences** (e.g. `\n`) instead of real line breaks. This can happen when upstream content is double-escaped (so the UI receives the two characters `\` and `n`), and it makes descriptions/comments hard to scan.

Separately, we need a clear stance on “bold normalization” so we don’t introduce risky, lossy markdown rewrites.

## Decision: where normalization happens

Normalize at the **data boundary** (Beads → app), not in the markdown renderer.

- **Primary normalization layer**: `apps/ralph-monitoring/app/db/beads.server.ts`
  - This file is the single choke-point that hydrates:
    - `issues.*` fields from the Beads sqlite DB (`description`, `design`, `acceptance_criteria`, `notes`)
    - comment bodies from `bd comments ... --json`
- **Rendering layer** (`apps/ralph-monitoring/app/components/Markdown.tsx`):
  - stays “dumb”: it should only render markdown and apply styling
  - should not perform content rewrites beyond presentation

### Rationale

- **Consistency**: task list previews, search/filter behavior, and detail pages should all see the same normalized strings.
- **Separation of concerns**: markdown rendering stays predictable; content cleanup lives at ingress.
- **Testability**: normalization is easy to unit test at the data layer without involving React rendering.

## Newline normalization rules

Apply these rules to every Beads-sourced markdown-ish field:

- **Normalize line endings**: convert Windows newlines `\r\n` → `\n`
- **Unescape literal newline sequences**: convert the two-character sequence `\\n` → `\n`
  - This is explicitly intended to fix “double-escaped newline” artifacts.
  - It is acceptable if this turns a user-authored literal `\\n` into a newline; for this UI, readability and correctness of Beads-authored content is the priority.

### Non-goals

- Do **not** attempt to interpret other escape sequences (e.g. `\\t`) unless we observe them in real data.
- Do **not** add a markdown plugin or CSS hack (like `white-space: pre-wrap`) to compensate for escaped input; fix the input instead.

## Bold normalization strategy

### Renderer behavior (what we do)

- The renderer already supports bold via markdown (`**text**` and `__text__`) and styles `<strong>` appropriately.
- We should **not** “auto-bold” by rewriting arbitrary markdown (e.g. converting `*text*` → `**text**`).

### Content behavior (what we require)

- When Ralph/workflows generate markdown-like content (plan-to-Beads conversion, task templates, etc.), they should emit **explicit bold** where desired (e.g. `**Objective:**`, `**Acceptance:**`).
- If we find a specific upstream source emitting “bold-but-not-bold” patterns, fix that source rather than trying to infer intent in the UI.

### Rationale

Automatic bold conversion is ambiguous and risks breaking:
- list markers (`* item`)
- italics semantics (`*emphasis*`)
- inline code / code blocks where asterisks are literal

Keeping bold as “author intent” avoids silent corruption of user content.

## Implementation notes (for `devagent-69fc.10`)

- Add a small helper (e.g. `normalizeBeadsMarkdownText(input: string): string`) in `beads.server.ts`.
- Apply it when returning:
  - `BeadsTask` fields (`description`, `design`, `acceptance_criteria`, `notes`)
  - `BeadsComment.body`

