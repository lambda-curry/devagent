# GitHub and Linear Integration Skills Research

- Owner: DevAgent Team
- Last Updated: 2025-12-25
- Status: Research
- Related Feature Hub: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/`

## Classification & Assumptions

**Classification:** Implementation design research for PR review agent integration capabilities

**Assumptions:**
- PR review agent needs to read GitHub PRs and fetch Linear issues
- Skills should follow Agent Skills open standard format (agentskills.io)
- Skills should be cross-platform portable (Cursor, VS Code, GitHub, Claude, etc.)
- Both MCP and CLI approaches should be documented for flexibility

## Research Plan

1. **GitHub Integration Options**
   - MCP server availability and capabilities
   - GitHub CLI (`gh`) command patterns for PR operations
   - IDE built-in GitHub tools (Cursor, VS Code)
   - Authentication and security considerations

2. **Linear Integration Options**
   - Linear MCP server capabilities (already available in function list)
   - Linear API patterns for issue retrieval
   - Authentication requirements

3. **Agent Skills Format**
   - SKILL.md structure with YAML frontmatter
   - Directory structure (`.claude/<skill-name>/`)
   - Best practices for skill descriptions and auto-discovery

4. **Skill Design Patterns**
   - How to structure skills for GitHub operations
   - How to structure skills for Linear operations
   - Integration patterns between skills

## Sources

1. **Agent Skills Open Standard**: [agentskills.io](https://agentskills.io) - Official specification for Agent Skills format
2. **GitHub CLI Documentation**: [cli.github.com](https://cli.github.com) - Official GitHub CLI documentation
3. **Linear API Documentation**: [developers.linear.app](https://developers.linear.app) - Linear GraphQL API reference
4. **MCP Servers**: Available MCP tools in function list (Linear MCP functions confirmed)
5. **Workflow vs Skill Decision Guide**: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md` - Decision framework for skills vs workflows

## Findings & Tradeoffs

### GitHub Integration

**Option 1: GitHub MCP Server**
- **Pros:**
  - Standardized protocol interface
  - Cross-platform compatibility
  - Structured API access
- **Cons:**
  - Requires MCP server setup and configuration
  - May not be available in all environments
- **Status:** Not currently available in function list; would require external MCP server setup

**Option 2: GitHub CLI (`gh`)**
- **Pros:**
  - Widely available and well-documented
  - Direct command-line access
  - No additional server setup required
  - Works in any terminal environment
- **Cons:**
  - Requires `gh` CLI installation and authentication
  - Command parsing and output handling needed
- **Status:** Recommended approach for portability

**Option 3: IDE Built-in Tools**
- **Pros:**
  - Native integration with development environment
  - No additional setup required
- **Cons:**
  - Tool-specific (not portable)
  - Limited to specific IDE capabilities
- **Status:** Fallback option; not recommended for skill development

### Linear Integration

**Option 1: Linear MCP Server**
- **Pros:**
  - Already available in function list
  - Standardized protocol interface
  - Rich set of operations (issues, projects, teams, comments, etc.)
- **Cons:**
  - Requires MCP server configuration
- **Status:** **Recommended** - Already available and functional

**Available Linear MCP Functions:**
- `mcp_Linear_list_issues` - List and filter issues
- `mcp_Linear_get_issue` - Get detailed issue information
- `mcp_Linear_create_issue` - Create new issues
- `mcp_Linear_update_issue` - Update existing issues
- `mcp_Linear_list_projects` - List projects
- `mcp_Linear_get_project` - Get project details
- `mcp_Linear_list_teams` - List teams
- `mcp_Linear_list_users` - List workspace users
- `mcp_Linear_list_comments` - List issue comments
- `mcp_Linear_create_comment` - Create comments
- And many more...

### Agent Skills Format

**Required Structure:**
```
.claude/skills/<skill-name>/
  SKILL.md          # Required: YAML frontmatter + instructions
  scripts/          # Optional: Helper scripts
  references/       # Optional: Detailed documentation
  assets/           # Optional: Static resources
```

**SKILL.md Format:**
- YAML frontmatter with `name` and `description` (required)
- Description should enable auto-discovery by agents
- Instructions should be clear and actionable
- Can reference external resources in `references/` directory

## Recommendation

### For GitHub Integration
**Primary Approach:** GitHub CLI (`gh`) skill
- Create a skill that provides instructions for using `gh` CLI commands
- Document common PR operations (view, list, create, update)
- Include authentication setup guidance
- Make it portable across all environments

**Secondary Approach:** Document MCP server option
- Note that GitHub MCP servers exist but require setup
- Provide references for future MCP integration

### For Linear Integration
**Primary Approach:** Linear MCP skill
- Create a skill that documents available Linear MCP functions
- Provide usage patterns and examples
- Document common workflows (fetching issues, creating comments, etc.)
- Reference Linear MCP functions already available

### Skill Structure
Create three skills:
1. **`github-cli-operations`** - GitHub CLI command patterns and usage
2. **`linear-mcp-integration`** - Linear MCP function reference and patterns
3. **`pr-review-integration`** - Combined patterns for PR review workflows

## Repo Next Steps

- [x] Research GitHub and Linear integration options
- [x] Create `.claude/skills/github-cli-operations/` skill directory
- [x] Create `.claude/skills/github-cli-operations/SKILL.md` with GitHub CLI patterns
- [x] Create `.claude/skills/linear-mcp-integration/` skill directory
- [x] Create `.claude/skills/linear-mcp-integration/SKILL.md` with Linear MCP patterns
- [x] Create `.claude/skills/pr-review-integration/` skill directory (optional, for combined patterns)
- [x] Create `.claude/skills/pr-review-integration/SKILL.md` (optional)
- [ ] Update PR review agent feature hub with skill references
- [ ] Test skills in Cursor/Claude environment

## Risks & Open Questions

**Risks:**
- GitHub CLI requires installation and authentication setup
- Linear MCP requires server configuration (may already be configured)
- Skills need to be tested across different platforms

**Open Questions:**
- Should we create a combined PR review skill or keep them separate?
- Do we need helper scripts for common operations?
- Should skills include authentication setup instructions?
- How should skills handle error cases and edge cases?

## References

- Agent Skills Open Standard: [agentskills.io](https://agentskills.io)
- GitHub CLI Documentation: [cli.github.com/manual](https://cli.github.com/manual)
- Linear API Documentation: [developers.linear.app/docs](https://developers.linear.app/docs)
- Workflow vs Skill Guide: `.devagent/workspace/research/2025-12-25_workflow-vs-skill-decision-guide.md`
- PR Review Agent Feature: `.devagent/workspace/features/completed/2025-12-25_pr-review-agent/AGENTS.md`
