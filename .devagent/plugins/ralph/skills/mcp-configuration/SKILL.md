---
name: MCP Auto-Configuration
description: >-
  Automatically configure MCP (Model Context Protocol) servers for tools like Playwright
  browser testing. Use when: (1) Setting up browser testing capabilities, (2) Configuring
  project-specific MCP servers, (3) Enabling autonomous browser testing without manual
  setup. This skill eliminates "Manual Setup Required" warnings and enables fully
  autonomous browser testing.
---

# MCP Auto-Configuration

Automatically detect and configure MCP servers for enhanced tooling capabilities.

## Purpose

Enables automated setup of:
- Playwright MCP for browser testing
- Project-specific MCP server configurations
- opencode.json or other AI tool configurations

Eliminates manual configuration steps and "setup required" blockers.

## Prerequisites

- Write access to project root directory
- Knowledge of required MCP servers for task
- Understanding of AI tool configuration format

## Configuration Process

### Step 1: Detect Existing MCP Configuration

**Check for configuration files:**
```bash
# Look for common MCP configuration files
ls opencode.json cursor.json .ai-config.json 2>/dev/null

# Check if configuration exists
if [ -f "opencode.json" ]; then
  echo "MCP configuration already exists"
  # Parse existing config
  jq '.mcpServers' opencode.json
fi
```

**Document findings:**
- Configuration file exists: Yes/No
- Location: `<path>`
- Existing servers: `<list>`

### Step 2: Determine Required MCP Servers

**Based on task requirements:**

**For Browser Testing:**
- Required: Playwright MCP server
- Command: `npx -y playwriter@latest`
- Server name: `playwriter`

**For Database Operations:**
- Required: Database MCP server
- Command: Custom based on database type
- Server name: `database`

**For File Operations:**
- Required: File system MCP server
- Command: Custom
- Server name: `filesystem`

### Step 3: Generate MCP Configuration

**For OpenCode (Claude Code):**

Create or update `opencode.json`:
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
```

**For Cursor:**

Create or update `.cursor/mcp-config.json`:
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
```

**For other AI tools:**
- Check tool documentation for MCP configuration format
- Generate appropriate configuration structure

### Step 4: Merge with Existing Configuration

**If configuration file exists:**
```bash
# Read existing configuration
EXISTING_CONFIG=$(cat opencode.json)

# Add new MCP server to existing config
jq '.mcpServers.playwriter = {"command": "npx", "args": ["-y", "playwriter@latest"]}' opencode.json > opencode.json.tmp
mv opencode.json.tmp opencode.json
```

**If configuration file doesn't exist:**
```bash
# Create new configuration
cat > opencode.json << 'EOF'
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
EOF
```

### Step 5: Validate Configuration

**Check JSON syntax:**
```bash
# Validate JSON structure
jq . opencode.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

**Check server configuration:**
- Command is executable
- Arguments are correct
- Server name doesn't conflict with existing servers

**Test server availability:**
```bash
# Check if command exists
which npx > /dev/null && echo "npx available" || echo "npx not found"

# Optionally test server startup (may not be possible in all environments)
```

### Step 6: Generate Configuration Report

**Create report:**
```json
{
  "configuration_timestamp": "2026-01-10T17:00:00Z",
  "ai_tool": "opencode",
  "config_file": "opencode.json",
  "action": "created | updated | no-change",
  "mcp_servers_configured": [
    {
      "name": "playwriter",
      "command": "npx",
      "args": ["-y", "playwriter@latest"],
      "purpose": "Browser testing with Playwright"
    }
  ],
  "validation_status": "success | failed",
  "next_steps": [
    "Restart AI tool to load MCP configuration",
    "Verify browser testing capability",
    "Run browser tests to validate setup"
  ]
}
```

**Save report:**
- Location: `<output-dir>/mcp-configuration.json`
- Format: Pretty-printed JSON

## Common MCP Server Configurations

### Playwright MCP (Browser Testing)

**OpenCode Configuration:**
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
```

**Note:** The package name `playwriter@latest` is based on the PR #270 specification. If the actual package name differs (e.g., `@modelcontextprotocol/server-playwright`), update accordingly.

**Purpose:** Enable browser automation and testing
**When to use:** Tasks require browser interaction or UI testing

### GitHub MCP (Repository Operations)

**Configuration:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

**Purpose:** Enhanced GitHub integration
**When to use:** Tasks involve GitHub API operations

### Filesystem MCP (Enhanced File Operations)

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

**Purpose:** Advanced file system operations
**When to use:** Tasks require complex file manipulations

## Integration with Ralph Execution

**Auto-configuration flow:**

1. **Before Task Execution:**
   - Check if task requires MCP capabilities (e.g., browser testing)
   - Run MCP auto-configuration if needed
   - Validate configuration was successful

2. **During Setup:**
   - Log configuration actions for revise report
   - Document any manual steps still required
   - Provide clear next steps if AI tool restart needed

3. **Error Handling:**
   - If configuration fails, log as infrastructure issue
   - Provide manual setup instructions as fallback
   - Don't block task execution if MCP is optional

## AI Tool Detection

**Detect which AI tool is in use:**
```bash
# Check for Cursor
if [ -d ".cursor" ]; then
  AI_TOOL="cursor"
  CONFIG_FILE=".cursor/mcp-config.json"
fi

# Check for OpenCode
if command -v opencode &> /dev/null; then
  AI_TOOL="opencode"
  CONFIG_FILE="opencode.json"
fi

# Check for Claude Code
if command -v claude &> /dev/null; then
  AI_TOOL="claude-code"
  CONFIG_FILE="opencode.json"  # Claude Code uses same format as OpenCode
fi
```

## Error Prevention

**Issues Prevented:**
- ✅ "Manual Setup Required" warnings
- ✅ Missing browser testing capabilities
- ✅ Incomplete MCP server configurations
- ✅ AI tool restart delays

**Manual Steps Eliminated:**
- ✅ Creating configuration files manually
- ✅ Looking up MCP server commands
- ✅ Debugging JSON syntax errors
- ✅ Merging configurations

## Output

**Configuration Report Format:**
```json
{
  "configuration_timestamp": "<ISO-8601>",
  "ai_tool": "opencode | cursor | claude-code | other",
  "config_file": "<path>",
  "action": "created | updated | no-change",
  "mcp_servers_configured": [
    {
      "name": "<server-name>",
      "command": "<command>",
      "args": ["<arg1>", "<arg2>"],
      "purpose": "<description>"
    }
  ],
  "validation_status": "success | failed",
  "errors": ["<error-1>", "<error-2>"],
  "next_steps": ["<step-1>", "<step-2>"]
}
```

## Best Practices

1. **Check Before Creating:**
   - Always check if configuration exists
   - Merge with existing config, don't overwrite

2. **Validate After Creation:**
   - Check JSON syntax
   - Verify commands are available
   - Test configuration if possible

3. **Document Actions:**
   - Log what was configured
   - Provide clear next steps
   - Include any manual steps still required

4. **Handle Errors Gracefully:**
   - Don't fail task if MCP config fails
   - Provide fallback instructions
   - Log as infrastructure issue

## Reference Documentation

- **Issue Example**: PR #270 comment about Playwright MCP manual setup
- **OpenCode Format**: opencode.json schema for MCP servers
- **MCP Servers**: Model Context Protocol server registry
