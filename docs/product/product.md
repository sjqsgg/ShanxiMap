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
- Practical discovery: help users search, filter, locate, and preview a site, then explicitly hand navigation off to AMap.
- Archival visual language: paper, ink, cinnabar, monospaced metadata, rules, seals, and restrained frosted overlays.
- Static-first: the current product remains useful without accounts, a backend, or community features.

## Current experience

### `/` — homepage and primary map experience

- Introduces the 532-record collection and key statistics.
- Uses the archive-bag narrative transition.
- Reveals the homepage map after the user scrolls through the introduction.
- Provides single-select filters on the homepage map.
- Opens a narrow archive preview when the user selects a marker; the user can then choose to open the full archive detail.
- Provides a city-grouped building index after the map; selecting an index entry opens its archive detail directly.
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

The intended comment model is public and shareable on each archive detail page, not a private travel notebook. It is not functional yet: the current controls are disabled, visitor-note text is not submitted or persisted, and there is no identity, storage, moderation, or backend model. Turning these surfaces into real features requires a separate product and technical spec; their presence must not be documented as completed functionality.

## Accepted experience model

The homepage is the primary journey:

```text
title and collection introduction
  -> archive bag
  -> scrolling reveals the map explorer
  -> continuing down reveals the full building index
  -> selecting a building opens its archive detail page
```

There is one conceptual map explorer, not two competing map products. It is presented in two modes:

- **Homepage mode:** the explorer emerges from the archive narrative and leads into the full index.
- **Direct mode (`/map`):** returning users, users in the field, and recipients of shared filtered links skip the narrative and open the explorer full-screen.

Both modes should share map-domain state, filtering, selection, and preview behavior. Presentation may differ, but maintaining independent domain implementations is not an intended product distinction.

The explorer does not provide routes or turn-by-turn navigation. Navigation is an external action handed off to AMap with the selected site's coordinates.

Interaction depth is intentional:

```text
map marker -> narrow archive preview -> archive detail
building index entry -> archive detail
```

A map marker benefits from an intermediate preview because the user is exploring spatially. An index click is already an explicit building choice and must not scroll back to the map or require the same preview step.

AMap navigation belongs to the archive detail content as an explicit site action. It does not belong in the large global/detail header.

The large header's responsibilities are fixed, but its copy and layout are deliberately deferred to a dedicated UI spec. It should orient the user, provide a route back or home, and carry product identity. It should not be filled with site-specific actions such as AMap navigation, favourite, or share merely to occupy a layout slot.

Archive-detail return behavior is contextual:

- Entered from a marker preview on the homepage map: return to the same map centre, zoom, filters, and homepage map position.
- Entered from the homepage building index: return to the same index scroll position, not to the map.
- Entered from direct map mode at `/map`: return to the previous `/map` centre, zoom, and filters.
- Opened directly from a shared archive-detail link with no in-product origin: return to the top of the homepage.

The principle is “return to the user's previous working context when it exists; otherwise return home.” The eventual header and breadcrumb design must preserve this behavior without making the information hierarchy depend on browser history.

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
- What identity, moderation, abuse prevention, and privacy model is required before community interactions become functional?
- What exact desktop and mobile layout best fulfils the agreed large-header responsibilities?
