# Pin Atlas — Backlog

> **Status:** Living document. The work breakdown for delivery.
> Companion to `spec.md` (what the product is) and `adr/` (why the technical choices).
>
> **Structure:** Epic → Stories → Acceptance Criteria.
> An **epic** is one demonstrable capability ("a user can now do X").
> A **story** is a user-facing slice inside it.
> Acceptance criteria are the check that the story is done.
>
> **Working method:** take one epic per session. At the start of the session,
> point Claude Code at `spec.md`, the relevant ADRs, and the root `CLAUDE.md`.
> Implement story by story, verify each against its acceptance criteria, commit,
> then move on. Do not pull later-phase work into a V1 epic — the phasing is
> the point.
>
> **Epic dependency order is strict:** each epic depends only on those before it,
> and each leaves the app in a working, committable state. You can stop after any
> epic and have something coherent.

---

# V1 — Shareable Pin Map

Six epics. End state: a user opens a map, searches for curated places, adds them
as pins, and shares the map by URL; visited countries are derived internally.

---

## Epic V1-E1 — Running app with a map

**Goal / demo:** `npm run dev` opens a page showing a MapLibre map clipped to
Switzerland. No pins, no search yet.

**Why first:** highest integration risk — React + TypeScript + Vite + MapLibre
all come together here for the first time. Get it working before anything
depends on it. (ADR-0003 engine; ADR-0007 clipped view.)

### Story V1-E1-S1 — Scaffold the app ✅
- Vite + React + TypeScript project runs locally with `npm run dev`.
- Project structure follows spec §14 (`components/`, `domain/`, `services/`, `data/`, `tests/`).
- Build produces no type errors.

### Story V1-E1-S2 — Render a map ✅
- A MapLibre GL map renders full-page.
- A basemap source is configured (free-tier or self-hosted; see ADR-0003 consequences).
- Map controls (zoom) are present.

### Story V1-E1-S3 — Clip initial view to the dataset ✅
- Initial viewport is fitted to Switzerland's bounds.
- The view does not open as a bare world map with no coverage.
- Panning beyond the dataset is constrained or clearly bounded (maxBounds acceptable).

---

## Epic V1-E2 — Place data and search

**Goal / demo:** typing "Zermatt" (or "Murren", "Luzern", "Genève") resolves to
the correct curated place, shown in a results list. No map interaction yet.

**Depends on:** E1. (Spec §13 search; §15 data; ADR-0002 IDs.)

### Story V1-E2-S1 — Define domain types ✅
- `Place`, `CustomPin`, `Route`, `MapState` types exist per spec §11.
- `Place.id` is a stable opaque string; `displayName`/`searchAliases` are separate from identity.
- Cross-reference fields `geonames`/`wikidata` present and documented as non-identity.

### Story V1-E2-S2 — Curated Switzerland dataset ✅
- A static JSON dataset of traveller-relevant Swiss places exists under `data/countries/ch/`.
- Each place has a stable opaque ID following the ADR-0002 scheme (GeoNames-mirrored where possible; reserved range for minted IDs).
- Each place has multilingual `displayName` and `searchAliases` covering the known naming variants.
- Dataset files are committed source data (never git-ignored).

### Story V1-E2-S3 — Search resolves names to IDs ✅
- Exact-name match works (`Bern`, `Interlaken`, `Zermatt`, `Gimmelwald`).
- Alias and accent-insensitive match works (`Murren`→`Mürren`; `Almenhubel`→`Allmendhubel`).
- Multi-name places resolve to one ID (`Luzern`/`Lucerne`; `Murten`/`Morat`; `Geneva`/`Genève`/`Genf`/`Ginevra`).
- Results show enough context to disambiguate (e.g. "Mürren — Bern, Switzerland").
- Similar names are not confused (`Grindlewald` may suggest `Grindelwald`, never `Gimmelwald`).

---

## Epic V1-E3 — Pins on the map

**Goal / demo:** selecting a search result drops a pin on the map; a sidebar
lists selected places; removing one removes its pin.

**Depends on:** E1, E2. (Spec §17 pin behaviour.)

### Story V1-E3-S1 — Add a place as a pin ✅
- Selecting a search result adds the place to selected state.
- A pin renders at the place's coordinates.
- Adding a place already selected does not create a duplicate.

### Story V1-E3-S2 — Selected-places sidebar ✅
- A sidebar lists currently selected places by display name.
- Each entry has a remove control.
- Removing an entry removes its pin from the map.

### Story V1-E3-S3 — Pin interaction ✅
- Clicking a pin shows the place name and basic context.
- (Clustering/labels by zoom may be deferred to V1.5; not required here.)

---

## Epic V1-E4 — URL state (the differentiator)

**Goal / demo:** selected pins serialise into the URL; reloading restores them;
opening the URL in another tab/browser reconstructs the same map.

**Depends on:** E3. (Spec §12 URL rules; ADR-0005 state source. This epic delivers the account-free shareable-URL property.)

### Story V1-E4-S1 — Serialise state to the URL
- Selected place IDs are encoded as opaque IDs in the URL (e.g. `?places=ch:place:2660646,...`).
- Display names/slugs are never used as state.
- Ordering is deterministic; IDs are deduplicated.
- The URL updates when pins are added or removed.

### Story V1-E4-S2 — Reconstruct state from the URL
- Loading a URL restores exactly the encoded pins.
- Unknown IDs are ignored gracefully (no crash, no error state).
- Duplicate IDs in the URL are deduplicated.

### Story V1-E4-S3 — State-source boundary
- URL parsing produces a `MapState`; the app consumes `MapState` without knowing its origin.
- URL-parsing logic is isolated (not leaked into components), so a future stored-map/short-link source can be added without touching the data model or UI. (ADR-0005.)

---

## Epic V1-E5 — Map controls

**Goal / demo:** copy/share the URL, clear all pins, and fit the map to the
selected pins, all from the UI.

**Depends on:** E3, E4. (Spec §17 controls.)

### Story V1-E5-S1 — Copy / share URL
- A control copies the current shareable URL to the clipboard.
- The copied URL reconstructs the current map when opened.

### Story V1-E5-S2 — Clear all
- A control removes all selected places.
- The URL and map update to the empty state.

### Story V1-E5-S3 — Fit to selected
- A control adjusts map bounds to fit all selected pins.
- With no pins selected, the control is disabled or no-ops gracefully.

---

## Epic V1-E6 — Derived country coverage (internal)

**Goal / demo:** selecting Swiss pins computes which country (and, where known,
which canton) they fall in. Output may be a text readout — colouring is V1.5.

**Depends on:** E3. (Spec §16 coverage; ADR-0001 derived; ADR-0004 metadata mechanism.)

### Story V1-E6-S1 — Derive country from selected places
- Each selected place maps to its `countryCode` (metadata mechanism, ADR-0004).
- Country coverage is computed from selected places, not manually selected.
- Multiple pins in one country do not duplicate the country in coverage.

### Story V1-E6-S2 — Surface coverage internally
- Derived coverage is exposed (readout, console, or simple list) — full map colouring is explicitly out of scope for V1.
- Coverage recomputes when pins change.

---

## V1 Definition of Done

A user can: open a map (clipped to Switzerland), search for curated places, add
them as pins, remove them, copy/share a URL that reconstructs the same map on
reload or for another person, and have visited countries derived internally from
the pins. Tests cover URL state, search aliases, and derived coverage (see below).

---

## Epic V1-E7 — V1 test coverage

**Goal / demo:** the V1 acceptance behaviours are protected by automated tests.

**Note:** can be folded into E2/E4/E6 as you go (test-alongside) rather than run
as a trailing epic. Listed separately so the coverage is not forgotten.
(Spec §19.)

### Story V1-E7-S1 — URL state tests
- Empty URL → empty state.
- Valid IDs parse correctly.
- Duplicates deduplicated.
- Unknown IDs ignored.
- Add/remove updates URL.
- Serialisation deterministic.

### Story V1-E7-S2 — Search tests
- The resolution cases listed in V1-E2-S3 are covered.
- Alias and accent-insensitive cases tested.
- Same-ID cases tested (multi-name places resolve to one ID).

### Story V1-E7-S3 — Coverage tests
- Pin in Switzerland → Switzerland represented.
- Pin in Zermatt → Valais.
- Pin in Mürren → Bern.
- Duplicates do not double-count.
- Coverage stays derived.

---

# V1.5 — Derived Coverage Views (epic headers)

Adds visible coverage at low zoom without changing the input model. Still
metadata-based (ADR-0004). Stories to be detailed when V1 lands.

- **V1.5-E1 — Canton derivation:** derive Swiss cantons from selected places via `admin1`.
- **V1.5-E2 — Coverage summary UI:** "N countries represented", "X/26 cantons represented".
- **V1.5-E3 — Country colouring at low zoom:** colour visited countries when zoomed out (needs the CH outline already required for cantons; no worldwide boundary set — ADR-0007).
- **V1.5-E4 — Zoom-dependent rendering:** pins prominent when zoomed in, coverage prominent when zoomed out; clustering for density.
- **V1.5-E5 — Coverage edge-case tests:** islands, enclaves, disputed/ambiguous territories (ADR-0004 consequences).

---

# V2 — Curated Routes (epic headers)

Introduces predefined shareable routes and the **polygon coverage mechanism**
(ADR-0004) for route-based derivation.

- **V2-E1 — Route data model + dataset:** curated routes with geometry and plural `countryCodes`.
- **V2-E2 — Render routes as lines.**
- **V2-E3 — Routes in URL state:** `&routes=ch:route:...`; reconstruct on load.
- **V2-E4 — Polygon coverage from routes:** boundary intersection; border-crossing routes mark all crossed countries.

---

# V3 — GPX Upload (epic headers)

Large geometry stays out of the URL (ADR-0005). Starts local-only.

- **V3-E1 — Local-only GPX (Option A):** parse, display, fit bounds; no sharing, no backend.
- **V3-E2 — GPX simplification + distance:** simplify large tracks; compute distance if absent.
- **V3-E3 — Shareable uploaded routes (Option B):** backend stores simplified geometry, returns an ID; URL references `&uploadedRoutes=rt_...`. *(First backend work; language decision per spec §18 deferred to here.)*
- **V3-E4 — Custom pins:** coordinate + optional label in URL; polygon coverage for custom pins; label encoding/length handling (ADR-0006). *(Placed here because custom pins drag in the polygon mechanism and push URL length toward stored state.)*

---

# V4 — Trips, Accounts, Stored State (epic headers)

- **V4-E1 — Stored maps + short links:** `/m/abc123` resolving to a stored `MapState`; the URL-length escape hatch (ADR-0005).
- **V4-E2 — Trips model:** group places/routes with date range, notes, label.
- **V4-E3 — Dates & notes:** now have a home (deferred from V1 URL state).
- **V4-E4 — Accounts:** saved maps, route library, public/private.
- **V4-E5 — Timeline:** filter/animate by year or trip.

---

## Notes on granularity (for writing future stories)

- If an epic can't be demonstrated, it's mis-cut — fold it into a neighbour.
- If an epic can't be finished in a focused session or two, split it.
- Never pull future-phase work into an earlier epic because it's "right there"
  (e.g. custom pins into the V1 pins epic) — that's the scope creep the phasing
  exists to prevent.
