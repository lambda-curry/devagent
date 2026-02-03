Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: Epic-level log access QA relied on curl/fetch of epic detail HTML to assert DOM (Task logs section, combobox, View task link, LogViewer). Full task-switcher interaction (open Select, pick another task) was not exercised in browser; component tests cover default selection and selector presence; Engineering noted Radix Select in jsdom triggers pointer-capture/portal issues.
**Recommendation**: For log-panel QA, consider: (1) DOM assertions on epic detail URL (section, combobox, link, LogViewer) as primary evidence; (2) task-switcher behavior covered by EpicLogPanel unit tests (default selection, effectiveTaskId sync); (3) optional agent-browser click/select only if needed for regression.
**Files/Rules Affected**: .devagent/plugins/ralph/skills/agent-browser/SKILL.md, QA workflow for epic log panel

Signed: QA Agent — Bug Hunter
