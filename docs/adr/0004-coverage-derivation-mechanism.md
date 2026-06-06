# ADR-0004: Coverage derivation — metadata then polygon (two mechanisms)

- Status: Accepted
- Date: 2026-06-06

## Context
ADR-0001 establishes that coverage is derived from pins/routes. There are two
genuinely different ways to compute "which country/region does this belong to":
read precomputed metadata off a curated record, or test a coordinate/line
against boundary polygons. These are not two settings of one mechanism; they
have different data requirements and different failure modes.

## Decision
Use **metadata-based** coverage for V1/V1.5 and introduce **polygon-based**
coverage later for the cases metadata cannot serve.
- V1: derive country from each curated place's `countryCode`.
- V1.5: derive Swiss cantons from each curated place's `admin1`.
- V2/V3: introduce polygon containment/intersection for routes, uploaded GPX,
  and custom pins — none of which carry admin metadata.

## Alternatives considered
- **Polygon-based from V1.** More general and globally scalable, but pulls in
  boundary geometry, point-in-polygon tooling, and the associated edge cases
  immediately, slowing the MVP for no V1 benefit. Rejected for V1.
- **Metadata-only forever.** Cannot handle custom pins, routes, or GPX, which
  have no curated admin fields. Insufficient for the roadmap. Rejected.

## Consequences
- V1/V1.5 coverage is only as good as curation, and works only for curated
  places — acceptable because V1 has only curated pins.
- The moment custom pins (ADR-0006), routes, or GPX arrive, the polygon path is
  required; it is an addition, not an upgrade of the metadata path.
- Boundary datasets (e.g. Natural Earth, official regional boundaries) become a
  dependency at V2/V3, not V1.
- Containment edge cases — small islands, enclaves, disputed/ambiguous
  territories — are where polygon logic breaks first and must be explicitly
  tested. (An existing product shipped a bug where an island nation was not
  counted; we test for this class directly.)
