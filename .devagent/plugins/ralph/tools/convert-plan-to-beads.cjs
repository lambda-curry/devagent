#!/usr/bin/env node
/**
 * Convert DevAgent plan to Beads payload
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const planPath = process.argv[2] || '.devagent/workspace/tasks/active/2026-01-14_brainstorm-next-phase-ralph-monitoring/plan/2026-01-14_ralph-monitoring-ui-enhancements-plan.md';
const planContent = fs.readFileSync(planPath, 'utf8');
const absolutePlanPath = path.resolve(planPath);

// Extract plan title
const titleMatch = planContent.match(/^# (.+?) Plan/);
const planTitle = titleMatch ? titleMatch[1] : 'Ralph-Monitoring UI Enhancements';

// Extract summary
const summaryMatch = planContent.match(/### Summary\n([\s\S]*?)(?=\n###|$)/);
const summary = summaryMatch ? summaryMatch[1].trim() : 'Enhance the ralph-monitoring app with UI-focused improvements';

// Generate epic ID
const hash = crypto.createHash('md5').update(planTitle).digest('hex').substring(0, 4);
const epicId = 'devagent-' + hash;

// Parse tasks
const tasks = [];
const taskRegex = /#### Task (\d+): (.+?)\n([\s\S]*?)(?=#### Task |## |$)/g;
let taskMatch;

while ((taskMatch = taskRegex.exec(planContent)) !== null) {
  const taskNum = parseInt(taskMatch[1]);
  const taskTitle = taskMatch[2].trim();
  const taskContent = taskMatch[3];
  
  // Extract objective
  const objectiveMatch = taskContent.match(/- \*\*Objective:\*\* (.+?)(?:\n|$)/);
  const objective = objectiveMatch ? objectiveMatch[1].trim() : '';
  
  // Extract impacted files
  const filesMatch = taskContent.match(/- \*\*Impacted Modules\/Files:\*\*([\s\S]*?)(?:\n- \*\*|$)/);
  const files = filesMatch ? filesMatch[1].trim().split('\n').map(f => f.trim()).filter(f => f && !f.startsWith('-')) : [];
  
  // Extract references
  const refsMatch = taskContent.match(/- \*\*References:\*\*([\s\S]*?)(?:\n- \*\*|$)/);
  const refs = refsMatch ? refsMatch[1].trim() : 'None';
  
  // Extract testing criteria
  const testMatch = taskContent.match(/- \*\*Testing Criteria:\*\*([\s\S]*?)(?:\n- \*\*|$)/);
  const testCriteria = testMatch ? testMatch[1].trim() : 'None';
  
  // Extract acceptance criteria
  const acceptMatch = taskContent.match(/- \*\*Acceptance Criteria:\*\*([\s\S]*?)(?:\n- \*\*|$)/);
  let acceptanceCriteria = [];
  if (acceptMatch) {
    const acceptText = acceptMatch[1];
    const criteriaLines = acceptText.split('\n').map(l => l.trim()).filter(l => l && (l.startsWith('-') || /^\d+\./.test(l)));
    acceptanceCriteria = criteriaLines.map(l => l.replace(/^[-\d\.]+\s*/, ''));
  }
  
  // Extract dependencies
  const depsMatch = taskContent.match(/- \*\*Dependencies:\*\* (.+?)(?:\n|$)/);
  let dependencies = [];
  if (depsMatch) {
    const depsText = depsMatch[1].trim();
    if (depsText !== 'None') {
      const depMatches = depsText.match(/Task (\d+)/g);
      if (depMatches) {
        dependencies = depMatches.map(d => {
          const num = parseInt(d.match(/\d+/)[0]);
          return epicId + '.' + num;
        });
      }
    }
  }
  
  const taskId = epicId + '.' + taskNum;
  const description = `Objective: ${objective}

Impacted Modules/Files:
${files.join('\n')}

References:
${refs}

Testing Criteria:
${testCriteria}`;
  
  tasks.push({
    id: taskId,
    title: taskTitle,
    description: description,
    acceptance_criteria: acceptanceCriteria,
    priority: 'normal',
    status: 'open',
    parent_id: epicId,
    depends_on: dependencies,
    notes: 'Plan document: ' + absolutePlanPath
  });
}

// Add final report task
const finalTaskNum = tasks.length + 1;
const finalTaskId = epicId + '.' + finalTaskNum;
const allTaskIds = tasks.map(t => t.id);
tasks.push({
  id: finalTaskId,
  title: 'Generate Epic Revise Report',
  description: `Auto-generated epic quality gate. This task runs only after all other epic tasks are closed or blocked. Verify that all child tasks have status 'closed' or 'blocked' (no 'open', 'in_progress' tasks remain) before generating the report. Run: devagent ralph-revise-report ${epicId}`,
  acceptance_criteria: ['All child tasks are closed or blocked', 'Report generated in .devagent/workspace/reviews/'],
  priority: 'normal',
  status: 'todo',
  parent_id: epicId,
  depends_on: allTaskIds,
  notes: 'Plan document: ' + absolutePlanPath
});

// Create epic description with quality gates
const qualityGates = `- All tests passing (npm test or bun test)
- Lint clean (npm run lint or bun run lint)
- Typecheck passing (npm run typecheck or bun run typecheck)
- Build succeeds (npm run build or bun run build)`;

const epicDescription = `Plan document: ${absolutePlanPath}

Final Deliverable:
${summary}

Final Quality Gates:
${qualityGates}`;

const payload = {
  metadata: {
    source_plan: absolutePlanPath,
    generated_at: new Date().toISOString() + 'Z'
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
  tasks: tasks
};

console.log(JSON.stringify(payload, null, 2));
