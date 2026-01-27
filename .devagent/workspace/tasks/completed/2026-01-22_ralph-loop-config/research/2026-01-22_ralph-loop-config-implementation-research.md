# Research Packet — Ralph Loop Config Implementation Details

- Mode: Task
- Requested By: Jake Ruesink
- Last Updated: 2026-01-22
- Related Plan: (not yet created)
- Storage Path: `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/research/2026-01-22_ralph-loop-config-implementation-research.md`
- Stakeholders: Jake Ruesink (Owner)

## Request Overview

**Problem Statement:** Research implementation details for config-driven Ralph loop setup system, including JSON schema patterns for task definitions, Beads task creation script requirements, and template composition approaches. This research supports the brainstorm ideas for building Beads tasks programmatically from structured data.

**Desired Outcomes:**
- JSON schema design patterns for system-agnostic task definitions
- Understanding of Beads CLI capabilities for programmatic task creation
- Template composition and inheritance patterns
- Script design requirements for creating Beads tasks from JSON (labels, dependencies, metadata)

**Constraints:**
- Must be system-agnostic (don't align too closely with Beads structure)
- Must support JSON schema validation
- Must enable reusable templates with setupTasks/teardownTasks
- Can adapt workflows to match new config (no backward compatibility needed)

## Context Snapshot

- **Task summary:** Create config-driven approach for Ralph loop setup enabling programmatic Beads task creation from structured data
- **Task reference:** `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/`
- **Related brainstorm:** `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md`
- **Existing decisions:**
  - Keep schema simple and system-agnostic (from brainstorm refinement)
  - Templates are separate files that can be copied and overridden
  - Setup/teardown tasks defined in templates
  - Metadata support depends on completing metadata extension task (`.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/`)

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What JSON schema validation patterns work well for TypeScript/Bun? | Answered | Ajv with JSONSchemaType provides type-safe validation |
| RQ2 | What are Beads CLI capabilities for creating tasks programmatically? | Answered | `bd create` supports all required fields; dependencies added separately |
| RQ3 | How should template composition work (extends/inheritance)? | Answered | JSON merge patterns with selective override support |
| RQ4 | What script structure is needed to create Beads tasks from JSON? | Answered | Read JSON → validate → map to CLI commands → execute sequentially |
| RQ5 | What metadata fields can be set during Beads task creation? | Answered | title, description, design, notes, acceptance, priority, labels, parent, id |
| RQ6 | How are dependencies handled in Beads task creation? | Answered | Added after creation via `bd dep add`; not supported in `bd create` |

## Key Findings

1. **JSON Schema Validation:** Ajv with `JSONSchemaType` provides type-safe validation in TypeScript. Schemas can be defined as TypeScript types and compiled into validation functions that act as type guards.

2. **Beads CLI Task Creation:** `bd create` supports all required fields (title, description, design, notes, acceptance, priority, labels, id, parent) but dependencies must be added separately via `bd dep add` after creation.

3. **Template Composition:** JSON merge patterns with selective override work well. The `extends` pattern can be implemented by loading base template, applying overrides, and merging arrays selectively.

4. **Script Structure:** Read template/JSON → validate against schema → map task definitions to Beads CLI commands → execute sequentially with proper error handling. Use `--body-file` for multiline content.

5. **Metadata Support:** Current Beads CLI supports all needed fields. Metadata extension task will add custom execution metadata table, but task creation fields are already sufficient.

6. **System-Agnostic Schema:** Keep schema focused on task structure (title, objective, labels, dependencies) without Beads-specific fields. Map to Beads CLI commands during script execution.

## Detailed Findings

### RQ1: JSON Schema Validation Patterns

**Answer:** Ajv (JSON Schema validator) with `JSONSchemaType` provides type-safe validation in TypeScript/Bun. Schemas can be defined as TypeScript interfaces and compiled into validation functions.

**Supporting Evidence:**
- Ajv library (`/ajv-validator/ajv`) - High reputation, 180 code snippets, supports JSON Schema drafts
- TypeScript integration via `JSONSchemaType` utility type ensures schema matches TypeScript interface
- Validation functions act as type guards, narrowing types after successful validation
- Error handling via `DefinedError[]` type for structured error messages

**Example Pattern:**
```typescript
import Ajv, {JSONSchemaType} from "ajv"
const ajv = new Ajv()

interface TaskDefinition {
  id: string
  title: string
  objective: string
  labels?: string[]
  dependencies?: string[]
  metadata?: Record<string, unknown>
}

const schema: JSONSchemaType<TaskDefinition> = {
  type: "object",
  properties: {
    id: {type: "string"},
    title: {type: "string"},
    objective: {type: "string"},
    labels: {type: "array", items: {type: "string"}, nullable: true},
    dependencies: {type: "array", items: {type: "string"}, nullable: true},
    metadata: {type: "object", nullable: true}
  },
  required: ["id", "title", "objective"],
  additionalProperties: false
}

const validate = ajv.compile(schema)
```

**Freshness:** Ajv v8.17.1 (current), documentation from official GitHub repo

**Tradeoff:** 
- **Pros:** Type-safe, well-maintained, extensive documentation
- **Cons:** Adds dependency (but lightweight and widely used)

### RQ2: Beads CLI Task Creation Capabilities

**Answer:** `bd create` supports all required fields for task creation. Dependencies must be added separately after creation. Multiline content requires `--body-file` flag.

**Supporting Evidence:**
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (2026-01-22) - Documents full `bd create` command structure
- `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` (2026-01-22) - Comprehensive Beads CLI reference

**Supported Fields in `bd create`:**
- `--id <task-id>` - Hierarchical IDs supported (e.g., `project-abc.1`)
- `--title "<title>"` - Task title
- `--body-file <file>` - Description (multiline-safe, required for newlines)
- `--design "<notes>"` - Design notes
- `--notes "<notes>"` - Implementation notes
- `--acceptance "<criteria>"` - Acceptance criteria (semicolon-separated)
- `--priority P0|P1|P2|P3` - Priority level
- `--labels <label>` - Routing labels (can specify multiple)
- `--parent <parent-id>` - Parent task (or inferred from hierarchical ID)
- `--force` - Required when using explicit IDs matching database prefix
- `--json` - Output JSON format

**Important Constraints:**
- `bd create` does NOT support `--status` flag (tasks default to "open")
- Dependencies cannot be set during creation; must use `bd dep add <task-id> <depends-on-id>` after
- Hierarchical IDs automatically set parent relationship (don't use `--parent` with hierarchical IDs)
- Use `--body-file` for any multiline content to avoid parsing errors

**Freshness:** Based on current workflow documentation and skill references (2026-01-22)

### RQ3: Template Composition Patterns

**Answer:** JSON merge patterns with selective override work well. The `extends` pattern can be implemented by loading base template, applying overrides recursively, and merging arrays selectively.

**Supporting Evidence:**
- Common JSON composition patterns (industry standard)
- Existing config.json structure shows nested object patterns
- Template copying approach from brainstorm (Idea 2) supports this pattern

**Implementation Pattern:**
```typescript
// Load base template
const baseTemplate = JSON.parse(fs.readFileSync('templates/generic-ralph-loop.json'))

// Load override/extended config
const override = JSON.parse(fs.readFileSync('loop-config.json'))

// Deep merge with array replacement
function mergeTemplate(base: any, override: any): any {
  if (Array.isArray(override)) return override // Arrays replace, don't merge
  if (typeof override !== 'object' || override === null) return override
  if (typeof base !== 'object' || base === null) return override
  
  const merged = {...base}
  for (const key in override) {
    merged[key] = mergeTemplate(base[key], override[key])
  }
  return merged
}

const finalConfig = mergeTemplate(baseTemplate, override)
```

**Template Structure:**
```json
{
  "extends": "templates/generic-ralph-loop.json",
  "loop": {
    "setupTasks": [...],
    "teardownTasks": [...]
  },
  "availableAgents": ["engineering", "qa", "design"],
  "tasks": [...] // Main tasks from plan
}
```

**Freshness:** Based on common JSON composition patterns and existing codebase structure

**Tradeoff:**
- **Pros:** Simple, declarative, supports inheritance and composition
- **Cons:** Need to handle edge cases (null values, array merging strategy)

### RQ4: Script Structure for Beads Task Creation

**Answer:** Script should follow pipeline: read config/template → validate schema → map task definitions to CLI commands → execute sequentially with error handling. Use temp files for multiline content.

**Supporting Evidence:**
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (2026-01-22) - Shows current manual workflow pattern
- `.devagent/plugins/ralph/tools/import-beads.cjs` - Example script that creates Beads tasks from JSON

**Script Pipeline:**
1. **Load and merge config:** Read template, apply extends/overrides, merge with plan tasks
2. **Validate:** Check against JSON schema using Ajv
3. **Generate task list:** Combine setupTasks + main tasks + teardownTasks in order
4. **Create tasks sequentially:**
   - Write multiline content to temp files
   - Execute `bd create` with all fields
   - Set parent explicitly (even with hierarchical IDs for reliability)
   - Add dependencies via `bd dep add` after all tasks created
5. **Error handling:** Validate each step, provide clear error messages

**Example Script Structure:**
```typescript
// 1. Load and merge
const template = loadTemplate(config.extends)
const merged = mergeTemplate(template, config)

// 2. Validate
const validate = ajv.compile(taskSchema)
if (!validate(merged)) {
  throw new Error(`Validation failed: ${validate.errors}`)
}

// 3. Generate task list
const allTasks = [
  ...merged.loop.setupTasks,
  ...merged.tasks, // from plan
  ...merged.loop.teardownTasks
]

// 4. Create tasks
for (const task of allTasks) {
  // Write description to temp file
  const descFile = writeTempFile(task.objective)
  
  // Create task
  execSync(`bd create --id ${task.id} --title "${task.title}" --body-file ${descFile} --labels ${task.labels.join(',')} --priority P2 --force --json`)
  
  // Set parent
  execSync(`bd update ${task.id} --parent ${epicId} --json`)
  
  // Cleanup
  fs.unlinkSync(descFile)
}

// 5. Add dependencies
for (const task of allTasks) {
  for (const dep of task.dependencies || []) {
    execSync(`bd dep add ${task.id} ${dep}`)
  }
}
```

**Freshness:** Based on current workflow patterns (2026-01-22)

### RQ5: Metadata Fields in Beads Task Creation

**Answer:** All required metadata fields are supported via `bd create` and `bd update`. Custom execution metadata (from metadata extension task) is separate and stored in custom table.

**Supporting Evidence:**
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (2026-01-22) - Documents all `bd create` fields
- `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md` (2026-01-17) - Documents custom metadata table approach

**Task Creation Fields (via `bd create`):**
- `title` - Task title
- `description` (via `--body-file`) - Full task description
- `design` - Design notes/decisions
- `notes` - Implementation notes
- `acceptance` - Acceptance criteria
- `priority` - P0/P1/P2/P3
- `labels` - Routing labels for agent selection
- `id` - Task identifier
- `parent` - Parent task (or inferred from hierarchical ID)

**Custom Execution Metadata (separate table):**
- Stored in `ralph_execution_metadata` table (from metadata extension task)
- Fields: `failure_count`, `last_failure_at`, `last_success_at`, `execution_count`
- Accessed via direct SQLite queries, not CLI
- Foreign key to `issues.id` for referential integrity

**Freshness:** Based on current workflow docs (2026-01-22) and metadata extension research (2026-01-17)

**Implication:** Schema should focus on task definition fields (title, objective, labels, dependencies). Custom execution metadata is separate concern handled by metadata extension task.

### RQ6: Dependency Handling in Beads

**Answer:** Dependencies are added after task creation via `bd dep add <task-id> <depends-on-id>`. The `bd create` command does not support dependencies, and `bd update` cannot add dependencies.

**Supporting Evidence:**
- `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` (2026-01-22) - Explicitly documents: "Dependencies are added as edges. You can add them after creation via `bd dep add <task-id> <depends-on-id>`. (`bd update` cannot add deps.)"
- `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` (2026-01-22) - Confirms dependency pattern

**Dependency Pattern:**
1. Create all tasks first (without dependencies)
2. After all tasks exist, add dependencies via `bd dep add`
3. Dependencies default to "blocking" relationship
4. Can add multiple dependencies per task

**Example:**
```bash
# Create tasks first
bd create --id epic.1 --title "Task 1" --force --json
bd create --id epic.2 --title "Task 2" --force --json

# Add dependencies after creation
bd dep add epic.2 epic.1  # Task 2 depends on Task 1
```

**Freshness:** Based on current workflow documentation (2026-01-22)

**Implication:** Script must create all tasks first, then add dependencies in a second pass. This ensures all task IDs exist before linking.

## Comparative / Alternatives Analysis

### JSON Schema Validation Libraries

| Library | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| **Ajv** | Type-safe with TypeScript, well-maintained, extensive docs, high performance | Adds dependency | **Recommended** - Best fit for TypeScript/Bun |
| **Zod** | Runtime validation with TypeScript inference | Different schema format (not JSON Schema) | Consider if team prefers Zod patterns |
| **Manual validation** | No dependencies | Error-prone, no type safety | Not recommended |

### Template Composition Approaches

| Approach | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| **JSON merge with extends** | Simple, declarative, supports inheritance | Need to handle edge cases | **Recommended** - Matches brainstorm ideas |
| **JavaScript/TypeScript functions** | Maximum flexibility | More complex, harder to version | Not needed (static JSON sufficient per brainstorm) |
| **YAML with anchors** | Native YAML feature | Requires YAML parser, less common | Not recommended (JSON is standard) |

## Implications for Implementation

### Schema Design

1. **Keep schema system-agnostic:** Focus on task structure (id, title, objective, labels, dependencies) without Beads-specific fields
2. **Use Ajv with JSONSchemaType:** Provides type safety and validation
3. **Schema location:** Separate file (e.g., `task-schema.json`) or embedded in docs
4. **Metadata support:** Include optional `metadata` field in schema, but implementation depends on metadata extension task completion

### Template System

1. **Template structure:** Separate JSON files in `.devagent/plugins/ralph/templates/`
2. **Composition:** Implement `extends` pattern via JSON merge with selective override
3. **Template copying:** AI/workflow copies template and applies overrides during setup
4. **Setup/teardown tasks:** Defined in templates, combined with plan tasks during setup

### Script Design

1. **Pipeline:** Load template → merge config → validate → generate task list → create Beads tasks → add dependencies
2. **Error handling:** Validate at each step, provide clear error messages
3. **Multiline content:** Use temp files with `--body-file` flag
4. **Dependencies:** Two-pass approach (create all tasks, then add dependencies)
5. **Parent linkage:** Always set parent explicitly even with hierarchical IDs for reliability

### Beads CLI Integration

1. **Task creation:** Use `bd create` with all supported fields
2. **Dependencies:** Add via `bd dep add` after all tasks created
3. **Labels:** Support multiple labels, but Ralph routing uses first matching label
4. **Hierarchical IDs:** Leverage automatic parent inference, but set parent explicitly for reliability

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Metadata extension task dependency | Risk | Jake Ruesink | Complete metadata extension task before implementing metadata support in schema | Before schema implementation |
| JSON merge edge cases | Risk | Implementation team | Test merge behavior with null values, nested objects, array merging strategy | During implementation |
| Beads CLI changes | Risk | Implementation team | Pin Beads version or test against latest, document CLI version requirements | Before script implementation |
| Template versioning | Question | Jake Ruesink | Decide if templates need versioning or can evolve forward-only (per C5) | Before template creation |
| Schema evolution | Question | Jake Ruesink | Determine if schema needs versioning or can evolve (per C5) | Before schema finalization |

## Recommended Follow-ups

1. **Complete metadata extension task** — Finish `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/` before implementing metadata support in schema

2. **Create implementation plan** — Run `devagent create-plan` to develop detailed implementation plan based on research findings and brainstorm ideas

3. **Prototype template merge** — Create small prototype to validate JSON merge behavior with edge cases (null values, nested objects, arrays)

4. **Test Beads CLI version** — Verify current Beads CLI version and document requirements for script

## Sources

| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| Ajv documentation (`/ajv-validator/ajv`) | External library docs | v8.17.1 (2026-01-22) | Official GitHub repo, Context7 query |
| `.devagent/plugins/ralph/workflows/setup-ralph-loop.md` | Internal workflow | 2026-01-22 | Current workflow documentation |
| `.devagent/plugins/ralph/skills/beads-integration/SKILL.md` | Internal skill docs | 2026-01-22 | Comprehensive Beads CLI reference |
| `.devagent/plugins/ralph/templates/beads-schema.json` | Internal schema | 2026-01-22 | Existing schema reference |
| `.devagent/workspace/tasks/active/2026-01-17_extend-task-metadata-for-error-tracking/research/2026-01-17_task-metadata-extension-research.md` | Internal research | 2026-01-17 | Metadata extension patterns |
| `.devagent/workspace/tasks/completed/2026-01-22_ralph-loop-config/brainstorms/2026-01-22_ralph-loop-config-brainstorm.md` | Internal brainstorm | 2026-01-22 | Refined ideas and constraints |
