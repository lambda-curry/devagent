# Guiding Questions & Answers

Log each mission workshop prompt here along with the timestamp, respondent, and distilled answer. Use this list to show progress and identify which areas still need clarity.

## Captured Responses

| Date | Prompt | Summary of Answer | Follow-up Needed |
|------|--------|-------------------|------------------|
| 2025-09-29 | What single sentence describes the product we are building right now? | A reusable suite of agentic prompts that teams can plug into their AI tools to ship faster, higher-quality code aligned to shared missions and specs. | No |
| 2025-09-29 | Who will feel the biggest impact, and how do we know they need it? | Engineering managers at Lambda Curry with teams that have uneven AI skills; they are actively searching for dependable AI workflows to boost output and quality. | No |
| 2025-09-29 | Which pains are most urgent, and what proof points back that up? | AI prompting feels unstructured and slow, so engineers default to old habits and context never compounds into reusable knowledge. | Capture workflow frictions from current projects |
| 2025-09-29 | Why is solving this problem timely, and what changes if we wait? | Waiting six to twelve months risks falling behind peers adopting AI-first development and losing competitive advantage with clients. | No |
| 2025-09-29 | What differentiates our approach from existing workflows or tools? | Combines builder-style agent OS practices and GitHub Spec Kit concepts, tuned for Lambda Curry so teams can adopt agents incrementally. | Highlight concrete examples of differentiation |
| 2025-09-29 | How will we measure success in the next 30, 90, and 180 days? | 30: founders use prompts daily and onboard one teammate; 90: sticky team adoption with positive feedback; 180: prompts become indispensable for new projects. | Define measurement signals |

## Open Follow-ups

Track unanswered or partially answered prompts here so the next workshop can focus on the highest-impact gaps.

| Date Logged | Question | Current Insight / Blocker | Owner / Next Step |
|-------------|----------|---------------------------|-------------------|
| 2025-09-28 | What minimal agent execution harness best balances simplicity and flexibility for contributors? | Need to compare lightweight CLI orchestration vs. hosted runners. | TBD - evaluate prototype options. |
| 2025-09-28 | Which repositories or knowledge bases should ResearchAgent prioritize for initial retrieval connectors? | Awaiting inventory of existing docs/repos to rank. | TBD - assemble doc landscape. |
| 2025-09-28 | How will we measure the reduction in manual handoffs without adding heavy process overhead? | No telemetry plan defined yet. | TBD - design lightweight metrics instrumentation. |
| 2025-09-28 | What safeguards are required before allowing Executor to modify repositories beyond DevAgent itself? | Need policy on approvals and rollback tooling. | TBD - draft governance proposal. |
| 2025-09-29 | What concrete signals will prove the workflow is sticky and indispensable at 90 and 180 days? | Metrics are defined qualitatively; need leading indicators, survey cadence, or usage telemetry. | TBD - propose adoption measurement plan. |
| 2025-09-29 | Which active Lambda Curry projects should pilot the agentic prompts first to capture friction points? | Need shortlist of teams willing to trial and provide feedback. | TBD - identify candidate projects and leads. |

| 2026-01-10 | How should Ralph handle tasks that exceed single context window capabilities while maintaining DevAgent's quality standards? | Ralph requires context-window-sized tasks; DevAgent plans often contain multi-week work. | TBD - design task breaking strategies and quality gate patterns. |
| 2026-01-10 | What quality gate patterns should be required vs. optional for Ralph autonomous execution across diverse project types? | Different projects have varying testing/linting requirements; Ralph needs reliable automation. | TBD - implement configurable quality gate templates. |
| 2026-01-10 | How should Ralph's autonomous execution balance with DevAgent's "human-in-the-loop defaults" delivery principle? | Ralph operates autonomously by design; DevAgent constitution emphasizes human confirmation (C3.1). | TBD - define autonomous execution boundaries and oversight mechanisms. |
