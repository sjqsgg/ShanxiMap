# ShanxiMap agent guide

## Start here

Before changing code or data, read:

- `CONTEXT.md` for the project vocabulary.
- `docs/product/product.md` for product intent and non-goals.
- `docs/architecture/current-system.md` for the implementation that exists today.
- Relevant records in `docs/adr/` before changing an established boundary.
- `docs/data/` before modifying `src/data/buildings.json` or any pipeline script.
- `docs/workflow.md` before starting a non-trivial feature or refactor.

Treat code, data, and successful verification as current facts. Historical prompts and old task briefs are not specifications.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run validate:data
npm run check
npm run build
```

`npm run lint` reports the repository's current warnings as well as errors. Do
not describe a warning-producing run as warning-free; include the warning count
in verification evidence until those warnings are resolved separately.

`npm run check` is the local acceptance entry. It runs lint, TypeScript,
automated tests, and runtime-data validation in fail-fast order. The production
build remains a separate integration check.

## Repository boundaries

- `src/app/` owns routes and page composition.
- `src/components/` owns UI and client interaction.
- `src/lib/` owns shared domain types and pure data helpers.
- `src/data/buildings.json` is the frontend runtime artifact, not a scratch file.
- `scripts/` owns data acquisition, enrichment, transformation, and validation scripts.
- `data/` currently contains pipeline checkpoints, reports, logs, backups, and intermediate results. Read `docs/data/pipeline.md` before moving or regenerating them.
- `.scratch/` is the local issue tracker used by the installed engineering skills.
- `.planning/` is ignored, disposable execution memory for long-running tasks; it never replaces a reviewed spec, ticket, ADR, or fact document.

Do not combine product UI refactors with data regeneration in one change. Prefer small vertical slices that can be verified independently.

## Working rules

- Preserve existing user changes. Never discard, overwrite, or mass-format unrelated work.
- For a non-trivial feature or refactor, create `.scratch/<feature>/spec.md` before implementation and split work into `.scratch/<feature>/issues/NN-<slug>.md`.
- After the spec and tickets are approved, use standard-mode `planning-with-files` when execution spans several phases or many tool calls. See `docs/agents/planning-with-files.md`.
- Clarify behavior and acceptance criteria before changing code. Distinguish facts, inferences, open questions, and user decisions.
- Reuse the vocabulary in `CONTEXT.md`; update it only when a domain term has actually been resolved.
- Record durable architectural or product decisions in `docs/adr/`. Do not turn temporary task progress into permanent documentation.
- Prefer extracting testable pure logic before changing coupled map UI code.
- Do not hand-edit large generated or enriched data sets without documenting the source and repeatable transformation.
- Never commit `.env.local`, API keys, security codes, or service credentials.

## Definition of done

For every implementation, report:

- changed behavior and changed files;
- acceptance criteria satisfied;
- commands actually run and their results;
- checks not run and why;
- remaining risks or unknowns.

At minimum, run `npm run typecheck` for TypeScript changes and `npm run build` for changes that affect runtime behavior or static generation. Add focused automated tests at approved public seams, and run `npm run validate:data` whenever runtime data or its validation contract changes.

## Agent skills

The repository vendors 13 workflow skills under `.codex/skills/`. The inventory, upstream commits, and licences are recorded in `.codex/skills/README.md`.

User-facing workflow skills:

- `setup-matt-pocock-skills`
- `grill-with-docs`
- `to-spec`
- `to-tickets`
- `implement`
- `improve-codebase-architecture`

Supporting skills invoked by those workflows when relevant:

- `grilling`
- `domain-modeling`
- `tdd`
- `diagnosing-bugs`
- `codebase-design`
- `code-review`

Long-running execution support:

- `planning-with-files` (standard, advisory mode only)

The two sections below configure how those skills use this repository; they are not the complete skill inventory.

### Issue tracker

Issues and specs live as local Markdown under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

This is a single-context repository with `CONTEXT.md` at the root and system-wide decisions in `docs/adr/`. See `docs/agents/domain.md`.

### Execution memory

Complex approved efforts may use ignored plan files under `.planning/`. See `docs/agents/planning-with-files.md`.
