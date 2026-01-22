---
description: Comprehensive guidelines for creating and maintaining high-quality Cursor rules that the AI can follow reliably.
fileMatching: ".cursor/rules/*.mdc"
alwaysApply: false
---

# Cursor Rules Best Practices Guide

## 🎯 Purpose & Scope
- **Align rules to real team workflows** so the AI "gets" the project
- **Standardize structure, content quality, and maintenance practices** across all rule files
- **Keep rules actionable, concise, and backed by examples** from this repo
- **Ensure continuous improvement** through structured maintenance processes

## 📋 Required Rule Structure

### Frontmatter Template
```markdown
---
description: Clear, one-line description of what the rule enforces
globs: path/to/files/*.ext, other/path/**/*
alwaysApply: boolean
---

# Rule Title

## 🎯 Context & Problem
- What problem does this rule solve?
- Where does it apply in the codebase?

## ✅ DO
- Concrete examples with explanations
- Real code from this repo when possible

## ❌ DON'T
- Anti-patterns with clear explanations
- Deprecated approaches marked explicitly

## 🔍 Verification
- Commands to run
- Files to check
- Lints to validate
```

## 🏷️ Rule Types and When to Use Them

### **Always** (alwaysApply: true)
- **Foundational rules**: Framework/language guidelines that apply everywhere
- **Security patterns**: Authentication, validation, file upload constraints
- **Performance essentials**: Caching, streaming, optimization patterns
- **Keep concise**: Max 200 lines, focus on core principles

### **Auto-attached** (specific globs)
- **File-pattern matching**: Routes, tests, components, API files
- **Framework-specific**: React Router v7, Remix patterns, testing files
- **Role-based**: Backend vs frontend vs testing workflows
- **Context-aware**: Different rules for different file types

### **Agent-requested** (alwaysApply: false)
- **Contextual rules**: Fetched when AI explicitly queries for them
- **Specialized knowledge**: Complex patterns, migration guides
- **Cross-cutting concerns**: Architecture decisions, design patterns

### **Manual** (ad hoc attachment)
- **One-off contexts**: Unusual situations, temporary fixes
- **Prefer brevity**: Keep to essential information only
- **Clear scope**: Explain when and why to use

## 🏗️ Structure & Organization

### **Frontmatter Requirements**
- **Always include**: `description`, `globs`, and `alwaysApply`
- **Clear descriptions**: One-line summary of what the rule enforces
- **Specific globs**: Target exact file patterns, avoid overly broad matches
- **Logical alwaysApply**: Only true for foundational, universal rules

### **Consistent Formatting**
- **Clear headings**: Use emoji prefixes for visual scanning
- **Concise bullets**: Focus on actionable items
- **Language-tagged code blocks**: Always specify language for syntax highlighting
- **Consistent markdown**: Use same patterns across all rules

### **Modular File Organization**
```
.cursor/rules/
├── README.md                    # This guide + rule index
├── workspace.mdc               # Project-specific patterns
├── architecture.mdc           # System design principles
├── backend.mdc                 # API, services, database (Drizzle ORM patterns)
├── frontend.mdc                # Components, routes, UI
├── testing-unit.mdc            # Unit testing patterns
├── testing-integration.mdc     # Integration testing
├── testing-e2e.mdc             # End-to-end testing
└── migration-guides.mdc        # Framework upgrades, refactoring
```

### **Cross-linking Strategy**
- **Reference related rules**: Use `[filename](mdc:path/to/file)` syntax
- **Avoid duplication**: Link instead of copying content
- **Maintain relationships**: Keep cross-references updated

## 📝 Content Best Practices

### **High-Level Context First**
- **Problem statement**: What specific issue does this rule address?
- **Scope definition**: Where in the codebase does it apply?
- **Workflow alignment**: How does it match team practices?

### **Essential Elements**
- **Required imports**: Always show exact import statements
- **SDK/gateway usage**: Version-specific patterns and configurations
- **Error handling**: Consistent patterns for success/failure cases
- **Naming conventions**: Clear examples of good vs. bad naming
- **Security constraints**: File upload limits, validation rules, auth patterns

### **Example Quality Standards**
- **Real code from this repo**: Ground examples in actual codebase
- **DO/DON'T pairs**: Show correct and incorrect approaches side-by-side
- **Contextual explanations**: Why this pattern works, not just how
- **Edge case handling**: Cover common mistakes and gotchas

### **Deprecation Management**
- **Mark deprecated patterns**: Use `❌ DEPRECATED` labels
- **Migration paths**: Show how to update from old to new patterns
- **Version-specific guidance**: Note which versions are affected
- **Timeline awareness**: When will deprecated patterns be removed?

### **Verification Steps**
- **Commands to run**: Specific CLI commands for validation
- **Files to check**: Which files should be examined
- **Lints to validate**: Biome, TypeScript, test commands
- **Success criteria**: How to know the rule is being followed

## 💻 Code Example Standards

### **Language-Specific Blocks**
```typescript
// ✅ DO: Strong TypeScript with explicit exports and descriptive names
export interface BudgetSummaryProps { 
  total: number; 
  currency?: string;
}

export const BudgetSummary = ({ total, currency = 'USD' }: BudgetSummaryProps) => {
  return <div>{total.toLocaleString('en-US', { style: 'currency', currency })}</div>;
};

// ❌ DON'T: Vague names, implicit any, default exports without reason
export default function Comp(p) { return <div>{p.t}</div>; }
```

### **Comment Standards**
- **Explain the "why"**: Not just what the code does, but why this approach
- **Highlight key patterns**: Point out important conventions
- **Show alternatives**: When multiple approaches exist, explain trade-offs

## 🏷️ Effective Rule Categories

### **Framework-Specific Rules**
- **React Router v7**: Route configuration, type imports, data loading patterns
- **Remix patterns**: Form handling, progressive enhancement, error boundaries
- **AI SDK integration**: Gateway usage, streaming, file upload constraints
- **Lambda Curry Forms**: Form validation, error display, accessibility

### **Language & Conventions**
- **TypeScript strict mode**: No `any`, explicit types, interface patterns
- **Naming standards**: camelCase functions, PascalCase components, kebab-case files
- **Import organization**: External → workspace → internal, grouped with blank lines

### **Architecture Patterns**
- **Module organization**: Services, repositories, utilities separation
- **API design**: RESTful patterns, error responses, authentication
- **Database patterns**: Query optimization, migration strategies
- **Cross-cutting concerns**: Logging, monitoring, security

### **Security & Performance**
- **Authentication**: Session management, role-based access, token validation
- **File uploads**: Size limits, type validation, no persistence of sensitive data
- **Performance**: Memoization, streaming, caching strategies
- **Validation**: Input sanitization, schema validation, error handling

### **Testing Strategies**
- **Unit testing**: Component isolation, mock strategies, assertion patterns
- **Integration testing**: API endpoints, database interactions, authentication flows
- **E2E testing**: User workflows, cross-browser compatibility, performance testing
- **Test organization**: File structure, naming conventions, setup/teardown

### **Development Workflow**
- **Git practices**: Commit messages, branch naming, PR templates
- **CI/CD patterns**: Build steps, test execution, deployment strategies
- **Type generation**: React Router v7 typegen, schema generation
- **Code quality**: Linting rules, formatting standards, review checklists

## 📊 Granularity vs. Grouping Strategy

### **When to Split Rules**
- **File patterns differ**: Routes vs. components vs. API files
- **Framework variations**: React Router vs. Remix vs. testing frameworks
- **Developer roles**: Backend vs. frontend vs. testing workflows
- **Rule size**: > 500 lines becomes unwieldy
- **Distinct contexts**: Components vs. API vs. database patterns

### **When to Group Rules**
- **Closely related patterns**: Same file types, similar workflows
- **Shared principles**: Common architectural decisions
- **Small rule sets**: < 100 lines, focused scope
- **Same globs**: Target the same file patterns

### **Recommended Testing Split**
```
.cursor/rules/
├── testing-unit.mdc        # Component isolation, mocking, assertions
├── testing-integration.mdc # API endpoints, database, authentication
└── testing-e2e.mdc         # User workflows, cross-browser, performance
```

**Why split testing?**
- Different file patterns and tools
- Distinct developer workflows
- Specific best practices (mocking vs. real DBs vs. user interactions)

## ⚠️ What to Avoid

### **Structural Anti-Patterns**
- **Missing frontmatter**: No description, globs, or alwaysApply
- **Unclear bullets**: Vague or ambiguous guidance
- **Inconsistent formatting**: Mixed markdown styles across rules
- **Single giant files**: Monolithic rules that try to cover everything
- **Poor organization**: No logical grouping or cross-references

### **Content Anti-Patterns**
- **Vague guidance**: "Use good practices" without specifics
- **No examples**: Rules without concrete code samples
- **Outdated patterns**: References to deprecated APIs or old versions
- **Mixed framework versions**: Conflicting guidance in same rule
- **No verification criteria**: No way to validate compliance

### **Technical Pitfalls**
- **Unmarked deprecated APIs**: Old patterns without clear migration paths
- **Ignoring security**: Missing authentication, validation, or file upload constraints
- **Performance blind spots**: No guidance on optimization or caching
- **Testing as afterthought**: Treating tests as optional rather than essential
- **Framework confusion**: Mixing React Router v6 and v7 patterns

## ✅ Verification Checklist

### **Rule Structure Validation**
- **Frontmatter complete**: description, globs, alwaysApply all present
- **Clear scope**: What problem it solves, where it applies
- **DO/DON'T examples**: Grounded in actual codebase, not theoretical
- **Cross-references**: Links to related rules using `[file](mdc:path)` syntax
- **Verification steps**: Commands to run, files to check, lints to validate
- **Deprecation handling**: Clear migration paths for outdated patterns

### **Content Quality Checks**
- **Real examples**: Code samples from `apps/ralph-monitoring` when possible
- **Contextual explanations**: Why patterns work, not just how
- **Edge case coverage**: Common mistakes and gotchas addressed
- **Version specificity**: Framework versions clearly stated
- **Security awareness**: Authentication, validation, file upload constraints

### **Technical Accuracy**
- **Framework alignment**: React Router v7, not v6 patterns
- **Type safety**: TypeScript strict mode compliance
- **Performance considerations**: Caching, streaming, optimization patterns
- **Testing integration**: Unit, integration, and E2E patterns covered

## 🔄 Maintenance & Continuous Improvement

### **Update Triggers**
- **New patterns emerge**: Team adopts new approaches or libraries
- **Framework updates**: React Router, Remix, or other core dependencies change
- **Security requirements**: New authentication or validation patterns needed
- **Performance issues**: Optimization patterns discovered
- **Testing improvements**: New testing strategies or tools adopted

### **Content Maintenance**
- **Prefer real examples**: Use actual code from `apps/ralph-monitoring` over theoretical snippets
- **Regular pruning**: Remove outdated content and consolidate duplicates
- **Version tracking**: Note when patterns become deprecated
- **Team feedback**: Incorporate developer experiences and pain points

### **Quality Assurance Process**
- **Test with diverse prompts**: Ensure rules work across different scenarios
- **Validate deprecated warnings**: Confirm migration paths are clear
- **Address ambiguous instructions**: Clarify vague or conflicting guidance
- **Monitor generated code**: Check that AI follows rules consistently
- **Collect team feedback**: Regular input from developers using the rules

## 🏢 Workspace-Specific Alignment

### **React Router v7 Type Safety**
```typescript
// ✅ DO: Always import Route types from ./+types/[routeName]
import type { Route } from './+types/product-details';

export async function loader({ params }: Route.LoaderArgs) {
  // params.id is automatically typed based on route pattern
  return { product: await getProduct(params.id) };
}

// ❌ DON'T: Manual type construction or relative imports
import type { Route } from '../+types/product-details'; // wrong path
```

### **Error Handling Patterns**
```typescript
// ✅ DO: Use throw data() for expected errors
import { data } from 'react-router';

export async function loader({ params }: Route.LoaderArgs) {
  const user = await getUser(params.id);
  if (!user) {
    throw data('User not found', { status: 404 });
  }
  return { user };
}

// ❌ DON'T: Manual error responses
return new Response('User not found', { status: 404 });
```

## 📝 Example: Minimal High-Quality Rule

```markdown
---
description: Enforce React Router v7 route type imports and type generation workflow
globs: apps/ralph-monitoring/app/routes/**/*.tsx
alwaysApply: false
---

# React Router v7 Type Safety

## 🎯 Context & Problem
- Route type imports must use relative paths to generated types
- Type generation required after route changes
- Prevents TypeScript errors and ensures type safety

## ✅ DO
```typescript
import type { Route } from './+types/product';
export async function loader({ params }: Route.LoaderArgs) { 
  return { product: await getProduct(params.id) };
}
```

## ❌ DON'T
```typescript
import type { Route } from '../+types/product'; // wrong path
import type { Route } from '../../+types/product'; // wrong path
```

## 🔍 Verification
- Run: `bun run typecheck`
- Ensure no missing `./+types/*` import errors
- Check that route parameters are properly typed

## 📚 Related Rules
- [react-router-7.mdc](mdc:.cursor/rules/react-router-7.mdc) - Complete React Router v7 patterns
- [testing-best-practices.mdc](mdc:.cursor/rules/testing-best-practices.mdc) - Route testing strategies
```

## 🚀 Authoring Flow (Step-by-Step)

### **1. Draft with Frontmatter**
- Start with clear description and appropriate globs
- Choose `alwaysApply` based on rule scope
- Keep initial scope focused and specific

### **2. Add Content Structure**
- **Context first**: What problem does this solve?
- **Concise bullets**: Focus on actionable items
- **DO/DON'T code**: Show correct and incorrect approaches
- **Cross-link related rules**: Build knowledge network

### **3. Add Verification & Deprecation**
- **Verification steps**: Commands to run, files to check
- **Deprecation notices**: Clear migration paths for outdated patterns
- **Success criteria**: How to know the rule is working

### **4. Test and Iterate**
- **Test with realistic prompts**: Ensure rules work across scenarios
- **Keep initial files small**: Split as content grows
- **Adjust for clarity**: Refine based on usage patterns

## 🎯 Quality Bar (TL;DR)

### **Core Principles**
- **Explicit over implicit**: Clear, unambiguous guidance
- **Examples over prose**: Show, don't just tell
- **Consistency over cleverness**: Standard patterns work better
- **Maintained over forgotten**: Regular updates and pruning

### **Success Metrics**
- **AI follows rules consistently**: Generated code matches patterns
- **Developer adoption**: Team uses patterns without confusion
- **Reduced errors**: Fewer TypeScript, linting, or runtime issues
- **Faster development**: Less time spent on boilerplate or debugging

### **Continuous Improvement**
- **Monitor AI output**: Check that generated code follows rules
- **Collect feedback**: Regular input from developers
- **Update patterns**: Incorporate new approaches and framework changes
- **Prune outdated content**: Remove deprecated or conflicting guidance
