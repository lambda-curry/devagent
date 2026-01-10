---
name: Quality Gate Detection
description: >-
  Load TypeScript quality gate template for Ralph's autonomous execution.
  Use when: (1) Loading quality gate commands for test, lint, typecheck, and browser testing,
  (2) Generating quality gate configuration JSON for Ralph execution. This skill enables
  Ralph to run TypeScript project quality gates.
---

# Quality Gate Detection

Load TypeScript quality gate template for autonomous execution. Assumes TypeScript projects.

## Prerequisites

- Quality gate template available at `quality-gates/typescript.json` in this plugin
- Output directory for generated configuration

## Configuration Process

### Step 1: Load TypeScript Quality Gate Template

Read the TypeScript template from `quality-gates/typescript.json`:

**Template Structure:**
```json
{
  "name": "<template-name>",
  "description": "<description>",
  "commands": {
    "test": "<test-command>",
    "lint": "<lint-command>",
    "typecheck": "<typecheck-command>",
    "browser": "<browser-test-command>"
  },
  "browser_requirements": [
    "<requirement-1>",
    "<requirement-2>"
  ]
}
```

### Step 2: Generate Quality Gate Configuration

Create configuration JSON with structure:

```json
{
  "template": "typescript",
  "commands": {
    "test": "npm test",
    "lint": "npm run lint",
    "typecheck": "npm run typecheck",
    "browser": "npm run test:browser"
  },
  "browser_requirements": [
    "Playwriter Chrome extension"
  ],
  "source_template": "<absolute-path-to-typescript.json>"
}
```

### Step 3: Write Output

Write the quality gate configuration to:
- Path: `<output-dir>/quality-gates.json`
- Format: Pretty-printed JSON with 2-space indentation
- Encoding: UTF-8

## TypeScript Template

**Commands:**
- Test: `npm test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Browser: `npm run test:browser`

**Browser Requirements:**
- Playwriter Chrome extension (for browser testing)

## Edge Cases

**Missing Template:**
- If `typescript.json` template file not found, report error and stop
- If template is missing required fields, use empty values with warning

**Custom Commands:**
- User can manually override commands by editing generated configuration

## Validation

Before writing output, validate:
1. Template file exists and is valid JSON
2. Template contains required fields (name, commands)
3. Commands are non-empty strings (unless optional)
4. Configuration JSON structure is valid

## Reference Documentation

- **Quality Gate Template**: See `quality-gates/typescript.json` in this plugin
- **Config Template**: See `tools/config.json` for full configuration structure
