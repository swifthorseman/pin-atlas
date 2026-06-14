# ADR-0006: Custom pins — coordinate + optional label, no canonical ID

- Status: Accepted
- Date: 2026-06-06

## Context

Curated places (ADR-0002) cover durable, widely-meaningful locations. But users
will want to pin things not in the dataset: restaurants, hotels, a friend's
house, an unnamed viewpoint. Many of these are real, named places — yet they are
ephemeral (a restaurant closes or rebrands) and personal. Forcing them through
the canonical-ID scheme would be wrong: a canonical ID promises "this specific
known entity, forever," which an ephemeral venue cannot honour, and a shared
canonical name would have to be either updated or frozen for everyone — wrong
for someone either way.

## Decision

Custom pins do **not** receive canonical IDs. A custom pin is a coordinate plus
an optional free-text label. **Identity is the coordinate; the label is
personal
annotation, not identity.** Two custom pins at the same coordinate with
different
labels are the same point with different notes. Custom pins are carried in the
URL as coordinates (and encoded labels), not via the ID scheme.

The dividing line between curated and custom: a place earns a curated ID if it
is durable and plausibly meaningful to many users as the *same* entity;
everything else is a custom pin.

## Alternatives considered

- **Mint canonical IDs for user-added places.** Breaks the durability promise of
  canonical IDs and creates a shared-naming conflict across users. Rejected.
- **Disallow custom pins (curated-only).** Would cap usefulness to the curated
  dataset and make V1 effectively a Switzerland demo. Rejected; at least one
  existing product had to add custom-pin naming, confirming the need.

## Consequences

- Custom-pin labels are the single, deliberate exception to "no display text in
  URL state" — tolerable because the label annotates identity rather than
  constituting it.
- Label handling is load-bearing, not edge-case: real labels are proper nouns
  with spaces, accents, apostrophes, ampersands. Enforce a length cap,
  URL-encode
  labels, and ensure separator characters (`,` `;`) inside labels cannot break
  parsing. Design this encoding correctly the first time.
- Custom pins carry no admin metadata, so determining their country/region
  requires the polygon mechanism (ADR-0004) — they drag in boundary geometry
  earlier than a curated-only plan would.
- Custom pins (label-heavy, potentially numerous) are the first feature to push
  URL length toward the stored-state migration (ADR-0005).
