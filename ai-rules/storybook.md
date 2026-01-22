---
description: Storybook setup and authoring rules for apps/ralph-monitoring (Vite + Tailwind v4 + TS path aliases + React Router v7)
fileMatching: "apps/ralph-monitoring/.storybook/**/*, apps/ralph-monitoring/**/*.stories.@(js|jsx|ts|tsx|mdx)"
alwaysApply: false
---

# Storybook (ralph-monitoring)

## 🎯 Context & Problem
`apps/ralph-monitoring` is a **React Router v7 + Vite** app using **Tailwind v4** via `@tailwindcss/vite` and CSS `@import "tailwindcss";`. Storybook should match the app's styling + TS aliasing without pulling in RR7 route typegen (`./+types/*`) or server-only behavior.

## ✅ DO

### Use the Vite framework
- Use **Storybook v8+** with `@storybook/react-vite`.
- Keep Storybook config **app-local** under `apps/ralph-monitoring/.storybook/`.

### Mirror app CSS + Tailwind v4
- Import `apps/ralph-monitoring/app/globals.css` in `.storybook/preview.ts` so Tailwind tokens/utilities match the app.

### Preserve TS path aliases (`~/*`)
- Ensure Storybook's Vite config includes `vite-tsconfig-paths()` (typically in `viteFinal()`).

### Keep stories component-scoped (avoid RR7 route modules)
- Prefer stories for `apps/ralph-monitoring/app/components/ui/*` and other components.
- If a story needs router context, wrap it with a **router decorator** (e.g., `createMemoryRouter` + `RouterProvider`) instead of importing route modules.

### Prefer deterministic stories
- Use fixtures and explicit props.
- If a component needs network-like behavior, use mocks (e.g., MSW) or clearly label the story as "interactive-only".

### Prefer semantic HTML in mocks
- When mocking UI in stories (especially form-like UIs), prefer semantic elements (e.g., `<output>`, `<fieldset>/<legend>`) over ARIA-only semantics on generic containers.

## ❌ DON'T

### Don't import RR7 route modules into stories
- Route files often import `./+types/*` (generated). Storybook runs/builds can fail if typegen hasn't run, and it couples stories to routing unnecessarily.

### Don't rely on app runtime side effects
- Avoid stories that require a running RR7 server, access to local task logs, or real `EventSource` connections (unless explicitly mocked).

### Don't "just add" the RR7 Vite plugin
- Avoid adding `reactRouter()` from `@react-router/dev/vite` to Storybook's Vite plugins unless you have a proven need. Storybook should not depend on RR7's route compilation.

## 🔍 Verification
- **Type safety**: `cd apps/ralph-monitoring && bun run typecheck`
- **Storybook dev** (once installed): `cd apps/ralph-monitoring && bun run storybook`
- **Static build** (once installed): `cd apps/ralph-monitoring && bun run build-storybook`

## 📚 Related rules
- [react-router-7.mdc](mdc:.cursor/rules/react-router-7.mdc)
- [testing-best-practices.mdc](mdc:.cursor/rules/testing-best-practices.mdc)
