# Update Tech Stack

## Mission
- Primary goal: Create or update comprehensive tech stack documentation for any project by analyzing codebases and gathering context from developers.
- Boundaries / non-goals: Does not install dependencies, configure build tools, or make architectural decisions; focuses solely on documenting existing or planned technology choices.
- Success signals: Tech stack documentation is complete, accurate, follows the template structure, and provides clear rationale for technology choices.

## Standard Instructions Reference
Before executing this workflow, review standard instructions in `.devagent/core/AGENTS.md` → Standard Workflow Instructions for:
- Date handling
- Metadata retrieval
- Context gathering order
- Standard guardrails
- Storage patterns

## Execution Directive
Follow standard execution directive in `.devagent/core/AGENTS.md` → Standard Workflow Instructions.

## Inputs
- Required: 
  - Repository or project context (name, purpose, target domain)
  - Location for tech stack file (default: `.devagent/workspace/memory/tech-stack.md`)
- Optional:
  - Existing package manifests (package.json, requirements.txt, pyproject.toml, Gemfile, go.mod)
  - Project documentation (README, architecture docs)
  - Developer preferences or constraints
  - Tech stack template customization needs
- Request missing info by: Enumerate gaps with specific questions (e.g., "What database are you using?", "What's your primary UI framework?") and suggest common answers for the project type.

## Resource Strategy
- Package manifest analysis (package.json, requirements.txt, etc.) - Parse to detect installed dependencies and versions
- File system inspection (config files, directory structure) - Identify frameworks, build tools, and architectural patterns
- `devagent research` (when technology choices need external validation) - Gather best practices and ecosystem context
- Context7 library docs (when analyzing specific frameworks or tools) - Get authoritative documentation about detected technologies
- Developer interview prompts (when automated detection is incomplete) - Ask structured questions to fill gaps
- Escalation rules: If tech stack has conflicting signals (e.g., multiple frameworks), pause and request clarification before documenting

## Knowledge Sources
- Internal: 
  - `.devagent/core/templates/tech-stack-template.md` (canonical template structure)
  - `.devagent/workspace/memory/constitution.md` (tool-agnostic principles)
  - `.devagent/workspace/product/` (mission and constraints that inform tech choices)
- External:
  - Repository package manifests and lock files
  - Build configuration files (vite.config, webpack.config, tsconfig.json, etc.)
  - CI/CD configuration (.github/workflows, .gitlab-ci.yml, etc.)
  - Context7 for framework documentation
  - Exa search for technology comparisons and decision rationale
- Retrieval etiquette: Cache detection results to avoid repeated scans; cite sources for technology rationale

## Workflow
1. **Kickoff / readiness checks**:
   - Confirm target repository or project
   - Verify tech stack file location (default: `.devagent/workspace/memory/tech-stack.md`)
   - Ask if creating new documentation or updating existing

2. **Context gathering**:
   - Scan for package manifests (package.json, requirements.txt, pyproject.toml, Gemfile, go.mod, composer.json)
   - Inspect build tool configs (vite.config, webpack.config, tsconfig.json, biome.json, .eslintrc, etc.)
   - Review CI/CD configs (.github/workflows/, vercel.json, netlify.toml, etc.)
   - Check database connections and ORM configs (prisma/, drizzle/, .env examples)
   - Read existing README and architecture docs
   - If existing tech-stack.md exists, load it for comparison

3. **Analysis and detection**:
   - Extract core stack (runtime, language, framework versions)
   - Identify build and development tools (monorepo, bundler, package manager)
   - Detect frontend stack (UI framework, CSS, component libraries, icons, fonts)
   - Identify backend stack (server framework, API style, authentication)
   - Map data layer (forms, state, fetching, database, ORM)
   - Find testing and quality tools (test framework, linting, formatting, type checking)
   - Document hosting and infrastructure (app hosting, database hosting, CDN, assets)
   - Note CI/CD and DevOps setup (platform, deployment triggers, environments)
   - Capture external services (AI, analytics, monitoring, email, etc.)

4. **Gap identification**:
   - Compare detected technologies against template sections
   - Generate specific questions for missing information
   - Suggest common answers based on project type and existing stack
   - Escalate ambiguities (e.g., "Found both Express and Fastify - which is primary?")

5. **Documentation drafting**:
   - Start from `.devagent/core/templates/tech-stack-template.md`
   - Fill detected sections with specific versions and tools
   - Add Product Capabilities based on feature set or mission
   - Document Constraints & Requirements from constitution or developer input
   - Include Future Integrations if roadmap exists
   - Add Decision Rationale for key technology choices (optional but recommended)

6. **Validation / QA**:
   - Cross-check versions against package manifests
   - Verify all template sections are addressed (or explicitly marked N/A)
   - Ensure consistency with tool-agnostic principles (if applicable)
   - Flag outdated dependencies or security concerns (informational only)

7. **Output packaging**:
   - Save to specified location (default: `.devagent/workspace/memory/tech-stack.md`)
   - Add metadata footer (version, last updated date)
   - Generate summary of changes if updating existing file

8. **Post-run logging**:
   - Log detection methods used and confidence levels
   - Note any unanswered questions or assumptions made
   - Recommend follow-up actions (e.g., "Consider documenting database migration strategy")

## Adaptation Notes
- **For new projects**: Focus on planned stack, include decision rationale for each choice
- **For existing projects**: Emphasize detected technologies, flag discrepancies between config and running code
- **For monorepos**: Create tech-stack.md per workspace or consolidate with clear boundaries
- **For tool-specific repos** (like devagent): Highlight tool-agnostic patterns and nested specializations
- **For microservices**: Consider per-service tech stacks or unified platform documentation

## Failure & Escalation
- Common blockers:
  - No package manifests found (pure infrastructure repos, scripts-only projects)
  - Conflicting signals (multiple frameworks, unclear primary database)
  - Incomplete configs (missing database connection details, no CI/CD setup)
  - Legacy or undocumented custom tooling
- Recovery playbook:
  - For missing manifests: Inspect file extensions and imports to infer language/frameworks
  - For conflicts: List all detected options and request developer clarification
  - For incomplete configs: Mark sections as "To be determined" and generate specific questions
  - For custom tooling: Document as-is with notes for future research

## Expected Output
- Artifacts:
  - `tech-stack.md` at specified location (default: `.devagent/workspace/memory/tech-stack.md`)
  - Summary of detected technologies and confidence levels
  - List of unanswered questions or gaps (if any)
- Communication:
  - "Tech stack documented for [project name] with [X] detected technologies and [Y] manual inputs required."
  - Link to created/updated file
  - Highlight any critical gaps or recommendations

## Follow-up Hooks
- Downstream agents:
  - `devagent update-product-mission` relies on tech stack for mission alignment
  - `devagent create-spec` references tech stack for feasibility checks
- `devagent plan-tasks` uses tech stack to identify testing and build requirements
- `devagent research` may validate technology choices against best practices
- Metrics / signals:
  - Track tech stack freshness (last updated date)
  - Monitor for dependency updates or security advisories
  - Log technology adoption patterns across projects

---

**Agent Version**: 1.0  
**Created**: 2025-10-01  
**Template Source**: `.devagent/core/templates/agent-brief-template.md`
