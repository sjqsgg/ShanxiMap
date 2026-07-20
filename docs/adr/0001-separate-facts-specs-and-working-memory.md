# ADR 0001: Separate facts, specs, and working memory

Date: 2026-07-20
Status: accepted

## Context

The repository previously kept Claude, Fable, and Superpowers task documents beside current project documentation. Those files mixed product intent, implementation instructions, completed tasks, and outdated architecture. They were easy for an agent to mistake for current truth.

The project is also adopting Matt Pocock's engineering skills and planning-with-files. Both can produce Markdown, so their responsibilities need explicit boundaries.

## Decision

Use three documentation lifecycles:

1. **Tracked fact layer**: `CONTEXT.md`, `docs/product/`, `docs/architecture/`, `docs/data/`, and `docs/adr/`. These describe durable vocabulary, current behavior, and accepted decisions.
2. **Tracked local issue layer**: `.scratch/<feature>/spec.md` and numbered issue files. These describe intended change and acceptance criteria.
3. **Ephemeral working memory**: planning files used to execute a long task. They record current phase, findings, failures, and verification, and are not authoritative product documentation.

Historical prompts and completed task briefs remain recoverable through Git history but do not remain in the working tree.

Evidence priority when sources conflict:

```text
verified runtime behavior and data
  > current tracked fact documents and accepted ADRs
  > active approved task spec
  > historical prompts or task briefs
```

An approved spec may intentionally change current behavior; until implemented and verified it must not be written into `current-system.md` as fact.

## Consequences

- Agents have one place to learn current system facts.
- Specs can evolve without silently rewriting product history.
- Long-running plans can be discarded after durable outcomes are promoted to code, tests, issues, or fact documents.
- Existing documentation requires maintenance when code or runtime data changes.
- Installing a workflow tool does not make its generated plans authoritative.
