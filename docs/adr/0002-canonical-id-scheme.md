# ADR-0002: Canonical place IDs — internal, GeoNames-mirrored, Wikidata cross-ref

- Status: Accepted
- Date: 2026-06-06

## Context

IDs appear in URLs that will exist "in the wild" and must remain stable
indefinitely — they cannot be cheaply changed once shared. They must be opaque
(never display names, so identity does not depend on spelling, accents, or
language). We must commit to where the canonical ID comes from before building.
A complication: the product deliberately flattens cities, towns, mountain
stations, viewpoints, and landmarks into "named point with coordinates," and
several flagship Swiss examples (e.g. Allmendhubel, Klein Matterhorn) are
non-settlement features that external gazetteers cover poorly.

## Decision

Canonical IDs are **internal and owned by the project**, of the form
`ch:place:<n>`. The `<n>` is sourced as follows:

- For places that exist in GeoNames, `<n>` mirrors the GeoNames integer ID. This
  gives free re-derivability of names/aliases/admin data.
- For features GeoNames lacks, `<n>` is minted internally in a reserved range
  (e.g. >= 900000000) with no upstream dependency. The `Place` record carries
  optional `geonames?: number` and `wikidata?: string` cross-reference fields
  used only for enrichment — **never as identity**. The ID is treated as an
  opaque string; nothing parses the numeric part for arithmetic, so integer
  width is irrelevant.

## Alternatives considered

- **GeoNames-pure (IDs externally re-derivable end to end).** Clean and fully
  re-derivable, but GeoNames is weakest exactly on the non-settlement features
  we care most about, leaving coverage gaps with no escape hatch. Rejected.
- **Raw OpenStreetMap IDs.** Best coverage, but OSM IDs are explicitly not
  stable (objects can be deleted and recreated with new IDs), which is
  disqualifying for durable URL identity. Kept only as a possible enrichment
  lookup, never as identity.
- **Wikidata QIDs as canonical.** Conceptually clean and multilingual, but
  coordinates/admin data are less uniformly populated and minor features may
  lack items. Adopted as an optional cross-reference instead.
- **Fully internal from scratch.** Total control but forfeits free enrichment
  and re-derivability for the common case. Rejected in favour of the hybrid.

## Consequences

- The common case gets GeoNames data and re-derivability for free; the long tail
  of obscure features has a clean internally-minted escape hatch.
- Requires one documented governance rule: which numeric range is
  GeoNames-mirrored vs. internally minted. (Below 900000000 =
  GeoNames-mirrored; >= 900000000 = internally minted.)
- Because the ID is an opaque string, the range convention can later be replaced
  with a prefix marker (e.g. `ch:place:x1`) or random tokens without affecting
  any consumer of the ID.
- The app never depends on GeoNames being reachable at runtime.
