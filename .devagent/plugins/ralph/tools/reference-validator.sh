#!/bin/bash
# Reference Validation Utility
# Checks for broken import/export references after file operations

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
Usage: $0 <operation> <path1> [path2] [output-dir]

Validate import/export references after file operations.

Arguments:
  operation    File operation: move, rename, or create
  path1        Old path (for move/rename) or new path (for create)
  path2        New path (for move/rename only)
  output-dir   Directory for output files (default: ./validation-output)

Examples:
  # After moving a file
  $0 move src/utils/formatter.ts src/formatters/formatter.ts

  # After renaming a file
  $0 rename src/utils/old-name.ts src/utils/new-name.ts

  # After creating a file
  $0 create src/helpers/validation.ts

Output:
  - reference-validation.json: Validation report
  - validation-log.txt: Detailed validation log
EOF
    exit 1
}

# Validate arguments
if [ $# -lt 2 ]; then
    log_error "Invalid number of arguments"
    usage
fi

OPERATION="$1"
PATH1="$2"
PATH2="${3:-}"
OUTPUT_DIR="${4:-./validation-output}"

# Validate operation
if [[ ! "$OPERATION" =~ ^(move|rename|create)$ ]]; then
    log_error "Invalid operation: $OPERATION (must be move, rename, or create)"
    usage
fi

# Validate paths based on operation
if [[ "$OPERATION" =~ ^(move|rename)$ ]] && [ -z "$PATH2" ]; then
    log_error "Operation '$OPERATION' requires two paths"
    usage
fi

# Set OLD_PATH and NEW_PATH
if [ "$OPERATION" = "create" ]; then
    OLD_PATH=""
    NEW_PATH="$PATH1"
else
    OLD_PATH="$PATH1"
    NEW_PATH="$PATH2"
fi

# Create output directory
if [ ! -d "$OUTPUT_DIR" ]; then
    log_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
fi

# Output files
REPORT_FILE="$OUTPUT_DIR/reference-validation.json"
LOG_FILE="$OUTPUT_DIR/validation-log.txt"

# Initialize log
{
    echo "==================================="
    echo "Reference Validation Log"
    echo "==================================="
    echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "Operation: $OPERATION"
    echo "Old Path: $OLD_PATH"
    echo "New Path: $NEW_PATH"
    echo ""
} > "$LOG_FILE"

log_info "Starting reference validation..."
log_info "Operation: $OPERATION"
if [ -n "$OLD_PATH" ]; then
    log_info "Old path: $OLD_PATH"
fi
log_info "New path: $NEW_PATH"

# Extract filename for search
if [ -n "$OLD_PATH" ]; then
    # Extract filename without extension(s)
    # Handle compound extensions like .test.ts, .spec.js
    OLD_FILENAME=$(basename "$OLD_PATH")
    # Remove all extensions (handles .test.ts, .spec.js, etc.)
    OLD_FILENAME="${OLD_FILENAME%%.*}"
    log_info "Searching for references to: $OLD_FILENAME"
else
    OLD_FILENAME=""
fi

NEW_FILENAME=$(basename "$NEW_PATH")
NEW_FILENAME="${NEW_FILENAME%%.*}"
NEW_DIR=$(dirname "$NEW_PATH")

# Step 2: Search for references
log_info "Step 1: Searching for import/export references..."
echo "=== Step 1: Reference Search ===" >> "$LOG_FILE"

REFERENCES_FOUND=0
BROKEN_REFS=()

if [ -n "$OLD_FILENAME" ]; then
    # Search for references to old filename
    log_info "Searching for imports/exports of '$OLD_FILENAME'..."
    
    IMPORT_REFS=$(grep -rn "from.*['\"].*$OLD_FILENAME['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null || true)
    REQUIRE_REFS=$(grep -rn "require.*['\"].*$OLD_FILENAME['\"]" --include="*.ts" --include="*.js" . 2>/dev/null || true)
    
    if [ -n "$IMPORT_REFS" ]; then
        echo "Import references found:" >> "$LOG_FILE"
        echo "$IMPORT_REFS" >> "$LOG_FILE"
        REFERENCES_FOUND=$((REFERENCES_FOUND + $(echo "$IMPORT_REFS" | wc -l)))
        
        while IFS= read -r ref; do
            BROKEN_REFS+=("$ref")
            log_warn "Found reference: $ref"
        done <<< "$IMPORT_REFS"
    fi
    
    if [ -n "$REQUIRE_REFS" ]; then
        echo "Require references found:" >> "$LOG_FILE"
        echo "$REQUIRE_REFS" >> "$LOG_FILE"
        REFERENCES_FOUND=$((REFERENCES_FOUND + $(echo "$REQUIRE_REFS" | wc -l)))
    fi
fi

# Step 3: Check entry points
log_info "Step 2: Checking package entry points..."
echo "" >> "$LOG_FILE"
echo "=== Step 2: Entry Point Check ===" >> "$LOG_FILE"

ENTRY_POINTS=$(find . -name "index.ts" -o -name "index.js" -o -name "public-api.ts" 2>/dev/null | grep -v node_modules || true)

ENTRY_ISSUES=0
if [ -n "$ENTRY_POINTS" ]; then
    echo "Entry points found:" >> "$LOG_FILE"
    echo "$ENTRY_POINTS" >> "$LOG_FILE"
    
    while IFS= read -r entry_point; do
        if [ -n "$OLD_FILENAME" ]; then
            # Check if entry point references old file
            if grep -q "$OLD_FILENAME" "$entry_point" 2>/dev/null; then
                log_warn "Entry point references old file: $entry_point"
                echo "  ISSUE: $entry_point references $OLD_FILENAME" >> "$LOG_FILE"
                ENTRY_ISSUES=$((ENTRY_ISSUES + 1))
            fi
        fi
    done <<< "$ENTRY_POINTS"
fi

# Determine validation status
VALIDATION_STATUS="passed"
TOTAL_ISSUES=$((REFERENCES_FOUND + ENTRY_ISSUES))

if [ $TOTAL_ISSUES -gt 0 ]; then
    VALIDATION_STATUS="failed"
    log_error "Validation failed: $TOTAL_ISSUES issue(s) found"
else
    log_success "Validation passed: No broken references found"
fi

# Generate JSON report
log_info "Generating validation report..."

cat > "$REPORT_FILE" << EOF
{
  "validation_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "file_operation": {
    "type": "$OPERATION",
    "old_path": "$OLD_PATH",
    "new_path": "$NEW_PATH"
  },
  "references_found": $REFERENCES_FOUND,
  "entry_points_with_issues": $ENTRY_ISSUES,
  "validation_status": "$VALIDATION_STATUS",
  "issues_found": $TOTAL_ISSUES,
  "recommended_fixes": [
    $([ $REFERENCES_FOUND -gt 0 ] && echo "\"Update import statements to reference new path\"," || true)
    $([ $ENTRY_ISSUES -gt 0 ] && echo "\"Update package entry points (index.ts) to export new path\"," || true)
    "Run typecheck to verify: npm run typecheck",
    "Review detailed log: $LOG_FILE"
  ]
}
EOF

log_info "Validation complete!"
log_info "Report: $REPORT_FILE"
log_info "Log: $LOG_FILE"

# Display summary
cat << EOF

${BLUE}Reference Validation Summary${NC}
================================
Operation:        $OPERATION
$([ -n "$OLD_PATH" ] && echo "Old Path:         $OLD_PATH" || true)
New Path:         $NEW_PATH
References Found: $REFERENCES_FOUND
Entry Issues:     $ENTRY_ISSUES
Status:           $([ "$VALIDATION_STATUS" = "passed" ] && echo -e "${GREEN}PASSED${NC}" || echo -e "${RED}FAILED${NC}")

$(if [ $TOTAL_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}Issues Detected:${NC}"
    echo "- $REFERENCES_FOUND import/export reference(s) to old path"
    echo "- $ENTRY_ISSUES entry point(s) need updating"
    echo ""
    echo -e "${YELLOW}Recommended Actions:${NC}"
    echo "1. Review broken references in log: $LOG_FILE"
    echo "2. Update import statements to new path"
    echo "3. Update package entry points (index.ts, public-api.ts)"
    echo "4. Run typecheck: npm run typecheck"
    echo "5. Run tests: npm test"
else
    echo -e "${GREEN}No Issues Found${NC}"
    echo "✓ No broken references detected"
    echo "✓ Entry points look good"
    echo ""
    echo "Recommended: Run typecheck to confirm: npm run typecheck"
fi)

For detailed analysis, see: $LOG_FILE
EOF

# Exit with appropriate code
[ "$VALIDATION_STATUS" = "passed" ] && exit 0 || exit 1
