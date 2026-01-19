# Storybook review rubric (ralph-monitoring)

Objective: keep stories **consistent**, **accessible**, and **useful for UI review** in `apps/ralph-monitoring`.

This app’s Storybook runs with:

- Tailwind v4 styles from `app/globals.css` (imported in `.storybook/preview.ts`)
- Global decorator `withThemeAndRrRouter` (ThemeProvider + RR7 memory data router)
- RR7 router stubs via `parameters.rrRouter` (see `app/lib/storybook/README.md`)

---

## Rubric: story naming & organization

- **`meta.title`**: use a predictable hierarchy:
  - **`ui/<Component>`** for primitives in `app/components/ui/*` (e.g. `ui/Button`, `ui/Input`)
  - **`components/<Component>`** for app components in `app/components/*` (e.g. `components/LogViewer`)
- **Story exports**: use **named exports** with reviewer-friendly names.
  - **Prefer**: `Default`, `Variants`, `Sizes`, `States`, `Empty`, `Loading`, `Error`, `Interaction`
  - **Avoid**: `Test1`, `Foo`, `Example`, or names that encode implementation details
- **Determinism**: every story should render meaningfully on first load without requiring user clicks unless explicitly labeled interactive-only.

---

## Rubric: args & controls conventions

- **Meta args**: set sensible defaults in `meta.args` (the “happy path”).
  - Keep required props filled (e.g. `taskId`, `children`, `aria-label`).
  - Prefer explicit fixtures (stable strings/dates) over `new Date()` unless the story is about relative time behavior.
- **Controls hygiene**:
  - Hide non-reviewable props (e.g. `className`, `ref`, internal callbacks) using `argTypes` controls disabling.
  - If a prop is important but complex (objects/arrays), provide a small curated set of variants as separate stories instead of exposing a huge control surface.
- **Actions**: rely on the global actions regex (`^on[A-Z].*`) when possible; only add custom actions when it materially improves review.

---

## Rubric: layout, spacing, and viewport expectations

- **Default layout**: treat Storybook’s default as “padded”. If a component needs a different presentation, set it per-story:
  - **Centered**: for small components (buttons, toggles) when alignment matters.
  - **Fullscreen**: for page-like components or anything that needs full width/height.
- **Provide a framing container** in `render()` for components that need space:
  - Use Tailwind to define max-width and spacing (e.g. `max-w-md`, `space-y-4`, `p-6`).
  - Ensure text wraps and long content doesn’t overflow by default.
- **Mobile-first check**: each component should be reviewable at narrow widths.
  - If a component is responsive, add at least one story that constrains width (e.g. `max-w-sm`) or sets a mobile viewport via `parameters.viewport`.

---

## Rubric: a11y & interaction checks (required for interactive components)

For components that accept user input or have click/keyboard interactions:

- **Keyboard**:
  - Ensure focus is visible and tab order is sensible.
  - Add a minimal `play()` that tabs to the element and asserts focus/behavior when feasible.
- **Accessible names**:
  - Inputs must have a label or `aria-label`.
  - Buttons/controls must have an accessible name that matches what a user would search for.
- **Semantics**:
  - Use correct roles/HTML elements; don’t rely on `div`/`span` for interactive controls.
- **Contrast**:
  - Text + icons must remain readable in both themes (see next section).

Note: we don’t currently enforce an automated a11y addon here; the “minimum bar” is keyboard + accessible names + semantic markup, validated via `@storybook/test` assertions where appropriate.

---

## Rubric: dark/light theme behavior

All components must be legible and usable in both themes under the global `ThemeProvider`.

- **Expectation**: nothing becomes invisible, low-contrast, or clipped when the theme changes.
- **How to verify**:
  - Prefer adding a `play()` that toggles theme when a story already includes `ThemeToggle`, or
  - Add a story-level decorator that forces the `html` class to `dark` and provides a separate `Dark` story (and cleans up on unmount).

If a component is intentionally theme-dependent (rare), document it in `parameters.docs.description.component`.

---

## Rubric: router stubs vs mocking vs real network

Storybook should be **offline by default** and should not depend on the RR7 server runtime.

### Use the built-in RR7 memory router (default)

- **Default state**: stories already run under a memory data router.
- **Use this when** your component uses `Link`, `useLocation`, `useFetcher`, or `<Form>`.

### Add route-level stubs with `parameters.rrRouter.extraRoutes`

- **Preferred for `useFetcher` / `<Form action>`**: stub the target routes as `RouteObject`s via `extraRoutes`.
- **Parse request bodies carefully**: in tests/stories, prefer `await request.text()` + `URLSearchParams` for `application/x-www-form-urlencoded` submissions (jsdom and Storybook tooling can be inconsistent with `request.formData()`).

### Mock browser APIs / fetch only when necessary

- **Use this when** the component integrates with browser APIs that can’t be expressed as router routes (e.g. `EventSource`, clipboard, `ResizeObserver`).
- **Mock narrowly**: intercept only the endpoints/constructors you need, and restore originals in cleanup.
- **Install mocks early**: if the component calls `fetch` or creates browser API instances in `useEffect`, install mocks in `useLayoutEffect` inside a wrapper decorator so the mocks are in place before child effects run.

### Never import RR7 route modules into stories

- Route modules often import generated `./+types/*` and/or server-only code.
- Prefer component stories + router stubs over pulling in full route files.

### Disable router wrapper only as a last resort

- Use `parameters.rrRouter.disabled = true` only if the router wrapper conflicts with a browser-API-heavy story and you have a clear alternative for providing the required context.

