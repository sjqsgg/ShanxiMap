# 01 — Establish non-interactive source checks

**What to build:** Contributors and CI can run explicit lint and TypeScript
commands that complete without setup questions and report source problems
independently, without changing ShanxiMap product behavior.

**Blocked by:** None — can start immediately

**Status:** complete

- [x] The lint command runs the ESLint CLI with explicit Next.js Core Web Vitals and TypeScript rules and never opens an interactive setup flow.
- [x] The TypeScript command runs a no-output project type-check under a stable package-script name.
- [x] Both commands pass on the current codebase from the committed dependency set.
- [x] Any source edits are limited to violations required by the selected lint configuration and preserve current behavior.
- [x] The production build still succeeds.

## Verification evidence

- `npm run lint` — passed with 0 errors and 6 existing warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed and generated all 537 static pages.
- No product source files or runtime data were changed.
