# Ralph Monitoring App — AI Agent Context

This file provides high-level context about the ralph-monitoring application for AI agents working in this codebase.

## What This App Is

**Ralph Monitoring is a React Router v7 application** that provides a monitoring UI for Ralph agent execution. The app displays task information, logs, and provides controls for managing agent tasks.

## Project Structure

**Location**: `apps/ralph-monitoring/`

**Key Directories:**
- `app/routes/` — File-based routing (`_index.tsx`, `tasks.$taskId.tsx`)
- `app/components/` — UI components (shadcn/ui based)
- `app/db/` — Database utilities (better-sqlite3)
- `app/lib/` — Shared utilities

**Configuration:**
- `react-router.config.ts` — React Router config
- `vite.config.ts` — Vite build config
- `package.json` — Dependencies and scripts

## Technology Stack

- **Framework**: React Router v7
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Database**: better-sqlite3
- **Testing**: Vitest, @testing-library/react

## Development

**Scripts**: See `package.json` for full list.
- `bun run dev` — Start dev server
- `bun run test` — Run tests
- `bun run typecheck` — Verify types

## Code Patterns & Rules

This project adheres to the global **AI Rules**. Please refer to the following rules which are automatically loaded or available in `.cursor/rules/`:
- **React Router v7**: patterns for loaders, actions, and type-safe routing.
- **Error Handling**: `throw data()` usage.
- **Testing**: Vitest patterns.

**Note**: Types are auto-generated in `./+types/[routeName]`. Run `bun run typecheck` to regenerate them.
