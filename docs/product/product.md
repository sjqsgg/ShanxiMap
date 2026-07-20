# Product definition

Status: current baseline, 2026-07-20

## Purpose

Shanxi Archive helps travellers and architecture enthusiasts discover nationally protected heritage sites across Shanxi, including important places that are poorly represented by mainstream travel products.

The product uses the metaphor of a paper archive: official batch, year, chronology, location, and source metadata are presented as a browsable collection rather than as engagement-driven travel content.

## Intended users

- Travellers planning focused visits to historic architecture in Shanxi.
- Architecture and heritage enthusiasts comparing sites by dynasty, city, type, or editorial priority.
- Returning users who want to use the homepage map, open the dedicated map page, or revisit a stable archive detail page.

## Product principles

- Heritage-first: do not depend on game, film, celebrity, or “viral destination” framing.
- Evidence-aware: distinguish sourced facts, generated summaries, editorial rankings, approximate coordinates, and unknown information.
- Practical discovery: help users search, filter, locate, preview, and navigate to a site.
- Archival visual language: paper, ink, cinnabar, monospaced metadata, rules, seals, and restrained frosted overlays.
- Static-first: the current product remains useful without accounts, a backend, or community features.

## Current experience

### `/` — homepage and primary map experience

- Introduces the 532-record collection and key statistics.
- Uses the archive-bag narrative transition.
- Reveals the homepage map after the user scrolls through the introduction.
- Provides single-select filters on the homepage map.
- Provides a city-grouped index and preview drawer.
- Also links to the optional dedicated map page.

### `/map` — dedicated map page

- Displays the current filtered set on AMap.
- Supports text search and multi-select dynasty, city, tier, type, and Yingzao Society filters.
- Synchronises filter state to the URL.
- Offers a result sidebar and preview drawer.
- Uses `/site/[id]` as the archive-detail deep link.
- Provides a focused full-screen alternative to the map embedded on the homepage.

### `/site/[id]` — archive detail page

- Displays one archive's metadata, description, image when available, practical enrichment, navigation action, and nearby sites.
- Displays a visitor-notes/comment placeholder and disabled check-in/favourite controls.
- Is statically generated for all 532 records in production builds.

### Community interaction status

The product already presents intended community surfaces on archive detail pages:

- visitor notes/comments;
- “我去过” check-in;
- “我要去” favourite.

They are not functional yet. The current controls are disabled, visitor-note text is not submitted or persisted, and there is no identity, storage, moderation, or backend model. Turning these surfaces into real features requires a separate product and technical spec; their presence must not be documented as completed functionality.

## Current collection

- 532 records and 532 unique IDs.
- Visit tiers: 21 必去, 49 推荐, 368 小众, 94 可选.
- Types: 422 古建筑, 15 石窟寺及石刻, 46 古遗址, 20 古墓葬, 28 近现代/革命史迹, 1 其他.
- 532 records have coordinates.
- Description sources: 70 manual, 379 wiki, 83 template.
- 16 records have a Yingzao Society annotation.

These values describe the committed dataset at the status date; documentation must be refreshed when the runtime artifact changes.

## Non-goals for the current baseline

- Treating editorial visit tiers as official heritage classifications.
- Claiming generated descriptions or approximate coordinates are authoritative.
- Route planning, bookings, opening-hours guarantees, or live operational status.
- A general-purpose tourism platform for all Shanxi attractions.

## Known product questions

- What evidence threshold should be required before practical information such as opening status is shown?
- Should homepage and map filters intentionally differ, or should they share one domain model and only vary in presentation?
- Which data corrections should users be able to report, and how should reports be reviewed?
- Which historical claims require first-party or scholarly citations before publication?
- What should visitor notes mean: public comments, private travel notes, or both?
- What identity, moderation, abuse prevention, and privacy model is required before community interactions become functional?
