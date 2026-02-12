**Revision Learning**

- **Category:** Process
- **Priority:** Low
- **Issue:** Epics layout had no loading indicator; users had no feedback during navigation between dashboard, detail, and live. Empty states for "no steps" and "connected but no logs yet" were missing.
- **Recommendation:** For mobile-first flows, add a minimal global loading indicator (e.g. thin top bar) in the layout when `useNavigation().state === 'loading'`, and ensure every list/feed has an explicit empty-state message.
- **Files/Rules Affected:** `app/routes/epics.tsx`, `app/components/StepsList.tsx`, `app/routes/epics.$epicId.live.tsx`, README.md.

Signed: Engineering Agent — Code Wizard
