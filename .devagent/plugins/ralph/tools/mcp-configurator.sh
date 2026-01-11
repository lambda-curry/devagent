#!/bin/bash
# MCP Auto-Configuration Utility
# Automatically configures MCP servers for AI tools

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Usage message
usage() {
    cat << EOF
Usage: $0 <mcp-server> [output-dir]

Automatically configure MCP servers for AI tools.

Arguments:
  mcp-server   MCP server to configure (playwright, github, filesystem)
  output-dir   Directory for output files (default: ./mcp-output)

Supported MCP Servers:
  playwright   - Browser testing with Playwright
  github       - Enhanced GitHub integration
  filesystem   - Advanced file system operations

Example:
  $0 playwright
  $0 github ./output

Output:
  - mcp-configuration.json: Configuration report
  - opencode.json: MCP configuration file (if applicable)
EOF
    exit 1
}

# Validate arguments
if [ $# -lt 1 ]; then
    log_error "Invalid number of arguments"
    usage
fi

MCP_SERVER="$1"
OUTPUT_DIR="${2:-./mcp-output}"

# Validate MCP server
if [[ ! "$MCP_SERVER" =~ ^(playwright|github|filesystem)$ ]]; then
    log_error "Invalid MCP server: $MCP_SERVER"
    usage
fi

# Create output directory
if [ ! -d "$OUTPUT_DIR" ]; then
    log_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
fi

REPORT_FILE="$OUTPUT_DIR/mcp-configuration.json"

log_info "Starting MCP auto-configuration..."
log_info "MCP Server: $MCP_SERVER"
log_info "Output: $OUTPUT_DIR"

# Detect AI tool
AI_TOOL="unknown"
CONFIG_FILE=""

if [ -d ".cursor" ]; then
    AI_TOOL="cursor"
    CONFIG_FILE=".cursor/mcp-config.json"
    log_info "Detected AI tool: Cursor"
elif command -v opencode &> /dev/null || [ -f "opencode.json" ]; then
    AI_TOOL="opencode"
    CONFIG_FILE="opencode.json"
    log_info "Detected AI tool: OpenCode"
elif command -v claude &> /dev/null; then
    AI_TOOL="claude-code"
    CONFIG_FILE="opencode.json"
    log_info "Detected AI tool: Claude Code"
else
    AI_TOOL="opencode"
    CONFIG_FILE="opencode.json"
    log_warn "Could not detect AI tool, defaulting to OpenCode format"
fi

# Define MCP server configurations
declare -A MCP_COMMANDS
declare -A MCP_PURPOSES

# Note: "playwriter" package name is based on PR #270 specification
# If the actual Playwright MCP package differs, update accordingly
MCP_COMMANDS[playwright]="npx"
MCP_PURPOSES[playwright]="Browser testing with Playwright"

MCP_COMMANDS[github]="npx"
MCP_PURPOSES[github]="Enhanced GitHub integration"

MCP_COMMANDS[filesystem]="npx"
MCP_PURPOSES[filesystem]="Advanced file system operations"

# Get server-specific args
get_mcp_args() {
    case "$1" in
        playwright)
            echo '"-y", "playwriter@latest"'
            ;;
        github)
            echo '"-y", "@modelcontextprotocol/server-github"'
            ;;
        filesystem)
            echo '"-y", "@modelcontextprotocol/server-filesystem"'
            ;;
    esac
}

# Check if config file exists
ACTION="created"
if [ -f "$CONFIG_FILE" ]; then
    log_info "Configuration file exists: $CONFIG_FILE"
    ACTION="updated"
    
    # Check if jq is available for merging
    if ! command -v jq &> /dev/null; then
        log_warn "jq not available - will create new config (may overwrite existing)"
        ACTION="created"
    fi
else
    log_info "Configuration file does not exist: $CONFIG_FILE"
fi

# Generate MCP configuration
log_info "Configuring MCP server: $MCP_SERVER"

MCP_COMMAND="${MCP_COMMANDS[$MCP_SERVER]}"
MCP_ARGS=$(get_mcp_args "$MCP_SERVER")
MCP_PURPOSE="${MCP_PURPOSES[$MCP_SERVER]}"

# Create or update configuration
if [ "$ACTION" = "updated" ] && command -v jq &> /dev/null; then
    # Merge with existing config
    log_info "Merging with existing configuration..."
    
    TEMP_CONFIG=$(mktemp)
    jq --arg server "$MCP_SERVER" --arg cmd "$MCP_COMMAND" --argjson args "[$MCP_ARGS]" \
        '.mcpServers[$server] = {"command": $cmd, "args": $args}' \
        "$CONFIG_FILE" > "$TEMP_CONFIG"
    
    mv "$TEMP_CONFIG" "$CONFIG_FILE"
    log_success "Updated $CONFIG_FILE with $MCP_SERVER configuration"
else
    # Create new configuration
    log_info "Creating new configuration file..."
    
    cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "$MCP_SERVER": {
      "command": "$MCP_COMMAND",
      "args": [$MCP_ARGS]
    }
  }
}
EOF
    
    log_success "Created $CONFIG_FILE with $MCP_SERVER configuration"
fi

# Validate JSON
VALIDATION_STATUS="success"
if command -v jq &> /dev/null; then
    if jq . "$CONFIG_FILE" > /dev/null 2>&1; then
        log_success "Configuration file is valid JSON"
    else
        log_error "Configuration file has invalid JSON syntax"
        VALIDATION_STATUS="failed"
    fi
else
    log_warn "jq not available - skipping JSON validation"
fi

# Check if command is available
if command -v "$MCP_COMMAND" &> /dev/null; then
    log_success "Command '$MCP_COMMAND' is available"
else
    log_warn "Command '$MCP_COMMAND' not found in PATH"
fi

# Generate report
log_info "Generating configuration report..."

cat > "$REPORT_FILE" << EOF
{
  "configuration_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "ai_tool": "$AI_TOOL",
  "config_file": "$CONFIG_FILE",
  "action": "$ACTION",
  "mcp_servers_configured": [
    {
      "name": "$MCP_SERVER",
      "command": "$MCP_COMMAND",
      "args": [$MCP_ARGS],
      "purpose": "$MCP_PURPOSE"
    }
  ],
  "validation_status": "$VALIDATION_STATUS",
  "next_steps": [
    "Restart $AI_TOOL to load MCP configuration",
    "Verify $MCP_SERVER capability is available",
    "Test functionality to validate setup"
  ]
}
EOF

log_success "Configuration complete!"
log_info "Config file: $CONFIG_FILE"
log_info "Report: $REPORT_FILE"

# Display summary
cat << EOF

${GREEN}MCP Auto-Configuration Summary${NC}
================================
AI Tool:      $AI_TOOL
Config File:  $CONFIG_FILE
Action:       $([ "$ACTION" = "created" ] && echo "Created new configuration" || echo "Updated existing configuration")
MCP Server:   $MCP_SERVER
Command:      $MCP_COMMAND
Purpose:      $MCP_PURPOSE
Status:       $([ "$VALIDATION_STATUS" = "success" ] && echo -e "${GREEN}SUCCESS${NC}" || echo -e "${RED}FAILED${NC}")

${YELLOW}Next Steps:${NC}
1. Restart $AI_TOOL to load the MCP configuration
2. Verify $MCP_SERVER server is available in tool
3. Test functionality (e.g., browser testing for Playwright)

${BLUE}Configuration Details:${NC}
The MCP server has been configured in: $CONFIG_FILE

To verify the configuration:
  cat $CONFIG_FILE

To test Playwright MCP (if configured):
  Run a browser test and check for Playwright capabilities

For detailed report, see: $REPORT_FILE
EOF

# Exit with appropriate code
[ "$VALIDATION_STATUS" = "success" ] && exit 0 || exit 1
