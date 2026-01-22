## Revision Learning

**Category**: Process
**Priority**: Low
**Issue**: Agent-browser CLI requires using element refs (from snapshot) instead of text selectors when text contains special characters like "?". The `click "link:Forgot password?"` command failed due to CSS selector parsing of the "?" character.

**Recommendation**: Update agent-browser skill documentation to emphasize using refs from snapshot output for reliable element selection, especially when text contains special characters. Example: Use `@e2` instead of `"link:Forgot password?"` when the snapshot shows `{"e2":{"name":"Forgot password?","role":"link"}}`.

**Files/Rules Affected**: `.devagent/plugins/ralph/skills/agent-browser/SKILL.md`

Signed: QA Agent — Bug Hunter
