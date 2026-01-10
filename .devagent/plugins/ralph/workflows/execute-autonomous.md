# Execute Autonomous (Ralph Plugin)

## Mission
Convert a DevAgent plan into Beads tasks, configure quality gates, and launch Ralph's autonomous execution loop using Beads for state and progress tracking.

## Inputs
- Required: Path to DevAgent plan markdown file
- Optional: Output directory for Beads payloads, Ralph config path, project root for quality gate detection

## Workflow Steps
1. Convert plan to Beads payload via `tools/convert-plan.py`.
2. Configure quality gates via `tools/configure-quality-gates.py`.
3. Prepare Ralph config (merge Beads payload + quality gates).
4. Launch Ralph execution loop (calls `tools/ralph.sh`).
5. Use `bd ready` for task selection, update status to `in_progress`, and log progress as Beads comments.

## Output
- Beads payload JSON
- Quality gate configuration JSON
- Ralph execution logs
