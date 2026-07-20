# Planning with files: execution memory

ShanxiMap uses `planning-with-files` only as disposable working memory for a
complex task whose behavior and scope have already been reviewed.

## When to use it

Use it when an approved effort has several dependent phases, is likely to span
many tool calls, or may need to resume in a later conversation. Skip it for a
small, well-defined change.

The authority order remains:

1. user decisions and the approved `.scratch/<effort>/spec.md`;
2. numbered `.scratch/<effort>/issues/` tickets;
3. durable facts and decisions in project documentation and ADRs;
4. ignored planning files, which only record temporary execution state.

## Start a standard plan

From the repository root, give the effort a short name:

```bash
sh .codex/skills/planning-with-files/scripts/init-session.sh "quality gates"
```

This creates a dated directory such as
`.planning/2026-07-20-quality-gates/` containing `task_plan.md`, `findings.md`,
and `progress.md`, then records it as the active plan. These files are ignored
by Git. Link the plan back to the approved spec and current ticket rather than
copying or redefining their requirements.

Do not pass `--autonomous` or `--gated`. Do not add unattended execution loops.
Those modes require a separate, explicit user decision.

## Work and resume

- Keep the current phase and checklist accurate in `task_plan.md`.
- Put research results, code evidence, and temporary decisions in `findings.md`.
- Append commands, results, errors, and checkpoints to `progress.md`.
- Promote durable conclusions to the correct tracked document; do not commit
  the planning files.
- The workspace hooks restore active-plan context and remain advisory. They do
  not override a user instruction, an approved spec, repository safety rules,
  or required review gates.

For one-shot checks, CI, or review work that should not inherit an active plan,
set `PLANNING_DISABLED=1` for that process.

## Check completion

Before reporting the effort complete, run:

```bash
sh .codex/skills/planning-with-files/scripts/check-complete.sh
```

Treat its result as a working-memory consistency check, not as proof that the
ticket's acceptance criteria or project quality gates passed. Verification
evidence still belongs in the ticket handoff and commit review.
