# Quality gates

Status: ready-for-agent
User review: approved 2026-07-20

## Problem Statement

ShanxiMap can currently type-check and produce a production build, but it does
not have one deterministic command that proves a proposed change meets the
project's minimum engineering standard. The lint script starts an interactive,
deprecated Next.js setup flow; there is no automated test runner, runtime data
check, or GitHub CI workflow. A contributor or coding agent can therefore skip
a check, run a different set of commands, or claim completion based only on a
successful local build.

## Solution

Provide a small, explicit quality-gate system with independently runnable leaf
commands and one non-interactive aggregate command. The leaf commands check
lint rules, TypeScript types, observable logic, and the baseline integrity of
the runtime building collection. Production build remains a separate, slower
integration check. GitHub runs both the aggregate command and the production
build in a clean Node.js environment for pushes and pull requests.

The first data seam is a pure building-collection validator that accepts
unknown input and reports deterministic validation failures. Its first version
establishes the reusable boundary and essential collection invariants; the
complete `Building` field contract and cross-field provenance rules remain a
separate approved effort that extends this seam.

This phase changes engineering feedback, not product behavior.

## User Stories

1. As the project owner, I want one command that checks the agreed minimum standard, so that I do not need to remember several implementation-specific commands.
2. As the project owner, I want GitHub to show whether a commit passes the same checks used locally, so that I can review evidence without reading every changed line.
3. As the project owner, I want each check to remain independently runnable, so that a failure clearly identifies the responsible category.
4. As a contributor, I want linting to run without setup questions, so that the result is repeatable locally and in CI.
5. As a contributor, I want Next.js, React, React Hooks, and TypeScript lint rules to be explicit, so that the repository does not depend on a deprecated framework wrapper.
6. As a contributor, I want a named TypeScript check, so that I can verify types quickly without generating build artifacts.
7. As a contributor, I want a lightweight automated test command, so that later pure domain refactors can leave runnable regression evidence.
8. As a data maintainer, I want malformed building collections to fail deterministically, so that invalid runtime data cannot silently pass through a TypeScript assertion.
9. As a data maintainer, I want validation failures to identify the record and violated invariant, so that a broken data promotion is actionable.
10. As a coding agent, I want the acceptance commands recorded in package scripts, so that I can execute the same gates rather than paraphrase them.
11. As a reviewer, I want production build to remain an explicit check, so that static route generation and bundling failures are not confused with faster source checks.
12. As a reviewer, I want CI to use the committed dependency lockfile and Node.js version, so that results do not depend on a contributor's machine.
13. As a future maintainer, I want the data validator to expose one stable public seam, so that complete schema and cross-field rules can be added without replacing the test approach.
14. As a visitor, I want quality tooling changes to leave the current homepage, map, archive details, and data presentation unchanged, so that engineering setup does not become an accidental product redesign.

## Implementation Decisions

- Replace the deprecated Next.js lint wrapper with the ESLint CLI and an explicit flat configuration using the recommended Next.js Core Web Vitals and TypeScript rule sets.
- Keep linting non-interactive. A clean checkout must be able to run the lint command without generating configuration or asking questions.
- Add named leaf commands for linting, TypeScript checking, automated tests, and runtime-data validation.
- Add one aggregate `npm run check` command that runs the four leaf checks and fails as soon as one fails.
- Keep `npm run build` separate from `npm run check` because it is a slower production integration check. CI and phase-completion evidence run both.
- Use a lightweight Node 20-compatible TypeScript test runner. The initial preference is `tsx` with Node's built-in test API rather than a browser or React testing stack.
- Introduce one pure validator boundary that accepts unknown input. Its result must make success and record-specific failures observable without importing the Next.js application.
- The baseline validator checks that the runtime value is an array of record-like values, required identity and map-display primitives are present with the expected broad types, identifiers are unique, coordinates are finite, and tier values belong to the existing editorial set.
- Do not present the baseline validator as the final data contract. Optional enrichment semantics, exact supported categories, Shanxi-specific coordinate bounds, image attribution, provenance dependencies, and other cross-field rules belong to the subsequent runtime-contract effort.
- Add a command-line adapter that reads the committed runtime data, passes it through the same validator seam, prints actionable failures, and exits non-zero on invalid data.
- Add one GitHub Actions verification job for pushes and pull requests. It checks out the repository, installs Node 20, uses `npm ci`, runs `npm run check`, then runs `npm run build`.
- Do not add deployment, secrets, data acquisition, network enrichment, or automatic code modification to CI.
- Resolve only source violations required to make the agreed lint configuration pass. Do not mass-format files or combine unrelated product refactors into this effort.

## Testing Decisions

- Test observable validator behavior through its public input/result boundary, not its private branches or helper functions.
- Use small, purpose-built samples: at least one accepted building collection and rejected cases for a non-array input, a missing essential value, an invalid primitive type, a duplicate identifier, a non-finite coordinate, and an unsupported tier.
- Assert that failures identify both the relevant record when available and the violated invariant; do not snapshot entire error messages or the full production dataset.
- Run the command-line validator against the real committed runtime artifact as an integration check.
- Treat ESLint, TypeScript, and production build as executable gates; do not write tests that merely assert their configuration files exist.
- No DOM, browser, AMap, component-rendering, visual-regression, or end-to-end test environment is introduced in this effort.
- The current successful type-check and production build are the behavioral baseline. The completed effort must preserve both results.

## Out of Scope

- Changing homepage, map, archive detail, navigation, comments, or personal-list behavior.
- Refactoring map state, filters, URL synchronisation, `MapCanvas`, or AMap integration.
- Encoding the complete runtime `Building` schema and all cross-field or provenance rules.
- Regenerating, enriching, correcting, or reformatting the building dataset.
- Reorganising the data pipeline or its checkpoints.
- Adding React component tests, browser tests, visual tests, or end-to-end tests.
- Deploying the application or changing hosting configuration.
- Broad dependency upgrades unrelated to the selected quality tools.
- Installing Ponytail as a persistent plugin. Its minimal-diff principles may be used manually during review.

## Further Notes

- `npm run check` is the fast, named acceptance entry; `npm run build` remains the production integration gate.
- A phase is complete only when both commands pass locally and the same commands pass in GitHub CI.
- CI success is evidence that deterministic checks passed in a clean environment, not proof that the product requirements or visual experience are correct.
- After implementation, perform a manual Ponytail-style review for avoidable dependencies, duplicated configuration, speculative abstractions, and unnecessary changed files. Safety, accessibility, validation, and required tests are not candidates for deletion.
