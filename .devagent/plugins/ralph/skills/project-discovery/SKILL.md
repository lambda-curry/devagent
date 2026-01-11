---
name: Project Structure Discovery
description: >-
  Analyze project structure to understand testing conventions, dependency management,
  and file organization patterns before implementation. Use when: (1) Starting autonomous
  execution on a new repository, (2) Before creating test files to determine correct
  placement, (3) Before adding dependencies to verify package structure, (4) To understand
  monorepo vs single-package layouts. This skill prevents "Quality Gate" failures caused
  by files placed in directories with incompatible configurations.
---

# Project Structure Discovery

Analyze project structure to understand testing patterns, dependency management, and file organization before implementation starts.

## Purpose

Prevents implementation errors by discovering:
- Where tests are located (monorepo root vs individual packages)
- Which packages have testing dependencies installed
- Project build/test configuration patterns
- TypeScript configuration structure
- Monorepo vs single-package layout

## Prerequisites

- Access to project root directory
- Read access to package.json files
- Access to find/grep commands

## Discovery Process

### Step 1: Detect Project Type

**Check for Monorepo Structure:**
```bash
# Look for workspace configuration
find . -maxdepth 2 -name "package.json" -exec grep -l "workspaces" {} \;

# Check for common monorepo patterns
ls -d packages/* apps/* 2>/dev/null
```

**Indicators:**
- Multiple `package.json` files in subdirectories
- Root `package.json` has `workspaces` field
- Directories like `packages/`, `apps/`, `libs/`

### Step 2: Discover Test Locations

**Find existing test files:**
```bash
# Search for test files by common patterns
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*-test.*" \) | head -20

# Check for test directories
find . -type d -name "__tests__" -o -name "tests" -o -name "test" | head -20
```

**Analyze patterns:**
- **Co-located tests:** Tests next to source files (e.g., `src/utils.ts`, `src/utils.test.ts`)
- **Separate test directory:** Tests in dedicated directory (e.g., `tests/`, `__tests__/`)
- **Root-level tests:** All tests in monorepo root regardless of package
- **Package-level tests:** Each package has its own tests

**Document findings:**
```
Test Pattern: [co-located | separate-directory | root-level | package-level]
Test Directory: [path to main test location]
Test File Naming: [*.test.ts | *.spec.ts | *-test.ts | other]
```

### Step 3: Analyze Testing Dependencies

**Check package.json for test frameworks:**
```bash
# Find test-related dependencies
find . -name "package.json" -exec grep -H "vitest\|jest\|mocha\|jasmine" {} \;

# Check test scripts
find . -name "package.json" -exec grep -H "\"test\":" {} \;
```

**For each package, identify:**
- Testing framework (vitest, jest, mocha, etc.)
- Test runner script (npm test, npm run test:unit, etc.)
- Coverage tools
- TypeScript testing dependencies (@types/*)

**Document package test capabilities:**
```json
{
  "packages/utils": {
    "has_testing_deps": false,
    "test_script": null,
    "framework": null
  },
  "apps/Reportory": {
    "has_testing_deps": true,
    "test_script": "npm test",
    "framework": "vitest"
  },
  "root": {
    "has_testing_deps": true,
    "test_script": "npm test",
    "framework": "vitest"
  }
}
```

### Step 4: Inspect TypeScript Configuration

**Find tsconfig files:**
```bash
find . -name "tsconfig.json" -o -name "tsconfig.*.json" | head -20
```

**Check for:**
- Root tsconfig vs package-level configs
- Path mappings and module resolution
- Include/exclude patterns
- References (project references)

**Identify potential issues:**
- Package without tsconfig cannot run typecheck
- Mismatched paths between packages
- Exclude patterns that might hide files

### Step 5: Check Build Configuration

**Identify build tools:**
```bash
# Check for build configurations
ls vite.config.* webpack.config.* rollup.config.* tsup.config.* 2>/dev/null

# Check build scripts
grep -r "\"build\":" --include="package.json" . | head -10
```

**Document build setup:**
- Build tool used (vite, webpack, tsc, etc.)
- Build location (package vs root)
- Output directories

### Step 6: Generate Discovery Report

**Create structured report:**
```json
{
  "discovery_timestamp": "2026-01-10T15:30:00Z",
  "project_type": "monorepo",
  "test_strategy": {
    "pattern": "root-level",
    "primary_location": "apps/Reportory",
    "test_deps_location": "root",
    "framework": "vitest",
    "naming_convention": "*.test.ts"
  },
  "packages": {
    "packages/utils": {
      "has_tests": false,
      "has_test_deps": false,
      "has_tsconfig": true,
      "build_script": "npm run build"
    },
    "apps/Reportory": {
      "has_tests": true,
      "has_test_deps": false,
      "has_tsconfig": true,
      "build_script": null
    }
  },
  "recommendations": {
    "test_placement": "Place new tests in apps/Reportory directory",
    "test_command": "npm test (from root)",
    "avoid": "Do not place tests in packages/* directories"
  }
}
```

**Save report:**
- Location: `<output-dir>/project-discovery.json`
- Format: Pretty-printed JSON
- Include recommendations section

## Usage in Autonomous Execution

**Integration Points:**

1. **Before Task Execution:**
   - Run discovery if not already done
   - Cache results for session
   - Reference during file placement decisions

2. **Before Creating Test Files:**
   - Check discovery report for test location
   - Verify test dependencies available
   - Use correct naming convention

3. **Before Adding Dependencies:**
   - Identify correct package.json to modify
   - Check if dependency should be in devDependencies
   - Verify package has build capability if needed

4. **Before Moving Files:**
   - Understand package boundaries
   - Check TypeScript configuration compatibility
   - Verify import paths will resolve

## Common Patterns & Recommendations

### Pattern: Monorepo with Root-Level Tests
**Example:** Reportory project
```
Discovery Result:
- Tests live in apps/Reportory/
- Testing deps in root package.json
- Individual packages don't have test capability

Recommendation:
- Create tests in apps/Reportory/src/**/*.test.ts
- Run tests from root: npm test
- Don't add test files to packages/*
```

### Pattern: Monorepo with Package-Level Tests
```
Discovery Result:
- Each package has own tests
- Each package has testing deps
- Tests co-located with source

Recommendation:
- Create tests in same package as source
- Run tests per-package: npm test (from package dir)
- Each package needs testing dependencies
```

### Pattern: Single Package
```
Discovery Result:
- One package.json at root
- Tests co-located with source
- All deps in root package.json

Recommendation:
- Create tests next to source files
- Use consistent naming convention
- Run tests from root
```

## Error Prevention

**Quality Gate Failures Prevented:**
- ✅ Test files in wrong directory (no vitest dependency)
- ✅ Import errors (wrong tsconfig scope)
- ✅ TypeScript errors (file not included in tsconfig)
- ✅ Missing dependencies (package doesn't have test framework)

**Manual Intervention Prevented:**
- ✅ Moving test files after creation
- ✅ Installing missing dependencies mid-task
- ✅ Fixing import paths
- ✅ Debugging "module not found" errors

## Output

**Discovery Report Format:**
```json
{
  "discovery_timestamp": "<ISO-8601>",
  "project_type": "monorepo | single-package",
  "test_strategy": {
    "pattern": "root-level | package-level | co-located | separate-directory",
    "primary_location": "<path>",
    "test_deps_location": "root | per-package",
    "framework": "vitest | jest | mocha | etc",
    "naming_convention": "<pattern>"
  },
  "packages": {
    "<package-name>": {
      "has_tests": true | false,
      "has_test_deps": true | false,
      "has_tsconfig": true | false,
      "build_script": "<script>" | null
    }
  },
  "recommendations": {
    "test_placement": "<guidance>",
    "test_command": "<command>",
    "dependency_location": "<package-json-path>",
    "avoid": ["<anti-pattern-1>", "<anti-pattern-2>"]
  }
}
```

## Reference Documentation

- **Pattern Examples**: See issue snippets 002, 003 from ralph-2026-01-10-AF44 session
- **Monorepo Detection**: Check for workspaces field in root package.json
- **Test Framework Detection**: Search devDependencies for vitest, jest, mocha
