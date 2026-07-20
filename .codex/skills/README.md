# Project engineering skills

This directory vendors a deliberately small subset of engineering workflow skills for ShanxiMap.

## Matt Pocock engineering skills

Imported from upstream `main` commit:

```text
9603c1cc8118d08bc1b3bf34cf714f62178dea3b
```

Installed skills:

- `setup-matt-pocock-skills`
- `grill-with-docs`
- `grilling` (shared dependency)
- `domain-modeling` (shared dependency)
- `to-spec`
- `to-tickets`
- `implement`
- `tdd`
- `diagnosing-bugs`
- `codebase-design`
- `code-review`
- `improve-codebase-architecture`

The project intentionally excludes triage, wayfinding, research, and prototype workflows until a real task demonstrates the need. Review upstream changes before updating this vendored copy; do not run an unreviewed bulk overwrite.

Upstream is MIT licensed. See `LICENSE.mattpocock-skills`.

## Planning with files

`planning-with-files` version `3.7.0` is imported from
[OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)
at upstream `master` commit:

```text
7c6c6cbb76ebee7c7a7e28a38a08d3ad7d1e0427
```

Its workspace hooks live in `.codex/hooks/` and `.codex/hooks.json`. ShanxiMap
uses only standard, advisory mode; autonomous and gated modes are not approved.
See `docs/agents/planning-with-files.md` for project-specific usage.

Upstream is MIT licensed. See `LICENSE.planning-with-files`.
