# Runtime data dictionary

Status: `src/data/buildings.json` at 2026-07-22

The runtime artifact contains 532 objects. The TypeScript declaration is `Building` in `src/lib/types.ts`. The pure `validateBuildings(unknown)` boundary checks the complete runtime record shape and returns trusted `Building[]` only when every record passes; `npm run validate:data` applies that same boundary to the committed artifact.

## Identity and classification

| Field | Type | Meaning |
|---|---|---|
| `id` | number | Stable archive identifier; currently unique across all 532 records. |
| `name` | string | Display name of the protected site. |
| `type` | string | Official-style category used by product filters. Current values are 古建筑, 石窟寺及石刻, 古遗址, 古墓葬, 近现代/革命史迹, 其他. |
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
| `geo_precision` | enum | Required project confidence/source class: `high`, `amap`, `approx`, or `county`. |
| `geo_source` | string | Required, non-empty free-form provenance for the coordinate. |

Coordinates must fall within the inclusive broad envelope longitude 110.23–114.56 and latitude 34.58–40.74. Current precision counts are 449 high, 23 amap, 32 approx, and 28 county. Both the envelope and precision labels are guards/metadata, not measured accuracy guarantees.

## Description and research enrichment

| Field | Type | Meaning |
|---|---|---|
| `description` | string | User-facing summary. |
| `desc_source` | enum | Required value: `manual`, `wiki`, or `template`. |
| `wiki_url` | optional HTTP(S) URL | Related Wikipedia page used as a reference/enrichment link. |
| `yingzao` | optional string | Documented Yingzao Society relationship such as survey or visit. |
| `yingzao_source` | optional string | Citation label supporting `yingzao`. |

Current description counts: 70 manual, 379 wiki, 83 template. There are 16 Yingzao-annotated records and 517 records with a `wiki_url`.

## Practical and media enrichment

| Field | Type | Meaning |
|---|---|---|
| `is_open` | optional boolean or null | Retrieved opening-state signal. It is not currently presented as a guaranteed live status. |
| `tel` | optional string | Retrieved telephone information. |
| `rating` | optional string or empty array | Transitional compatibility only: 358 records use strings and 26 use `[]`; the final practical-information schema is deferred. |
| `image` | optional object | Wikimedia image metadata. |
| `image.url` | HTTP(S) URL | Required source image URL when `image` exists. |
| `image.thumb` | HTTP(S) URL | Required thumbnail URL when `image` exists. |
| `image.license` | non-empty string | Required license label when `image` exists. |
| `image.artist` | non-empty string | Required creator/attribution when `image` exists. |

Current enrichment coverage: 144 images, 102 telephone values, 358 string ratings, and 26 transitional empty-array ratings.

## Contract enforcement and remaining boundary

- Runtime records and nested image objects reject unknown fields. Source and intermediate schemas are not constrained by this frontend contract.
- IDs are unique positive integers but need not be contiguous; the collection must be a non-empty array but is not fixed at 532 records.
- City, heritage type, description source, and coordinate precision are strict enums. Display and source text such as dynasty, address, county, batch number, and `geo_source` remains open.
- `yingzao` and `yingzao_source` must be absent together, empty together, or non-empty together.
- The CLI can validate the committed artifact or an explicit candidate path and exits non-zero after reporting every issue.
- The application still loads JSON through a TypeScript assertion. Calling the same validator at application load, so invalid data also directly blocks development and production builds, is the next contract ticket.

Adding, removing, or changing a runtime field requires one reviewed migration across data, type, validator, tests, consumers, and this dictionary.
