# ADR-0003: Map engine — MapLibre GL

- Status: Accepted
- Date: 2026-06-06

## Context

V1 only needs to drop pins on a map, for which the simplest tool would do. But
the roadmap requires rendering derived coverage as filled, data-driven country
and region polygons that update as pins change (V1.5), plus route lines, dense
clustering, and fit-to-bounds across many features (V2/V3). The engine is
relatively hard to swap once the app is built around it.

## Decision

Use **MapLibre GL** as the map engine, with **Vite** as the build tool and
React + TypeScript as the app framework.

## Alternatives considered

- **Leaflet.** Raster-tile, DOM-marker based; wonderfully simple for V1 pins and
  three-line raster basemaps. But data-driven polygon styling, large-scale
  clustering, and vector rendering are awkward bolt-ons that strain as data
  grows — i.e. it is weakest exactly where the roadmap is heaviest. Choosing it
  would optimise for the one phase we spend least time in and fight every phase
  after. Rejected, except as a choice if V1 were a throwaway prototype (it is
  not).
- **Heavier frameworks (Next.js/Nuxt).** No backend, SSR, or routing complexity
  in V1; routing is a single page reading URL params. Unjustified. Rejected.

## Consequences

- Slightly steeper V1 setup: MapLibre needs a vector tile/style source rather
  than pointing at raster OSM tiles.
- Introduces a separate, deferred decision: the **basemap provider** (e.g. a
  hosted service like MapTiler with per-load billing, vs. self-hosting a static
  basemap with Protomaps to avoid recurring cost). This does not affect the data
  model or URL scheme and can be chosen at build time; start on a free tier and
  switch later if needed.
- Vector/data-driven styling makes V1.5 coverage colouring and later route/GPX
  rendering first-class rather than retrofits.
