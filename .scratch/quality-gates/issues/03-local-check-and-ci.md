# 03 — Connect the local acceptance entry and GitHub CI

**What to build:** The project owner can run one local acceptance command, and
GitHub automatically repeats that command plus the production build in a clean,
locked Node.js environment on every push and pull request.

**Blocked by:** 01 — Establish non-interactive source checks; 02 — Establish the building data validation seam

**Status:** ready-for-agent

- [ ] The aggregate check runs lint, TypeScript, automated tests, and runtime-data validation and fails when any leaf command fails.
- [ ] Pushes and pull requests trigger one verification job using Node 20 and the committed dependency lockfile.
- [ ] CI installs with `npm ci`, runs the aggregate check, and then runs the production build.
- [ ] CI does not deploy, use project secrets, acquire or enrich data, or modify committed files.
- [ ] The complete local aggregate check and production build pass before delivery.
- [ ] A final manual minimal-diff review finds no avoidable dependency, duplicated configuration, speculative abstraction, or unrelated changed file.
