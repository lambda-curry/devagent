Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Intermittent "Application Error" (TypeError: Cannot read properties of null (reading 'useContext')) when opening epic detail URL in agent-browser; subsequent load of same URL succeeded. Error stack pointed at useParams/useErrorBoundaryProps/WithErrorBoundaryProps2.
**Recommendation**: If reports of 404 or loader errors showing a broken error screen (instead of the root ErrorBoundary content) increase, investigate React Router context availability inside the root ErrorBoundary (e.g. when document is re-created with full html/body).
**Files/Rules Affected**: apps/ralph-monitoring/app/root.tsx (ErrorBoundary)

Signed: QA Agent — Bug Hunter
