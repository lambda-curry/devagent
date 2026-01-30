Revision Learning:
**Category**: Process
**Priority**: Low
**Issue**: agent-browser `get text` with selector `[aria-live='polite']` and `text=Loop control` each resolved to multiple elements (strict mode violation). Status text had to be inferred from full body text / snapshot.
**Recommendation**: Prefer role+name or more specific selectors (e.g. getByRole('heading', { name: 'Loop control' }) or scope to the Loop control card) for single-element assertions in agent-browser scripts.
**Files/Rules Affected**: .devagent/plugins/ralph/skills/agent-browser/SKILL.md (optional: add note on avoiding ambiguous selectors)

Signed: QA Agent — Bug Hunter
