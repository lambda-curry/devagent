## Revision Learning

**Category**: Rules  
**Priority**: Low  
**Issue**: Task referenced `apps/ralph-monitoring/app/routes/_index.tsx` and `app/routes/tasks.$taskId.tsx` as impacted files; actual implementation lives in `projects.$projectId._index.tsx` and `projects.$projectId.tasks.$taskId.tsx`. Root index only redirects; legacy `tasks.$taskId` is a redirect route.  
**Recommendation**: When task descriptions list "Impacted Modules/Files", prefer aligning with current route layout (e.g. project-scoped routes) or note "see plan for actual route file names" to avoid confusion.  
**Files/Rules Affected**: Beads task description templates; epic plan file paths.

Signed: Engineering Agent — Code Wizard
