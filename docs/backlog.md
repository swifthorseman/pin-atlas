# Pin Atlas — Backlog

> **Status:** Living document. The work breakdown for delivery. Companion to
> `spec.md` (what the product is) and `adr/` (why the technical choices).
>
> **Structure:** Epic → Stories → Acceptance Criteria. An **epic** is one
> demonstrable capability ("a user can now do X"). A **story** is a user-facing
> slice inside it. Acceptance criteria are the check that the story is done.
>
> **Working method:** take one epic per session. At the start of the session,
> point Claude Code at `spec.md`, the relevant ADRs, and the root `CLAUDE.md`.
> Implement story by story, verify each against its acceptance criteria, commit,
> then move on. Do not pull later-phase work into a V1 epic — the phasing is the
> point.
>
> **Epic dependency order is strict:** each epic depends only on those before
> it, and each leaves the app in a working, committable state. You can stop
> after any epic and have something coherent.

---

## V1 — Shareable Pin Map

Six epics. End state: a user opens a map, searches for curated places, adds them
as pins, and shares the map by URL; visited countries are derived internally.

---

### Epic V1-E1 — Running app with a map

**Goal / demo:** `npm run dev` opens a page showing a MapLibre map clipped to
Switzerland. No pins, no search yet.

**Why first:** highest integration risk — React + TypeScript + Vite + MapLibre
all come together here for the first time. Get it working before anything
depends on it. (ADR-0003 engine; ADR-0007 clipped view.)

#### Story V1-E1-S1 — Scaffold the app ✅

- Vite + React + TypeScript project runs locally with `npm run dev`.
- Project structure follows spec §14 (`components/`, `domain/`, `services/`,
  `data/`, `tests/`).
- Build produces no type errors.

#### Story V1-E1-S2 — Render a map ✅

- A MapLibre GL map renders full-page.
- A basemap source is configured (free-tier or self-hosted; see ADR-0003
  consequences).
- Map controls (zoom) are present.

#### Story V1-E1-S3 — Clip initial view to the dataset ✅

- Initial viewport is fitted to Switzerland's bounds.
- The view does not open as a bare world map with no coverage.
- Panning beyond the dataset is constrained or clearly bounded (maxBounds
  acceptable).

---

### Epic V1-E2 — Place data and search

**Goal / demo:** typing "Zermatt" (or "Murren", "Luzern", "Genève") resolves to
the correct curated place, shown in a results list. No map interaction yet.

**Depends on:** E1. (Spec §13 search; §15 data; ADR-0002 IDs.)

#### Story V1-E2-S1 — Define domain types ✅

- `Place`, `CustomPin`, `Route`, `MapState` types exist per spec §11.
- `Place.id` is a stable opaque string; `displayName`/`searchAliases` are
  separate from identity.
- Cross-reference fields `geonames`/`wikidata` present and documented as
  non-identity.

#### Story V1-E2-S2 — Curated Switzerland dataset ✅

- A static JSON dataset of traveller-relevant Swiss places exists under
  `data/countries/ch/`.
- Each place has a stable opaque ID following the ADR-0002 scheme
  (GeoNames-mirrored where possible; reserved range for minted IDs).
- Each place has multilingual `displayName` and `searchAliases` covering the
  known naming variants.
- Dataset files are committed source data (never git-ignored).

#### Story V1-E2-S3 — Search resolves names to IDs ✅

- Exact-name match works (`Bern`, `Interlaken`, `Zermatt`, `Gimmelwald`).
- Alias and accent-insensitive match works (`Murren`→`Mürren`;
  `Almenhubel`→`Allmendhubel`).
- Multi-name places resolve to one ID (`Luzern`/`Lucerne`; `Murten`/`Morat`;
  `Geneva`/`Genève`/`Genf`/`Ginevra`).
- Results show enough context to disambiguate (e.g. "Mürren — Bern,
  Switzerland").
- Similar names are not confused (`Grindlewald` may suggest `Grindelwald`, never
  `Gimmelwald`).

---

### Epic V1-E3 — Pins on the map

**Goal / demo:** selecting a search result drops a pin on the map; a sidebar
lists selected places; removing one removes its pin.

**Depends on:** E1, E2. (Spec §17 pin behaviour.)

#### Story V1-E3-S1 — Add a place as a pin ✅

- Selecting a search result adds the place to selected state.
- A pin renders at the place's coordinates.
- Adding a place already selected does not create a duplicate.

#### Story V1-E3-S2 — Selected-places sidebar ✅

- A sidebar lists currently selected places by display name.
- Each entry has a remove control.
- Removing an entry removes its pin from the map.

#### Story V1-E3-S3 — Pin interaction ✅

- Clicking a pin shows the place name and basic context.
- (Clustering/labels by zoom may be deferred to V1.5; not required here.)

---

### Epic V1-E4 — URL state (the differentiator)

**Goal / demo:** selected pins serialise into the URL; reloading restores them;
opening the URL in another tab/browser reconstructs the same map.

**Depends on:** E3. (Spec §12 URL rules; ADR-0005 state source. This epic
delivers the account-free shareable-URL property.)

#### Story V1-E4-S1 — Serialise state to the URL ✅

- Selected place IDs are encoded as opaque IDs in the URL (e.g.
  `?places=ch:place:2660646,...`).
- Display names/slugs are never used as state.
- Ordering is deterministic; IDs are deduplicated.
- The URL updates when pins are added or removed.

#### Story V1-E4-S2 — Reconstruct state from the URL ✅

- Loading a URL restores exactly the encoded pins.
- Unknown IDs are ignored gracefully (no crash, no error state).
- Duplicate IDs in the URL are deduplicated.

#### Story V1-E4-S3 — State-source boundary ✅

- URL parsing produces a `MapState`; the app consumes `MapState` without knowing
  its origin.
- URL-parsing logic is isolated (not leaked into components), so a future
  stored-map/short-link source can be added without touching the data model or
  UI. (ADR-0005.)

---

### Epic V1-E5 — Map controls

**Goal / demo:** copy/share the URL, clear all pins, and fit the map to the
selected pins, all from the UI.

**Depends on:** E3, E4. (Spec §17 controls.)

#### Story V1-E5-S1 — Copy / share URL ✅

- A control copies the current shareable URL to the clipboard.
- The copied URL reconstructs the current map when opened.

#### Story V1-E5-S2 — Clear all ✅

- A control removes all selected places.
- The URL and map update to the empty state.

#### Story V1-E5-S3 — Fit to selected ✅

- A control adjusts map bounds to fit all selected pins.
- With no pins selected, the control is disabled or no-ops gracefully.

---

### Epic V1-E6 — Derived country coverage (internal)

**Goal / demo:** selecting Swiss pins computes which country (and, where known,
which canton) they fall in. Output may be a text readout — colouring is V1.5.

**Depends on:** E3. (Spec §16 coverage; ADR-0001 derived; ADR-0004 metadata
mechanism.)

#### Story V1-E6-S1 — Derive country from selected places ✅

- Each selected place maps to its `countryCode` (metadata mechanism, ADR-0004).
- Country coverage is computed from selected places, not manually selected.
- Multiple pins in one country do not duplicate the country in coverage.

#### Story V1-E6-S2 — Surface coverage internally ✅

- Derived coverage is exposed (readout, console, or simple list) — full map
  colouring is explicitly out of scope for V1.
- Coverage recomputes when pins change.

---

### V1 Definition of Done

A user can: open a map (clipped to Switzerland), search for curated places, add
them as pins, remove them, copy/share a URL that reconstructs the same map on
reload or for another person, and have visited countries derived internally from
the pins. Tests cover URL state, search aliases, and derived coverage (see
below).

---

### Epic V1-E7 — V1 test coverage

**Goal / demo:** the V1 acceptance behaviours are protected by automated tests.

**Note:** can be folded into E2/E4/E6 as you go (test-alongside) rather than run
as a trailing epic. Listed separately so the coverage is not forgotten. (Spec
§19.)

#### Story V1-E7-S1 — URL state tests ✅

- Empty URL → empty state.
- Valid IDs parse correctly.
- Duplicates deduplicated.
- Unknown IDs ignored.
- Add/remove updates URL.
- Serialisation deterministic.

#### Story V1-E7-S2 — Search tests ✅

- The resolution cases listed in V1-E2-S3 are covered.
- Alias and accent-insensitive cases tested.
- Same-ID cases tested (multi-name places resolve to one ID).

#### Story V1-E7-S3 — Coverage tests ✅

- Pin in Switzerland → Switzerland represented.
- Duplicates do not double-count.
- Coverage stays derived.
- (Canton cases — Zermatt → Valais, Mürren → Bern — moved to V1.5-E1; canton
  derivation is V1.5.)

---

### V1 refinement — Alias language policy ✅

Curated aliases restricted to the country's official Latin-script languages plus
English; non-Latin native scripts and broader exonyms are a separate, deliberate
feature. (ADR-0008.)

- ADR-0008 records the decision and supersedes the spec §10 best-effort-exonym
  stance.
- `spec.md` §10 amended (and the §13/§19 exonym references); best-effort-exonym
  allowance removed.
- Curated dataset audited; `Ginebra` removed from Geneva (the lone
  non-official-language alias).
- Search guard: `Ginebra` no longer resolves to Geneva.

---

## V1.1 — End-to-end smoke tests

One epic. End state: the core interactive flows of V1 are exercised by automated
browser tests (Playwright), so the wiring across React + MapLibre + DOM is
verified without manually clicking through the app, and regressions in those
flows are caught automatically.

**Why this exists:** unit tests cover the logic layer (URL state, search,
coverage) but cannot verify the assembled UI: that clicking a search result
drops a pin, that remove/clear actually update map and sidebar, that copy writes
the right URL, that a cold-loaded share link reconstructs the map. Today that
verification is manual (launch browser, click through everything), and the cost
grows with every feature. This builds the safety net once.

**Execution position:** built **before** the V1.2 deploy work and before testing
V1 in anger, so tweaks discovered during real use are made under a regression
net rather than re-verified by hand.

**Scope discipline (YAGNI / INVEST):** assert only on **DOM-observable** state:
MapLibre `Marker` DOM elements, sidebar entries, the URL, the clipboard. Do NOT
assert on map-canvas pixels or basemap rendering (WebGL canvas is opaque to the
test driver); do NOT assert that the map panned to specific bounds (needs
map-instance hooks, out of scope). Five core flows only; not exhaustive
coverage.

---

### Epic V1.1-E1 — Playwright smoke suite

**Goal / demo:** `npx playwright test` drives a real browser through the core V1
flows and passes; breaking a flow in app code makes it fail.

**Depends on:** the existing V1 app. Independent of V1.2/V1.3.

#### Story V1.1-E1-S1 — Playwright harness

- Playwright is added as a dev dependency with a `playwright.config.ts` and a
  test script (e.g. `npm run test:e2e`).
- The config starts the app for tests via a `webServer` block (built preview,
  e.g. `npm run preview`, to run against production-like output).
- Headless Chromium is configured to obtain a WebGL context so MapLibre renders
  (apply the known headless flag if required).
- A trivial first test (app loads, map container present) passes, proving the
  harness works end to end.

#### Story V1.1-E1-S2 — Core interaction flows

Each flow asserts only on DOM-observable state (markers, sidebar, URL,
clipboard):

- **Add a pin:** search a known place (e.g. "Zermatt"), click the result, assert
  a marker element exists and the sidebar lists the place.
- **Remove a pin:** with two places selected, remove one; assert its sidebar
  entry and marker are gone and the other remains.
- **Clear all:** with places selected, clear all; assert the sidebar is empty
  and the URL has no `places` param.
- **Copy URL:** with places selected, click copy; assert the clipboard contains
  the expected `?places=…` URL. *(Grant clipboard permission in the Playwright
  context.)*
- **Reconstruct from URL:** load a cold URL containing `?places=…`; assert the
  corresponding markers and sidebar entries appear.

#### Story V1.1-E1-S3 — CI integration

- A CI job installs the Chromium browser binary and runs the e2e suite.
- The e2e job runs as part of, or alongside, the existing `verify` gate so a
  broken core flow fails CI.
- Browser install is cached where practical to keep CI time reasonable.

---

### V1.1 Definition of Done

`npx playwright test` drives a real browser through the five core V1 flows (add,
remove, clear, copy-URL, reconstruct-from-URL), asserting on DOM-observable
state only; the suite runs in CI and fails when a core flow breaks. No product
behaviour changes.

---

## V1.2 — Public Deployment

Three epics. End state: a real public URL renders the app with a production
basemap, served over a configured host with sensible response headers. This
realises the product's core differentiator (a shareable URL, no account; spec
§1), which is theoretical until the app is actually public.

**Why before V1.5:** the shareable-URL property is the wedge; deploying makes it
real, and the planned blog post needs a live link. Coverage views (V1.5)
elaborate a product that should first exist in public.

**Scope discipline (YAGNI):** this milestone makes the existing V1 app public
and nothing more. No new product features. No speculative security hardening
beyond what a public static SPA needs. No observability/analytics: those attach
to features or a backend that do not yet exist and are deferred to later point
releases.

**Epic dependency order:** E1 (basemap) and E2 (hosting) are independent and may
be done in either order. E3 (headers/CSP) depends on both, because the CSP must
admit whatever the basemap provider fetches and is applied by the host.

---

### Epic V1.2-E1 — Production basemap

**Goal / demo:** the map renders real, detailed basemap tiles (Swiss town and
terrain detail at local zoom) from MapTiler instead of the MapLibre demo tiles.

**Depends on:** nothing (operates on existing V1). (ADR-0009; ADR-0003 engine;
spec §17 Map UX.)

#### Story V1.2-E1-S1 — Swap demo tiles for the MapTiler style

- `BASEMAP_STYLE` in `src/config.ts` points at a MapTiler vector style URL, not
  `demotiles.maplibre.org`.
- The MapTiler API key is read from a Vite environment variable (e.g.
  `VITE_MAPTILER_KEY`), not hardcoded in committed source.
- `.env` files carrying the key are git-ignored; an `.env.example` documents the
  variable name with no real value.
- The map renders at all zoom levels used by the app, including local zoom over
  Swiss towns (e.g. Mürren, Zermatt), showing real detail rather than coarse
  demo geometry.

#### Story V1.2-E1-S2 — Domain-restrict the key

- The MapTiler key is restricted in the MapTiler dashboard to the deployment
  origin(s) plus localhost for dev. *(Dashboard action; verified manually, not a
  code change.)*
- A short README note (or a comment by the env var in `.env.example`) records
  that the client-side key is public by design and must stay domain-restricted.

---

### Epic V1.2-E2 — Hosting

**Goal / demo:** the built app loads at a public URL, with the SPA served
correctly (deep links / refresh do not 404).

**Depends on:** ADR-0010 (hosting: Cloudflare Pages, accepted). (spec §14
frontend; §18 backend, none in V1.)

> Host decided: **Cloudflare Pages** (ADR-0010). E2 is unblocked.

#### Story V1.2-E2-S1 — Build and deploy pipeline

- The production build (`npm run build`) deploys to the chosen host on push to
  `master` (or a documented manual deploy command if CI deploy is deferred).
- The deployed site serves the Vite `dist/` output.
- The deploy step does not run before CI's `verify` job passes (existing
  branch-protection discipline is preserved).

#### Story V1.2-E2-S2 — SPA serving and custom domain

- Client-side routing / direct URL loads (e.g. a shared `?places=…` link opened
  cold) resolve to the app, not a host 404.
- The site is reachable at the intended domain (`pinatlas.com` if wired now;
  otherwise the host's default subdomain, with the custom domain noted as a
  follow-up).

---

### Epic V1.2-E3 — Response headers

**Goal / demo:** the public site loads with no console/CSP violations and
carries a minimal, correct set of security headers.

**Depends on:** E1 and E2. (The CSP must admit the basemap provider's fetches
and is applied at the host layer.)

**Scope (YAGNI):** a Content-Security-Policy that allows exactly what the app
needs (self, plus MapTiler's tile/style/font/worker origins), and two low-cost
hardening headers. Nothing speculative.

#### Story V1.2-E3-S1 — Content-Security-Policy

- A CSP is served (via the host's headers config) that allows the app's own
  assets and MapTiler's required origins for styles, tiles, fonts, and web
  workers.
- The map renders fully under the CSP with no CSP violations in the browser
  console.
- The policy does not use `unsafe-eval`; any worker/blob needs of MapLibre are
  met with the narrowest directives that work.

#### Story V1.2-E3-S2 — Baseline hardening headers

- `X-Content-Type-Options: nosniff` and `Referrer-Policy:
  strict-origin-when-cross-origin` are served.
- Headers are verified present on the deployed site (documented check, e.g.
  response inspection).

---

### V1.2 Definition of Done

The existing V1 app is reachable at a public URL, rendering production MapTiler
tiles with real local-zoom detail; a cold-loaded shared link reconstructs its
map; and the site serves a working CSP (no violations) plus baseline hardening
headers. No product behaviour has changed. This milestone only makes V1 public.

---

### Deferred to later point releases (explicitly NOT in V1.2)

- **Coverage threshold gate** (per-directory vitest thresholds, glue excluded):
  CI hygiene, independent of deployment; own point release (now V1.3).
- **Observability / error tracking (Sentry), analytics beyond host-provided**:
  attach to a backend or real traffic that do not yet exist.

---

## V1.3 — Coverage gate (CI hardening)

One epic. End state: CI fails when test coverage on the logic layer drops below
a set threshold, so coverage regressions are caught automatically as the
codebase grows.

**Why a point release, sequenced after V1.2:** it is CI hygiene, independent of
deployment and of any product feature; it does not block the public launch, but
it is cheap and makes the repo demonstrably disciplined. Best done once the site
is live (after V1.2) and before driving readers to the repo via the planned blog
post.

**Scope discipline (YAGNI / INVEST):** gate the layer where logic and bugs
actually live (`domain/`, `services/`); do NOT gate map/UI glue, which is
integration-shaped and cannot be meaningfully unit-tested in jsdom without
hollow tests. Do not chase 100%. No e2e here (e2e is V1.1).

---

### Epic V1.3-E1 — Coverage threshold in CI

**Goal / demo:** a deliberate drop in logic-layer coverage makes CI fail; normal
passing code is unaffected.

**Depends on:** nothing (operates on the existing test suite and CI).
Independent of V1.2; may be done any time after it.

#### Story V1.3-E1-S1 — Configure coverage reporting

- `vitest` is configured to collect coverage (the V8 or istanbul provider) via
  `npm run test` (or a dedicated `test:coverage` script).
- Coverage runs in the existing CI `verify` job (or a clearly-named adjacent
  job), producing a coverage summary.
- Map/UI glue is excluded from coverage measurement: `src/components/**`,
  `src/app/**`, `src/main.tsx`, and `src/components/map/MapView.tsx` (anything
  that requires a live map/DOM to exercise). The exclusion list lives in config
  and is the documented record of "these need e2e, not unit tests."

#### Story V1.3-E1-S2 — Enforce a logic-layer threshold

- A coverage threshold is enforced on the non-excluded layer (`src/domain/**`,
  `src/services/**`) such that CI fails below it.
- The threshold is set at a level the current suite already meets (do not lower
  the bar to pass; if current logic coverage is high, set it at or just below
  the current figure, not 100%).
- A deliberate removal of a logic-layer test (or addition of an untested logic
  branch) causes CI to fail; reverting it makes CI pass. *(Demonstrates the gate
  works.)*
- Config values (threshold number, include/exclude globs) live in the vitest/CI
  config, not hardcoded ad hoc.

---

### V1.3 Definition of Done

CI enforces a coverage threshold on the logic layer (`domain/`, `services/`),
with map/UI glue explicitly excluded; a coverage regression in logic fails the
build, and the exclusion list documents what is intentionally left to e2e. No
product behaviour changes.

---

## V1.5 — Derived Coverage Views (epic headers)

Adds visible coverage at low zoom without changing the input model. Still
metadata-based (ADR-0004). Stories to be detailed when V1 lands.

- **V1.5-E1 — Canton derivation:** derive Swiss cantons from selected places via
  `admin1`. Tests (deferred here from V1-E7-S3): pin in Zermatt → Valais; pin in
  Mürren → Bern.
- **V1.5-E2 — Coverage summary UI:** "N countries represented", "X/26 cantons
  represented".
- **V1.5-E3 — Country colouring at low zoom:** colour visited countries when
  zoomed out (needs the CH outline already required for cantons; no worldwide
  boundary set — ADR-0007).
- **V1.5-E4 — Zoom-dependent rendering:** pins prominent when zoomed in,
  coverage prominent when zoomed out; clustering for density.
- **V1.5-E5 — Coverage edge-case tests:** islands, enclaves, disputed/ambiguous
  territories (ADR-0004 consequences).

---

## V2 — Curated Routes (epic headers)

Introduces predefined shareable routes and the **polygon coverage mechanism**
(ADR-0004) for route-based derivation.

- **V2-E1 — Route data model + dataset:** curated routes with geometry and
  plural `countryCodes`.
- **V2-E2 — Render routes as lines.**
- **V2-E3 — Routes in URL state:** `&routes=ch:route:...`; reconstruct on load.
- **V2-E4 — Polygon coverage from routes:** boundary intersection;
  border-crossing routes mark all crossed countries.

---

## V3 — GPX Upload (epic headers)

Large geometry stays out of the URL (ADR-0005). Starts local-only.

- **V3-E1 — Local-only GPX (Option A):** parse, display, fit bounds; no sharing,
  no backend.
- **V3-E2 — GPX simplification + distance:** simplify large tracks; compute
  distance if absent.
- **V3-E3 — Shareable uploaded routes (Option B):** backend stores simplified
  geometry, returns an ID; URL references `&uploadedRoutes=rt_...`. *(First
  backend work; language decision per spec §18 deferred to here.)*
- **V3-E4 — Custom pins:** coordinate + optional label in URL; polygon coverage
  for custom pins; label encoding/length handling (ADR-0006). *(Placed here
  because custom pins drag in the polygon mechanism and push URL length toward
  stored state.)*

---

## V4 — Trips, Accounts, Stored State (epic headers)

- **V4-E1 — Stored maps + short links:** `/m/abc123` resolving to a stored
  `MapState`; the URL-length escape hatch (ADR-0005).
- **V4-E2 — Trips model:** group places/routes with date range, notes, label.
- **V4-E3 — Dates & notes:** now have a home (deferred from V1 URL state).
- **V4-E4 — Accounts:** saved maps, route library, public/private.
- **V4-E5 — Timeline:** filter/animate by year or trip.

---

### Notes on granularity (for writing future stories)

- If an epic can't be demonstrated, it's mis-cut — fold it into a neighbour.
- If an epic can't be finished in a focused session or two, split it.
- Never pull future-phase work into an earlier epic because it's "right there"
  (e.g. custom pins into the V1 pins epic) — that's the scope creep the phasing
  exists to prevent.
