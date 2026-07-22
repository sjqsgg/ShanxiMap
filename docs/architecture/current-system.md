# Current system architecture

Status: observed baseline, 2026-07-22

This document describes the implementation that exists today. It is not a target architecture.

## Runtime shape

ShanxiMap is a static Next.js 15 App Router application using React 19, TypeScript, Tailwind CSS 4, Framer Motion, and AMap JS API 2.0. There is no application backend or database.

```text
src/data/buildings.json
        |
        v
src/lib/data.ts + src/lib/types.ts
        |
        +--> /                  HomeClient + homepage MapCanvas
        +--> /map               dedicated MapApp + MapCanvas
        +--> /site/[id]         statically generated archive details

AMap loader <------------------ browser environment variables
```

`next build` currently generates 537 static pages: framework pages plus 532 `/site/[id]` routes.

## Main boundaries

### Routes

- `src/app/page.tsx`: server-rendered homepage shell and collection statistics.
- `src/app/map/page.tsx`: dedicated map route with a Suspense boundary.
- `src/app/site/[id]/page.tsx`: static parameter generation and one-site archive detail, including placeholder community controls.

### Client interaction

- `src/components/home/HomeClient.tsx`: homepage filter state, selection state, index grouping, embedded map, and preview.
- `src/components/map/MapApp.tsx`: dedicated map filter state, query-string synchronisation, selection, list/panel state, and preview; its pure filter and URL transformations live in `src/lib/map-filters.ts`.
- `src/components/map/MapCanvas.tsx`: AMap SDK loading and lifecycle, province layer, label markers, map view persistence, selection rendering, and camera movement. All site archives use one neutral base marker weight; selection may increase prominence, while the grotto shape and Yingzao badge remain factual distinctions.
- `PreviewDrawer.tsx` is shared by both map experiences.
- `SitePlaceholders.tsx` renders disabled visitor-note and visit-state UI. It has no persistence, identity, submission, or backend integration. Its combined “我要去 · 收藏” label conflicts with the accepted two-state model and is obsolete placeholder copy.

The accepted first-release visit-state model is private rather than aggregate: guest “visited” and “want to visit” markers remain device-local, registered users may synchronise them later, and no public per-site counts are required.

### Domain and data access

- `src/lib/types.ts`: TypeScript data shape, enums, grouping constants, and archive-number formatting.
- `src/lib/data.ts`: imports the runtime JSON, asserts it to `Building[]`, derives statistics, chronology-first city grouping, distance, and nearby-site results.
- The application import boundary still asserts JSON as TypeScript without validation. A separate baseline command validates essential collection fields, but it is not yet the complete runtime schema or part of application loading.

### Data tooling

- Python scripts implement the original Yingzao annotation, geocoding, retry, and description stages.
- Node scripts implement newer API enrichment, image lookup, and merge operations.
- Inputs, intermediates, logs, checkpoints, review reports, backups, and frontend artifacts are not yet separated by a stable lifecycle.

## State and URL behavior

The homepage and dedicated map intentionally use different filter shapes today:

- Homepage: single value per dynasty, city, and type; no query-string persistence.
- Dedicated map: multi-select dynasty, city, and type arrays, text search, Yingzao-only toggle, and query-string persistence. A legacy `tier` query parameter is ignored and is not written back to a shareable URL.

Both independently implement filtering, selection, map displacement, legends, and preview wiring. `MapCanvas` is shared, and the dedicated map now uses a tested pure filter/URL seam, but the surrounding domain logic is still duplicated.

The accepted product model is one shared map explorer with homepage and direct presentation modes. The current duplicated surrounding logic does not yet implement that model and should be reconciled through tested vertical slices. The explorer itself is for discovery and selection; route navigation remains an external AMap handoff.

Two current behaviors also differ from the accepted experience:

- Homepage index entries currently select a site, scroll back to the map, and open the shared preview drawer. The intended behavior is to open the archive detail directly.
- The fixed archive-detail header currently includes an AMap navigation link. The intended placement is within the detail content; the large header's final contents are not yet decided.
- The archive-detail return link currently always targets `/#map`. The intended behavior is contextual: restore the originating homepage map, homepage index, or `/map` state, with the homepage top as the fallback for a directly opened shared link.
- The homepage footer currently says “不蹭任何IP”. The accepted product principle permits relevant popular-culture and trend connections while explicitly excluding *Black Myth: Wukong*; runtime copy has not yet been updated.

`/site/[id]` is the canonical detail route. `MapApp` may read a legacy `id` query parameter on initial load, but it no longer writes selection IDs to the map URL.

## External dependencies and trust boundaries

- The browser loads AMap with `NEXT_PUBLIC_AMAP_KEY` and `NEXT_PUBLIC_AMAP_SECRET`.
- AMap browser credentials are public by construction and must be restricted by allowed domains in the AMap console.
- `AMAP_WEB_KEY` is used only by local scripts and must never be committed.
- Wikipedia/Wikimedia and AMap enrichment outputs require review; successful network retrieval does not establish factual correctness.

## Confirmed structural risks

1. `MapCanvas` combines SDK adaptation, persistence, marker presentation, selection events, and camera policy behind `any`-typed AMap objects.
2. Homepage and `/map` duplicate filter and selection domain behavior with incompatible state shapes.
3. The runtime dataset crosses into TypeScript through `as unknown as Building[]`; the new baseline validator is still separate from this application import boundary and does not encode the complete schema.
4. The repository has a fail-fast local acceptance command and a GitHub CI job covering lint, TypeScript, tests, baseline data validation, and production build; these gates do not replace product or visual review.
5. The explicit ESLint command passes, but it still reports six known source warnings that require separate, behavior-aware cleanup.
6. Data pipeline stages and artifacts do not have one declared source-to-runtime path.
7. Several pipeline scripts use machine-specific absolute paths.

## Safe refactoring sequence

The current evidence supports this order:

1. Define and validate the runtime `Building` contract.
2. Extract pure filter/query transformations with tests.
3. Introduce a typed AMap adapter boundary and reduce responsibilities in `MapCanvas`.
4. Reconcile homepage and dedicated-map interaction models deliberately.
5. Define the data lifecycle and make pipeline entry points repeatable.

Each item must be delivered as independently verifiable vertical slices rather than as one rewrite.
