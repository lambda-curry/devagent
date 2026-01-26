# 2026-01-20 — Design System Sweep Plan (Ralph Monitoring)

**Expectations Version:** v1 (2026-01-20)

## Objective

Establish a cohesive design language (based on a reference screenshot) and apply it across tokens, shared components, and key product surfaces in a single sweep to eliminate mixed styling and ad-hoc CSS.

## Scope

- **In scope**: `apps/ralph-monitoring` tokens (`globals.css`), shared UI primitives (`app/components/ui/*`), and composite components/routes on the “golden path”.
- **Out of scope**: Other apps/packages unless inventory proves otherwise.

## Work Breakdown (Beads)

### Routing labels (validation)

- **project-manager**: coordination + inventory + reporting
- **design**: language + tokens decisions
- **engineering**: component refactors + surface sweep

| Task | Label | Purpose | Key outputs |
|---|---|---|---|
| `devagent-07a7.0` | project-manager | Run + PR setup | Run folder ready; PR created/linked; Run header comment posted |
| `devagent-07a7.1` | project-manager | Baseline inventory | Inventory doc with sources + surfaces mapped to files |
| `devagent-07a7.2` | design | Define language + update tokens | `DESIGN_LANGUAGE.md`; token updates in `globals.css` |
| `devagent-07a7.3` | engineering | Refactor primitives + stories | Token-driven primitives + minimum Storybook coverage set |
| `devagent-07a7.4` | engineering | Sweep composite surfaces | Golden-path surfaces aligned to language |
| `devagent-07a7.5` | project-manager | Revise report | Consolidated revise report once all tasks closed/blocked |

## Evidence & Review

- **Run folder**: `.devagent/workspace/tasks/completed/2026-01-20_audit-design-system-improvements/run/`
- **Reference** (to be added): `.devagent/workspace/tasks/completed/2026-01-20_audit-design-system-improvements/references/reference.png`

## Quality Gates (repo-level)

Diagnosed from root `package.json`:

- `bun run lint`
- `bun run typecheck`
- `bun run test`
