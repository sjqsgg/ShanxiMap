# 01 — Establish non-interactive source checks

**What to build:** Contributors and CI can run explicit lint and TypeScript
commands that complete without setup questions and report source problems
independently, without changing ShanxiMap product behavior.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The lint command runs the ESLint CLI with explicit Next.js Core Web Vitals and TypeScript rules and never opens an interactive setup flow.
- [ ] The TypeScript command runs a no-output project type-check under a stable package-script name.
- [ ] Both commands pass on the current codebase from the committed dependency set.
- [ ] Any source edits are limited to violations required by the selected lint configuration and preserve current behavior.
- [ ] The production build still succeeds.
