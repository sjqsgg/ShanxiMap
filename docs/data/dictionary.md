# Runtime data dictionary

Status: `src/data/buildings.json` at 2026-07-20

The runtime artifact contains 532 objects. The TypeScript declaration is `Building` in `src/lib/types.ts`. `npm run validate:data` now checks the collection shape, essential identity and map-display primitive types, unique IDs, finite coordinates, and visit tiers through a deterministic baseline validator.

## Identity and classification

| Field | Type | Meaning |
|---|---|---|
| `id` | number | Stable archive identifier; currently unique across all 532 records. |
| `name` | string | Display name of the protected site. |
| `type` | string | Official-style category used by product filters. Current values are 古建筑, 石窟寺及石刻, 古遗址, 古墓葬, 近现代/革命史迹, 其他. |
| `tier` | enum | Editorial visit tier: 必去, 推荐, 小众, 可选. Not an official classification. |
| `batch` | string | National-protection batch label. |
| `batch_no` | string | Batch number in display-oriented form. |
| `year` | number | Announcement year associated with the batch. |

## Chronology and location

| Field | Type | Meaning |
|---|---|---|
| `dynasty` | string | Full chronology label preserved for display. |
| `earliest_dynasty` | string | Normalised earliest-period label used for filtering and statistics. |
| `dynasty_sort` | number | Numeric chronology key used for ordering. |
| `address` | string | Human-readable address or locality description. |
| `city` | string | One of Shanxi's 11 prefecture-level city labels. |
| `county` | string | County/district/city subdivision; may be empty when the source lacks it. |

## Coordinates

| Field | Type | Meaning |
|---|---|---|
| `lat` | number | Latitude expected to align with AMap's GCJ-02 display. |
| `lng` | number | Longitude expected to align with AMap's GCJ-02 display. |
| `geo_precision` | optional enum | Project confidence/source class: `high`, `amap`, `approx`, or `county`. |
| `geo_source` | optional string | Free-form provenance for the coordinate. |

Current precision counts: 449 high, 23 amap, 32 approx, 28 county. Precision labels are project metadata, not measured error guarantees.

## Description and research enrichment

| Field | Type | Meaning |
|---|---|---|
| `description` | string | User-facing summary. |
| `desc_source` | optional enum | `manual`, `wiki`, or `template`. |
| `wiki_url` | optional string | Related Wikipedia page used as a reference/enrichment link. |
| `yingzao` | optional string | Documented Yingzao Society relationship such as survey or visit. |
| `yingzao_source` | optional string | Citation label supporting `yingzao`. |

Current description counts: 70 manual, 379 wiki, 83 template. There are 16 Yingzao-annotated records and 517 records with a `wiki_url`.

## Practical and media enrichment

| Field | Type | Meaning |
|---|---|---|
| `is_open` | optional boolean or null | Retrieved opening-state signal. It is not currently presented as a guaranteed live status. |
| `tel` | optional string | Retrieved telephone information. |
| `rating` | optional string | Retrieved rating. String `"0"` is treated as absent by the UI. |
| `image` | optional object | Wikimedia image metadata. |
| `image.url` | string | Source image URL. |
| `image.thumb` | string | Thumbnail URL preferred by the UI. |
| `image.license` | string | License label displayed with the image. |
| `image.artist` | string | Creator/attribution text retained in data. |

Current enrichment coverage: 144 images, 102 telephone values, and 384 non-zero ratings.

## Contract gaps

- Optionality in TypeScript has not been checked against every JSON value at runtime.
- Free-form `type`, `yingzao`, provenance, URLs, and string ratings need exact validation rules beyond the current broad primitive checks.
- Cross-field rules are not enforced, such as requiring `yingzao_source` when `yingzao` is present.
- Positive-integer ID rules, geographic coordinate ranges, complete supported enums, and image attribution are not yet checked.
- The baseline validator is a separate command; the application still loads the JSON through a TypeScript assertion, and `npm run build` does not invoke the command directly.

The later complete-contract effort should extend the same validator seam with these rules before the pipeline is reorganised.
