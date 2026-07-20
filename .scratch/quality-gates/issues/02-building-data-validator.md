# 02 — Establish the building data validation seam

**What to build:** Data maintainers can pass unknown input through one pure,
testable building-collection boundary, and a command-line check rejects an
invalid runtime artifact with actionable record-level errors.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] A lightweight Node 20-compatible TypeScript test command runs non-interactively without a browser or React test environment.
- [ ] The public validator accepts an unknown value and exposes deterministic success or record-specific failure results.
- [ ] Baseline validation covers collection shape, essential identity and map-display primitive types, unique identifiers, finite coordinates, and the supported editorial tiers.
- [ ] Focused samples cover accepted input plus non-array input, missing values, wrong primitive types, duplicate identifiers, non-finite coordinates, and unsupported tiers.
- [ ] A command-line adapter validates the real runtime artifact through the same seam and exits non-zero with actionable output when validation fails.
- [ ] The real committed runtime artifact passes without being regenerated or reformatted.
- [ ] The complete optional-field and cross-field contract remains explicitly deferred to its separate effort.
