# Engineering workflow

This workflow keeps the user in control while giving Codex repeatable ways to clarify, plan, implement, and verify work.

## Choose the smallest workflow

### Simple change

Use the normal task conversation for a well-defined, low-risk, single-file change. Inspect the relevant code, make the change, run proportionate checks, and report evidence. Do not create planning files merely to satisfy a ritual.

### Non-trivial feature or refactor

Use the tracked local issue flow when behavior, architecture, data, or more than one independently verifiable step is involved:

```text
grill-with-docs
  -> to-spec
  -> to-tickets
  -> implement (using tdd at agreed seams)
  -> code-review
  -> verification evidence
```

Artifacts:

```text
.scratch/<effort>/spec.md
.scratch/<effort>/issues/01-<slice>.md
.scratch/<effort>/issues/02-<slice>.md
```

The user reviews the spec before tickets, and reviews each independently committed phase before the next phase starts.

### Long-running execution

When an approved effort spans many tool calls, phases, or conversations, add planning-with-files working memory after the spec and tickets exist. Planning files track execution; they do not replace the approved spec or permanent project documentation.

Use the repository's standard, advisory configuration described in `docs/agents/planning-with-files.md`. Autonomous mode, gated mode, and unattended execution loops require a separate user decision and are not part of this workflow.

## Skill responsibilities

| Skill | Use it for | Do not use it for |
|---|---|---|
| `grill-with-docs` | Resolve product behavior, terminology, and durable decisions with the user. | Starting implementation before decisions are settled. |
| `to-spec` | Turn an already-discussed change into observable requirements and acceptance criteria. | Inventing missing requirements silently. |
| `to-tickets` | Split an approved spec into dependency-aware vertical slices. | Horizontal “build all utilities first” task lists. |
| `implement` | Execute one ticket, use TDD where a test seam exists, then review. | Implementing an unapproved multi-ticket effort in one sweep. |
| `tdd` | Red-green-refactor for pure logic, regressions, and stable interfaces. | Tests that merely mirror implementation details. |
| `diagnosing-bugs` | Reproduce, minimise, hypothesise, instrument, fix, and regression-test. | Guessing at a fix before establishing a signal. |
| `codebase-design` | Design deep modules with small interfaces and testable seams. | Abstracting solely to reduce file length. |
| `improve-codebase-architecture` | Identify and discuss high-leverage structural improvements. | Automatically rewriting every candidate it finds. |
| `code-review` | Review both documented standards and originating spec. | Replacing deterministic type, test, lint, data, or build checks. |
| `planning-with-files` | Preserve temporary findings, progress, and the current phase during a long approved effort. | Defining requirements, changing accepted decisions, or acting as durable project documentation. |

## ShanxiMap refactoring order

The current baseline supports this sequence:

1. Repair quality gates: TypeScript, ESLint, automated tests, data validation, build.
2. Encode the runtime `Building` contract and cross-field rules.
3. Extract shared, pure filter and URL transformations.
4. Reconcile homepage and `/map` state deliberately without changing both UIs at once.
5. Introduce a typed AMap adapter and reduce `MapCanvas` responsibilities.
6. Define and reorganise the data pipeline only after promotion and provenance rules are approved.

Every numbered item is a separate effort with its own spec. Do not create one “refactor everything” implementation ticket.

The map-state effort must preserve the accepted product distinctions recorded in `docs/product/product.md`: marker preview versus direct index navigation, contextual return from archive details, and a single map explorer presented through homepage and direct modes.

## Review gates

Before implementation:

- current behavior is cited from code or reproduced;
- user-visible outcome and non-goals are explicit;
- allowed and excluded file scopes are explicit;
- acceptance criteria and commands are agent-runnable where possible.

Before claiming a ticket complete:

- acceptance criteria are mapped to evidence;
- `npm run check` passes as the standard local acceptance entry;
- focused tests pass when present;
- `npm run typecheck` passes for TypeScript changes;
- `npm run build` passes for runtime/static-generation changes;
- `npm run validate:data` passes for runtime data or validator changes;
- the diff is reviewed against both `AGENTS.md` and the approved spec;
- skipped checks and remaining risks are reported.

GitHub repeats `npm run check` and `npm run build` in one read-only Node 20
verification job for every push and pull request. CI does not deploy or replace
the product/spec review described above.

## Durable updates

After a task, promote only durable conclusions:

- new shared term -> `CONTEXT.md`;
- changed current behavior or boundary -> appropriate fact document;
- accepted long-term trade-off -> new or superseding ADR;
- repeatable verification -> package script, test, or validator;
- temporary findings and progress -> discard after useful results are promoted.
