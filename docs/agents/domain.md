# Domain documentation

ShanxiMap is a single-context repository.

Before exploring or changing the system, engineering skills should read:

- `CONTEXT.md` for shared vocabulary;
- relevant records under `docs/adr/`;
- `docs/product/product.md` for product intent;
- `docs/architecture/current-system.md` for current implementation;
- `docs/data/` for runtime data and pipeline work.

Use glossary terms consistently in specs, tickets, code, and tests. If a required concept is absent, determine whether it is an unnecessary synonym or a genuine domain gap before adding it.

If a proposed change contradicts an ADR, identify the conflict explicitly and create a superseding ADR when the decision changes. Never silently rewrite an accepted decision.
