Commit: d21a8af7 - feat(ralph-monitoring): project switcher and registration UI (devagent-multi-project-support.4) [skip ci]

Summary:
- **ProjectSwitcher**: Select dropdown with "All projects" + per-project options; "Manage" link to settings. Hosted in projects layout header so it appears on task list and task detail.
- **Settings /projects**: List of projects (path, label, valid); add form (path + optional label) when config is writable; remove button per project; read-only message with config path and schema when file is not writable.
- **projects.server**: `isConfigWritable()`, `addProject()`, `removeProject()`, `getConfigWriteInstructions()`; add validates path (Beads DB exists), generates unique id from path slug.
- **Root index**: Redirects to default project when set in config, else `/projects/combined`.

Verification: lint, typecheck, test (342 tests) passed.

Signed: Engineering Agent — Code Wizard
