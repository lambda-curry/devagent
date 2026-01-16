#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const planPath = process.argv[2];
if (!planPath) {
  console.error('Usage: node parse-plan-to-beads.js <plan-path> [db-prefix]');
  process.exit(1);
}

const dbPrefix = process.argv[3] || 'bd';
const planContent = fs.readFileSync(planPath, 'utf-8');
const absolutePlanPath = path.resolve(planPath);

// Extract plan title
const titleMatch = planContent.match(/^# (.+?)(?: —|$)/m);
const planTitle = titleMatch ? titleMatch[1] : 'Plan';

// Generate hash
const hash = crypto.createHash('md5').update(planTitle).digest('hex').substring(0, 4);
const epicId = `${dbPrefix}-${hash}`;

// Extract summary from PART 1
const summaryMatch = planContent.match(/## PART 1: PRODUCT CONTEXT[\s\S]*?### Summary\s*\n\n(.+?)(?=\n### |\n## |$)/);
const summary = summaryMatch ? summaryMatch[1].trim() : '';

// Extract functional narrative as fallback
const narrativeMatch = planContent.match(/### Functional Narrative\s*\n\n(.+?)(?=\n###|\n##|$)/);
const narrative = narrativeMatch ? narrativeMatch[1].trim() : '';

// Use narrative if summary is too short or high-level
const finalDeliverable = summary.length > 100 ? summary : narrative || summary;

// Parse tasks from PART 2
const tasksSection = planContent.match(/## PART 2: IMPLEMENTATION PLAN[\s\S]*?### Implementation Tasks\s*\n\n([\s\S]+?)(?=\n### |\n## |$)/);
if (!tasksSection) {
  console.error('Error: Could not find "Implementation Tasks" section');
  process.exit(1);
}

const tasksContent = tasksSection[1];
// Match task header and content separately
const taskRegex = /#### Task (\d+): ([^\n]+)\n\n([\s\S]+?)(?=#### Task \d+:|$)/g;
const tasks = [];
let match;

function extractField(content, fieldName) {
  // Escape special regex characters in fieldName
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Try multiline format first (with indented list items)
  // Stop at next field marker (- **FieldName:**) or end of content
  const multilineRegex = new RegExp(`- \\*\\*${escapedFieldName}:\\*\\*\\s*\\n((?:  - .+\\n?)+?)(?=\\n- \\*\\*|$)`, 's');
  const multilineMatch = content.match(multilineRegex);
  if (multilineMatch && multilineMatch[1].trim().length > 0) {
    return multilineMatch[1].trim();
  }
  // Try single line format
  const singleLineRegex = new RegExp(`- \\*\\*${escapedFieldName}:\\*\\* (.+?)(?=\\n- \\*\\*|$)`, 's');
  const singleMatch = content.match(singleLineRegex);
  return singleMatch ? singleMatch[1].trim() : '';
}

function extractAcceptanceCriteria(content) {
  const match = content.match(/- \*\*Acceptance Criteria:\*\*\s*\n((?:  - .+?\n?)+)/);
  if (match) {
    return match[1].split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().substring(2).trim())
      .filter(l => l.length > 0);
  }
  return [];
}

function extractSubtasks(content) {
  const subtasksMatch = content.match(/- \*\*Subtasks[^:]*:\*\*\s*\n((?:\d+\. .+?\n?)+)/);
  const subtasks = [];
  if (subtasksMatch) {
    const subtasksText = subtasksMatch[1];
    const subtaskRegex = /(\d+)\. (.+?)(?=\n\d+\. |$)/g;
    let subtaskMatch;
    while ((subtaskMatch = subtaskRegex.exec(subtasksText)) !== null) {
      subtasks.push({
        number: parseInt(subtaskMatch[1]),
        title: subtaskMatch[2].trim()
      });
    }
  }
  return subtasks;
}

while ((match = taskRegex.exec(tasksContent)) !== null) {
  const taskNum = parseInt(match[1]);
  const taskTitle = match[2].trim();
  const taskContent = match[3]; // Content after title
  
  // Extract objective
  const objectiveMatch = taskContent.match(/- \*\*Objective:\*\* (.+?)(?=\n- \*\*|$)/);
  const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
  
  // Extract impacted modules (multiline)
  const impacted = extractField(taskContent, 'Impacted Modules/Files');
  
  // Extract references (multiline)
  const references = extractField(taskContent, 'References');
  
  // Extract testing criteria
  const testingMatch = taskContent.match(/- \*\*Testing Criteria:\*\* (.+?)(?=\n- \*\*|$)/);
  const testingCriteria = testingMatch ? testingMatch[1].trim() : 'N/A (research task)';
  
  // Extract acceptance criteria
  const acceptanceCriteria = extractAcceptanceCriteria(taskContent);
  
  // Extract dependencies
  const depsMatch = taskContent.match(/- \*\*Dependencies:\*\* (.+?)(?=\n- \*\*|$)/);
  const depsText = depsMatch ? depsMatch[1].trim() : 'None';
  const dependencies = depsText === 'None' || depsText === 'N/A' 
    ? [] 
    : depsText.split(',').map(d => {
        const taskMatch = d.match(/Task (\d+)/);
        return taskMatch ? `${epicId}.${taskMatch[1]}` : null;
      }).filter(Boolean);
  
  // Extract subtasks
  const subtasks = extractSubtasks(taskContent);
  
  tasks.push({
    number: taskNum,
    title: taskTitle,
    objective,
    impacted,
    references,
    testingCriteria,
    acceptanceCriteria,
    dependencies,
    subtasks
  });
}

// Build description for task
function buildTaskDescription(task) {
  const parts = [];
  if (task.objective) parts.push(`Objective: ${task.objective}`);
  if (task.impacted) parts.push(`\nImpacted Modules/Files:\n${task.impacted}`);
  if (task.references) parts.push(`\nReferences:\n${task.references}`);
  if (task.testingCriteria) parts.push(`\nTesting Criteria:\n${task.testingCriteria}`);
  return parts.join('\n');
}

// Generate Beads tasks
const beadsTasks = [];
const allTaskIds = [];

// Add main tasks
tasks.forEach(task => {
  const taskId = `${epicId}.${task.number}`;
  allTaskIds.push(taskId);
  
  beadsTasks.push({
    id: taskId,
    title: task.title,
    description: buildTaskDescription(task),
    acceptance_criteria: task.acceptanceCriteria,
    priority: 'normal',
    status: 'todo',
    parent_id: epicId,
    depends_on: task.dependencies,
    notes: `Plan document: ${absolutePlanPath}`
  });
  
  // Add subtasks
  task.subtasks.forEach(subtask => {
    beadsTasks.push({
      id: `${taskId}.${subtask.number}`,
      title: subtask.title,
      description: '',
      acceptance_criteria: [],
      priority: 'normal',
      status: 'todo',
      parent_id: taskId,
      depends_on: [],
      notes: `Plan document: ${absolutePlanPath}`
    });
  });
});

// Add final report task
const maxTaskNum = Math.max(...tasks.map(t => t.number));
const reportTaskId = `${epicId}.${maxTaskNum + 1}`;
beadsTasks.push({
  id: reportTaskId,
  title: 'Generate Epic Revise Report',
  description: `Auto-generated epic quality gate. This task runs only after all other epic tasks are closed or blocked. Verify that all child tasks have status 'closed' or 'blocked' (no 'todo', 'in_progress', or 'open' tasks remain) before generating the report. Run: \`devagent ralph-revise-report ${epicId}\``,
  acceptance_criteria: [
    'All child tasks are closed or blocked',
    'Report generated in .devagent/workspace/reviews/'
  ],
  priority: 'normal',
  status: 'todo',
  parent_id: epicId,
  depends_on: allTaskIds,
  notes: `Plan document: ${absolutePlanPath}`
});

// Build epic description
const qualityGates = [
  'All tests passing (bun run test)',
  'Lint clean (bun run lint)',
  'Typecheck passing (bun run typecheck)'
];

const epicDescription = `Plan document: ${absolutePlanPath}

Final Deliverable: ${finalDeliverable}

Final Quality Gates:
${qualityGates.map(g => `- ${g}`).join('\n')}`;

// Generate payload
const payload = {
  metadata: {
    source_plan: absolutePlanPath,
    generated_at: new Date().toISOString()
  },
  ralph_integration: {
    ready_command: 'bd ready',
    status_updates: {
      in_progress: 'in_progress',
      closed: 'closed'
    },
    progress_comments: true
  },
  epics: [{
    id: epicId,
    title: planTitle,
    description: epicDescription,
    status: 'todo'
  }],
  tasks: beadsTasks
};

console.log(JSON.stringify(payload, null, 2));
