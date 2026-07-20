# Current system architecture

Status: observed baseline, 2026-07-20

This document describes the implementation that exists today. It is not a target architecture.

## Runtime shape

ShanxiMap is a static Next.js 15 App Router application using React 19, TypeScript, Tailwind CSS 4, Framer Motion, and AMap JS API 2.0. There is no application backend or database.

```text
src/data/buildings.json
        |
        v
src/lib/data.ts + src/lib/types.ts
        |
        +--> /                  HomeClient + embedded MapCanvas
        +--> /map               MapApp + MapCanvas
        +--> /site/[id]         statically generated dossiers

AMap loader <------------------ browser environment variables
```

`next build` currently generates 537 static pages: framework pages plus 532 `/site/[id]` routes.

## Main boundaries

### Routes

- `src/app/page.tsx`: server-rendered homepage shell and collection statistics.
- `src/app/map/page.tsx`: dedicated map route with a Suspense boundary.
- `src/app/site/[id]/page.tsx`: static parameter generation and one-site dossier.

### Client interaction

- `src/components/home/HomeClient.tsx`: homepage filter state, selection state, index grouping, embedded map, and preview.
- `src/components/map/MapApp.tsx`: dedicated map filters, query-string synchronisation, selection, list/panel state, and preview.
- `src/components/map/MapCanvas.tsx`: AMap SDK loading and lifecycle, province layer, label markers, map view persistence, selection rendering, and camera movement.
- `PreviewDrawer.tsx` is shared by both map experiences.

### Domain and data access

- `src/lib/types.ts`: TypeScript data shape, enums, grouping constants, colours, and archive-number formatting.
- `src/lib/data.ts`: imports the runtime JSON, asserts it to `Building[]`, derives statistics, grouping, distance, and nearby-site results.
- There is no runtime schema validation between JSON and TypeScript.

### Data tooling

- Python scripts implement the original Yingzao annotation, geocoding, retry, and description stages.
- Node scripts implement newer API enrichment, image lookup, and merge operations.
- Inputs, intermediates, logs, checkpoints, review reports, backups, and frontend artifacts are not yet separated by a stable lifecycle.

## State and URL behavior

The homepage and dedicated map intentionally use different filter shapes today:

- Homepage: single value per dynasty, city, type, and tier; no query-string persistence.
- Dedicated map: multi-select arrays, text search, Yingzao-only toggle, and query-string persistence.

Both independently implement filtering, selection, map displacement, legends, and preview wiring. `MapCanvas` is shared, but the surrounding domain logic is duplicated.

`/site/[id]` is the canonical detail route. `MapApp` may read a legacy `id` query parameter on initial load, but it no longer writes selection IDs to the map URL.

## External dependencies and trust boundaries

- The browser loads AMap with `NEXT_PUBLIC_AMAP_KEY` and `NEXT_PUBLIC_AMAP_SECRET`.
- AMap browser credentials are public by construction and must be restricted by allowed domains in the AMap console.
- `AMAP_WEB_KEY` is used only by local scripts and must never be committed.
- Wikipedia/Wikimedia and AMap enrichment outputs require review; successful network retrieval does not establish factual correctness.

## Confirmed structural risks

1. `MapCanvas` combines SDK adaptation, persistence, marker presentation, selection events, and camera policy behind `any`-typed AMap objects.
2. Homepage and `/map` duplicate filter and selection domain behavior with incompatible state shapes.
3. The runtime dataset crosses into TypeScript through `as unknown as Building[]` with no schema check.
4. There is no automated test runner or data-validation gate.
5. `npm run lint` points to `next lint`, which is not a valid command for the installed Next.js version.
6. Data pipeline stages and artifacts do not have one declared source-to-runtime path.
7. Several pipeline scripts use machine-specific absolute paths.

## Safe refactoring sequence

The current evidence supports this order:

1. Establish deterministic type, lint, test, build, and data-validation commands.
2. Define and validate the runtime `Building` contract.
3. Extract pure filter/query transformations with tests.
4. Introduce a typed AMap adapter boundary and reduce responsibilities in `MapCanvas`.
5. Reconcile homepage and dedicated-map interaction models deliberately.
6. Define the data lifecycle and make pipeline entry points repeatable.

Each item must be delivered as independently verifiable vertical slices rather than as one rewrite.
