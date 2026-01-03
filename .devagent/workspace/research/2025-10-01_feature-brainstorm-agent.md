# Research Packet — Feature Brainstorm Agent Design

- Mode: General
- Requested By: DevAgent Team
- Last Updated: 2025-10-01
- Storage Path: `.devagent/research/2025-10-01_feature-brainstorm-agent.md`
- Stakeholders: DevAgent Team
- Research Topic: What would make an effective Feature Brainstorm Agent for the DevAgent ecosystem

## Request Overview

Research and identify what would make an effective Feature Brainstorm Agent that fits within our existing agent ecosystem (ProductMissionPartner, ResearchAgent, SpecArchitect, TaskPlanner, TaskExecutor, CodegenBackgroundAgent). The goal is to understand where feature brainstorming fits in the current workflow, what capabilities it should have, and what structured outputs would make brainstorm results actionable for downstream agents.

## Research Questions

| ID | Question | Status | Notes |
| --- | --- | --- | --- |
| RQ1 | What are the key capabilities and outputs of effective ideation/brainstorming agents in product development workflows? | Answered | Industry best practices researched |
| RQ2 | Where does feature brainstorming fit in the current workflow (before ProductMissionPartner, between agents, or parallel)? | Answered | Gap identified between mission and research |
| RQ3 | What inputs and triggers should activate a feature brainstorm agent? | Answered | Mission artifacts and problem statements |
| RQ4 | What structured outputs would make brainstorm results actionable for downstream agents? | Answered | Prioritized candidates with evaluation matrix |
| RQ5 | How do leading AI-assisted product development practices handle early-stage feature ideation? | Answered | Multiple sources reviewed |

## Summary

A Feature Brainstorm Agent would fill a critical gap in the current workflow by facilitating **divergent ideation before convergent research and specification**. It should operate at the intersection of mission alignment and formal research, helping teams explore solution spaces, generate feature ideas, and prioritize opportunities before committing to detailed investigation.

## Key Findings

### 1. Workflow Position & Purpose

**Current state:** The workflow jumps from high-level mission (`#ProductMissionPartner`) directly to evidence-based research (`#ResearchAgent → #SpecArchitect`). There's no dedicated divergent thinking phase.

**Ideal placement:**
- **Primary trigger:** After ProductMissionPartner establishes/updates mission, before ResearchAgent investigates specific features
- **Secondary trigger:** Standalone invocation when exploring solutions to known problems or opportunities
- **Output feeds:** ResearchAgent (with prioritized feature candidates), ProductMissionPartner (to refine roadmap)

**Citation:** Current agent roster analysis (`.devagent/agents/`, `README.md`, `AGENTS.md`)

### 2. Core Capabilities from Industry Best Practices

**Essential features identified:**
- **Idea Generation:** Multiple ideation techniques (prompt-based, constraint-based, analogy, SCAMPER, "How Might We" framing)
- **Idea Clustering:** AI-powered grouping of similar concepts to reduce redundancy and identify themes
- **Prioritization Framework:** Structured evaluation against mission metrics, effort estimates, and impact potential
- **Multi-perspective exploration:** Generate ideas from different stakeholder viewpoints (user, developer, business, technical)
- **Context preservation:** Capture rationale, assumptions, and constraints alongside ideas

**Citations:**
- Google Mixboard AI brainstorming approach ([androidcentral.com](https://www.androidcentral.com/apps-software/how-googles-mixboard-is-revolutionizing-creative-brainstorming-with-ai))
- Miro AI collaboration patterns ([miro.com](https://miro.com/ai/brainstorming/))
- AgentText brainstorming techniques ([agentext.com](https://agentext.com/posts/brainstorming-techniques-with-ai/))
- Multi-agent brainstorming patterns ([agentic-patterns.com](https://agentic-patterns.com/patterns/iterative-multi-agent-brainstorming/))

### 3. Structured Outputs for Downstream Agents

To be actionable, brainstorm outputs must be **convergent** (narrowed and prioritized) not just divergent (broad idea generation).

**Required output structure:**
1. **Prioritized Feature Candidates** (top 3-5 ideas ranked by: mission alignment, impact potential, feasibility)
2. **Clustered Idea Themes** (grouped related concepts with common patterns identified)
3. **Evaluation Matrix** (each idea scored against: mission metrics, technical constraints, user impact, effort)
4. **Next Steps** (recommended research questions for #ResearchAgent, spec requirements for #SpecArchitect)
5. **Parking Lot** (lower-priority or future ideas preserved for later consideration)

**Citation:** Design thinking convergent/divergent frameworks

### 4. Integration with Existing System

**Key integration points:**
- **Inputs:** Mission artifacts (`product/mission.md`, `roadmap.md`, `guiding-questions.md`), constitution clauses, recent decision journal entries
- **Outputs:** Brainstorm packet stored in `.devagent/features/_ideation/YYYY-MM-DD_<topic>.md` or `.devagent/product/brainstorms/`
- **Collaboration:** Can invoke or be invoked by `#ProductMissionPartner` for mission validation, feeds prioritized candidates to `#ResearchAgent`
- **Guardrails:** Must respect constitution principles, cite mission alignment, flag ideas requiring mission shifts

**Citation:** DevAgent product mission (`.devagent/product/mission.md`), constitution and memory patterns (`.devagent/memory/`)

### 5. Operating Modes

**Proposed modes (inspired by ResearchAgent's pattern):**
- **Exploratory:** Open-ended ideation from a problem statement or opportunity ("What features could improve X?")
- **Targeted:** Generate solutions for a specific mission gap or user need with defined constraints
- **Expansion:** Take an existing feature concept and generate variations, enhancements, or alternative approaches

**Citation:** ResearchAgent's three-mode pattern (general, spec, task) as precedent

## Detailed Findings

### Industry Best Practices Analysis

Contemporary AI-assisted brainstorming tools emphasize several key patterns:

1. **Multi-technique generation:** Leading tools don't rely on a single ideation method. They combine prompt-based generation, constraint-based creativity, analogical thinking, and systematic frameworks (SCAMPER, "How Might We", etc.) to generate diverse ideas.

2. **Intelligent clustering:** AI algorithms automatically group similar ideas to reduce redundancy and surface themes. This prevents teams from drowning in unstructured lists and helps identify patterns that might not be obvious.

3. **Structured evaluation:** Anonymous voting, ranking frameworks, and scoring matrices ensure unbiased assessment. This is particularly important for avoiding groupthink and ensuring fair consideration of all ideas.

4. **Asynchronous and synchronous modes:** Modern tools support both real-time collaborative sessions and async contribution across time zones, maintaining coherent threads in both cases.

5. **Sentiment and engagement tracking:** Some advanced systems use sentiment analysis to understand participant engagement and emotional responses, though this may be overkill for DevAgent's developer-centric use case.

**Sources:**
- [Miro AI brainstorming features](https://miro.com/ai/brainstorming/) — real-time collaboration, idea clustering
- [Taskade AI brainstorming agents](https://www.taskade.com/generate/ai/brainstorming-assistant-agent) — customizable agent behaviors
- [Conversational Swarm Intelligence](https://arxiv.org/abs/2412.14205) — real-time collaborative deliberation (published 2024)

### Gap Analysis in Current DevAgent Workflow

The current agent sequence is optimized for execution but has a "cold start" problem at the feature ideation phase:

**Current flow:**
```
ProductMissionPartner (mission updates) 
  → ResearchAgent (evidence gathering for KNOWN features)
    → SpecArchitect (spec drafting)
      → TaskPlanner (implementation planning)
        → TaskExecutor (code)
```

**Missing step:** 
There's no structured process for generating feature candidates from mission goals. Teams must arrive at ResearchAgent with a feature already in mind, but where does that initial idea come from? This gap likely leads to:
- Ad-hoc, unstructured ideation
- Bias toward obvious solutions
- Missed opportunities for creative alternatives
- Inconsistent evaluation of ideas against mission

**Proposed enhanced flow:**
```
ProductMissionPartner (mission updates)
  → [NEW] FeatureBrainstormAgent (generate & prioritize feature candidates)
    → ResearchAgent (evidence gathering for TOP candidates)
      → SpecArchitect (spec drafting)
        → TaskPlanner (implementation planning)
          → TaskExecutor (code)
```

### DevAgent-Specific Design Considerations

Given DevAgent's principles and target users (engineering teams at Lambda Curry), the brainstorm agent should:

1. **Be mission-grounded:** Every idea must be evaluated against the established mission metrics in `product/mission.md`. This prevents scope creep and ensures alignment.

2. **Produce research-ready outputs:** Unlike general brainstorming tools, DevAgent's brainstorm agent should format outputs to feed directly into ResearchAgent. This means including:
   - Formulated research questions for each candidate
   - Evidence gaps that need investigation
   - Clear success criteria tied to mission metrics

3. **Maintain traceability:** Ideas should be linked to specific mission problems, user needs, or strategic opportunities documented in the system.

4. **Respect lightweight governance:** Per DevAgent's principles, executing developers have standing approval to run brainstorm sessions. Results are logged but don't require approval gates before proceeding.

5. **Support solo operation:** While the agent could facilitate team sessions, it should work effectively for individual developers exploring ideas, matching DevAgent's current agent interaction model.

## Implications for Implementation

### Recommended Agent Design

#### Mission Statement
**Primary goal:** Facilitate structured ideation sessions that generate, cluster, and prioritize feature candidates aligned with the product mission, providing actionable inputs for research and specification work.

**Boundaries:** Do not conduct evidence-based research (that's #ResearchAgent), draft specs (that's #SpecArchitect), or commit roadmap changes (that's #ProductMissionPartner). Focus on creative exploration and prioritization.

**Success signals:** Sessions produce 3-5 prioritized feature candidates with clear next steps, ideas align with mission metrics, and downstream agents can proceed without re-scoping.

#### Key Differentiators for DevAgent Context
1. **Mission-grounded ideation:** Every idea evaluated against established mission metrics and constitution clauses
2. **Research-ready outputs:** Brainstorm results include formulated research questions for #ResearchAgent
3. **Traceable rationale:** Ideas linked to specific mission problems, user needs, or strategic opportunities
4. **Lightweight governance:** Brainstorms logged but don't block workflow; executing developer has approval to run sessions immediately

#### Suggested Workflow
1. **Kickoff:** Confirm brainstorm topic, mode (exploratory/targeted/expansion), mission context, and constraints
2. **Divergent phase:** Generate 15-30 ideas using multiple techniques (prompts, analogies, inversions, constraints)
3. **Clustering:** Group similar ideas, identify themes, reduce redundancy
4. **Convergent phase:** Evaluate against mission metrics, technical feasibility, and impact potential
5. **Prioritization:** Rank top 3-5 candidates with scoring rationale
6. **Package outputs:** Create brainstorm packet with prioritized candidates, evaluation matrix, research questions, and parking lot
7. **Hand-off:** Log in decision journal, update roadmap considerations, queue research tasks for priority candidates

### Storage Strategy

**Recommendation:** Create a new directory for brainstorm outputs that don't yet have feature slugs:

```
.devagent/product/brainstorms/
  YYYY-MM-DD_<topic>.md
```

This placement makes sense because:
- Brainstorms are product-level activities (like mission, roadmap, guiding-questions)
- They happen before features are formally kicked off
- They inform roadmap decisions
- Once a brainstormed idea becomes a formal feature, it gets its own task hub

**Alternative:** Use `.devagent/features/_ideation/` if you prefer keeping all feature-related work under features.

## Risks & Open Questions

| Item | Type | Owner | Mitigation / Next Step | Due |
| --- | --- | --- | --- | --- |
| Collaborative vs. Solo sessions | Question | DevAgent Team | Clarify whether agent should facilitate multi-person sessions or focus on single-developer ideation | TBD |
| Idea source integration | Question | DevAgent Team | Determine if agent should integrate external inputs (user feedback, competitive analysis) beyond AI generation | TBD |
| Frequency & triggers | Question | DevAgent Team | Define when brainstorms happen: scheduled/recurring vs. on-demand | TBD |
| Evaluation criteria customization | Question | DevAgent Team | Decide if teams can customize scoring framework or should use standard mission metrics | TBD |
| Integration with guiding-questions.md | Question | DevAgent Team | Clarify if brainstorm insights should auto-update open follow-ups when they address existing gaps | TBD |
| Directory structure | Decision | DevAgent Team | Choose between `.devagent/product/brainstorms/` vs `.devagent/features/_ideation/` | TBD |

## Recommended Follow-ups

1. **For #SpecArchitect:** Draft a Feature Brainstorm Agent spec incorporating the mission statement, workflow, and output structure outlined in this research

2. **For #ProductMissionPartner:** Validate whether brainstorming fits current team cadences and clarify multi-person vs. solo session expectations

3. **For repository structure:** Decide on storage location and create directory if approved

4. **For #ResearchAgent:** Define handoff protocol—how should prioritized brainstorm candidates trigger research mode (automatic queueing vs. manual invocation)?

5. **Create brainstorm packet template:** Develop a structured template similar to research-packet-template.md for consistent brainstorm outputs

## Sources

### Internal Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| `.devagent/agents/ResearchAgent.md` | Agent brief | 2025-10-01 | Research workflow patterns and modes |
| `.devagent/agents/ProductMissionPartner.md` | Agent brief | 2025-10-01 | Mission alignment and workshop facilitation |
| `README.md` | Documentation | 2025-10-01 | Agent ecosystem and workflow sequence |
| `.devagent/product/mission.md` | Product artifact | 2025-09-29 | Current mission metrics and success criteria |
| `.devagent/product/guiding-questions.md` | Product artifact | 2025-09-29 | Open questions and follow-ups |
| `.devagent/features/README.md` | Documentation | 2025-10-01 | Feature hub patterns and storage conventions |

### External Sources
| Reference | Type | Freshness | Access Notes |
| --- | --- | --- | --- |
| [Google Mixboard AI brainstorming](https://www.androidcentral.com/apps-software/how-googles-mixboard-is-revolutionizing-creative-brainstorming-with-ai) | Article | 2024-2025 | AI-powered idea generation and refinement |
| [Miro AI brainstorming features](https://miro.com/ai/brainstorming/) | Product docs | 2024-2025 | Idea clustering and collaborative organization |
| [AgentText brainstorming techniques](https://agentext.com/posts/brainstorming-techniques-with-ai/) | Blog post | 2024-2025 | Voting, prioritization, sentiment analysis |
| [Iterative multi-agent brainstorming patterns](https://agentic-patterns.com/patterns/iterative-multi-agent-brainstorming/) | Design patterns | 2024-2025 | Multi-agent collaboration for idea generation |
| [Taskade AI brainstorming agents](https://www.taskade.com/generate/ai/brainstorming-assistant-agent) | Product docs | 2024-2025 | Customizable agent behaviors |
| [Conversational Swarm Intelligence](https://arxiv.org/abs/2412.14205) | Research paper | Dec 2024 | Real-time collaborative deliberation methods |

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2025-10-01 | Initial research packet created | DevAgent Team |

