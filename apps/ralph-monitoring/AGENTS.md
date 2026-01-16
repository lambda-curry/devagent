# Ralph Monitoring App — AI Agent Context

This file provides high-level context about the ralph-monitoring application for AI agents working in this codebase.

## What This App Is

**Ralph Monitoring is a React Router v7 application** that provides a monitoring UI for Ralph agent execution. The app displays task information, logs, and provides controls for managing agent tasks.

## Project Structure

### Application Root
- **Location**: `apps/ralph-monitoring/`
- **Framework**: React Router v7 (v7.7.1)
- **Runtime**: Node.js (>=20.11.0)
- **Package Manager**: Bun

### Core Directories

#### `app/` — Application Source
- **`routes/`** — Route modules (file-based routing)
  - `_index.tsx` — Home page route
  - `tasks.$taskId.tsx` — Task detail page
  - `api.logs.$taskId.ts` — Logs API endpoint
  - `api.logs.$taskId.stream.ts` — Streaming logs endpoint
  - `api.tasks.$taskId.stop.ts` — Stop task endpoint
- **`components/`** — React components
  - `ui/` — Reusable UI components (shadcn/ui based)
  - `EmptyState.tsx` — Empty state component
  - `LogViewer.tsx` — Log viewer component
  - `TaskCardSkeleton.tsx` — Loading skeleton
  - `ThemeProvider.tsx` — Theme context provider
  - `ThemeToggle.tsx` — Theme toggle component
- **`db/`** — Database utilities
  - `beads.server.ts` — Beads database operations
  - `__tests__/` — Database tests
- **`lib/`** — Library utilities
  - `utils.ts` — Utility functions
- **`utils/`** — Server utilities
  - `logs.server.ts` — Log processing utilities
  - `process.server.ts` — Process management utilities
- **`root.tsx`** — Root layout component
- **`routes.ts`** — Route configuration
- **`globals.css`** — Global styles

#### Configuration Files
- **`react-router.config.ts`** — React Router configuration
- **`vite.config.ts`** — Vite build configuration
- **`vitest.config.ts`** — Vitest test configuration
- **`vitest.setup.ts`** — Test setup file
- **`tsconfig.json`** — TypeScript configuration
- **`package.json`** — Dependencies and scripts
- **`components.json`** — shadcn/ui configuration

## Technology Stack

### Core Framework
- **React Router v7** (v7.7.1) — Framework mode with file-based routing
- **React** (v19.1.0) — UI library
- **TypeScript** (v5.8.3) — Type safety

### UI Libraries
- **Tailwind CSS** (v4.1.10) — Styling
- **shadcn/ui** — Component library (Radix UI based)
- **Radix UI** — Headless UI primitives
- **Lucide React** — Icons
- **next-themes** — Theme management
- **Sonner** — Toast notifications

### Testing
- **Vitest** (v3.2.4) — Test runner
- **@testing-library/react** (v16.1.0) — Component testing
- **jsdom** (v26.1.0) — DOM environment for tests

### Database
- **better-sqlite3** (v11.7.0) — SQLite database

### Build Tools
- **Vite** (v6.3.3) — Build tool
- **Turbo** — Monorepo build orchestration

## Development Workflow

### Scripts
```bash
# Development
bun run dev              # Start dev server

# Building
bun run build            # Build for production
bun run start            # Start production server

# Code Quality
bun run typecheck        # Type check TypeScript
bun run lint             # Lint code (Biome)
bun run format           # Format code (Biome)

# Testing
bun run test             # Run tests (watch mode)
bun run test:ui          # Run tests with UI
bun run test:run         # Run tests once
bun run test:ci          # Run tests for CI
```

### Type Generation
React Router v7 generates types automatically. After creating or modifying routes:
1. Run `bun run typecheck` to generate types
2. Types are generated in `./+types/[routeName]` relative to each route file
3. The dev server also auto-generates types when running

### Route Configuration
Routes are configured in `app/routes.ts` using React Router v7's explicit route configuration:

```tsx
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("tasks/:taskId", "routes/tasks.$taskId.tsx"),
  // ... more routes
] satisfies RouteConfig;
```

## Cursor Rules

This project uses comprehensive Cursor rules to guide AI assistants. Rules are located in `.cursor/rules/` at the repository root.

### Available Rules

1. **`error-handling.mdc`** — Framework-native error handling patterns
   - Use `throw data()` for expected errors
   - Let ErrorBoundary handle unexpected errors
   - Always apply: `true`

2. **`react-router-7.mdc`** — React Router v7 patterns and best practices
   - Route type imports (`./+types/[routeName]`)
   - Type-safe URL generation with `href()`
   - Data loading patterns
   - Always apply: `true`

3. **`testing-best-practices.mdc`** — Testing patterns and strategies
   - Vitest and @testing-library/react usage
   - React Router v7 testing patterns
   - Component and integration testing
   - Applies to: `apps/ralph-monitoring/**/*.test.ts`, `apps/ralph-monitoring/**/*.test.tsx`

4. **`useEffect-patterns.mdc`** — useEffect usage guidelines
   - When to use effects (synchronization with external systems)
   - When NOT to use effects (data transformation, user events)
   - Always apply: `false` (agent-requested)

5. **`cursor-rules.mdc`** — Guidelines for creating and maintaining Cursor rules
   - Rule structure and organization
   - Content best practices
   - Applies to: `.cursor/rules/*.mdc`

### Using Cursor Rules

- **Always apply rules** (`alwaysApply: true`) are automatically included in AI context
- **Glob-based rules** are attached when working with matching file patterns
- **Agent-requested rules** (`alwaysApply: false`) are available when explicitly referenced

### Rule References in Code

When working in this codebase, follow patterns documented in:
- `.cursor/rules/react-router-7.mdc` — For all route and framework patterns
- `.cursor/rules/error-handling.mdc` — For error handling in loaders/actions/components
- `.cursor/rules/testing-best-practices.mdc` — For writing tests

## Key Patterns

### Route Modules
```tsx
import type { Route } from "./+types/tasks.$taskId";

export async function loader({ params }: Route.LoaderArgs) {
  // Load data
  return { task: await getTask(params.taskId) };
}

export default function TaskDetail({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.task.name}</div>;
}
```

### Error Handling
```tsx
import { data } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const task = await getTask(params.taskId);
  if (!task) {
    throw data(null, { status: 404 });
  }
  return { task };
}
```

### Type-Safe Navigation
```tsx
import { Link, href } from "react-router";

<Link to={href("/tasks/:taskId", { taskId: task.id })}>
  View Task
</Link>
```

## Testing

### Test Organization
- Test files use `.test.ts` or `.test.tsx` extensions
- Co-locate tests with implementation when possible
- Use `__tests__/` directories for grouped tests

### Test Utilities
Test utilities should be created in `app/lib/test-utils/` (to be implemented):
- `router.tsx` — React Router v7 testing helpers
- `testDatabase.ts` — Database testing utilities (if needed)

### Running Tests
```bash
bun run test          # Watch mode
bun run test:ui       # Interactive UI
bun run test:run      # Single run
bun run test:ci       # CI mode
```

## Database

The app uses better-sqlite3 for local database storage. Database utilities are in `app/db/`:
- `beads.server.ts` — Beads database operations

## Styling

- **Tailwind CSS v4** — Utility-first CSS framework
- **CSS-first configuration** — Uses `@theme` directive
- **shadcn/ui components** — Pre-built accessible components
- **Theme support** — Light/dark mode via next-themes

## Common Tasks

### Adding a New Route
1. Create route file in `app/routes/`
2. Add route to `app/routes.ts` configuration
3. Run `bun run typecheck` to generate types
4. Import types: `import type { Route } from "./+types/[routeName]"`

### Adding a New Component
1. Create component in `app/components/`
2. Use TypeScript interfaces for props
3. Follow naming conventions (PascalCase for components)
4. Add tests if component has logic

### Adding Tests
1. Create test file with `.test.tsx` extension
2. Use Vitest and @testing-library/react
3. Follow patterns in `testing-best-practices.mdc`
4. Use accessible queries (`getByRole`, `getByLabelText`)

## References

- **React Router v7 Docs**: https://reactrouter.com/
- **Cursor Rules**: `.cursor/rules/` at repository root
- **Project Root AGENTS.md**: `../../AGENTS.md` (DevAgent project context)

---

*This app is part of the DevAgent monorepo. For project-level context, see the root `AGENTS.md` file.*
