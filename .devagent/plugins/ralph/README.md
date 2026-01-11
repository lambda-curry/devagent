# Ralph DevAgent Plugin

**Version:** 0.1.0  
**Status:** Active Development

Ralph is an autonomous execution plugin for DevAgent that converts DevAgent plans into executable tasks using Beads for state management and tracking.

## Recent Improvements (Based on PR #270 Session)

This plugin has been enhanced with technical improvements from the ralph-2026-01-10-AF44 session to address the top issues encountered during autonomous execution.

### 🔧 What's New

#### 1. **PlanToBeadsConverter Utility** (Schema Compatibility)
- **Problem Solved:** Beads CLI requires `acceptance_criteria` as a string, not an array
- **Solution:** Automatic flattening of arrays to markdown-formatted strings
- **Location:** `tools/plan-to-beads-converter.sh`
- **Usage:** Converts DevAgent plans to Beads-compatible JSON with proper schema mapping

#### 2. **Project Discovery Skill** (Context Awareness)
- **Problem Solved:** Ralph assumed standard monorepo structure, causing test placement failures
- **Solution:** Automated project structure analysis before implementation
- **Location:** `skills/project-discovery/SKILL.md`, `tools/project-discovery.sh`
- **Features:**
  - Detects monorepo vs single-package layouts
  - Identifies where tests should be placed
  - Discovers which packages have testing dependencies
  - Analyzes TypeScript configuration structure

#### 3. **Reference Validation Tool** (Code Integrity)
- **Problem Solved:** File moves/renames broke import statements and package exports
- **Solution:** Automated import/export reference checking after file operations
- **Location:** `skills/reference-validation/SKILL.md`, `tools/reference-validator.sh`
- **Features:**
  - Searches for references to moved/renamed files
  - Validates package entry points (index.ts, public-api.ts)
  - Generates fix recommendations
  - Prevents "module not found" build failures

#### 4. **Baseline Validation** (Pre-Flight Quality Gates)
- **Problem Solved:** Pre-existing issues confused with Ralph-caused failures
- **Solution:** Run quality gates before implementation to establish baseline
- **Location:** Integrated into `workflows/execute-autonomous.md`
- **Features:**
  - Validates baseline before making changes
  - Separates pre-existing issues from new issues
  - Attempts to fix obvious baseline problems (missing dependencies)
  - Provides clear attribution of failures

#### 5. **MCP Auto-Configuration** (Plugin System)
- **Problem Solved:** Manual setup required for browser testing (Playwright MCP)
- **Solution:** Automated opencode.json generation with MCP server configuration
- **Location:** `skills/mcp-configuration/SKILL.md`, `tools/mcp-configurator.sh`
- **Features:**
  - Detects AI tool in use (OpenCode, Cursor, Claude Code)
  - Generates or updates MCP configuration
  - Supports Playwright, GitHub, and filesystem MCP servers
  - Validates configuration and provides next steps

## Directory Structure

```
.devagent/plugins/ralph/
├── plugin.json                          # Plugin manifest
├── README.md                            # This file
├── commands/                            # Command definitions
│   └── execute-autonomous.md
├── workflows/                           # Workflow instructions
│   └── execute-autonomous.md
├── quality-gates/                       # Quality gate templates
│   └── typescript.json
├── templates/                           # Schema and templates
│   └── beads-schema.json
├── tools/                               # Utility scripts
│   ├── config.json
│   ├── plan-to-beads-converter.sh       # NEW: Schema compatibility converter
│   ├── project-discovery.sh             # NEW: Project structure analyzer
│   ├── reference-validator.sh           # NEW: Import/export validator
│   ├── mcp-configurator.sh              # NEW: MCP auto-configuration
│   └── ralph.sh                         # Main execution loop
└── skills/                              # Skill definitions
    ├── plan-to-beads-conversion/        # Plan → Beads conversion
    ├── quality-gate-detection/          # Quality gate loading
    ├── beads-integration/               # Beads CLI usage
    ├── issue-logging/                   # Issue tracking
    ├── revise-report-generation/        # Report generation
    ├── project-discovery/               # NEW: Project analysis
    ├── reference-validation/            # NEW: Reference checking
    └── mcp-configuration/               # NEW: MCP setup
```

## Quick Start

### Prerequisites

- Beads CLI installed (`bd` command available)
- AI tool (OpenCode, Cursor, or Claude Code)
- Node.js and npm (for most projects)

### Basic Usage

```bash
# 1. Run project discovery (recommended first step)
.devagent/plugins/ralph/tools/project-discovery.sh . ./discovery-output

# 2. Convert plan to Beads payload
.devagent/plugins/ralph/tools/plan-to-beads-converter.sh \
  path/to/plan.md \
  ./output

# 3. Configure MCP if needed (e.g., for browser testing)
.devagent/plugins/ralph/tools/mcp-configurator.sh playwright

# 4. Execute autonomous workflow (see execute-autonomous.md for details)
```

## Utility Scripts

### plan-to-beads-converter.sh

Converts DevAgent plans to Beads-compatible JSON with schema flattening.

```bash
./tools/plan-to-beads-converter.sh <plan-file> <output-dir>
```

**Features:**
- Extracts plan title and generates epic ID
- Flattens acceptance_criteria arrays to markdown strings
- Prepends parent context to child descriptions
- Creates base JSON structure with schema compatibility

**Output:**
- `beads-payload.json` - Beads-compatible task structure
- `conversion-log.txt` - Conversion details

### project-discovery.sh

Analyzes project structure to understand testing patterns and configuration.

```bash
./tools/project-discovery.sh [project-root] [output-dir]
```

**Features:**
- Detects monorepo vs single-package
- Finds test file locations and naming conventions
- Analyzes testing dependencies
- Identifies TypeScript configuration

**Output:**
- `project-discovery.json` - Structured discovery report
- `discovery-log.txt` - Detailed analysis

### reference-validator.sh

Validates import/export references after file operations.

```bash
./tools/reference-validator.sh <operation> <path1> [path2] [output-dir]
```

**Operations:**
- `move` - File moved to different directory
- `rename` - File renamed in same directory
- `create` - New file created

**Features:**
- Searches for references to old paths
- Checks package entry points
- Generates fix recommendations

**Output:**
- `reference-validation.json` - Validation report
- `validation-log.txt` - Detailed findings

### mcp-configurator.sh

Automatically configures MCP servers for AI tools.

```bash
./tools/mcp-configurator.sh <mcp-server> [output-dir]
```

**Supported Servers:**
- `playwright` - Browser testing
- `github` - GitHub integration
- `filesystem` - File operations

**Features:**
- Detects AI tool in use
- Creates or updates MCP configuration
- Validates configuration syntax

**Output:**
- `mcp-configuration.json` - Configuration report
- `opencode.json` (or appropriate config file) - MCP configuration

## Skills

### Core Skills (Existing)

- **plan-to-beads-conversion** - Convert DevAgent plans to Beads tasks
- **quality-gate-detection** - Load TypeScript quality gate templates
- **beads-integration** - Use Beads CLI for task management
- **issue-logging** - Log issues during execution
- **revise-report-generation** - Generate comprehensive revise reports

### New Skills (PR #270 Improvements)

- **project-discovery** - Analyze project structure before implementation
- **reference-validation** - Validate import/export references
- **mcp-configuration** - Auto-configure MCP servers

## Workflow Integration

The execute-autonomous workflow now includes:

1. **Step 0: Project Discovery & Baseline Validation**
   - Run project discovery to understand structure
   - Validate baseline quality gates
   - Document pre-existing issues

2. **Step 1: Convert Plan to Beads Payload**
   - Use improved converter with schema compatibility

3. **Step 2: Configure Quality Gates**
   - Load quality gate templates

4. **Step 3: Prepare Ralph Configuration**
   - Merge components into unified config

5. **Step 4: Launch Ralph Execution Loop**
   - During execution:
     - Use project discovery for file placement decisions
     - Run reference validation after file operations
     - Compare quality gate results against baseline

6. **Step 5: Generate Revise Report**
   - Include all logged issues
   - Separate baseline vs implementation issues

## Impact of Improvements

Based on ralph-2026-01-10-AF44 session findings:

| Issue | Before | After |
|-------|--------|-------|
| Schema Compatibility | Manual JSON editing required | Automatic array flattening |
| Test Placement | Wrong directory (75% of issues) | Correct location from discovery |
| Import Errors | Manual fixing required | Automatic detection & validation |
| Baseline Failures | Confused with Ralph issues | Clearly separated & documented |
| MCP Setup | Manual configuration steps | Fully automated |

**Result:** 75% reduction in manual interventions (from discovery + validation)

## Best Practices

1. **Always run project discovery first** - Prevents most file placement issues
2. **Check baseline quality gates** - Separates pre-existing from new issues
3. **Use reference validator after file ops** - Catches import errors early
4. **Configure MCP at setup** - Enables full autonomous capabilities
5. **Review discovery report** - Understand project before implementation

## Troubleshooting

### Issue: Tests placed in wrong directory
**Solution:** Run project discovery and follow recommendations

### Issue: Import errors after file move
**Solution:** Use reference-validator.sh to detect and fix references

### Issue: Quality gates fail (baseline)
**Solution:** Run baseline validation first to identify pre-existing issues

### Issue: Browser testing not available
**Solution:** Run mcp-configurator.sh playwright

## Contributing

When adding new improvements:
1. Document in this README
2. Add skill to `skills/` directory
3. Create utility script in `tools/` if applicable
4. Update `plugin.json` manifest
5. Integrate into `workflows/execute-autonomous.md`

## Version History

- **0.1.0** - Initial implementation with PR #270 improvements
  - PlanToBeadsConverter utility
  - Project discovery skill
  - Reference validation tool
  - Baseline validation
  - MCP auto-configuration

## References

- **PR #270**: ralph-2026-01-10-AF44 session findings
- **Beads**: Task management system
- **DevAgent**: Parent framework
- **MCP**: Model Context Protocol

## License

Part of DevAgent project. See root LICENSE file.
