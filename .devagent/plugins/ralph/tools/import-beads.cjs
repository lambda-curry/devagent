#!/usr/bin/env node
/**
 * Beads Task Import Script
 * 
 * Imports tasks from a Beads payload JSON file into the Beads database.
 * Handles prefix detection, hierarchical IDs, and proper error handling.
 * 
 * Usage:
 *   node import-beads.js <beads-payload.json>
 * 
 * Or make executable and run:
 *   ./import-beads.js <beads-payload.json>
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Detect the Beads database prefix from database configuration or existing tasks
 */
function detectDatabasePrefix() {
  // First, try to get prefix from database configuration (most reliable)
  try {
    const result = execSync('bd config get issue_prefix', { encoding: 'utf8', stdio: 'pipe' });
    const prefix = result.trim();
    if (prefix && prefix !== '' && !prefix.includes('Error') && !prefix.includes('not found')) {
      return prefix;
    }
  } catch (e) {
    // Config might not be set or command failed - continue to try other methods
  }
  
  // Fallback: try to get prefix from existing tasks
  try {
    const result = execSync('bd list --json', { encoding: 'utf8', stdio: 'pipe' });
    const tasks = JSON.parse(result);
    if (tasks.length > 0 && tasks[0].id) {
      // Extract prefix (everything before the last segment)
      const parts = tasks[0].id.split('-');
      if (parts.length >= 2) {
        // Take first two parts (e.g., "video-query-mcp" from "video-query-mcp-abc123")
        return parts.slice(0, 2).join('-');
      }
      // Fallback: take everything before the last dash
      const lastDash = tasks[0].id.lastIndexOf('-');
      if (lastDash > 0) {
        return tasks[0].id.substring(0, lastDash);
      }
    }
  } catch (e) {
    // Database might be empty or not exist - continue to final fallback
  }
  
  // Final fallback: use directory name (matches bd init default behavior)
  try {
    const cwd = process.cwd();
    const dirName = path.basename(cwd);
    if (dirName && dirName !== '.' && dirName !== '..') {
      return dirName;
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Last resort: default to "bd"
  return 'bd';
}

/**
 * Check if Beads CLI is available
 */
function checkBeadsCLI() {
  try {
    execSync('which bd', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if Beads database is initialized
 */
function checkBeadsDatabase() {
  try {
    execSync('bd list --json', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Create a temporary file with content
 */
function createTempFile(content, suffix = 'txt') {
  const tempPath = `/tmp/beads-import-${Date.now()}-${Math.random().toString(36).substring(7)}.${suffix}`;
  fs.writeFileSync(tempPath, content);
  return tempPath;
}

/**
 * Clean up temporary files
 */
function cleanupTempFiles(files) {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });
}

/**
 * Import a single task into Beads
 */
function importTask(task, tempFiles) {
  try {
    // Combine description and notes
    let description = task.description || '';
    if (task.notes) {
      description += (description ? '\n\n' : '') + task.notes;
    }
    
    // Create temp file for description
    const descFile = createTempFile(description);
    tempFiles.push(descFile);
    
    // Map status (Beads uses "open" for tasks ready for work)
    // Note: bd create does NOT support --status flag, we'll set it after creation
    let status = task.status || 'open';
    if (status === 'ready' || status === 'todo') {
      status = 'open';
    }

    // Build create command (without --status, as bd create doesn't support it)
    let cmd = `bd create --type task --title "${task.title.replace(/"/g, '\\"').replace(/`/g, '\\`')}" --id ${task.id} --body-file ${descFile} --force`;
    
    // Add acceptance criteria
    if (task.acceptance_criteria && task.acceptance_criteria.length > 0) {
      const acceptance = task.acceptance_criteria.join('; ').replace(/"/g, '\\"');
      cmd += ` --acceptance "${acceptance}"`;
    }
    
    // Note: Do NOT use --parent with hierarchical IDs - Beads infers it automatically
    
    // Add dependencies
    if (task.depends_on && task.depends_on.length > 0) {
      cmd += ` --deps ${task.depends_on.join(',')}`;
    }
    
    cmd += ' --json';
    
    // Execute create command
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    const created = JSON.parse(result);
    
    // Set status after creation (bd create doesn't support --status flag)
    if (status !== 'open') {
      try {
        execSync(`bd update ${created.id} --status ${status}`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        warn(`Failed to set status for ${created.id}: ${e.message.split('\n')[0]}`);
      }
    }
    
    success(`Created task: ${created.id} - ${created.title}`);
    return true;
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('UNIQUE constraint')) {
      warn(`Task ${task.id} already exists, skipping`);
      return true; // Not an error
    } else {
      error(`Failed to create task ${task.id}: ${e.message.split('\n')[0]}`);
      return false;
    }
  }
}

/**
 * Import an epic into Beads
 */
function importEpic(epic, tempFiles) {
  try {
    const descFile = createTempFile(epic.description);
    tempFiles.push(descFile);
    
    // Map status (Beads uses "open" for epics ready for work)
    // Note: bd create does NOT support --status flag, we'll set it after creation
    let status = epic.status || 'open';
    if (status === 'ready' || status === 'todo') {
      status = 'open';
    }

    // Build create command (without --status, as bd create doesn't support it)
    const cmd = `bd create --type epic --title "${epic.title.replace(/"/g, '\\"')}" --body-file ${descFile} --id ${epic.id} --force --json`;
    
    // Execute create command
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    const created = JSON.parse(result);
    
    // Set status after creation (bd create doesn't support --status flag)
    if (status !== 'open') {
      try {
        execSync(`bd update ${created.id} --status ${status}`, { encoding: 'utf8', stdio: 'pipe' });
      } catch (e) {
        warn(`Failed to set status for ${created.id}: ${e.message.split('\n')[0]}`);
      }
    }
    
    success(`Created epic: ${created.id} - ${created.title}`);
    return true;
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('UNIQUE constraint')) {
      warn(`Epic ${epic.id} already exists, skipping`);
      return true; // Not an error
    } else {
      error(`Failed to create epic ${epic.id}: ${e.message.split('\n')[0]}`);
      return false;
    }
  }
}

/**
 * Main import function
 */
function main() {
  const payloadPath = process.argv[2];
  
  if (!payloadPath) {
    error('Usage: node import-beads.js <beads-payload.json>');
    process.exit(1);
  }
  
  if (!fs.existsSync(payloadPath)) {
    error(`Payload file not found: ${payloadPath}`);
    process.exit(1);
  }
  
  // Check prerequisites
  if (!checkBeadsCLI()) {
    error('Beads CLI (bd) not found in PATH. Please install Beads first.');
    process.exit(1);
  }
  
  if (!checkBeadsDatabase()) {
    error('Beads database not initialized. Run "bd init" first.');
    process.exit(1);
  }
  
  // Detect prefix
  const dbPrefix = detectDatabasePrefix();
  info(`Detected database prefix: ${dbPrefix}`);
  
  // Load payload
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  } catch (e) {
    error(`Failed to parse payload: ${e.message}`);
    process.exit(1);
  }
  
  // Validate payload structure
  if (!payload.epics || payload.epics.length === 0) {
    error('Payload missing epics');
    process.exit(1);
  }
  
  if (!payload.tasks || payload.tasks.length === 0) {
    error('Payload missing tasks');
    process.exit(1);
  }
  
  // Check prefix compatibility
  const epic = payload.epics[0];
  const epicPrefix = epic.id.split('-').slice(0, 2).join('-');
  if (epicPrefix !== dbPrefix) {
    warn(`Epic prefix (${epicPrefix}) doesn't match database prefix (${dbPrefix})`);
    warn('This may cause import issues. Consider regenerating payload with correct prefix.');
  }
  
  // Import epic and tasks
  const tempFiles = [];
  let successCount = 0;
  let errorCount = 0;
  
  try {
    log('\nImporting epic...');
    if (importEpic(epic, tempFiles)) {
      successCount++;
    } else {
      errorCount++;
    }
    
    log(`\nImporting ${payload.tasks.length} tasks...`);
    for (const task of payload.tasks) {
      if (importTask(task, tempFiles)) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    log('\n' + '='.repeat(50));
    if (errorCount === 0) {
      success(`Import complete! ${successCount} items imported successfully.`);
    } else {
      warn(`Import complete with ${errorCount} error(s). ${successCount} items imported.`);
    }
  } finally {
    // Cleanup temp files
    cleanupTempFiles(tempFiles);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { importEpic, importTask, detectDatabasePrefix };
