# Generate Revise Report

## Mission
Generate a comprehensive revise report for Ralph autonomous execution sessions, capturing issues, improvements, and optimization opportunities.

## Inputs
- Required: Session context description
- Optional: Session ID (auto-generated if not provided)
- Optional: Output directory (default: `.devagent/workspace/reviews/`)

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for date handling, metadata retrieval, context gathering order, and storage patterns.

## Resource Strategy
- Skill instructions: `.devagent/plugins/ralph/skills/revise-report-generation/SKILL.md` (detailed generation process)
- Storage location: `.devagent/workspace/reviews/` (reports directory)
- Session tracking: Beads database for execution history

## Workflow Steps

### Step 1: Initialize Report Context

**Objective:** Set up basic report metadata and context.

**Instructions:**
1. Get current date using `date +%Y-%m-%d` for report filename
2. Generate unique session ID if not provided (format: `ralph-YYYY-MM-DD-<4-chars>`)
3. Validate input context description
4. Create report filename: `YYYY-MM-DD_revise-report-session-<id>.md`

### Step 2: Gather Execution Data

**Objective:** Collect data from the Ralph execution session.

**Instructions:**
1. Query Beads database for session execution data:
   - Tasks completed vs. attempted
   - Quality gate failures and reasons
   - Task status changes and timestamps
   - Comments and progress notes
2. Review execution logs for:
   - Error messages and stack traces
   - Manual intervention points
   - Performance bottlenecks
   - Unexpected behaviors
3. Analyze system state:
   - Resource usage patterns
   - File system operations
   - External service integrations

### Step 3: Classify Issues

**Objective:** Categorize identified issues using the standard taxonomy.

**Categories:**
- **Ralph Systems:** Core execution engine issues
- **Workflows & Process:** Instruction flow problems
- **Code Rules & Documentation:** Reference material issues
- **Skills & Prompts:** Individual skill execution problems
- **Infrastructure & Tooling:** Environment and tooling issues

**Instructions:**
1. Review collected data and identify potential issues
2. Classify each issue into appropriate category
3. Assess severity and impact
4. Document symptoms and workarounds
5. Note frequency and reproducibility

### Step 4: Generate Action Items

**Objective:** Create actionable recommendations for each issue.

**Instructions:**
1. For each issue, create specific action items:
   - Clear description of what needs to be done
   - Assignment to appropriate owner/team
   - Priority level and estimated effort
   - Dependencies and due dates
2. Group related action items
3. Identify quick wins vs. systemic improvements
4. Link action items to specific issues

### Step 5: Populate Report Template

**Objective:** Fill the report template with collected data.

**Instructions:**
1. Follow the standard markdown report structure from the skill documentation
2. Populate all sections:
   - Report metadata (session info, date, context)
   - Executive summary with key metrics
   - Issues organized by category
   - Action items with priorities and assignments
   - System improvement recommendations
3. Create supporting JSON files for action items and metrics (optional)

### Step 6: Write Output File

**Objective:** Generate and store the complete revise report.

**Instructions:**
1. Write markdown report to `.devagent/workspace/reviews/YYYY-MM-DD_revise-report-session-<id>.md`
2. Update reviews index in `.devagent/workspace/reviews/README.md`

## Report Structure

### Markdown Report Format

```markdown
# Revise Report - Session <session-id>

**Date:** YYYY-MM-DD
**Session Context:** <brief description>
**Execution Duration:** <duration>
**Report Type:** End-of-Session Review

## Executive Summary
<2-3 sentence overview with key metrics>

## Key Metrics
- Total Issues: <count>
- Critical Issues: <count>
- Automation Success Rate: <percentage>
- Manual Interventions: <count>

## Issues Identified

### Ralph Systems [<count>]
[Issues in detail format]

### Workflows & Process [<count>]
[Issues in detail format]

### Code Rules & Documentation [<count>]
[Issues in detail format]

### Skills & Prompts [<count>]
[Issues in detail format]

### Infrastructure & Tooling [<count>]
[Issues in detail format]

## Action Items
[Numbered list of action items with priorities]

## System Improvements
[Broader recommendations for enhancements]

## Follow-up Required
- [ ] Code changes needed (<count> items)
- [ ] Documentation updates required (<count> items)
- [ ] Configuration adjustments (<count> items)
```

### Issue Detail Format

```markdown
- **Issue:** <brief title>
- **Description:** <detailed description>
- **Symptoms:** <observable effects or error messages>
- **Impact:** <how it affected execution>
- **Severity:** [Critical|High|Medium|Low]
- **Frequency:** [Once|Occasional|Frequent|Constant]
- **Recommendation:** <proposed fix>
- **Workaround:** <workaround used, if applicable>
```

## Error Handling

- **Missing execution data:** If Beads database is unavailable or has no data for the session, create report based on available context and note data limitations
- **Classification conflicts:** If issues don't fit neatly into categories, note cross-cutting concerns and create sub-categories as needed
- **Action item overload:** If too many action items are generated, prioritize and group them into logical phases

## Output

- **Primary Report:** Markdown file in `.devagent/workspace/reviews/`
- **Updated Index:** Reviews README with new report entry
- **Integration Points:** Links to related DevAgent workflows for follow-up

## Integration with DevAgent Workflows

This revise report workflow integrates with:
- `devagent update-constitution` for governance updates
- `devagent build-workflow` for workflow improvements
- `devagent update-tech-stack` for infrastructure changes
- `devagent research` for deeper investigation of systemic issues