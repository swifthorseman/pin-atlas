# ADR-0005: URL state now, stored state later, via a swappable state source

- Status: Accepted
- Date: 2026-06-06

## Context
The product's differentiator is a shareable, account-free map: the URL *is* the
artifact. URL state is perfect for small, self-contained, anonymous snapshots,
but query strings have practical length limits. Custom pins with free-text
labels (ADR-0006) are the first feature that will push URLs past comfortable
length; dates, notes, and large geometry would too. We need URL state now
without painting ourselves into a corner later.

## Decision
V1 keeps all shareable state in the URL as opaque IDs (plus custom-pin
coordinates/labels). The application consumes a `MapState` object via a
**state-source boundary**: URL parsing produces a `MapState`, and the app
neither knows nor cares where the `MapState` came from. Dates and notes are
**not** carried in V1 URL state; they are deferred to trips/accounts. When URLs
grow too long, introduce stored maps addressed by an opaque short-link ID
(`/m/abc123`) that resolves to a stored `MapState` — the same parse/consume
boundary, just a different source.

## Alternatives considered
- **Backend + accounts from V1.** Removes URL-length worry but destroys the
  account-free, instantly-shareable property that differentiates the product,
  and adds infrastructure the MVP does not need. Rejected.
- **Grow the query string indefinitely.** Simple but hits browser/proxy URL
  limits and produces ugly, fragile links. Rejected as a long-term answer;
  acceptable only for V1's small state.
- **Put dates/notes/geometry in the URL.** Reintroduces display text and bulk
  into state, fighting the opaque-ID discipline. Rejected.

## Consequences
- One small discipline required in V1: keep URL-parsing logic out of components;
  isolate it behind the state-source boundary so additional sources (short link,
  user account) can be added without touching the data model or UI.
- Custom-pin labels are the trigger to watch for the URL-length migration.
- A backend appears only at V3 (stored GPX, short links) and beyond; its
  language is an open decision (likely Node/TypeScript for one-language
  consistency) deferred until then.
- Migrating from URL state to stored state is mechanical, not a rewrite, because
  the short link is just another opaque ID resolving to the same `MapState`.
