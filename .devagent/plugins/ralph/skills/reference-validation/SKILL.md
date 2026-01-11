---
name: Reference Validation (Import/Export Checking)
description: >-
  Validate import/export references after file moves, renames, or creation to prevent
  broken module references. Use when: (1) After moving or renaming files, (2) After
  creating new modules, (3) Before completing tasks that modify file structure, (4) During
  quality gate validation to catch broken references. This skill prevents "Low Severity"
  implementation bugs from becoming "Medium Severity" blockers that break builds.
---

# Reference Validation (Import/Export Checking)

Validate import/export references to prevent broken module links after file operations.

## Purpose

Prevents build failures by detecting:
- Broken import statements after file moves/renames
- Missing exports in package entry points (index.ts, public-api.ts)
- Stale references to old file paths
- Orphaned modules not exported from package

## Prerequisites

- Access to grep/find commands
- Access to file system for package inspection
- Knowledge of modified file paths

## Validation Process

### Step 1: Identify Files That Changed

**Track file operations:**
```bash
# After move/rename, identify old and new paths
OLD_PATH="src/utils/string-formatter.ts"
NEW_PATH="src/formatters/string-formatter.ts"

# After creation, identify new file
NEW_FILE="src/helpers/validation.ts"
```

**Document changes:**
```json
{
  "operation": "move | rename | create",
  "old_path": "<old-path>",
  "new_path": "<new-path>",
  "timestamp": "<ISO-8601>"
}
```

### Step 2: Search for References to Old Paths

**Find all references:**
```bash
# Search for imports of the old path
grep -r "from.*string-formatter" --include="*.ts" --include="*.tsx" --include="*.js" .

# Search for require statements
grep -r "require.*string-formatter" --include="*.ts" --include="*.js" .

# Search for dynamic imports
grep -r "import(.*string-formatter" --include="*.ts" --include="*.js" .
```

**Check specific patterns:**
- Relative imports: `from './string-formatter'`, `from '../utils/string-formatter'`
- Absolute imports: `from '@/utils/string-formatter'`, `from 'utils/string-formatter'`
- Re-exports: `export { ... } from './string-formatter'`

**Document findings:**
```
References found:
- src/components/Form.tsx:15 - import { format } from './string-formatter'
- src/utils/index.ts:3 - export * from './string-formatter'
- tests/utils.test.ts:8 - import { format } from '../utils/string-formatter'
```

### Step 3: Check Package Entry Points

**Identify entry point files:**
```bash
# Common entry point patterns
find . -name "index.ts" -o -name "index.js" -o -name "public-api.ts" -o -name "main.ts"

# Check package.json for main/exports
grep -A 5 "\"main\":\|\"exports\":" package.json
```

**For each entry point, verify exports:**
```bash
# Check if file is exported
grep "string-formatter" src/utils/index.ts

# Check for wildcard exports
grep "export \* from" src/utils/index.ts
```

**Validation checklist:**
- ✓ New file is exported from package entry point
- ✓ Old file reference removed from entry point (if moved/renamed)
- ✓ Export path is correct (relative path matches file location)
- ✓ No duplicate exports

### Step 4: Validate Import Statements

**Check import statements in modified file:**
```bash
# If file was moved, check its own imports
grep "^import\|^export.*from" "$NEW_PATH"
```

**Verify relative imports still valid:**
- If file moved to different directory, relative imports need updating
- Check parent directory references (`../`)
- Validate sibling file references (`./`)

**Example validation:**
```
Before move: src/utils/string-formatter.ts imports from './helpers'
After move: src/formatters/string-formatter.ts needs '../utils/helpers'
```

### Step 5: Run Automated Checks

**Use TypeScript compiler:**
```bash
# TypeScript will catch most reference errors
npm run typecheck
# OR
tsc --noEmit

# Look for errors like:
# error TS2307: Cannot find module './string-formatter'
```

**Use linter:**
```bash
# ESLint can catch some import issues
npm run lint

# Look for:
# error: Unable to resolve path to module './string-formatter'
```

### Step 6: Generate Validation Report

**Create report structure:**
```json
{
  "validation_timestamp": "2026-01-10T16:30:00Z",
  "file_operation": {
    "type": "move",
    "old_path": "src/utils/string-formatter.ts",
    "new_path": "src/formatters/string-formatter.ts"
  },
  "references_found": [
    {
      "file": "src/utils/index.ts",
      "line": 3,
      "content": "export * from './string-formatter'",
      "status": "broken",
      "fix_needed": "Update to '../formatters/string-formatter'"
    }
  ],
  "entry_points_checked": [
    {
      "file": "src/utils/index.ts",
      "exports_new_path": false,
      "exports_old_path": true,
      "needs_update": true
    }
  ],
  "validation_status": "failed",
  "issues_found": 1,
  "recommended_fixes": [
    "Update src/utils/index.ts line 3 to export from new path",
    "Run typecheck after fixes: npm run typecheck"
  ]
}
```

**Save report:**
- Location: `<output-dir>/reference-validation.json`
- Format: Pretty-printed JSON
- Include all broken references

## Common Scenarios

### Scenario 1: File Moved to Different Directory
```
Operation: Move src/utils/formatter.ts → src/formatters/formatter.ts

Steps:
1. Search for imports of './utils/formatter' or '../utils/formatter'
2. Update all references to new path
3. Check src/utils/index.ts for exports
4. Remove old export, add new export if needed
5. Run typecheck to verify
```

### Scenario 2: File Renamed
```
Operation: Rename src/utils/formatter.ts → src/utils/string-formatter.ts

Steps:
1. Search for imports of './formatter' or 'formatter'
2. Update all references to 'string-formatter'
3. Check src/utils/index.ts
4. Update export statement
5. Run typecheck to verify
```

### Scenario 3: New File Created
```
Operation: Create src/helpers/validation.ts

Steps:
1. No old references to check
2. Add export to src/helpers/index.ts (if exists)
3. Verify file can be imported from expected locations
4. Run typecheck to verify
```

### Scenario 4: Package Entry Point Update
```
Operation: Add new module to public API

Steps:
1. Identify package entry point (index.ts, public-api.ts)
2. Add export statement: export * from './new-module'
3. Check for naming conflicts
4. Run typecheck to verify
5. Check if module should be in public API or internal
```

## Integration with Quality Gates

**Add to pre-quality-gate checks:**
```bash
# Before running quality gates
./tools/reference-validator.sh <old-path> <new-path> ./validation-output

# Check validation report
if [ "$(jq '.validation_status' validation-output/reference-validation.json)" != "\"passed\"" ]; then
  echo "Reference validation failed - fix broken imports"
  exit 1
fi

# Continue with quality gates
npm run typecheck
npm run lint
npm test
```

## Automated Fix Suggestions

**For broken imports:**
1. Calculate correct relative path from referencer to new file location
2. Generate sed command to update import
3. Validate fix doesn't break other imports

**For missing exports:**
1. Identify package entry point
2. Generate export statement with correct path
3. Insert at appropriate location (maintain alphabetical order)

**Example fix script:**
```bash
# Update reference in src/components/Form.tsx
sed -i "s|from './string-formatter'|from '../formatters/string-formatter'|g" src/components/Form.tsx

# Update entry point export
sed -i "s|export \* from './string-formatter'|export * from '../formatters/string-formatter'|g" src/utils/index.ts
```

## Error Prevention

**Issues Prevented:**
- ✅ "Cannot find module" TypeScript errors
- ✅ Build failures from broken imports
- ✅ Missing exports in package entry points
- ✅ Runtime errors from undefined imports
- ✅ Stale import paths in test files

**Quality Gate Failures Prevented:**
- ✅ TypeScript compilation errors (TS2307)
- ✅ ESLint import resolution errors
- ✅ Test failures from missing modules
- ✅ Build process failures

## Output

**Validation Report Format:**
```json
{
  "validation_timestamp": "<ISO-8601>",
  "file_operation": {
    "type": "move | rename | create",
    "old_path": "<path>",
    "new_path": "<path>"
  },
  "references_found": [
    {
      "file": "<path>",
      "line": <number>,
      "content": "<import-statement>",
      "status": "ok | broken",
      "fix_needed": "<suggestion>" | null
    }
  ],
  "entry_points_checked": [
    {
      "file": "<path>",
      "exports_new_path": true | false,
      "exports_old_path": true | false,
      "needs_update": true | false
    }
  ],
  "validation_status": "passed | failed",
  "issues_found": <number>,
  "recommended_fixes": ["<fix-1>", "<fix-2>"]
}
```

## Reference Documentation

- **Issue Example**: Issue snippet 004 from ralph-2026-01-10-AF44 session
- **TypeScript Errors**: TS2307 (Cannot find module)
- **Entry Points**: index.ts, public-api.ts, main.ts patterns
