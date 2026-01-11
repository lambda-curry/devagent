#!/bin/bash
# Project Structure Discovery Utility
# Analyzes repository structure to understand testing patterns and configuration

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
log_debug() { echo -e "${BLUE}[DEBUG]${NC} $1"; }

# Usage message
usage() {
    cat << EOF
Usage: $0 [project-root] [output-dir]

Analyze project structure to discover testing patterns and configuration.

Arguments:
  project-root  Path to project root (default: current directory)
  output-dir    Directory for output files (default: ./discovery-output)

Output:
  - project-discovery.json: Structured discovery report
  - discovery-log.txt: Detailed analysis log

Example:
  $0 /path/to/project ./output
  $0  # Use current directory
EOF
    exit 1
}

# Arguments with defaults
PROJECT_ROOT="${1:-.}"
OUTPUT_DIR="${2:-./discovery-output}"

# Validate inputs
if [ ! -d "$PROJECT_ROOT" ]; then
    log_error "Project root not found: $PROJECT_ROOT"
    exit 1
fi

if [ ! -d "$OUTPUT_DIR" ]; then
    log_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
fi

# Output files
REPORT_FILE="$OUTPUT_DIR/project-discovery.json"
LOG_FILE="$OUTPUT_DIR/discovery-log.txt"

# Initialize log
{
    echo "==================================="
    echo "Project Structure Discovery Log"
    echo "==================================="
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "Project Root: $PROJECT_ROOT"
    echo "Output Directory: $OUTPUT_DIR"
    echo ""
} > "$LOG_FILE"

log_info "Starting project discovery..."
log_info "Project: $PROJECT_ROOT"
log_info "Output: $OUTPUT_DIR"

cd "$PROJECT_ROOT"

# Step 1: Detect Project Type
log_info "Step 1: Detecting project type..."
echo "=== Step 1: Project Type ===" >> "$LOG_FILE"

PROJECT_TYPE="single-package"
PACKAGE_COUNT=$(find . -maxdepth 2 -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | wc -l)

# Check if root package.json has workspaces configuration
if [ -f "package.json" ] && grep -q "workspaces" package.json 2>/dev/null; then
    PROJECT_TYPE="monorepo"
    log_info "Detected: Monorepo (workspaces configured)"
    echo "Project Type: monorepo (workspaces found in root package.json)" >> "$LOG_FILE"
elif [ "$PACKAGE_COUNT" -gt 1 ]; then
    # Multiple package.json files but no workspace config - likely monorepo without workspaces
    PROJECT_TYPE="monorepo"
    log_info "Detected: Monorepo (multiple packages found)"
    echo "Project Type: monorepo (multiple package.json files)" >> "$LOG_FILE"
fi

if [ "$PROJECT_TYPE" = "single-package" ]; then
    log_info "Detected: Single package"
    echo "Project Type: single-package" >> "$LOG_FILE"
fi

# Step 2: Find Test Files
log_info "Step 2: Discovering test file locations..."
echo "" >> "$LOG_FILE"
echo "=== Step 2: Test File Locations ===" >> "$LOG_FILE"

TEST_FILES=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*-test.*" \) 2>/dev/null | head -20)
TEST_DIRS=$(find . -type d \( -name "__tests__" -o -name "tests" -o -name "test" \) 2>/dev/null | head -10)

if [ -n "$TEST_FILES" ]; then
    log_info "Found test files:"
    echo "$TEST_FILES" | while read -r file; do
        log_debug "  $file"
        echo "  $file" >> "$LOG_FILE"
    done
    
    # Determine primary test location
    PRIMARY_TEST_LOCATION=$(echo "$TEST_FILES" | head -1 | xargs dirname)
    log_info "Primary test location: $PRIMARY_TEST_LOCATION"
    echo "Primary test location: $PRIMARY_TEST_LOCATION" >> "$LOG_FILE"
else
    log_warn "No test files found"
    echo "No test files found" >> "$LOG_FILE"
    PRIMARY_TEST_LOCATION="unknown"
fi

# Determine test pattern
TEST_PATTERN="unknown"
if echo "$TEST_FILES" | grep -q "\.test\."; then
    TEST_PATTERN="*.test.*"
elif echo "$TEST_FILES" | grep -q "\.spec\."; then
    TEST_PATTERN="*.spec.*"
fi
log_info "Test naming pattern: $TEST_PATTERN"
echo "Test naming pattern: $TEST_PATTERN" >> "$LOG_FILE"

# Step 3: Check Testing Dependencies
log_info "Step 3: Analyzing testing dependencies..."
echo "" >> "$LOG_FILE"
echo "=== Step 3: Testing Dependencies ===" >> "$LOG_FILE"

ROOT_HAS_TEST_DEPS=false
TEST_FRAMEWORK="unknown"

if [ -f "package.json" ]; then
    if grep -q "vitest\|jest\|mocha\|jasmine" package.json; then
        ROOT_HAS_TEST_DEPS=true
        if grep -q "vitest" package.json; then
            TEST_FRAMEWORK="vitest"
        elif grep -q "jest" package.json; then
            TEST_FRAMEWORK="jest"
        elif grep -q "mocha" package.json; then
            TEST_FRAMEWORK="mocha"
        fi
        log_info "Root has testing dependencies: $TEST_FRAMEWORK"
        echo "Root testing framework: $TEST_FRAMEWORK" >> "$LOG_FILE"
    fi
fi

# Step 4: Find package.json files and analyze
log_info "Step 4: Analyzing package structure..."
echo "" >> "$LOG_FILE"
echo "=== Step 4: Package Analysis ===" >> "$LOG_FILE"

PACKAGES=$(find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null)
echo "$PACKAGES" >> "$LOG_FILE"

# Generate JSON report
log_info "Generating discovery report..."

cat > "$REPORT_FILE" << EOF
{
  "discovery_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project_root": "$PROJECT_ROOT",
  "project_type": "$PROJECT_TYPE",
  "test_strategy": {
    "pattern": "$TEST_PATTERN",
    "primary_location": "$PRIMARY_TEST_LOCATION",
    "test_deps_location": "$([ "$ROOT_HAS_TEST_DEPS" = true ] && echo "root" || echo "unknown")",
    "framework": "$TEST_FRAMEWORK",
    "naming_convention": "$TEST_PATTERN"
  },
  "recommendations": {
    "test_placement": "$([ "$PRIMARY_TEST_LOCATION" != "unknown" ] && echo "Place tests in or near $PRIMARY_TEST_LOCATION" || echo "No existing tests found - establish convention")",
    "test_command": "npm test (verify in package.json)",
    "avoid": [
      "Placing tests in packages without testing dependencies",
      "Creating tests in directories not covered by tsconfig.json"
    ]
  },
  "analysis_notes": [
    "Review discovery-log.txt for detailed findings",
    "Verify test command before creating tests",
    "Check package.json scripts for test-related commands"
  ]
}
EOF

log_info "Discovery complete!"
log_info "Report: $REPORT_FILE"
log_info "Log: $LOG_FILE"

# Display summary
cat << EOF

${GREEN}Project Discovery Summary${NC}
================================
Project Type:     $PROJECT_TYPE
Test Framework:   $TEST_FRAMEWORK
Test Pattern:     $TEST_PATTERN
Primary Location: $PRIMARY_TEST_LOCATION

${YELLOW}Recommendations:${NC}
$([ "$PRIMARY_TEST_LOCATION" != "unknown" ] && echo "✓ Place new tests in or near: $PRIMARY_TEST_LOCATION" || echo "⚠ No tests found - establish testing convention first")
✓ Verify dependencies before creating tests in new packages
✓ Check tsconfig.json includes test file locations

${BLUE}Next Steps:${NC}
1. Review detailed report: $REPORT_FILE
2. Check test command: npm test (or see package.json scripts)
3. Verify testing dependencies are installed
4. Understand package structure before implementation

For detailed analysis, see: $LOG_FILE
EOF
