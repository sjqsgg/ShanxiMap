# 02 — Establish the building data validation seam

**What to build:** Data maintainers can pass unknown input through one pure,
testable building-collection boundary, and a command-line check rejects an
invalid runtime artifact with actionable record-level errors.

**Blocked by:** None — can start immediately

**Status:** complete

- [x] A lightweight Node 20-compatible TypeScript test command runs non-interactively without a browser or React test environment.
- [x] The public validator accepts an unknown value and exposes deterministic success or record-specific failure results.
- [x] Baseline validation covers collection shape, essential identity and map-display primitive types, unique identifiers, finite coordinates, and the supported editorial tiers.
- [x] Focused samples cover accepted input plus non-array input, missing values, wrong primitive types, duplicate identifiers, non-finite coordinates, and unsupported tiers.
- [x] A command-line adapter validates the real runtime artifact through the same seam and exits non-zero with actionable output when validation fails.
- [x] The real committed runtime artifact passes without being regenerated or reformatted.
- [x] The complete optional-field and cross-field contract remains explicitly deferred to its separate effort.

## Verification evidence

- `npm test` — passed 8 focused validator tests.
- `npm run validate:data` — passed all 532 committed records.
- Isolated invalid CLI fixture — reported `$[0].name (id 1)` and exited 1.
- `npm run lint` — passed with 0 errors and the same 6 existing warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed and generated all 537 static pages.
- `src/data/buildings.json` was not modified.
