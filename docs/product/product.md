# Product definition

Status: current baseline, 2026-07-20

## Purpose

Shanxi Archive helps travellers and architecture enthusiasts discover nationally protected heritage sites across Shanxi, including important places that are poorly represented by mainstream travel products.

The product uses the metaphor of a paper archive: official batch, year, chronology, location, and source metadata are presented as a browsable collection rather than as engagement-driven travel content.

## Intended users

- Travellers planning focused visits to historic architecture in Shanxi.
- Architecture and heritage enthusiasts comparing sites by dynasty, city, type, or editorial priority.
- Returning users who want to move directly to a map or a stable site dossier.

## Product principles

- Heritage-first: do not depend on game, film, celebrity, or “viral destination” framing.
- Evidence-aware: distinguish sourced facts, generated summaries, editorial rankings, approximate coordinates, and unknown information.
- Practical discovery: help users search, filter, locate, preview, and navigate to a site.
- Archival visual language: paper, ink, cinnabar, monospaced metadata, rules, seals, and restrained frosted overlays.
- Static-first: the current product remains useful without accounts, a backend, or community features.

## Current experience

### `/` — archive hall

- Introduces the 532-record collection and key statistics.
- Uses the archive-bag narrative transition.
- Embeds a map with single-select filters.
- Provides a city-grouped index and preview drawer.
- Links directly to the dedicated map.

### `/map` — map workbench

- Displays the current filtered set on AMap.
- Supports text search and multi-select dynasty, city, tier, type, and Yingzao Society filters.
- Synchronises filter state to the URL.
- Offers a result sidebar and preview drawer.
- Uses `/site/[id]` as the full-dossier deep link.

### `/site/[id]` — site dossier

- Displays one archive's metadata, description, image when available, practical enrichment, navigation action, and nearby sites.
- Is statically generated for all 532 records in production builds.

## Current collection

- 532 records and 532 unique IDs.
- Visit tiers: 21 必去, 49 推荐, 368 小众, 94 可选.
- Types: 422 古建筑, 15 石窟寺及石刻, 46 古遗址, 20 古墓葬, 28 近现代/革命史迹, 1 其他.
- 532 records have coordinates.
- Description sources: 70 manual, 379 wiki, 83 template.
- 16 records have a Yingzao Society annotation.

These values describe the committed dataset at the status date; documentation must be refreshed when the runtime artifact changes.

## Non-goals for the current baseline

- User accounts, comments, social feeds, or community moderation.
- Treating editorial visit tiers as official heritage classifications.
- Claiming generated descriptions or approximate coordinates are authoritative.
- Route planning, bookings, opening-hours guarantees, or live operational status.
- A general-purpose tourism platform for all Shanxi attractions.

## Known product questions

- What evidence threshold should be required before practical information such as opening status is shown?
- Should homepage and map filters intentionally differ, or should they share one domain model and only vary in presentation?
- Which data corrections should users be able to report, and how should reports be reviewed?
- Which historical claims require first-party or scholarly citations before publication?
