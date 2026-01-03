# Agent-to-Workflow Transformation

- Owner: SpecArchitect
- Last Updated: 2025-01-27
- Status: Draft
- Related Feature Hub: `.devagent/workspace/features/2025-01-27_agent-to-workflow-transformation/`
- Stakeholders: Developer (Primary User, Decision Role)
- Notes: Transformation of agent-based system to workflow-based system for improved model recognition and usability.

## Summary
Transform the current agent-based DevAgent system (using `#AgentName` triggers) into a workflow-based system using `devagent [workflow-name]` triggers. This addresses the core issue where models don't reliably recognize agent hashtags, requiring users to say "devagent" at the beginning to trigger proper execution. The transformation will improve usability, consistency, and model recognition while maintaining all existing functionality.

## Context & Problem
The current DevAgent system uses agent-based prompts with hashtag triggers (`#ResearchAgent`, `#SpecArchitect`, etc.) that models don't consistently recognize. Users report that models only follow the agent path when they explicitly say "devagent" at the beginning, indicating poor trigger recognition. This creates friction in the workflow and reduces the effectiveness of the structured prompt system.

Current agents include: ResearchAgent, SpecArchitect, TaskPlanner, TaskExecutor, FeatureBrainstormAgent, FeatureClarifyAgent, ProductMissionPartner, TechStackAgent, AgentBuilder, and CodegenBackgroundAgent.

## Objectives & Success Metrics
- **Primary Objective:** Improve model recognition and trigger reliability by 100% (models consistently recognize workflow triggers)
- **Secondary Objective:** Maintain 100% functional parity with existing agents
- **Tertiary Objective:** Improve user experience with simpler, more intuitive workflow names
- **Success Metrics:** 
  - Models recognize `devagent [workflow-name]` triggers without requiring "devagent" prefix
  - All existing agent functionality preserved and accessible
  - User adoption of new workflow syntax within 1 week
  - Zero breaking changes to existing workflows

## Users & Insights
**Primary User:** Developer using DevAgent system
**Key Insights:** 
- Models respond better to natural language patterns than hashtag-based triggers
- Users prefer simpler, more descriptive workflow names
- Consistency in trigger format improves recognition
- Self-contained workflows reduce coordination overhead

## Solution Principles
- **Consistency:** All workflows use `devagent [workflow-name]` trigger format
- **Simplicity:** Workflow names should be intuitive and descriptive
- **Self-containment:** Each workflow includes all necessary context gathering
- **Backward Compatibility:** Existing functionality preserved during transition
- **Clear Sequencing:** Explicit workflow chains for common scenarios

## Scope Definition
- **In Scope:** 
  - Transform all 10 existing agents to workflows
  - Update AGENTS.md with workflow-based approach
  - Rename agent files to workflow names
  - Create workflow trigger patterns and examples
  - Maintain all existing functionality and capabilities
  - Update internal references and documentation

- **Out of Scope / Future:** 
  - New workflow capabilities beyond existing agents
  - Changes to core DevAgent architecture
  - Integration with external systems
  - Performance optimizations

## Functional Narrative

### Workflow Transformation Flow
- **Trigger:** User requests agent-to-workflow transformation
- **Experience narrative:** 
  1. User invokes `devagent spec` to create transformation specification
  2. System analyzes current agent structure and creates comprehensive transformation plan
  3. User reviews and approves transformation approach
  4. System implements workflow-based structure while preserving functionality
  5. User tests new workflow triggers and confirms improved recognition
- **Acceptance criteria:** 
  - All 10 agents successfully transformed to workflows
  - AGENTS.md updated with workflow-based structure
  - Model recognition of `devagent [workflow-name]` triggers improved
  - Zero functional regression

### Workflow Usage Flow
- **Trigger:** User needs to perform development task
- **Experience narrative:**
  1. User writes `devagent [workflow-name]: [task description]`
  2. System recognizes workflow trigger immediately
  3. Workflow executes with full context gathering
  4. User receives expected output without coordination overhead
- **Acceptance criteria:**
  - Models recognize workflow triggers without "devagent" prefix requirement
  - Workflows execute self-contained with minimal user input
  - Output quality matches or exceeds current agent performance

## Experience References
- Current AGENTS.md structure and agent descriptions
- Existing agent files in `.devagent/core/agents/`
- User feedback on current trigger recognition issues
- Model behavior patterns with hashtag vs natural language triggers

## Technical Notes & Dependencies
- **File Dependencies:** All workflow files in `.devagent/core/workflows/` directory
- **Template Dependencies:** Spec document template and related templates
- **Documentation Dependencies:** AGENTS.md, README.md, and related docs
- **No External Dependencies:** Transformation is self-contained within DevAgent system

## Risks & Open Questions
| Item | Type (Risk / Question) | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Model recognition improvement not achieved | Risk | Developer | Test with multiple models, iterate on trigger patterns | 2025-01-28 |
| Workflow name conflicts or confusion | Risk | Developer | User testing, clear naming conventions | 2025-01-28 |
| Breaking existing user workflows | Risk | Developer | Gradual migration, backward compatibility | 2025-01-28 |
| Internal reference updates missed | Risk | Developer | Comprehensive audit, automated checks | 2025-01-28 |

## Delivery Plan
**Phase 1: Specification & Planning (Day 1)**
- Complete transformation specification
- Create detailed implementation plan
- Identify all files requiring updates

**Phase 2: Core Transformation (Day 2)**
- Update AGENTS.md with workflow-based structure
- Rename and update agent files to workflow format
- Create workflow trigger examples and documentation

**Phase 3: Testing & Validation (Day 3)**
- Test workflow triggers with multiple models
- Validate functional parity with existing agents
- Gather user feedback and iterate

**Phase 4: Documentation & Cleanup (Day 4)**
- Update all internal references
- Create migration guide for users
- Final validation and sign-off

## Approval & Ops Readiness
- **Required Approvals:** Developer (Primary User)
- **Operational Checklist:** 
  - All workflow triggers tested and validated
  - Documentation updated and reviewed
  - User migration path documented
  - Rollback plan prepared

## Appendices & References
- Current AGENTS.md: `/Users/jaruesink/projects/devagent/AGENTS.md`
- Workflow files: `.devagent/core/workflows/`
- Spec template: `.devagent/core/templates/spec-document-template.md`
- User feedback on current trigger recognition issues

## Change Log
| Date | Change | Author |
| --- | --- | --- |
| 2025-01-27 | Initial draft | SpecArchitect |
