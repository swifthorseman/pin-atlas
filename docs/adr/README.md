# Architecture Decision Records

These records capture the **rationale** behind hard-to-reverse technical decisions for Pin Atlas. Each ADR is **append-only and immutable**: when a decision changes, write a new ADR that supersedes the old one rather than editing it. The "what" of the product lives in `../spec.md`; the "why" lives here.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-pins-as-source-of-truth.md) | Pins and routes are the source of truth; coverage is derived | Accepted |
| [0002](0002-canonical-id-scheme.md) | Canonical place IDs: internal, GeoNames-mirrored, Wikidata cross-ref | Accepted |
| [0003](0003-map-engine-maplibre.md) | Map engine: MapLibre GL | Accepted |
| [0004](0004-coverage-derivation-mechanism.md) | Coverage derivation: metadata then polygon (two mechanisms) | Accepted |
| [0005](0005-url-state-then-stored-state.md) | URL state now, stored state later, via a swappable state source | Accepted |
| [0006](0006-custom-pins-model.md) | Custom pins: coordinate + optional label, no canonical ID | Accepted |
| [0007](0007-switzerland-clip-not-empty-world.md) | Initial view: clip to dataset, not an empty world map | Accepted |
| [0008](0008-alias-languages-official-plus-english.md) | Curated alias languages: country official languages plus English | Accepted |
| [0009](0009-basemap-provider-maptiler.md) | Basemap provider: MapTiler free tier, with a documented upgrade path | Accepted |
| [0010](0010-hosting-cloudflare-pages.md) | Frontend hosting: Cloudflare Pages | Accepted |

### Template
```
# ADR-NNNN: Title

- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD

## Context
What forces are at play; what problem this decides.

## Decision
The choice made, stated plainly.

## Alternatives considered
What else was on the table and why it was rejected.

## Consequences
What this makes easy, what it makes harder, what it commits us to.
```
