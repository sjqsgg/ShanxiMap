# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown under `.scratch/`. This keeps the initial workflow local while it is being tested; moving to GitHub Issues is a later explicit decision.

## Conventions

- One effort per directory: `.scratch/<feature-slug>/`.
- The approved spec is `.scratch/<feature-slug>/spec.md`.
- Implementation work is split into `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Each issue is a vertical slice with observable acceptance criteria, allowed scope, excluded scope, and verification commands.
- Record state in a `Status:` line near the top of each issue.
- Append material follow-up discussion under `## Comments`; do not silently rewrite an accepted decision.

## Skill mapping

- When a skill says “publish to the issue tracker”, create or update the appropriate `.scratch/<feature-slug>/` files.
- When a skill says “fetch the ticket”, read the exact numbered issue file supplied by the user or parent spec.
- `to-spec` owns `spec.md`; `to-tickets` owns numbered issue files; `implement` consumes them.

Do not store transient execution logs here. Long-task progress belongs to the working-memory layer introduced separately.
