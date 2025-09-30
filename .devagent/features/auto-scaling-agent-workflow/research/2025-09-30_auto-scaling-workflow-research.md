# Auto-Scaling Agent Workflow Research

- **Date**: 2025-09-30
- **Mode**: Spec Research
- **Related Spec**: `.devagent/features/auto-scaling-agent-workflow/spec/2025-09-30_auto-scaling-agent-workflow.md`
- **Researcher**: #ResearchAgent (Jake Ruesink)
- **Related Clauses**: C1, C2, C3

## Research Questions

### Q1: What patterns exist for auto-scaling complexity in AI agent systems?
**Finding**: Recent research in agentic AI systems emphasizes self-discovering workflows over static routing. Key patterns include:

1. **RobustFlow Framework** (arXiv:2509.21834, Sept 2025)
   - Addresses workflow consistency and robustness through preference optimization
   - Teaches models invariance to instruction variations
   - Key insight: Workflows should remain stable despite semantic variations in input
   - Implication: Our risk triggers should be semantic-based, not syntax-based

2. **GraphScout Self-Discovery** (OrKA-reasoning framework, Sept 2025)
   - Replaces static routers with intelligent path discovery
   - System explores graph structure and decides dynamically based on context
   - Key insight: "An intelligent workflow should not just follow pre-written instructions, it should explore the structure around it and decide where to go"
   - Implication: Agents should query their context graph (codebase impact, dependencies) to self-assess

3. **Hierarchical Supervisor Patterns** (CrewAI/Gemini frameworks, Sept 2025)
   - Coordinated multi-agent workflows with supervisor layer
   - Adaptive delegation based on task complexity
   - Implication: Consider a lightweight supervisor pattern that assesses complexity before delegation

**Citation**:
- RobustFlow: https://arxiv.org/abs/2509.21834
- GraphScout: https://dev.to/marcosomma/graphscout-self-discovering-paths-in-orka-348k
- Hierarchical Supervisor: https://www.marktechpost.com/2025/09/30/a-coding-guide-to-build-a-hierarchical-supervisor-agent-framework-with-crewai-and-google-gemini-for-coordinated-multi-agent-workflows/

### Q2: How do systems implement risk-based escalation effectively?
**Finding**: Risk-based escalation patterns in production AI systems emphasize:

1. **Behavioral Baselining** (Adaptive Cybersecurity Architecture, arXiv:2509.20640)
   - Systems establish baselines then detect deviations
   - Dynamic learning and context-aware decision making
   - Real-time anomaly detection triggers escalation
   - Implication: Agents could establish baselines (e.g., "single-file changes are typical") and escalate on deviations

2. **Decentralized Risk Scoring**
   - Each component maintains local risk scores
   - Federated threat intelligence sharing
   - Implication: Each agent maintains its own risk assessment logic rather than centralized classifier

3. **Escalation Predictor Patterns** (Relevance AI, 2025)
   - AI-driven escalation prediction based on context signals
   - Real-time assessment of when human intervention needed
   - Implication: Similar pattern for when upstream agents are needed

**Citation**:
- Adaptive Cybersecurity: https://arxiv.org/abs/2509.20640
- Escalation Predictor: https://relevanceai.com/agent-templates-tasks/escalation-predictor

### Q3: What are the current pain points with our existing agent structure?
**Finding**: Analysis of current agent prompts reveals:

1. **Minimal Team-Structure Assumptions** (Good news!)
   - Review of ResearchAgent.md and SpecArchitect.md shows they already avoid heavy stakeholder language
   - ResearchAgent: References "executing developer" as default, only mentions "required reviewers when needed"
   - SpecArchitect: Notes "mandatory reviewers only when the work demands them"
   - **No action needed**: Current agents already align with solo-dev-first principle

2. **Current Classification Burden**
   - AGENTS.md line 11 still references "simple enhancements" vs "complex features"
   - This is the only place that enforces upfront classification
   - **Action needed**: Update AGENTS.md to remove simple/complex language

3. **Implicit Handoff Assumptions**
   - Agent guides assume linear handoffs (Research → Spec → Plan → Execute)
   - No documented pattern for skipping agents or mid-stream escalation
   - **Action needed**: Add "Should I run?" logic and escalation patterns

**Citation**: Internal codebase analysis of `.devagent/agents/*.md`

### Q4: What risk triggers objectively indicate when each agent should run?
**Finding**: Synthesizing from existing agent missions and industry patterns:

**ResearchAgent Triggers**:
- ✅ NEW: Technology/pattern not present in codebase (detectable via codebase search)
- ✅ NEW: Compliance/security/regulatory keywords present
- ✅ NEW: Explicit "research" or "investigate" in request
- ✅ EXISTING: Evidence gaps flagged by spec
- 🚫 SKIP: Routine maintenance, existing patterns, context already provided

**SpecArchitect Triggers**:
- ✅ NEW: Changes affect >3 files (quantifiable via git impact analysis)
- ✅ NEW: Database schema changes or migrations (keyword detection)
- ✅ NEW: Public API design (irreversible decisions)
- ✅ NEW: Cross-system boundaries (multiple directories/services touched)
- ✅ EXISTING: Compliance/security requirements
- ✅ EXISTING: Research output flags high-impact unknowns
- 🚫 SKIP: Single-file changes, isolated bug fixes, reversible work

**TaskPlanner Triggers**:
- ✅ NEW: Spec has >5 acceptance criteria (quantifiable)
- ✅ NEW: External dependencies or sequencing constraints mentioned
- ✅ NEW: Multi-phase or staged rollout required
- ✅ NEW: Parallel work streams mentioned
- 🚫 SKIP: Straightforward single-phase work, single implementation session

**TaskExecutor Triggers**:
- ✅ ALWAYS: Default endpoint, adapts to available context

**Evidence**: These triggers are:
1. Objective (mostly quantifiable or keyword-detectable)
2. Risk-correlated (align with Constitution C3 delivery principles)
3. Solo-dev friendly (no coordination overhead)

### Q5: How does the superseded "Simple vs Complex" spec compare?
**Finding**: Analysis of `.devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md`:

**Key Differences**:
1. **User Choice vs Auto-Detection**
   - Old: User explicitly classifies work as Simple or Complex upfront
   - New: System auto-detects based on risk triggers
   - Why better: Eliminates cognitive load and meta-decisions

2. **Two Lanes vs Single Entry**
   - Old: Separate Simple and Complex workflows with different artifact requirements
   - New: One workflow, agents self-skip based on triggers
   - Why better: Simpler mental model, no path selection

3. **Classification Rigidity vs Dynamic Escalation**
   - Old: Reclassification requires explicit escalation process
   - New: Agents can invoke other agents mid-stream naturally
   - Why better: Work adapts to emerging complexity without ceremony

4. **Shared Principles** (Good to preserve):
   - Both emphasize solo developer as default
   - Both require objective triggers for rigor
   - Both document escalation paths
   - Both track decisions for auditability

**Recommendation**: The auto-scaling approach is superior. Supersede the simple-vs-complex spec as planned.

**Citation**: `.devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md`

## Key Findings Summary

1. **Pattern Validation**: Industry trends strongly support self-discovering, adaptive workflows over static classification (RobustFlow, GraphScout, Hierarchical Supervisor patterns all converge here)

2. **Risk Triggers Are Quantifiable**: We can implement objective, measurable triggers for most decisions:
   - File count (for spec invocation)
   - Keyword detection (for research/security escalation)
   - Acceptance criteria count (for planning invocation)
   - Codebase pattern presence (for research invocation)

3. **Current Agents Are Ready**: Minimal changes needed to existing agent prompts—they already avoid heavy ceremony

4. **Self-Assessment Logic Pattern**:
   ```
   1. Parse request for trigger keywords/patterns
   2. Query context (codebase, dependencies, scope)
   3. Evaluate against risk trigger checklist
   4. Log decision rationale
   5. Skip (pass context forward) OR invoke (run full workflow)
   ```

## Implications for Spec

### Strengths to Preserve
- ✅ Single entry point concept
- ✅ Risk-driven escalation model
- ✅ Solo-dev-first assumptions
- ✅ Decision tree visualization
- ✅ Meta-workflow example (DevAgent working on itself)

### Enhancements Recommended

1. **Add Self-Assessment Pattern Section**
   - Document the common pattern all agents use
   - Make it reusable across agent prompts
   - Include example pseudo-code

2. **Quantify Risk Triggers**
   - Make triggers more concrete and measurable where possible
   - Add examples of what matches/doesn't match each trigger
   - Consider automation potential (e.g., git stats for file count)

3. **Add Mid-Stream Escalation Protocol**
   - Document how agents invoke other agents mid-execution
   - Define context handoff format
   - Log escalation rationale template

4. **Clarify Override Mechanism**
   - How do developers manually invoke agents when auto-assessment says skip?
   - Make it explicit and low-friction

5. **Add Baseline Metrics Collection**
   - Current spec mentions "baseline: current cycle time TBD"
   - Recommend capturing before/after metrics:
     * Time from request to first code commit
     * Number of agents invoked per request type
     * Escalation rate (% of lightweight paths that escalate)
     * Developer satisfaction with auto-assessment accuracy

6. **Reference Industry Patterns**
   - Add appendix linking to RobustFlow, GraphScout patterns
   - Strengthens rationale for approach
   - Provides validation from broader AI agent community

## Open Questions

1. **Q: How do we handle false negatives (agent skips when it shouldn't)?**
   - A: Start conservative (lower thresholds), monitor escalation patterns, tune triggers based on feedback
   - Mitigation: Always allow manual invocation as escape hatch

2. **Q: What's the context handoff format between agents?**
   - A: Recommend lightweight JSON/YAML structure with:
     * Request summary
     * Trigger evaluation results
     * Context links (files, specs, research)
     * Decision log

3. **Q: Should we log every skip decision?**
   - A: Yes for first 30 days to validate auto-assessment
   - Then reduce to logging only when triggers were close to threshold

4. **Q: How do we prevent "shadow complexity" (work that seems simple but isn't)?**
   - A: Mid-stream escalation handles this—any agent can pause and invoke upstream
   - Monitor escalation rate as key metric

## Recommendations for Phase 1

1. **Update AGENTS.md**:
   - Remove simple/complex classification language
   - Add "How Agents Self-Determine" section
   - Document risk triggers per agent

2. **Create Self-Assessment Template**:
   - Reusable prompt section for all agents
   - Include the 5-step pattern documented above
   - Make it copy-pasteable into agent guides

3. **Update Agent Prompts** (priority order):
   - ResearchAgent.md: Add self-assessment logic section
   - SpecArchitect.md: Add self-assessment logic section  
   - TaskPlanner.md: Add self-assessment logic section
   - TaskExecutor.md: Document adaptive behavior based on input

4. **Document Escalation Pattern**:
   - Create `.devagent/governance/escalation-protocol.md`
   - Define context handoff format
   - Include logging template

5. **Set Up Metrics Collection**:
   - Define baseline measurement period (recommend 2 weeks)
   - Track: cycle time, agent invocations, escalations, satisfaction
   - Document in spec's "Baseline metrics missing" risk item

## Related Artifacts

- `.devagent/features/auto-scaling-agent-workflow/spec/2025-09-30_auto-scaling-agent-workflow.md`
- `.devagent/features/simple-vs-complex-feature-workflows/spec/2025-09-30_simple-vs-complex-feature-workflows.md`
- `.devagent/agents/ResearchAgent.md`
- `.devagent/agents/SpecArchitect.md`
- `.devagent/agents/TaskPlanner.md`
- `.devagent/agents/TaskExecutor.md`
- `AGENTS.md`

## Freshness Notes

- External research: Sept 2025 (current month, highly fresh)
- Internal codebase analysis: Sept 30, 2025 (today, maximally fresh)
- Pattern recommendations: Based on latest industry trends and current codebase state
- Next refresh: Recommended after Phase 1 implementation (approx 2 weeks)

## Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2025-09-30 | Initial research packet for auto-scaling workflow spec | #ResearchAgent (Jake Ruesink) |

