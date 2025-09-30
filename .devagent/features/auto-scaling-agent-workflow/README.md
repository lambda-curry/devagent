# Auto-Scaling Agent Workflow

**Status**: Draft  
**Owner**: Jake Ruesink  
**Started**: 2025-09-30

## Overview

This feature replaces the two-lane workflow model with a single intelligent entry point where agents self-determine their necessity based on inherent work complexity. Eliminates user cognitive load around path selection while maintaining appropriate rigor for high-risk work.

## Key Innovation

Instead of asking users to classify work as "Simple" or "Complex," agents embed risk-assessment logic and auto-invoke themselves only when risk signals warrant it. Default path is lightweight execution.

## Artifacts

- **Spec**: `spec/2025-09-30_auto-scaling-agent-workflow.md`
- **Research**: TBD - baseline cycle time metrics needed
- **Related**: Supersedes `.devagent/features/simple-vs-complex-feature-workflows/`

## Status

- [x] Spec drafted
- [ ] Risk triggers validated
- [ ] Agent prompts updated
- [ ] Governance docs cleaned up
- [ ] Tested on real tasks
- [ ] Meta-test completed (using workflow on itself)

## Next Steps

1. Review spec with Jake
2. Gather baseline metrics via #ResearchAgent
3. Update AGENTS.md and agent prompts
4. Test on 3-5 real tasks
5. Iterate based on feedback

