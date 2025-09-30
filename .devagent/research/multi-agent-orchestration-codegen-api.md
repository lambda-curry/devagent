# Multi-Agent Orchestration with Codegen API

**Research Date:** 2025-09-30  
**Researched By:** Jake Ruesink  
**Status:** Draft

## Executive Summary

This research explores how to leverage the Codegen API to build a multi-agent orchestration system where a manager agent can coordinate sub-agents either linearly (sequential) or in parallel, with bidirectional communication for progress updates.

## Codegen API Overview

### Key Capabilities

The Codegen API (https://docs.codegen.com/api-reference/overview) provides:

1. **Agent Creation & Execution** - Programmatically create and run AI agents
2. **Status Monitoring** - Check agent run status and retrieve results
3. **Conversation Continuation** - Resume agent runs with follow-up prompts
4. **Full UI Integration** - All API-created agents visible in codegen.com UI

### Core Endpoints

```bash
# 1. Create Agent Run
POST /v1/organizations/{org_id}/agent/run
{
  "prompt": "Your task description",
  "repo_id": 123
}

# 2. Check Status
GET /v1/organizations/{org_id}/agent/run/{agent_run_id}

# 3. Resume with Follow-up
POST /v1/organizations/{org_id}/agent/run/resume
{
  "agent_run_id": 456,
  "prompt": "Follow-up instructions"
}
```

### Rate Limits
- **Standard endpoints**: 60 requests/30 seconds
- **Agent creation**: 10 requests/minute
- **Setup commands**: 5 requests/minute
- **Log analysis**: 5 requests/minute

## Multi-Agent Architecture Design

### Manager Agent Pattern

The manager agent serves as the orchestrator that:
1. Receives high-level objectives
2. Breaks down work into sub-tasks
3. Delegates to specialized sub-agents
4. Aggregates results and progress
5. Makes decisions on next steps

### Communication Flow

```
┌─────────────────┐
│ Manager Agent   │
│  (Orchestrator) │
└────────┬────────┘
         │
    ┌────┴─────┐
    │ Dispatch │
    └────┬─────┘
         │
    ┌────┴────────────────────┐
    │                         │
┌───▼────┐               ┌───▼────┐
│ Sub-   │               │ Sub-   │
│ Agent  │               │ Agent  │
│   1    │               │   2    │
└───┬────┘               └───┬────┘
    │                        │
    │ Return Message         │
    │ (via resume API)       │
    │                        │
    └────────────┬───────────┘
                 │
          ┌──────▼──────┐
          │  Aggregate  │
          │  & Decide   │
          └─────────────┘
```

## Implementation Strategy

### Option 1: Sequential Execution (Linear)

**Use Case:** When tasks have dependencies or need ordered execution

```python
# Pseudo-code example
def execute_linear_workflow(manager_agent_id, tasks):
    results = []
    
    for task in tasks:
        # Create sub-agent for task
        sub_agent = create_agent_run(
            org_id=ORG_ID,
            prompt=task.prompt,
            repo_id=task.repo_id
        )
        
        # Wait for completion
        while not is_complete(sub_agent.id):
            sleep(polling_interval)
            status = get_agent_status(sub_agent.id)
        
        # Get results
        result = get_agent_result(sub_agent.id)
        results.append(result)
        
        # Update manager with progress
        resume_agent_run(
            agent_run_id=manager_agent_id,
            prompt=f"Sub-agent completed: {task.name}. Result: {result.summary}"
        )
    
    return results
```

**Advantages:**
- Simple to implement and debug
- Clear execution order
- Easy error handling per step

**Disadvantages:**
- Slower total execution time
- Underutilizes concurrency
- Blocks on slow sub-tasks

### Option 2: Parallel Execution

**Use Case:** When tasks are independent and can run simultaneously

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def execute_parallel_workflow(manager_agent_id, tasks):
    # Create all sub-agents concurrently
    sub_agents = []
    
    for task in tasks:
        sub_agent = create_agent_run(
            org_id=ORG_ID,
            prompt=task.prompt,
            repo_id=task.repo_id
        )
        sub_agents.append((task, sub_agent))
    
    # Poll all agents concurrently
    async def monitor_agent(task, agent):
        while not is_complete(agent.id):
            await asyncio.sleep(polling_interval)
            status = get_agent_status(agent.id)
        
        result = get_agent_result(agent.id)
        
        # Report back to manager
        resume_agent_run(
            agent_run_id=manager_agent_id,
            prompt=f"Sub-agent '{task.name}' completed with result: {result.summary}"
        )
        
        return result
    
    # Wait for all to complete
    results = await asyncio.gather(*[
        monitor_agent(task, agent) 
        for task, agent in sub_agents
    ])
    
    return results
```

**Advantages:**
- Faster overall execution
- Better resource utilization
- Natural for independent tasks

**Disadvantages:**
- More complex error handling
- Harder to debug
- Rate limit considerations (10 agents/minute)

### Option 3: Hybrid Approach (Recommended)

Combines sequential and parallel execution based on task dependencies:

```python
def execute_hybrid_workflow(manager_agent_id, workflow_graph):
    """
    workflow_graph: DAG of tasks with dependencies
    """
    results = {}
    completed = set()
    
    while len(completed) < len(workflow_graph.tasks):
        # Find tasks ready to execute (dependencies met)
        ready_tasks = [
            task for task in workflow_graph.tasks
            if task.id not in completed
            and all(dep in completed for dep in task.dependencies)
        ]
        
        # Execute ready tasks in parallel
        batch_results = execute_parallel_batch(
            manager_agent_id,
            ready_tasks
        )
        
        # Update results and completed set
        results.update(batch_results)
        completed.update(batch_results.keys())
        
        # Update manager with batch progress
        resume_agent_run(
            agent_run_id=manager_agent_id,
            prompt=f"Completed batch: {', '.join(batch_results.keys())}"
        )
    
    return results
```

## Progress Communication Patterns

### 1. Polling-Based Updates

Sub-agents complete their work, manager polls for status:

```python
def poll_sub_agent(sub_agent_id, manager_id, callback_interval=30):
    """Poll sub-agent and report to manager periodically"""
    start_time = time.time()
    last_update = start_time
    
    while True:
        status = get_agent_status(sub_agent_id)
        
        # Send progress update to manager at intervals
        if time.time() - last_update > callback_interval:
            resume_agent_run(
                agent_run_id=manager_id,
                prompt=f"Sub-agent {sub_agent_id} status: {status.state}"
            )
            last_update = time.time()
        
        if status.state in ['completed', 'failed']:
            break
        
        sleep(5)  # Poll every 5 seconds
    
    return status
```

### 2. Event-Driven Updates (via Webhooks)

If Codegen API supports webhooks (to be verified):

```python
# Register webhook for agent completion
register_webhook(
    event_type='agent.run.completed',
    callback_url='https://your-manager-service.com/webhook',
    agent_run_id=sub_agent_id
)

# Manager service endpoint
@app.post('/webhook')
def handle_agent_completion(event):
    if event.type == 'agent.run.completed':
        # Resume manager agent with results
        resume_agent_run(
            agent_run_id=event.metadata.manager_id,
            prompt=f"Sub-agent completed: {event.agent_run_id}"
        )
```

### 3. Structured Return Messages

Define a standard protocol for sub-agents to report back:

```python
# Sub-agent includes structured data in its final output
sub_agent_output = {
    "status": "completed",
    "task_id": "task-123",
    "result": {
        "files_modified": ["src/auth.py", "tests/test_auth.py"],
        "pr_created": "https://github.com/org/repo/pull/456",
        "tests_passed": True
    },
    "metrics": {
        "duration_seconds": 120,
        "api_calls_made": 15
    }
}

# Manager parses and aggregates
resume_agent_run(
    agent_run_id=manager_id,
    prompt=f"""
    Sub-agent task-123 completed successfully:
    - Files modified: {len(sub_agent_output['result']['files_modified'])}
    - PR: {sub_agent_output['result']['pr_created']}
    - Duration: {sub_agent_output['metrics']['duration_seconds']}s
    """
)
```

## Data Store Design

To manage agent state and communication:

```python
# Agent Registry
agent_registry = {
    "manager_id": "agent-run-789",
    "sub_agents": [
        {
            "id": "agent-run-101",
            "task": "implement-auth",
            "status": "running",
            "started_at": "2025-09-30T10:00:00Z",
            "parent_id": "agent-run-789"
        },
        {
            "id": "agent-run-102",
            "task": "write-tests",
            "status": "pending",
            "depends_on": ["agent-run-101"],
            "parent_id": "agent-run-789"
        }
    ]
}

# Progress Tracking
progress_log = [
    {
        "timestamp": "2025-09-30T10:05:00Z",
        "agent_id": "agent-run-101",
        "event": "status_update",
        "message": "Created branch and modified 3 files"
    },
    {
        "timestamp": "2025-09-30T10:15:00Z",
        "agent_id": "agent-run-101",
        "event": "completed",
        "result": {"pr_url": "..."}
    }
]
```

## Error Handling & Resilience

### Retry Logic

```python
def create_agent_with_retry(prompt, repo_id, max_retries=3):
    """Create agent run with exponential backoff"""
    for attempt in range(max_retries):
        try:
            return create_agent_run(
                org_id=ORG_ID,
                prompt=prompt,
                repo_id=repo_id
            )
        except RateLimitError:
            if attempt < max_retries - 1:
                sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
        except Exception as e:
            # Log and notify manager
            resume_agent_run(
                agent_run_id=manager_id,
                prompt=f"Failed to create sub-agent: {str(e)}"
            )
            raise
```

### Failure Recovery

```python
def handle_sub_agent_failure(manager_id, failed_agent_id, task):
    """Handle sub-agent failures gracefully"""
    
    # Notify manager
    resume_agent_run(
        agent_run_id=manager_id,
        prompt=f"Sub-agent {failed_agent_id} failed. Analyzing failure..."
    )
    
    # Get failure details
    status = get_agent_status(failed_agent_id)
    error_logs = get_agent_logs(failed_agent_id)
    
    # Decide on recovery strategy
    if is_retryable(error_logs):
        # Retry with modified prompt
        new_agent = create_agent_run(
            org_id=ORG_ID,
            prompt=f"{task.prompt}\n\nPrevious attempt failed: {error_logs}. Please address this.",
            repo_id=task.repo_id
        )
        return new_agent
    else:
        # Escalate to manager for human intervention
        resume_agent_run(
            agent_run_id=manager_id,
            prompt=f"Sub-agent failed with non-retryable error. Human intervention needed."
        )
        return None
```

## Rate Limit Management

With 10 agent creations per minute, strategies include:

### 1. Batching & Throttling

```python
from collections import deque
import time

class AgentCreationQueue:
    def __init__(self, max_per_minute=10):
        self.queue = deque()
        self.created_at = deque()
        self.max_per_minute = max_per_minute
    
    def create_agent(self, prompt, repo_id):
        # Clean up timestamps older than 1 minute
        now = time.time()
        while self.created_at and now - self.created_at[0] > 60:
            self.created_at.popleft()
        
        # Wait if we've hit the limit
        if len(self.created_at) >= self.max_per_minute:
            sleep_time = 60 - (now - self.created_at[0])
            if sleep_time > 0:
                time.sleep(sleep_time)
        
        # Create agent
        agent = create_agent_run(org_id=ORG_ID, prompt=prompt, repo_id=repo_id)
        self.created_at.append(time.time())
        return agent
```

### 2. Priority Queue

```python
class PrioritizedAgentQueue:
    def __init__(self):
        self.high_priority = deque()
        self.low_priority = deque()
    
    def add_task(self, task, priority='low'):
        if priority == 'high':
            self.high_priority.append(task)
        else:
            self.low_priority.append(task)
    
    def process_next(self):
        """Process high-priority tasks first"""
        if self.high_priority:
            return self.high_priority.popleft()
        elif self.low_priority:
            return self.low_priority.popleft()
        return None
```

## Integration with DevAgent System

### Align with Existing Agents

The current DevAgent system has:
- ProductMissionPartner
- ResearchAgent  
- SpecArchitect
- TaskPlanner
- TaskExecutor

**Manager agent could orchestrate these via API:**

```python
def orchestrate_feature_development(feature_request):
    """
    Full feature development workflow using API orchestration
    """
    
    # 1. Create manager agent
    manager = create_agent_run(
        org_id=ORG_ID,
        prompt=f"Orchestrate development of: {feature_request}",
        repo_id=DEVAGENT_REPO_ID
    )
    
    # 2. Sequential execution of dependent agents
    
    # Step 1: Research
    research_agent = create_agent_run(
        org_id=ORG_ID,
        prompt=f"#ResearchAgent: Research requirements for {feature_request}",
        repo_id=DEVAGENT_REPO_ID
    )
    research_result = wait_for_completion(research_agent.id)
    
    # Update manager
    resume_agent_run(
        agent_run_id=manager.id,
        prompt=f"Research completed: {research_result.summary}"
    )
    
    # Step 2: Spec creation
    spec_agent = create_agent_run(
        org_id=ORG_ID,
        prompt=f"#SpecArchitect: Create spec based on research: {research_result.output}",
        repo_id=DEVAGENT_REPO_ID
    )
    spec_result = wait_for_completion(spec_agent.id)
    
    resume_agent_run(
        agent_run_id=manager.id,
        prompt=f"Spec created: {spec_result.summary}"
    )
    
    # Step 3: Task planning
    planner_agent = create_agent_run(
        org_id=ORG_ID,
        prompt=f"#TaskPlanner: Break down spec into tasks: {spec_result.output}",
        repo_id=DEVAGENT_REPO_ID
    )
    tasks_result = wait_for_completion(planner_agent.id)
    
    # Step 4: Parallel task execution
    task_agents = []
    for task in tasks_result.tasks:
        executor = create_agent_run(
            org_id=ORG_ID,
            prompt=f"#TaskExecutor: Execute task: {task.description}",
            repo_id=DEVAGENT_REPO_ID
        )
        task_agents.append((task, executor))
    
    # Monitor all executors
    results = monitor_parallel_agents(manager.id, task_agents)
    
    return results
```

## Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│           Manager Service (Python)              │
│  - Receives high-level goals                    │
│  - Maintains agent registry & state             │
│  - Orchestrates via Codegen API                 │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │   Codegen API         │
        │   - Create agents     │
        │   - Check status      │
        │   - Resume with msgs  │
        └───────────┬───────────┘
                    │
    ┌───────────────┴───────────────────┐
    │                                   │
┌───▼────────────┐           ┌─────────▼────────┐
│  Sub-Agent 1   │           │  Sub-Agent N     │
│  (Codegen API) │           │  (Codegen API)   │
└────────────────┘           └──────────────────┘

Storage Layer (PostgreSQL/SQLite)
├── agent_runs (id, parent_id, status, created_at)
├── task_queue (id, agent_id, priority, status)
└── progress_logs (timestamp, agent_id, event, data)
```

## Next Steps

1. **Prototype Development**
   - Build simple manager service that creates 2-3 sub-agents
   - Test sequential execution
   - Test parallel execution
   - Validate message passing via resume API

2. **State Management**
   - Set up database schema for agent tracking
   - Implement progress logging
   - Build admin dashboard for visualization

3. **Error Handling**
   - Add retry logic with exponential backoff
   - Implement failure recovery strategies
   - Add alerting for stuck/failed agents

4. **Rate Limit Optimization**
   - Implement throttling queue
   - Add priority system
   - Monitor actual API usage patterns

5. **Integration Testing**
   - Test with real DevAgent workflows
   - Measure end-to-end performance
   - Validate against existing agent system

## Questions for Further Research

1. **Does Codegen API support webhooks?** This would eliminate polling overhead
2. **What's the max concurrent agent runs?** Affects parallel execution design
3. **Can we retrieve structured data from agent runs?** Or just text output?
4. **Are there agent run logs/traces via API?** Useful for debugging
5. **Can we specify agent timeouts?** Important for orchestration reliability

## References

- [Codegen API Documentation](https://docs.codegen.com/api-reference/overview)
- [Codegen Authentication Guide](https://docs.codegen.com/api-reference/authentication)
- [Agent Run Logs](https://docs.codegen.com/api-reference/agent-run-logs)
- [LangGraph Multi-Agent Patterns](https://blog.langchain.com/deep-agents/)
- [AWS AgentCore Runtime](https://aws.amazon.com/blogs/machine-learning/running-deep-research-ai-agents-on-amazon-bedrock-agentcore/)

---

**Status:** Ready for review and prototype development
**Estimated Complexity:** Medium-High (3-4 week implementation)
**Risk Level:** Medium (API rate limits, state management complexity)

