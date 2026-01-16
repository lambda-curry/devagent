# Ralph-Monitoring UI Enhancements Plan

- Owner: Jake Ruesink
- Last Updated: 2026-01-14
- Status: Draft
- Related Task Hub: `.devagent/workspace/tasks/completed/2026-01-14_brainstorm-next-phase-ralph-monitoring/`
- Stakeholders: Jake Ruesink (Owner, Decision Maker)

---

## PART 1: PRODUCT CONTEXT

### Summary
Enhance the ralph-monitoring app with UI-focused improvements that follow shadcn/ui and Tailwind CSS best practices. These enhancements will provide meaningful work for testing Ralph's UI development and testing capabilities while improving the user experience of the monitoring interface. The focus is on implementing polished, accessible UI components and interactions that demonstrate modern React Router 7 patterns.

### Context & Problem
The ralph-monitoring MVP provides core functionality (task list, log streaming, stop controls) but lacks UI polish and advanced interaction patterns. Current components are custom-built without leveraging shadcn/ui's accessible component library. This phase will enhance the UI with filtering, search, theme switching, improved log viewer controls, and better visual feedback—all while establishing shadcn/ui as the component foundation for future development. (Sources: `brainstorms/2026-01-14_ralph-monitoring-phase-2-ideas.md`, `../2026-01-13_ralph-monitoring-ui/plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md`)

### Objectives & Success Metrics
- **Component library foundation:** shadcn/ui is properly installed and configured, with at least 5 components integrated into the app
- **UI enhancements delivered:** 4-5 major UI enhancements implemented (filtering/search, theme toggle, log viewer controls, task card improvements, empty states)
- **Best practices adherence:** All new components follow shadcn/ui patterns, Tailwind CSS v4 conventions, and React Router 7 data loading patterns
- **Testing readiness:** Components are structured for easy testing with React Testing Library
- **Baseline:** Current MVP has basic custom components without shadcn/ui
- **Target:** Polished UI with shadcn/ui components, improved interactions, and better visual hierarchy

### Users & Insights
- **Primary user:** Jake Ruesink, monitoring his own Ralph executions
- **Key insight:** UI enhancements should provide good practice for Ralph's component development and testing skills while improving daily usability
- **Demand signal:** Need for better task filtering, search, and log viewer controls identified in brainstorming session

### Solution Principles
- Use shadcn/ui components as the foundation for all new UI elements
- Follow Tailwind CSS v4 best practices (CSS-first approach with `@theme` directive)
- Maintain React Router 7 patterns (loaders for data, actions for mutations)
- Ensure accessibility (keyboard navigation, ARIA labels, focus management)
- Prioritize component reusability and composability
- Use TypeScript strictly with proper type definitions
- Follow functional programming patterns (avoid classes, prefer hooks)

### Scope Definition
- **In Scope:**
  - shadcn/ui setup and configuration
  - Task status filtering and search functionality
  - Dark/light theme toggle with persistence
  - Enhanced log viewer controls (pause/resume, copy, download, line numbers)
  - Task card enhancements (hover states, quick actions, better visual hierarchy)
  - Empty states and loading skeletons
  - Real-time status animations and visual feedback
- **Out of Scope / Future:**
  - Mobile-responsive optimizations (deferred to future phase)
  - Task timeline/history view (complex feature, defer)
  - Log syntax highlighting (requires parsing logic, defer)
  - Task detail sidebar/modal (current full-page view is acceptable for MVP+)

### Functional Narrative

#### Flow 1: Filter and Search Tasks
- Trigger: User opens task list page
- Experience narrative:
  - UI displays filter controls (status dropdown, priority filter) and search input at the top
  - User can select status filters (all, todo, in_progress, done, blocked) using shadcn Select component
  - User types in search box (debounced input) to filter tasks by title/description
  - Task list updates reactively as filters/search change
  - Active filters are visually indicated
- Acceptance criteria:
  - Filter dropdowns work with keyboard navigation
  - Search input debounces queries (300ms delay)
  - Task list filters correctly by status and search terms
  - Filter state persists in URL query params for shareability

#### Flow 2: Toggle Theme
- Trigger: User clicks theme toggle button
- Experience narrative:
  - Theme toggle button (sun/moon icon) is visible in header/navigation
  - Clicking toggles between light and dark mode
  - Theme preference is saved to localStorage
  - System preference is detected on first load
  - Smooth transition between themes
- Acceptance criteria:
  - Theme toggle works with keyboard (Enter/Space)
  - Preference persists across page reloads
  - System preference is respected on first visit
  - All components respect theme (no hardcoded colors)

#### Flow 3: Enhanced Log Viewer Controls
- Trigger: User views task detail page with logs
- Experience narrative:
  - Log viewer displays control toolbar above log content
  - Controls include: pause/resume streaming, copy logs, download logs, jump to top/bottom, toggle line numbers
  - Pause button stops auto-scroll and pauses SSE stream
  - Copy button copies all logs to clipboard with feedback toast
  - Download button triggers file download of log content
  - Line numbers toggle shows/hides line numbers in log output
- Acceptance criteria:
  - All controls are keyboard accessible
  - Copy action shows success toast notification
  - Download generates proper log file
  - Pause/resume works correctly with SSE stream
  - Line numbers align correctly with log content

#### Flow 4: Improved Task Cards
- Trigger: User views task list
- Experience narrative:
  - Task cards have hover states (subtle elevation, border highlight)
  - Cards show quick action buttons on hover (view details, stop if active)
  - Better visual hierarchy with improved spacing and typography
  - Status badges are animated (pulsing for in_progress, checkmark animation for done)
  - Cards are more visually distinct and easier to scan
- Acceptance criteria:
  - Hover states are smooth and non-jarring
  - Quick actions are accessible via keyboard
  - Animations are performant (60fps)
  - Visual hierarchy improves scanability

#### Flow 5: Empty States and Loading
- Trigger: User views task list with no tasks or during data loading
- Experience narrative:
  - Empty state shows helpful message with icon when no tasks exist
  - Loading skeleton screens display while data loads (matching final layout)
  - First-time user sees brief onboarding message
  - States are visually polished and informative
- Acceptance criteria:
  - Empty states are helpful and actionable
  - Loading skeletons match final component layout
  - No layout shift when data loads
  - States are accessible (screen reader friendly)

### Technical Notes & Dependencies
- **shadcn/ui setup:** Requires `npx shadcn@latest init` to configure components.json and install dependencies
- **Tailwind CSS v4:** Already configured; ensure new components use CSS-first approach with existing theme variables
- **React Router 7:** Use loaders for filter/search state management via URL params
- **localStorage:** For theme preference persistence
- **Clipboard API:** For copy-to-clipboard functionality
- **File download:** Use Blob API for log file downloads
- **Platform:** macOS primary; Linux compatible

---

## PART 2: IMPLEMENTATION PLAN

### Scope & Assumptions
- Scope focus: UI enhancements with shadcn/ui foundation, focusing on components that provide good testing practice for Ralph
- Key assumptions:
  - shadcn/ui components work well with Tailwind CSS v4 (validate during setup)
  - React Router 7 loaders can handle filter/search state via URL params
  - localStorage is available for theme persistence
  - Clipboard API is available for copy functionality
- Out of scope: Mobile optimizations, complex timeline views, log parsing

### Implementation Tasks

#### Task 1: Set up shadcn/ui and install base components
- **Objective:** Configure shadcn/ui in the ralph-monitoring app and install essential components (Button, Select, Input, Card, Badge, Toast, Skeleton) following best practices.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/components.json` (new file, created by shadcn init)
  - `apps/ralph-monitoring/app/components/ui/` (new directory for shadcn components)
  - `apps/ralph-monitoring/app/lib/utils.ts` (new file for cn() utility)
  - `apps/ralph-monitoring/package.json` (updated with shadcn dependencies: class-variance-authority, clsx, tailwind-merge)
  - `apps/ralph-monitoring/app/globals.css` (verify Tailwind config compatibility)
- **References:**
  - shadcn/ui documentation: https://ui.shadcn.com/docs/installation
  - Tailwind CSS v4 compatibility: verify with shadcn setup
  - Brainstorm: `brainstorms/2026-01-14_ralph-monitoring-phase-2-ideas.md`
- **Dependencies:** None (foundational task)
- **Acceptance Criteria:**
  - `npx shadcn@latest init` completes successfully with Tailwind CSS v4
  - Components directory structure follows shadcn conventions (`app/components/ui/`)
  - `cn()` utility function is available for className merging
  - At least 5 base components installed (Button, Select, Input, Card, Badge, Toast, Skeleton)
  - Components use existing Tailwind theme variables from `globals.css`
  - TypeScript types are properly configured
- **Testing Criteria:**
  - Manual: verify shadcn components render correctly
  - Manual: verify theme variables are applied correctly
  - Manual: verify `cn()` utility works for className merging
  - If test infrastructure exists: add basic render test for one component
- **Validation Plan:** Confirm components.json is created, components directory exists, and sample component renders with correct styling.

#### Task 2: Implement task filtering and search with shadcn components
- **Objective:** Add filter controls (status dropdown, priority filter) and search input to the task list page using shadcn Select and Input components, with URL-based state management.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx` (add filter/search UI and logic)
  - `apps/ralph-monitoring/app/components/ui/select.tsx` (shadcn component, if not already installed)
  - `apps/ralph-monitoring/app/components/ui/input.tsx` (shadcn component, if not already installed)
  - `apps/ralph-monitoring/app/components/ui/button.tsx` (shadcn component, for clear filters button)
  - `apps/ralph-monitoring/app/utils/filters.server.ts` (new file, filter logic utilities)
- **References:**
  - React Router 7 loader patterns: `.cursorrules/react-router-7.mdc`
  - shadcn Select component: https://ui.shadcn.com/docs/components/select
  - shadcn Input component: https://ui.shadcn.com/docs/components/input
  - Brainstorm idea #1: Task Status Filtering & Search
- **Dependencies:** Task 1 (shadcn/ui setup)
- **Acceptance Criteria:**
  - Filter controls appear at top of task list page
  - Status filter dropdown uses shadcn Select component
  - Search input uses shadcn Input component with debouncing (300ms)
  - Filter/search state is managed via URL query params (`?status=in_progress&search=keyword`)
  - Task list filters correctly based on selected filters and search terms
  - Clear filters button resets all filters
  - All controls are keyboard accessible
  - Filter state persists when navigating back to page
- **Testing Criteria:**
  - Manual: test filtering by status (all, todo, in_progress, done, blocked)
  - Manual: test search by title and description
  - Manual: test URL query param persistence
  - Manual: test keyboard navigation
  - If test infrastructure exists: add test for filter logic
- **Validation Plan:** Verify filters work correctly, URL params update, and task list updates reactively.

#### Task 3: Implement dark/light theme toggle with persistence
- **Objective:** Add theme toggle button to app header/navigation that switches between light and dark modes, persists preference to localStorage, and detects system preference.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/root.tsx` (add theme provider and toggle button)
  - `apps/ralph-monitoring/app/components/ThemeToggle.tsx` (new component)
  - `apps/ralph-monitoring/app/utils/theme.server.ts` (new file, theme utilities)
  - `apps/ralph-monitoring/app/globals.css` (verify dark mode classes work correctly)
- **References:**
  - Tailwind CSS v4 dark mode: already configured in `globals.css`
  - shadcn theme patterns: https://ui.shadcn.com/docs/theming
  - Brainstorm idea #4: Dark/Light Theme Toggle
- **Dependencies:** Task 1 (shadcn/ui setup for Button component)
- **Acceptance Criteria:**
  - Theme toggle button appears in header/navigation area
  - Button uses shadcn Button component with sun/moon icons (lucide-react)
  - Clicking toggles between light and dark themes
  - Theme preference is saved to localStorage
  - System preference is detected on first visit (prefers-color-scheme)
  - Smooth transition between themes (CSS transitions)
  - All components respect theme (no hardcoded colors)
  - Toggle is keyboard accessible (Enter/Space)
- **Testing Criteria:**
  - Manual: toggle theme and verify all components update
  - Manual: reload page and verify preference persists
  - Manual: test system preference detection
  - Manual: test keyboard accessibility
- **Validation Plan:** Verify theme toggle works, preference persists, and all UI elements respect theme.

#### Task 4: Enhance log viewer with controls using shadcn components
- **Objective:** Add control toolbar to LogViewer component with pause/resume, copy, download, jump buttons, and line number toggle using shadcn components.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/components/LogViewer.tsx` (add control toolbar and functionality)
  - `apps/ralph-monitoring/app/components/ui/button.tsx` (shadcn component, for control buttons)
  - `apps/ralph-monitoring/app/components/ui/toast.tsx` (shadcn component, for copy feedback)
  - `apps/ralph-monitoring/app/utils/logs.client.ts` (new file, client-side log utilities)
- **References:**
  - shadcn Button component: https://ui.shadcn.com/docs/components/button
  - shadcn Toast component: https://ui.shadcn.com/docs/components/toast
  - Clipboard API: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
  - Brainstorm idea #2: Enhanced Log Viewer Controls
- **Dependencies:** Task 1 (shadcn/ui setup), existing LogViewer component
- **Acceptance Criteria:**
  - Control toolbar appears above log content
  - Pause/resume button controls SSE stream and auto-scroll
  - Copy button copies all logs to clipboard and shows success toast
  - Download button generates and downloads log file (`.txt` format)
  - Jump to top/bottom buttons scroll log container
  - Line numbers toggle shows/hides line numbers with proper alignment
  - All controls use shadcn Button component
  - Controls are keyboard accessible
  - Toast notifications appear for copy action
- **Testing Criteria:**
  - Manual: test pause/resume functionality
  - Manual: test copy to clipboard and verify toast appears
  - Manual: test download generates correct file
  - Manual: test jump buttons scroll correctly
  - Manual: test line numbers toggle and alignment
  - Manual: test keyboard accessibility
- **Validation Plan:** Verify all controls work correctly, clipboard API functions, and file download succeeds.

#### Task 5: Enhance task cards with improved visual hierarchy and interactions
- **Objective:** Improve task cards with hover states, quick action buttons, animated status badges, and better visual hierarchy using shadcn Card and Badge components.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx` (update TaskCard component)
  - `apps/ralph-monitoring/app/components/ui/card.tsx` (shadcn component)
  - `apps/ralph-monitoring/app/components/ui/badge.tsx` (shadcn component)
  - `apps/ralph-monitoring/app/components/ui/button.tsx` (shadcn component, for quick actions)
- **References:**
  - shadcn Card component: https://ui.shadcn.com/docs/components/card
  - shadcn Badge component: https://ui.shadcn.com/docs/components/badge
  - Tailwind CSS animations: use existing Tailwind animation utilities
  - Brainstorm ideas #5 and #6: Task Card Enhancements, Real-time Status Badges & Animations
- **Dependencies:** Task 1 (shadcn/ui setup)
- **Acceptance Criteria:**
  - Task cards use shadcn Card component
  - Cards have smooth hover states (elevation, border highlight)
  - Quick action buttons appear on hover (view details, stop if active)
  - Status badges use shadcn Badge component with animations:
    - Pulsing animation for `in_progress` status
    - Checkmark animation for `done` status
  - Improved visual hierarchy with better spacing and typography
  - Cards are more visually distinct and easier to scan
  - All interactions are keyboard accessible
  - Animations are performant (60fps, use CSS transforms)
- **Testing Criteria:**
  - Manual: verify hover states work smoothly
  - Manual: verify quick actions appear and function correctly
  - Manual: verify status animations are smooth and performant
  - Manual: verify keyboard accessibility
  - Manual: verify visual hierarchy improves scanability
- **Validation Plan:** Verify cards look polished, interactions are smooth, and animations are performant.

#### Task 6: Add empty states and loading skeletons
- **Objective:** Implement polished empty states for "no tasks" scenarios and loading skeleton screens using shadcn Skeleton component.
- **Impacted Modules/Files:**
  - `apps/ralph-monitoring/app/routes/_index.tsx` (add empty state and loading skeletons)
  - `apps/ralph-monitoring/app/components/ui/skeleton.tsx` (shadcn component)
  - `apps/ralph-monitoring/app/components/EmptyState.tsx` (new component)
  - `apps/ralph-monitoring/app/components/TaskCardSkeleton.tsx` (new component)
- **References:**
  - shadcn Skeleton component: https://ui.shadcn.com/docs/components/skeleton
  - Brainstorm idea #10: Empty States & Loading Skeletons
- **Dependencies:** Task 1 (shadcn/ui setup)
- **Acceptance Criteria:**
  - Empty state displays when no tasks exist with helpful message and icon
  - Loading skeletons match final component layout (task card skeletons)
  - No layout shift when data loads (skeletons match dimensions)
  - Empty states are accessible (screen reader friendly)
  - First-time user sees brief onboarding message
  - States are visually polished and informative
- **Testing Criteria:**
  - Manual: verify empty state appears when no tasks
  - Manual: verify loading skeletons appear during data fetch
  - Manual: verify no layout shift occurs
  - Manual: verify screen reader accessibility
- **Validation Plan:** Verify empty states are helpful and loading skeletons match layout.

### Implementation Guidance

**From `.cursorrules/react-router-7.mdc` → Route Structure & Data Loading:**
- Use file-based routing in `app/routes/`
- Route files should export default component and optional meta, loader, action functions
- Use loaders for server-side data fetching
- Prefer server-side data loading over client-side when possible
- Keep route components focused on layout and data orchestration
- Extract business logic into custom hooks or utilities

**From `AGENTS.md` (root) → Code Style and Structure:**
- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Prefer self documenting code, but if a comment is needed make sure it is not redundant and will be add helpful context

**From `AGENTS.md` (root) → TypeScript Usage:**
- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces
- Prefer importing types from React such as `import type { ComponentType } from 'react';` instead of using React as a global

**From `AGENTS.md` (root) → UI and Styling:**
- Prefer utilizing components and packages that are already used within the project
- Implement responsive design with Tailwind CSS; use a mobile-first approach
- Use existing Tailwind theme variables from `globals.css` (do not hardcode colors)

**From `apps/ralph-monitoring/app/globals.css` → Tailwind CSS v4 Theme:**
- Use CSS-first approach with `@theme` directive
- Use existing theme variables (e.g., `--color-background`, `--color-foreground`, `--color-primary`)
- Dark mode is configured via `.dark` class on root element
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`, `border-border`)

**shadcn/ui Best Practices:**
- Install components using `npx shadcn@latest add [component]`
- Components are copied into `app/components/ui/` directory
- Use `cn()` utility for className merging (combines clsx and tailwind-merge)
- Customize components by editing the copied files (they're not npm packages)
- Follow shadcn component patterns for accessibility (proper ARIA labels, keyboard navigation)
- Use Radix UI primitives (installed automatically with shadcn components) for complex interactions

**Testing Patterns:**
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Test accessibility (keyboard navigation, screen reader)
- Test loading and error states
- Follow project testing standards (vitest is configured)

---

## Risks & Open Questions

| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| shadcn/ui compatibility with Tailwind CSS v4 | Risk | Jake Ruesink | Validate during Task 1 setup; shadcn may need Tailwind v3 config initially | During Task 1 |
| URL query param state management complexity | Risk | Jake Ruesink | Use React Router 7's built-in URL search params handling; prototype early | During Task 2 |
| Clipboard API browser compatibility | Risk | Jake Ruesink | Use Clipboard API with fallback to document.execCommand if needed | During Task 4 |
| Theme persistence with SSR | Question | Jake Ruesink | Verify localStorage access in React Router 7 SSR context; may need client-only check | During Task 3 |
| Performance of animated status badges | Risk | Jake Ruesink | Use CSS transforms for animations; test with many tasks visible | During Task 5 |

---

## Progress Tracking
Refer to the AGENTS.md file in the task directory for instructions on tracking and reporting progress during implementation.

---

## Appendices & References

- **Task hub:** `.devagent/workspace/tasks/completed/2026-01-14_brainstorm-next-phase-ralph-monitoring/AGENTS.md`
- **Brainstorm:** `.devagent/workspace/tasks/completed/2026-01-14_brainstorm-next-phase-ralph-monitoring/brainstorms/2026-01-14_ralph-monitoring-phase-2-ideas.md`
- **MVP Plan:** `.devagent/workspace/tasks/completed/2026-01-13_ralph-monitoring-ui/plan/2026-01-14_ralph-monitoring-ui-mvp-plan.md`
- **App Location:** `apps/ralph-monitoring/`
- **shadcn/ui Documentation:** https://ui.shadcn.com/docs
- **Tailwind CSS v4 Documentation:** https://tailwindcss.com/docs
- **React Router 7 Documentation:** https://reactrouter.com/
- **Cursor Rules:** `.cursorrules/react-router-7.mdc`
- **Agent Documentation:** `AGENTS.md` (root), `.devagent/core/AGENTS.md`
- **Constitution:** `.devagent/workspace/memory/constitution.md` (C1: Mission & Stakeholder Fidelity, C3: Delivery Principles)
