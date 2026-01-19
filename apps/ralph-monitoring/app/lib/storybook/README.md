# Storybook router stubs (React Router v7)

Storybook runs components outside the app’s full RR7 runtime. To keep stories **deterministic** and avoid **live network** by default, we wrap stories with:

- `ThemeProvider` (dark/light tokens work)
- A **memory data router** (`createMemoryRouter` + `RouterProvider`) so `Link`, `useFetcher`, and `Form` work.

This is wired globally in `apps/ralph-monitoring/.storybook/preview.ts`.

## Story authoring standards

For consistent review coverage (naming, args/controls, layout/viewport, a11y, theme behavior, and mocking vs router stubs), follow:

- `apps/ralph-monitoring/docs/STORYBOOK_REVIEW_RUBRIC.md`

## Default behavior

- Every story renders under a memory router at `"/"` (or any location, because the story route uses `path: "*"` by default).
- No loaders/actions run unless you explicitly provide them via `extraRoutes`.

## Per-story configuration

Set `parameters.rrRouter` in your story:

```ts
export const Default = {
  parameters: {
    rrRouter: {
      initialEntries: ["/"],
      storyPath: "*"
    }
  }
};
```

### Mocking loaders/actions (no network)

Use `extraRoutes` to define “API routes” for `useFetcher` / `<Form action="...">`:

```ts
import { data } from "react-router";

export const WithFetcher = {
  parameters: {
    rrRouter: {
      extraRoutes: [
        {
          path: "/api/demo",
          action: async ({ request }) => {
            const bodyText = await request.text();
            const params = new URLSearchParams(bodyText);
            return data({ ok: true, name: params.get("name") });
          }
        }
      ]
    }
  }
};
```

## Opting out (browser-API-heavy components)

Some components are difficult to run inside Storybook without additional mocking (e.g. `EventSource`, complex timers, `ResizeObserver`, WebRTC).

To disable the router wrapper for a specific story:

```ts
export const NoRouter = {
  parameters: {
    rrRouter: { disabled: true }
  }
};
```

If your component needs router context but also needs heavy browser APIs, prefer:

- Keeping the memory router enabled
- Adding targeted mocks (or MSW) only for that story
- Clearly labeling the story as “interactive-only” if it’s not deterministic

