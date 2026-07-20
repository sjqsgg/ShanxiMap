# ShanxiMap domain context

This glossary defines the terms used in product discussion, code, specs, and tests.

## Product language

### Shanxi Archive / 山西访古档案

The product as a whole. It presents Shanxi's nationally protected heritage sites through an archival visual language rather than as a generic points-of-interest map.

### Archive / 档案

The product representation of one heritage-site record. An archive has a stable numeric `id`, protection batch metadata, location, chronology, classification, coordinates, description, and optional enrichment.

### Archive hall / 档案馆

The narrative homepage at `/`. It introduces the collection, embeds a browsable map, and provides a city-grouped index.

### Map workbench / 地图工作台

The dedicated full-screen map at `/map`. It supports search, multi-select filters, a result list, selection, and preview.

### Site dossier / 完整档案

The detail page at `/site/[id]`. This is the canonical deep link for a selected archive. `/map?id=...` is legacy behavior and must not be treated as the detail URL.

### Heritage site / 国保单位

One of the 532 records in the current collection of Shanxi entries from the first through eighth batches of 全国重点文物保护单位. Use “heritage site” or “archive” in engineering prose; avoid introducing synonymous entity names such as attraction or venue.

### Visit tier / 访古等级

An editorial discovery priority, not an official government rating:

- `必去`: primary highlights;
- `推荐`: strongly recommended sites;
- `小众`: specialist or less-known destinations;
- `可选`: records outside the default map focus.

### Yingzao Society footprint / 营造学社足迹

A source-backed annotation indicating a documented survey or visit by members of the Society for Research in Chinese Architecture. The presence of the annotation must be supported by `yingzao_source`; absence does not prove the site was never visited.

## Data language

### Runtime artifact

`src/data/buildings.json`, the JSON bundled into the frontend build. It is currently loaded with a TypeScript assertion and has no runtime schema validation.

### Source

An upstream CSV, JSON, official list, API response, or human-reviewed fact used to produce data. A source is not interchangeable with a checkpoint or generated artifact.

### Intermediate

A reproducible transformation result used by another pipeline step. Intermediates are not frontend inputs.

### Checkpoint

Progress saved so a network enrichment job can resume. Checkpoints may depend on the exact input and script version.

### Review report

A human-readable list of uncertain matches, missing enrichment, or proposed changes. It is evidence for review, not automatically authoritative data.

### Description source / `desc_source`

- `manual`: intentionally authored project copy;
- `wiki`: enrichment derived from a Wikipedia source;
- `template`: generated fallback copy and visibly labelled as such in the UI.

### Coordinate precision / `geo_precision`

- `high`: project-classified high-confidence coordinate;
- `amap`: coordinate returned by the newer AMap enrichment flow;
- `approx`: approximate locality-level coordinate;
- `county`: county-centre fallback requiring extra caution.

All frontend coordinates are expected to align with the GCJ-02 coordinate system used by AMap.

## Engineering language

### Fact layer

Tracked documentation describing the product and system as they exist: `CONTEXT.md`, `docs/product/`, `docs/architecture/`, `docs/data/`, and `docs/adr/`.

### Spec

A task-specific definition of intended behavior and acceptance criteria under `.scratch/<feature>/spec.md`. A spec describes what should change; it is not a status log.

### Ticket

One independently verifiable vertical slice under `.scratch/<feature>/issues/`.

### Working memory

Ephemeral plan, findings, and progress files used while executing a long task. Working memory is introduced separately from tracked facts and specs.
