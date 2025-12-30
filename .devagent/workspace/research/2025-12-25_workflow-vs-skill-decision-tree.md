# Workflow vs Skill Decision Tree

Visual decision tree for choosing between DevAgent Workflow and Agent Skill.

## Mermaid Decision Tree

```mermaid
flowchart TD
    Start([Need to create a new capability?]) --> Q1{Does this fit<br/>DevAgent's structured<br/>workflow lifecycle?<br/>research → plan → execute}
    
    Q1 -->|Yes| Q2{Does this produce<br/>artifacts in<br/>.devagent/workspace/?}
    Q1 -->|No| Q6{Is this a standalone<br/>capability that<br/>enhances agent<br/>base functionality?}
    
    Q2 -->|Yes| Q3{Does this need to<br/>coordinate with<br/>other DevAgent<br/>workflows?}
    Q2 -->|No| Q7{Should this be<br/>automatically<br/>discovered by<br/>agents?}
    
    Q3 -->|Yes| Workflow[✅ DevAgent Workflow<br/>.devagent/core/workflows/<br/>Manual invocation<br/>Structured artifacts]
    Q3 -->|No| Q7
    
    Q6 -->|Yes| Q7
    Q6 -->|No| Q8{Is this a domain<br/>knowledge bundle<br/>or reference<br/>material?}
    
    Q7 -->|Yes| Q9{Should this work<br/>across multiple<br/>skills-compatible<br/>platforms?<br/>Cursor, VS Code, GitHub, etc.}
    Q7 -->|No| Q10{Is this still<br/>experimental or<br/>evolving?}
    
    Q8 -->|Yes| Skill[✅ Agent Skill<br/>.codex/skill-name/<br/>SKILL.md format<br/>Auto-discovery<br/>Cross-platform]
    Q8 -->|No| Q10
    
    Q9 -->|Yes| Skill
    Q9 -->|No| Q10
    
    Q10 -->|Yes| Workflow
    Q10 -->|No| Q11{Is this a simple,<br/>frequent action<br/>or quick shortcut?}
    
    Q11 -->|Yes| Workflow
    Q11 -->|No| Skill
    
    Workflow --> End1([Create workflow file:<br/>.devagent/core/workflows/name.md<br/>Create command file:<br/>.agents/commands/name.md<br/>Update workflow roster])
    
    Skill --> End2([Create skill directory:<br/>.codex/skill-name/<br/>Create SKILL.md with<br/>YAML frontmatter<br/>Add scripts/references/assets<br/>Follow agentskills.io spec])
    
    style Workflow fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    style Skill fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style Start fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style End1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style End2 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

## Simplified Quick Reference

```mermaid
flowchart LR
    Start([New Capability]) --> Q1{Fits DevAgent<br/>lifecycle?}
    
    Q1 -->|Yes| Q2{Produces<br/>artifacts in<br/>workspace/?}
    Q1 -->|No| Skill[✅ Agent Skill]
    
    Q2 -->|Yes| Q3{Coordinates with<br/>other workflows?}
    Q2 -->|No| Q4{Auto-discovery<br/>needed?}
    
    Q3 -->|Yes| Workflow[✅ DevAgent Workflow]
    Q3 -->|No| Q4
    
    Q4 -->|Yes| Skill
    Q4 -->|No| Q5{Simple/frequent<br/>action?}
    
    Q5 -->|Yes| Workflow
    Q5 -->|No| Skill
    
    style Workflow fill:#e1f5ff,stroke:#0277bd
    style Skill fill:#fff3e0,stroke:#ef6c00
    style Start fill:#f3e5f5,stroke:#7b1fa2
```

## Decision Criteria Summary

### Choose **DevAgent Workflow** if:
- ✅ Fits DevAgent's structured lifecycle (research → plan → execute)
- ✅ Produces artifacts in `.devagent/workspace/`
- ✅ Coordinates with other DevAgent workflows
- ✅ Simple, frequent actions or shortcuts
- ✅ Still experimental or evolving

### Choose **Agent Skill** if:
- ✅ Standalone capability (not part of DevAgent lifecycle)
- ✅ Should be automatically discovered by agents
- ✅ Domain knowledge bundle or reference material
- ✅ Needs cross-platform portability (Cursor, VS Code, GitHub, etc.)
- ✅ Works better as agent base capability enhancement

## Related Documentation

- Full decision guide: `2025-12-25_workflow-vs-skill-decision-guide.md`
- Agent Skills spec: https://agentskills.io
- DevAgent workflows: `.devagent/core/AGENTS.md`
