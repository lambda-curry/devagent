# DevAgent Workflow Trigger Examples

This document provides comprehensive examples and documentation for using the new `devagent [workflow-name]` trigger patterns. It covers individual workflow usage and common workflow chains.

## Individual Workflow Examples

### devagent create-product-mission

**Example 1: Initial product vision development**
```
devagent create-product-mission
Context: Starting a new mobile app project for fitness tracking
Expected outcome: Detailed product mission statement, target audience analysis, and initial feature roadmap
```

**Example 2: Mission refinement for existing product**
```
devagent create-product-mission
Context: Updating mission after user feedback analysis shows shift in priorities
Expected outcome: Revised mission statement incorporating new insights, updated value propositions
```

**Example 3: Mission creation for enterprise software**
```
devagent create-product-mission
Context: Building B2B analytics platform for healthcare providers
Expected outcome: Mission aligned with healthcare industry needs, compliance considerations, and enterprise requirements
```

### devagent clarify-feature

**Example 1: Validating user story requirements**
```
devagent clarify-feature
Context: User story "As a user, I want to filter search results by date range" needs clarification
Expected outcome: Complete acceptance criteria, edge cases identified, dependencies mapped
```

**Example 2: Feature gap analysis**
```
devagent clarify-feature
Context: Wireframes completed but requirements have gaps in error handling scenarios
Expected outcome: Comprehensive requirement set with error states, validation rules, and user feedback mechanisms
```

**Example 3: Technical feasibility assessment**
```
devagent clarify-feature
Context: Proposed feature requires integration with third-party APIs
Expected outcome: Technical constraints identified, alternative approaches evaluated, implementation feasibility confirmed
```

### devagent brainstorm-features

**Example 1: Expanding product capabilities**
```
devagent brainstorm-features
Context: Current e-commerce platform lacks personalization features
Expected outcome: 20+ feature ideas clustered by themes (recommendation engine, user profiling, dynamic pricing)
```

**Example 2: Mobile app enhancement**
```
devagent brainstorm-features
Context: Social features need improvement in existing dating app
Expected outcome: Feature candidates prioritized by user impact and implementation complexity
```

**Example 3: Enterprise tool innovation**
```
devagent brainstorm-features
Context: Project management tool needs competitive differentiation
Expected outcome: Innovative feature concepts with market analysis and technical feasibility scores
```

### devagent research-feature

**Example 1: Competitive analysis**
```
devagent research-feature
Context: Planning user authentication improvements
Expected outcome: Industry best practices, security standards review, competitor feature comparisons
```

**Example 2: Technical research**
```
devagent research-feature
Context: Implementing real-time notifications using WebSockets
Expected outcome: Technology options evaluated, performance benchmarks, implementation guides
```

**Example 3: User experience research**
```
devagent research-feature
Context: Designing onboarding flow for SaaS application
Expected outcome: UX patterns analysis, conversion optimization techniques, accessibility considerations
```

### devagent architect-spec

**Example 1: API design specification**
```
devagent architect-spec
Context: Building REST API for payment processing
Expected outcome: Complete API specification with endpoints, data models, authentication, and error handling
```

**Example 2: System architecture design**
```
devagent architect-spec
Context: Scalable microservices architecture for high-traffic application
Expected outcome: Architecture diagrams, service boundaries, data flow specifications, scaling strategies
```

**Example 3: Database schema design**
```
devagent architect-spec
Context: Multi-tenant SaaS application database design
Expected outcome: Schema specifications, migration strategies, performance optimization plans
```

### devagent plan-tasks

**Example 1: Sprint planning breakdown**
```
devagent plan-tasks
Context: 2-week sprint for user dashboard implementation
Expected outcome: Sequenced task list with estimates, dependencies, and acceptance criteria
```

**Example 2: Feature development roadmap**
```
devagent plan-tasks
Context: Complex feature requiring frontend, backend, and database changes
Expected outcome: Detailed implementation plan with milestones, testing requirements, and rollback procedures
```

**Example 3: Technical debt reduction**
```
devagent plan-tasks
Context: Refactoring legacy codebase for maintainability
Expected outcome: Phased migration plan, risk assessment, quality assurance checkpoints
```

### devagent execute-tasks

**Example 1: Code implementation**
```
devagent execute-tasks
Context: Implementing user registration API endpoints
Expected outcome: Complete implementation with tests, documentation updates, and code review
```

**Example 2: Database migration**
```
devagent execute-tasks
Context: Adding new user preferences table and migration scripts
Expected outcome: Schema changes deployed, data migration completed, rollback scripts ready
```

**Example 3: UI component development**
```
devagent execute-tasks
Context: Building responsive navigation component
Expected outcome: Component implemented, styled, tested across devices, integrated into application
```

### devagent document-tech-stack

**Example 1: New project documentation**
```
devagent document-tech-stack
Context: Setting up documentation for React/TypeScript project
Expected outcome: Comprehensive tech stack guide, setup instructions, architecture overview
```

**Example 2: Legacy system analysis**
```
devagent document-tech-stack
Context: Documenting existing monolithic application before modernization
Expected outcome: Technology inventory, dependency analysis, modernization recommendations
```

**Example 3: Framework migration planning**
```
devagent document-tech-stack
Context: Planning migration from AngularJS to React
Expected outcome: Migration roadmap, compatibility analysis, team training requirements
```

### devagent build-agent

**Example 1: Custom workflow creation**
```
devagent build-agent
Context: Creating specialized code review workflow
Expected outcome: Agent prompt designed, integration tested, documentation completed
```

**Example 2: Testing agent development**
```
devagent build-agent
Context: Building automated testing workflow for CI/CD pipeline
Expected outcome: Agent specification, prompt optimization, deployment configuration
```

**Example 3: Documentation agent**
```
devagent build-agent
Context: Creating API documentation generator agent
Expected outcome: Agent template, instruction set, quality validation procedures
```

### devagent deploy-codegen-agent

**Example 1: Background code generation**
```
devagent deploy-codegen-agent
Context: Generating boilerplate code for new microservice
Expected outcome: Codegen agent deployed, monitoring set up, output validation
```

**Example 2: Test case generation**
```
devagent deploy-codegen-agent
Context: Creating comprehensive unit test suites
Expected outcome: Test generation agent active, coverage reports automated
```

**Example 3: Documentation automation**
```
devagent deploy-codegen-agent
Context: Automated API documentation updates
Expected outcome: Documentation agent deployed, integration with codebase monitoring
```

## Workflow Chain Examples

### Simple Enhancement Sequence
**Use case:** Quick feature implementation for existing codebase
```
devagent research-feature → devagent execute-tasks
```
**Example:** Adding dark mode toggle to existing settings page
- Research current theming approach and best practices
- Implement toggle component and theme switching logic

### Standard Feature Development
**Use case:** Developing new feature from concept to deployment
```
devagent research-feature → devagent architect-spec → devagent plan-tasks → devagent execute-tasks
```
**Example:** Building user notification preferences system
- Research notification patterns and user preferences
- Design data models and API endpoints
- Break down into implementable tasks
- Execute development with testing

### Complex Product Development
**Use case:** Major new feature requiring validation and planning
```
devagent create-product-mission → devagent clarify-feature → devagent research-feature → devagent architect-spec → devagent plan-tasks → devagent execute-tasks
```
**Example:** Launching AI-powered code review assistant
- Define product mission and target users
- Validate feature requirements and constraints
- Research AI integration approaches and best practices
- Design system architecture and APIs
- Plan implementation phases
- Execute development with quality assurance

### Innovation and Ideation
**Use case:** Exploring new product directions
```
devagent brainstorm-features → devagent research-feature → devagent architect-spec
```
**Example:** Expanding marketplace platform capabilities
- Generate feature ideas for marketplace enhancements
- Research competitive landscape and user needs
- Design specifications for top-priority features

### Technical Modernization
**Use case:** Upgrading legacy systems
```
devagent document-tech-stack → devagent research-feature → devagent plan-tasks → devagent execute-tasks
```
**Example:** Migrating from monolith to microservices
- Document current technology stack and dependencies
- Research modernization approaches and tools
- Plan migration strategy and phases
- Execute incremental modernization

## Usage Patterns and Best Practices

### Trigger Patterns
- Always use `devagent [workflow-name]` format
- Workflow names are lowercase with hyphens (e.g., `create-product-mission`)
- No hashtags or special characters needed
- Natural language context works best with these triggers

### When to Use Each Workflow
- **create-product-mission**: New products, major pivots, mission clarification
- **clarify-feature**: Incomplete requirements, ambiguous user stories, validation needed
- **brainstorm-features**: Idea generation, solution exploration, feature prioritization
- **research-feature**: Technical unknowns, competitive analysis, best practices
- **architect-spec**: System design, API specification, technical planning
- **plan-tasks**: Sprint planning, complex feature breakdown, dependency mapping
- **execute-tasks**: Code implementation, deployment, testing execution
- **document-tech-stack**: New projects, legacy analysis, technology decisions
- **build-agent**: Custom workflow creation, agent development, prompt engineering
- **deploy-codegen-agent**: Automated code generation, background processing, scaling

### Chain Selection Guidelines
- Simple changes: research-feature → execute-tasks
- New features: research-feature → architect-spec → plan-tasks → execute-tasks
- Major initiatives: create-product-mission → clarify-feature → research-feature → architect-spec → plan-tasks → execute-tasks
- Innovation projects: brainstorm-features → research-feature → architect-spec

### Context Provision
- Provide specific details about your use case
- Include relevant files, user stories, or requirements
- Mention constraints, deadlines, or priorities
- Reference existing code or documentation when available

### Output Expectations
- Each workflow produces specific deliverables (specs, plans, code, documentation)
- Review outputs before proceeding to next workflow in chain
- Use outputs as input context for subsequent workflows
- Log decisions and changes for future reference
