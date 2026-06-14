# CLAUDE.md — Pin Atlas

Standing brief for working in this repo. Read this first, every session.

## What this project is

Pin Atlas: a web app for recording travel as **pins** (and later routes) on a
multi-scale map, shareable by URL with no account. Larger coverage (countries,
cantons, regions) is **derived** from pins, never entered manually.

## Read before non-trivial work

- `docs/spec.md` — what the product is and does (the source of truth for
  behaviour).
- `docs/adr/` — why the technical decisions were made. Each ADR is immutable; if
  a decision changes, write a new ADR that supersedes it, do not edit the old
  one.
- `docs/backlog.md` — the work breakdown (epics → stories → acceptance
  criteria).

## Non-negotiable rules (these are the things most likely to be broken by accident)

1. **IDs are opaque. Never display names.** `ch:place:2660646`, never `zermatt`.
   Identity must not depend on spelling, accents, or language. (ADR-0002)
2. **Coverage is derived, never stored or manually set.**
   Countries/cantons/regions are computed from pins/routes. No "mark country
   visited" feature. (ADR-0001)
3. **No display text in URL state — one exception.** The sole exception is a
   custom pin's label. A custom pin's **identity is its coordinate**; the label
   is personal annotation, never identity. (ADR-0005, ADR-0006)
4. **Switzerland is data, not the product boundary.** Never name anything
   `SwissMap`, `SwissSearch`, `CantonSelector`, etc. Use generic names:
   `MapView`, `PlaceSearch`, `Place`, `CoverageLayer`. (spec §14)
5. **Keep the state-source boundary clean.** URL parsing produces a `MapState`;
   the app consumes `MapState` without knowing where it came from. Do not leak
   URL-parsing logic into components — a stored-map/short-link source must be
   addable later without touching the data model or UI. (ADR-0005)
6. **Coverage has two distinct mechanisms, not one.** Metadata (`countryCode`,
   `admin1`) for curated places in V1/V1.5; polygon containment later for
   routes, GPX, and custom pins. Do not conflate them. (ADR-0004)

## Stack

React + TypeScript + Vite + MapLibre GL. **No backend in V1.** Static JSON
datasets, bundled or statically hosted. (ADR-0003)

## Curated data files are source, not artifacts

The country JSON datasets under `src/data/countries/**` are committed source
data. Never git-ignore them.

## How to work here

- Take **one backlog story at a time.** Implement it, verify against its
  acceptance criteria, then stop for review and commit. Do not run ahead.
- **Do not pull future-phase work into an earlier epic** because it's convenient
  — e.g. custom pins are V3, not part of the V1 pins epic. The phasing is
  deliberate.
- Prefer small, reviewable diffs. Explain what changed and which acceptance
  criteria it satisfies.
- When something here conflicts with an instruction in chat, surface the
  conflict rather than silently choosing.
