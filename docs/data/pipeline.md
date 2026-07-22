# Data pipeline baseline

Status: observed repository state, 2026-07-22

This document records the current, partially overlapping pipeline. It does not claim that every file is required or that the sequence is fully reproducible.

## Frontend boundary

`src/data/buildings.json` is the only dataset imported by the application. Any pipeline change is incomplete until the intended result is validated and deliberately promoted to this path.

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

`npm run validate:data` now automates baseline checks for collection shape,
essential identity and map-display primitive types, unique IDs, finite
coordinates. It validates the committed runtime artifact; it
does not promote a candidate or encode the complete contract.

Before replacing the runtime artifact, also verify:

- an explicitly reviewed collection change when the record count differs from the current 532; record count itself is not a permanent contract;
- unique positive integer IDs;
- finite coordinates within the expected Shanxi area;
- supported type, description-source, and precision values;
- cross-field provenance rules;
- image URLs and attribution fields when an image is present;
- TypeScript and production build success.

The checks beyond the baseline validator remain procedural documentation, not
automated enforcement.

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
