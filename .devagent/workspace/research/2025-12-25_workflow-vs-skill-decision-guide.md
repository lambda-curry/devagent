# Workflow vs Skill Decision Guide

- Owner: DevAgent Team
- Last Updated: 2025-12-25
- Status: Research
- Related Task Hub: Research artifact (general guidance)

## Summary
Decision criteria and best practices for choosing between creating a DevAgent workflow (slash command) versus an Agent Skill (open standard), based on industry best practices and DevAgent architecture.

**Key Correction:** Agent Skills is an **open standard** (not Claude-specific) developed by Anthropic and supported by multiple platforms including Cursor, VS Code, GitHub, OpenAI Codex, Claude, and others. Skills are portable across skills-compatible agent products.

## Decision Framework

### Choose a **DevAgent Workflow** (Slash Command) When:

1. **Manual/Explicit Invocation Required**
   - User needs explicit control over when to run the capability
   - Task should be invoked on-demand, not automatically
   - Workflow triggers manually—no background scheduler needed

2. **Part of DevAgent's Structured Workflow Model**
   - Follows DevAgent's product development lifecycle patterns
   - Produces structured artifacts in `.devagent/workspace/` hierarchy
   - Integrates with DevAgent's workflow roster (research, plan, execute)
   - Requires coordination with task hubs, research packets, specs

3. **Workflow is Still Evolving**
   - Process is not yet standardized or subject to change
   - Needs flexibility for iterative refinement
   - May be experimental or in active development

4. **Part of DevAgent's Core Roster**
   - Fits into the product development lifecycle (research → plan → execute)
   - Coordinates with other workflows (research, create-plan, etc.)
   - Produces artifacts in `.devagent/workspace/` structure

5. **Simple, Frequent Actions**
   - Straightforward tasks performed repeatedly
   - Quick shortcuts without overhead
   - Lightweight instruction sheets

6. **Structured Multi-Step Process**
   - Requires clear input/output contracts
   - Has defined artifacts and storage policies
   - Needs hand-off coordination between agents

**DevAgent Workflow Structure:**
- Location: `.devagent/core/workflows/<workflow-name>.md`
- Command file: `.agents/commands/<workflow-name>.md`
- Invocation: `devagent <workflow-name>` or reference to workflow file
- Portable: Yes (part of `.devagent/core/`)

### Choose an **Agent Skill** (Open Standard) When:

1. **Automatic/Discovery-Based Activation**
   - Should be discovered and loaded by agents based on context
   - Agents automatically detect when skill is relevant
   - Eliminates need for explicit manual invocation
   - Skill metadata (name, description) allows agent auto-detection

2. **Cross-Platform Portability Needed**
   - Need to work across multiple skills-compatible platforms (Cursor, VS Code, GitHub, OpenAI Codex, Claude, etc.)
   - Want interoperability across different agent products
   - Follows the Agent Skills open standard format
   - Can be reused in any tool that supports the standard

3. **Standalone, Self-Contained Capability**
   - Not part of DevAgent's structured workflow lifecycle
   - Independent capability that enhances agent functionality
   - May include bundled resources (scripts, references, assets)
   - Doesn't require coordination with DevAgent's artifact structure

4. **Specialized Domain Knowledge Bundle**
   - Packages domain-specific expertise, schemas, or reference materials
   - Contains procedural knowledge agents should load on demand
   - Bundles company-, team-, or user-specific context
   - Works as an enhancement to agent base capabilities

5. **Repeatable Workflow (Skill Format)**
   - Multi-step task that should be consistent and auditable
   - Can be packaged as a skill for automatic discovery
   - Doesn't fit DevAgent's research → plan → execute model
   - Better suited to skill's instruction-based format

**Agent Skill Structure (Open Standard):**
- Location: `.codex/<skill-name>/` or platform-specific skill directory
- Required file: `SKILL.md` with YAML frontmatter (name, description)
- Optional: `scripts/`, `references/`, `assets/` subdirectories
- Portable: **Yes** - Works across Cursor, VS Code, GitHub, OpenAI Codex, Claude, and other skills-compatible platforms
- Standard: Defined at [agentskills.io](https://agentskills.io)

## Best Practices

### Development Strategy

1. **Start with Workflows for New Processes**
   - Begin by implementing new processes as DevAgent workflows
   - Test utility and effectiveness through manual invocation
   - Once stable and frequently used, consider if auto-activation adds value

2. **Workflow First, Skill Later**
   - Use workflows to refine and standardize processes
   - Convert to skills only when automatic activation provides clear benefit
   - Maintain workflows as the source of truth even if skills exist

3. **Clear Boundaries**
   - **Workflows**: DevAgent's structured lifecycle, manual invocation, produces artifacts in `.devagent/workspace/`
   - **Skills**: Open standard format, automatic discovery, standalone capabilities, cross-platform portable
   - Both can be portable, but serve different purposes—choose based on fit with DevAgent's model

### Design Principles

**For Workflows:**
- Provide clear input/output contracts
- Define artifact storage policies
- Document integration hooks with other workflows
- Ensure tool-agnostic design (per Constitution C4)

**For Skills:**
- Write clear, comprehensive descriptions in YAML frontmatter (name, description)
- Description should help agents discover when to use the skill
- Keep SKILL.md concise; use references/ for detailed docs
- Follow Agent Skills open standard format (see agentskills.io)
- Design for cross-platform compatibility

### When Both Might Be Needed

In some cases, you might have both:
- **Workflow**: DevAgent-structured process with manual invocation, produces artifacts
- **Skill**: Cross-platform variant that wraps workflow capabilities for automatic discovery
- Maintain workflow as source of truth; skill can reference or integrate with workflow
- Example: A skill that auto-detects when to run a DevAgent workflow

## DevAgent-Specific Considerations

### DevAgent Workflows Are Preferred When:

- Following the product development lifecycle (mission → research → plan → execute)
- Need to coordinate with task hubs, research packets, specs
- Producing artifacts that fit into `.devagent/workspace/` structure
- Working across multiple AI tools and environments
- Aligning with DevAgent's constitution and delivery principles

### Skills May Be Appropriate For:

- Cross-platform capabilities that need automatic discovery (Cursor, VS Code, GitHub, etc.)
- Standalone capabilities that don't fit DevAgent's structured workflow model
- Domain expertise bundles (schemas, policies, reference docs) for agent enhancement
- Repeatable workflows better suited to skill format than DevAgent lifecycle
- Company-wide knowledge bases that should be discoverable by agents

## Decision Checklist

Before creating a new capability, ask:

- [ ] Should this be invoked manually (workflow) or discovered automatically (skill)?
- [ ] Does this fit into DevAgent's workflow roster and artifact structure?
- [ ] Does this produce artifacts in `.devagent/workspace/` hierarchy?
- [ ] Is this a standalone capability or part of DevAgent's lifecycle?
- [ ] Does this need to coordinate with other DevAgent workflows?
- [ ] Should this work across skills-compatible platforms (Cursor, VS Code, GitHub, etc.)?
- [ ] Is the process stable and standardized enough for automatic discovery?

**If manual invocation + DevAgent lifecycle + structured artifacts** → DevAgent Workflow  
**If automatic discovery + standalone capability + cross-platform** → Agent Skill

## Examples

### DevAgent Workflow Examples (from current roster):
- `research` - Manual invocation for research tasks
- `create-plan` - Part of standard development lifecycle
- `new-feature` - Scaffolds task hubs in workspace
- `review-progress` - Coordinates with feature tracking
- All are portable, tool-agnostic, and produce structured artifacts

### Agent Skill Examples (would be appropriate):
- Company policy reference skill (auto-discovered when policies mentioned)
- API documentation skill (available across Cursor, VS Code, GitHub, etc.)
- Domain schema skill (auto-discovered for database queries)
- Code style guide skill (discovered during code review discussions)
- MCP server builder skill (standalone capability, cross-platform)
- Data analysis pipeline skill (repeatable workflow format)

## References

- **Agent Skills Open Standard**: [agentskills.io](https://agentskills.io) - Official specification and format
- DevAgent Constitution: `.devagent/workspace/memory/constitution.md` - Tool-agnostic design (C4)
- DevAgent Workflow Roster: `.devagent/core/AGENTS.md` - Available workflows and patterns
- Build Workflow Guide: `.devagent/core/workflows/build-workflow.md` - Creating new workflows

## Sources

1. **Agent Skills Open Standard**: [agentskills.io](https://agentskills.io) - Open standard by Anthropic, supported by Cursor, VS Code, GitHub, OpenAI Codex, Claude, and others
2. Skills Best Practices: Claude Skills guidance (claude.com, thetoolnerd.com, medium.com)
3. AI Agent Architecture Patterns: Multi-agent systems, workflow vs skill extensions
4. DevAgent Codebase: `.devagent/core/`, `.agents/commands/`, workflow definitions
5. DevAgent Constitution: Tool-agnostic design principles

## Important Note

**Agent Skills is an open standard**, not Claude-specific. The standard was developed by Anthropic and has been adopted by:
- **Microsoft**: Visual Studio Code, GitHub
- **OpenAI**: ChatGPT, Codex CLI
- **Coding Agents**: Cursor, Goose, Amp, OpenCode
- **Anthropic**: Claude Desktop, Claude Code

This means skills are **portable across platforms** that support the Agent Skills standard. The decision between workflow and skill should be based on:
- **Workflow**: DevAgent's structured lifecycle and artifact model
- **Skill**: Open standard format for cross-platform, automatically-discoverable capabilities
