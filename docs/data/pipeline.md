# Data pipeline baseline

Status: observed repository state, 2026-07-22

This document records the current, partially overlapping pipeline. It does not claim that every file is required or that the sequence is fully reproducible.

## Frontend boundary

`src/data/buildings.json` is the only dataset imported by the application. `src/lib/data.ts` passes it through the complete runtime validator before exposing it to any route or component. Any pipeline change is incomplete until the intended result is validated and deliberately promoted to this path.

## Original Python flow

```text
shanxi_guobao_enhanced.csv/json
  -> scripts/01_yingzao.py
  -> scripts/02_geocode.py
  -> scripts/02b_geocode_retry.py
  -> scripts/03_descriptions.py
  -> root-level final/work/review files
```

Responsibilities:

- `01_yingzao.py`: attaches source-backed Yingzao Society annotations.
- `02_geocode.py`: performs the original geocoding pass.
- `02b_geocode_retry.py`: retries or refines geocoding results.
- `03_descriptions.py`: creates manual/template-era description output.

Several scripts currently contain the absolute path `/Users/a77/Downloads/ShanxiMap`, so the flow is not portable without edits.

## Newer Node enrichment flow

```text
frontend or backup building data
  -> scripts/enrich.mjs
  -> data/enrich-checkpoint.json
  -> data/enrichment-result.json
  -> data/enrichment-review.md
  -> scripts/fetch-images.mjs
  -> data/images-checkpoint.json
  -> data/images-result.json
  -> data/images-review.md
  -> scripts/merge-enrichment.mjs
  -> src/data/buildings.json
```

The scripts also emit logs and keep `data/buildings-backup.json`. Network-derived values include AMap and Wikipedia/Wikimedia enrichment and therefore require review before promotion.

## Current artifact classes

| Class | Current examples | Intended treatment |
|---|---|---|
| Upstream/source | `shanxi_guobao_enhanced.csv`, `shanxi_guobao_enhanced.json` | Preserve provenance; avoid silent edits. |
| Working/intermediate | `data_work.json`, `shanxi_guobao_final.json`, enrichment result JSON | Reproducible outputs, not frontend imports. |
| Checkpoint | `data/*-checkpoint.json` | Resume state tied to a script/input version. |
| Log | `data/*.log` | Diagnostic execution history. |
| Review report | `geo_review.csv`, `data/*-review.md`, `yingzao_list.csv` | Human-review evidence. |
| Backup | `data/buildings-backup.json` | Recovery snapshot; lifecycle not yet defined. |
| Runtime artifact | `src/data/buildings.json` | Validated input bundled by Next.js. |

## Current promotion checks

`npm run validate:data` applies the complete `validateBuildings(unknown)`
contract to the committed runtime artifact. The CLI also accepts an explicit
candidate path (`tsx scripts/validate-buildings.ts <path>`) for review before
promotion. It rejects invalid collection shape, fields, primitives, enums,
identifiers, coordinates, URLs, images, and cross-field provenance with
locatable issues and a non-zero exit code.

The contract does not freeze the current 532-record count or require contiguous
IDs. A collection-size change and cross-release ID retirement/reuse still need
explicit human review because a single candidate cannot prove historical
identity. TypeScript and the production build also remain required before
promotion. The production build re-executes the same validator at application
loading, so an invalid promoted artifact stops page generation. The CLI
validates a candidate; it does not promote or overwrite the runtime artifact.

Legacy source and intermediate artifacts may still carry the retired `tier` field because their schemas are not the frontend runtime contract. Promotion scripts must drop it rather than copying it into `src/data/buildings.json`; enrichment and image reports no longer organise records by that field.

## Target cleanup questions

Before moving files, decide and record:

1. Which file is the canonical upstream source?
2. Which outputs are reproducible and should be ignored rather than committed?
3. Which review artifacts are durable evidence worth tracking?
4. How are manual corrections represented so regeneration does not erase them?
5. How are network source, timestamp, script version, and licence captured?
6. What one command validates and promotes a candidate runtime artifact?

Do not reorganise the existing data directory until these questions are resolved in a spec and ADR.
