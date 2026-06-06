# ADR-0007: Initial view — clip to dataset, not an empty world map

- Status: Accepted
- Date: 2026-06-06

## Context
V1 ships with only the Switzerland dataset, but the architecture is global.
The initial map view could either render the full world (with data only in
Switzerland) or constrain the initial viewport to the covered region. The first
is marginally easier; the second is clearer to the user.

## Decision
Open the map **clipped/fitted to the available dataset's bounds** (Switzerland
initially), constraining the initial viewport (and optionally `maxBounds`),
rather than presenting a full world map with no coverage outside Switzerland.

## Alternatives considered
- **Full world map, data only in Switzerland.** Slightly easier to implement,
  but invites the user to pan to, say, France, see nothing, and conclude the app
  is broken. Misrepresents current coverage. Rejected.

## Consequences
- More honest: the view communicates "this is what is covered right now."
- Cheap: still renders a world basemap but constrains the viewport; needs only
  the Switzerland outline already required for canton coverage, **not** a
  worldwide boundary set. So it does not pull in the boundary data that the
  full-world option would let us defer — it costs a bounds configuration.
- Also settles the "open globally or fit to dataset" question: open fitted to
  the available dataset.
- As more country datasets are added, the clip expands to the union of available
  datasets.
