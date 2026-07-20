# ShanxiMap domain context

This glossary defines the terms used in product discussion, code, specs, and tests.

## Product language

### Shanxi Archive / 山西访古档案

The product as a whole. It presents Shanxi's nationally protected heritage sites through an archival visual language rather than as a generic points-of-interest map.

### Site archive / 地点档案

The product's data and presentation unit for one heritage site. A site archive has a stable numeric `id`, protection batch metadata, location, chronology, classification, coordinates, description, and optional enrichment. Use “地点档案” when the distinction from a page or the collection matters.

### Homepage / 首页

The primary experience at `/`. It begins with the archive-themed introduction and archive-bag transition; scrolling then reveals the homepage map and city-grouped index. “档案馆” is a visual metaphor for this entire experience, not a separate feature or route.

### Map explorer / 地图探索器

The shared product experience for discovering site archives through a map: filtering, searching, selecting, previewing, and opening an archive detail. It does not plan routes or provide navigation; navigation is handed off to AMap when the user explicitly requests it.

The explorer appears in two presentation modes: revealed inside the homepage after the archive-bag narrative, and opened directly as a full-screen view.

### Direct map view / 地图直达模式

The `/map` route, which opens the shared map explorer full-screen without replaying the homepage narrative. It serves returning, field-use, and shared-link scenarios; it is not a separate map product.

### Archive preview / 档案预览

The narrow drawer opened when a site marker is selected on the Shanxi map. It shows a subset of the site archive and links to its detail page. The full building index does not use this intermediate step.

### Building index / 建筑总索引

The city-grouped list shown after the homepage map. Selecting an entry is an explicit choice and opens the archive detail page directly, without returning the user to the map or opening an archive preview.

### Archive detail page / 档案详情页

The route `/site/[id]` for one site archive. This is the canonical deep link for a selected site. It contains the action that hands navigation off to AMap; external navigation is not a global-header action. `/map?id=...` is legacy behavior and must not be treated as the detail URL.

### Public comment / 公开评论

A shareable, public user response attached to an archive detail page. It is not a private travel note. The current UI labelled “访客笔记” is only a disabled placeholder and does not yet create public comments.

### Heritage site / 国保单位

One of the 532 records in the current collection of Shanxi entries from the first through eighth batches of 全国重点文物保护单位. Use “heritage site” or “site archive” in engineering prose; avoid introducing synonymous entity names such as attraction or venue.

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
