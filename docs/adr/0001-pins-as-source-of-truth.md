# ADR-0001: Pins and routes are the source of truth; coverage is derived

- Status: Accepted
- Date: 2026-06-06

## Context

A travel map can be built two ways: let users mark countries/regions as visited
directly (a checklist), or let users record concrete places/routes and *derive*
larger coverage from them. The product is a record of travel history, not a
checklist, and we want a single source of truth that scales from a pin up to a
continent without the user maintaining two parallel records.

## Decision

Places and routes are the only things the user records. Countries, cantons,
states, provinces, and other regions are **derived views** computed from the
recorded places/routes. The user never manually marks a country or region as
visited in the core workflow.

## Alternatives considered

- **Manual country/region checklist.** Familiar (many "visited countries" apps
  do this) and trivial to implement, but it creates a second source of truth
  that can disagree with the pins, and it does not capture *where* in a country
  someone went. Rejected as the core model (a derived count can still be shown).
- **Hybrid (pins + manual overrides).** Adds the disagreement problem back in.
  Rejected for V1; could be revisited only with a clear precedence rule.

## Consequences

- Coverage logic becomes a first-class concern (see ADR-0004) rather than a
  stored field.
- The data model stays clean: one source of truth, everything else computed.
- Validated externally: at least one existing product uses the same
  derived-coverage model, confirming the approach.
- The user cannot mark a country "visited" without a concrete place in it — an
  intentional constraint, not a bug.
