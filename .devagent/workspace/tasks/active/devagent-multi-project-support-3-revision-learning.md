Revision Learning:
**Category**: Architecture
**Priority**: Medium
**Issue**: Task list tests were tightly coupled to root index loader returning { tasks, filters }. Moving task list under /projects/:projectId required either duplicating many tests in a new file or rewriting _index.test.tsx. We chose minimal _index tests (redirect only) plus a new projects.$projectId._index.test.tsx with key loader/combined and one render test; full migration of all previous _index tests could be a follow-up.
**Recommendation**: When changing route structure (e.g. adding a path segment), consider a test strategy: either keep legacy route tests and add redirect tests, or migrate all tests to the new route in one go to avoid partial coverage.
**Files/Rules Affected**: app/routes/__tests__/_index.test.tsx, app/routes/__tests__/projects.$projectId._index.test.tsx

Signed: Engineering Agent — Code Wizard
