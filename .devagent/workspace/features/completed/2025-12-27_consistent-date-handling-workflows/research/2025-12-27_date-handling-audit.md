# Research: Date Handling Audit for DevAgent Workflows

- Date: 2025-12-27
- Classification: Workflow improvement / consistency audit
- Assumptions: All workflows should use ISO 8601 date format (YYYY-MM-DD) consistently. AI assistants need explicit instructions to retrieve the current date rather than inferring it.

---

## Research Plan

What was validated:
1. **Current date usage patterns** across all workflows in `.devagent/core/workflows/`
2. **Date handling instructions** (or lack thereof) in workflow documentation
3. **Template date fields** that require date population
4. **Storage patterns** that use dates in filenames
5. **Document headers** that include date metadata
6. **AGENTS.md update patterns** that require date updates

---

## Sources

### Internal Sources
- `.devagent/core/workflows/research.md` — Uses dates in research document filenames (`YYYY-MM-DD_<descriptor>.md`) — 2025-12-27
- `.devagent/core/workflows/create-plan.md` — Uses dates in plan document filenames (`YYYY-MM-DD_<descriptor>.md`) — 2025-12-27
- `.devagent/core/workflows/new-feature.md` — Uses dates for feature folder prefixes and AGENTS.md "Last Updated" field — 2025-12-27
- `.devagent/core/workflows/review-progress.md` — Uses dates in checkpoint filenames and document headers — 2025-12-27
- `.devagent/core/workflows/brainstorm.md` — Uses dates in brainstorm packet filenames (`YYYY-MM-DD_<topic>.md`) — 2025-12-27
- `.devagent/core/workflows/compare-prs.md` — Uses dates in comparison artifact filenames (`YYYY-MM-DD_pr-comparison_<pr-numbers>.md`) — 2025-12-27
- `.devagent/core/workflows/review-pr.md` — Uses dates in review artifact filenames (`YYYY-MM-DD_pr-<number>-review.md`) — 2025-12-27
- `.devagent/core/templates/feature-agents-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/core/templates/plan-document-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/core/templates/research-packet-template.md` — Template includes "Last Updated: <YYYY-MM-DD>" field — 2025-12-27
- `.devagent/workspace/memory/constitution.md` — C2 clause requires ISO-date prefixes for chronological feature artifacts — 2025-12-27
- Date handling notes provided in feature hub — Documents the problem, solution pattern, and verification checklist — 2025-12-27

---

## Findings & Tradeoffs

### 1. Current Date Usage Patterns

**Workflows that create dated documents:**

1. **research.md**
   - Creates: `YYYY-MM-DD_<descriptor>.md` in research directories
   - Current instruction: "Feature‑scoped research: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/research/` with `YYYY-MM-DD_<descriptor>.md`"
   - **Issue:** No explicit instruction to run `date +%Y-%m-%d` before creating filename
   - **Issue:** No instruction to include date in document header

2. **create-plan.md**
   - Creates: `YYYY-MM-DD_<descriptor>.md` in plan directories
   - Current instruction: "Save the plan to `.devagent/workspace/features/{status}/<feature_prefix>_<feature_slug>/plan/YYYY-MM-DD_<descriptor>.md`"
   - **Issue:** No explicit instruction to run `date +%Y-%m-%d` before creating filename
   - **Issue:** Template has "Last Updated: <YYYY-MM-DD>" but no instruction on how to populate it

3. **new-feature.md**
   - Creates: Feature folders with `YYYY-MM-DD_<feature-slug>` prefix
   - Creates: AGENTS.md with "Last Updated: <YYYY-MM-DD>"
   - Current instruction: "Otherwise, use today's date in ISO `YYYY-MM-DD`"
   - Current instruction: "Last Updated → today (ISO date)"
   - **Issue:** Says "use today's date" but doesn't specify how to get it
   - **Issue:** Says "today (ISO date)" but doesn't specify how to retrieve it

4. **review-progress.md**
   - Creates: `YYYY-MM-DD_checkpoint.md` in progress directories
   - Creates: Document with "**Date:** YYYY-MM-DD" header
   - Current instruction: "Checkpoint naming: Use current date and optional descriptor"
   - **Issue:** Says "Use current date" but doesn't specify how to get it
   - **Issue:** Template shows "**Date:** YYYY-MM-DD" but no instruction to populate it

5. **brainstorm.md**
   - Creates: `YYYY-MM-DD_<topic>.md` in brainstorm directories
   - Current instruction: "format: `YYYY-MM-DD_<topic>.md`"
   - **Issue:** No explicit instruction to run `date +%Y-%m-%d` before creating filename

6. **compare-prs.md**
   - Creates: `YYYY-MM-DD_pr-comparison_<pr-numbers>.md` in reviews directory
   - Current instruction: "Save artifact with dated filename: `YYYY-MM-DD_pr-comparison_<pr-1>-<pr-2>.md`"
   - **Issue:** Says "dated filename" but doesn't specify how to get the date

7. **review-pr.md**
   - Creates: `YYYY-MM-DD_pr-<number>-review.md` in reviews directory
   - Current instruction: "Save artifact with dated filename: `YYYY-MM-DD_pr-<number>-review.md`"
   - **Issue:** Says "dated filename" but doesn't specify how to get the date

8. **clarify-feature.md**
   - Creates: Clarification packets (likely dated, needs verification)
   - **Issue:** Need to verify date usage pattern

### 2. Template Date Fields

**Templates that include date fields requiring population:**

1. **feature-agents-template.md**
   - Field: "Last Updated: <YYYY-MM-DD>"
   - Instruction: "Always update 'Last Updated' to today's date (ISO: YYYY-MM-DD) when editing this file"
   - **Issue:** Says "today's date" but doesn't specify how to retrieve it

2. **plan-document-template.md**
   - Field: "Last Updated: <YYYY-MM-DD>"
   - **Issue:** No instruction on how to populate this field

3. **research-packet-template.md**
   - Field: "Last Updated: <YYYY-MM-DD>"
   - **Issue:** No instruction on how to populate this field

### 3. Date Retrieval Patterns

**Current state:**
- No workflows explicitly instruct running `date +%Y-%m-%d` to get the current date
- Workflows use phrases like "today's date", "current date", "today (ISO date)" without specifying retrieval method
- AI assistants may infer dates incorrectly, especially when working across timezones or on different days

**Required pattern (from user notes):**
- Always run `date +%Y-%m-%d` first to get current date
- Use the output in filenames, document headers, and AGENTS.md updates
- Verify date format matches `YYYY-MM-DD` pattern

### 4. Storage Pattern Consistency

**All workflows follow similar patterns:**
- Feature-scoped: `.devagent/workspace/features/{status}/YYYY-MM-DD_feature-slug/...`
- General: `.devagent/workspace/{category}/YYYY-MM-DD_<descriptor>.md`
- Reviews: `.devagent/workspace/reviews/YYYY-MM-DD_<type>_<identifier>.md`

**Consistency:** All use `YYYY-MM-DD` format, which aligns with Constitution C2 requirement for ISO-date prefixes.

**Gap:** None specify how to retrieve the date value.

---

## Recommendation

### Primary Recommendation: Add Explicit Date Retrieval to All Workflows

**For each workflow that creates dated documents, add explicit instructions:**

1. **Before creating any dated document:**
   ```markdown
   ## Date Retrieval
   - Run `date +%Y-%m-%d` to get the current date in ISO format
   - Store the output in a variable or use directly: `CURRENT_DATE=$(date +%Y-%m-%d)`
   - Verify format matches `YYYY-MM-DD` pattern
   ```

2. **Update workflow sections that mention dates:**
   - Replace "use today's date" with "run `date +%Y-%m-%d` to get current date"
   - Replace "current date" with "date from `date +%Y-%m-%d` output"
   - Add explicit step: "Get current date: Run `date +%Y-%m-%d`"

3. **Update template instructions:**
   - Add to template sections: "Populate date fields by running `date +%Y-%m-%d` first"
   - Update "Last Updated" instructions to specify date retrieval method

### Specific Workflow Updates Needed

1. **research.md** — Add date retrieval step before creating research documents
2. **create-plan.md** — Add date retrieval step before creating plan documents and populating template
3. **new-feature.md** — Add date retrieval step before creating feature folder and AGENTS.md
4. **review-progress.md** — Add date retrieval step before creating checkpoint documents
5. **brainstorm.md** — Add date retrieval step before creating brainstorm packets
6. **compare-prs.md** — Add date retrieval step before creating comparison artifacts
7. **review-pr.md** — Add date retrieval step before creating review artifacts
8. **clarify-feature.md** — Verify and add date retrieval if clarification packets are dated

### Template Updates Needed

1. **feature-agents-template.md** — Update "Last Updated" instruction to specify `date +%Y-%m-%d`
2. **plan-document-template.md** — Add instruction for populating "Last Updated" field
3. **research-packet-template.md** — Add instruction for populating "Last Updated" field
4. **Other templates** — Audit and update any templates with date fields

### Verification Pattern

Add to each workflow's verification/checklist section:
- [ ] Date matches `date +%Y-%m-%d` output
- [ ] Filename uses correct date format
- [ ] Document header has correct date
- [ ] AGENTS.md "Last Updated" matches (if modified)

---

## Repo Next Steps

- [ ] Update `research.md` workflow with explicit date retrieval instructions
- [ ] Update `create-plan.md` workflow with explicit date retrieval instructions
- [ ] Update `new-feature.md` workflow with explicit date retrieval instructions
- [ ] Update `review-progress.md` workflow with explicit date retrieval instructions
- [ ] Update `brainstorm.md` workflow with explicit date retrieval instructions
- [ ] Update `compare-prs.md` workflow with explicit date retrieval instructions
- [ ] Update `review-pr.md` workflow with explicit date retrieval instructions
- [ ] Verify `clarify-feature.md` date usage and update if needed
- [ ] Update `feature-agents-template.md` with date retrieval instructions
- [ ] Update `plan-document-template.md` with date retrieval instructions
- [ ] Update `research-packet-template.md` with date retrieval instructions
- [ ] Audit other templates for date fields and update as needed
- [ ] Test updated workflows to ensure dates are correctly retrieved
- [ ] Update `.devagent/core/AGENTS.md` "Last Updated" field when workflow updates are complete

---

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Workflow updates may break existing patterns | Risk | Workflow maintainer | Test each workflow update before committing | 2025-12-27 |
| Templates may need versioning if changes are breaking | Question | Workflow maintainer | Determine if template changes require migration guide | 2025-12-27 |
| Timezone considerations for date retrieval | Question | Workflow maintainer | Document timezone behavior of `date +%Y-%m-%d` command | 2025-12-27 |
| Should we add date format validation step? | Question | Workflow maintainer | Consider adding `date +%Y-%m-%d \| grep -E '^\d{4}-\d{2}-\d{2}$'` verification | 2025-12-27 |

---

## Related Workflows

- **devagent create-plan** — Will use updated date handling patterns
- **devagent research** — Will use updated date handling patterns
- **devagent new-feature** — Will use updated date handling patterns

---

## Notes

- This research validates the problem statement from the feature hub: AI assistants sometimes use incorrect dates when creating or updating documents.
- The solution pattern (always run `date +%Y-%m-%d` first) is sound and should be applied consistently across all workflows.
- Constitution C2 (Chronological Feature Artifacts) supports this change by requiring ISO-date prefixes, which this update will ensure are always correct.
