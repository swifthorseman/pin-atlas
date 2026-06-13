# Pin Atlas — Product Specification

> **Status:** Living document. Describes what the product is and does.
> Rationale for hard-to-reverse technical decisions lives in `docs/adr/`.
> Product name: **Pin Atlas**. Repository: `pin-atlas`.

---

## 1. Product Vision

Build a personal travel atlas: a shareable, multi-scale map of places visited and routes travelled.

The product starts simple, but the long-term vision is global:

- A world map zoomed out, with visited countries visually indicated.
- Zooming into a country reveals the exact places visited.
- Zooming further reveals individual pins, route lines, and local detail.
- Routes can represent hikes, skating routes, rail journeys, road trips, ferry journeys, cycling routes, or uploaded GPS tracks.

The product is not primarily a "visited countries checklist". It is a map-based record of travel history.

The key concept:

> The user records concrete places and routes. Larger coverage such as countries, regions, cantons, states, and provinces is derived from those places and routes.

Examples:

- If the user pins Zermatt, Switzerland becomes visited and Valais becomes represented.
- If the user pins Nice, France becomes visited and Provence-Alpes-Côte d'Azur becomes represented.
- If the user pins Yangon, Myanmar becomes visited.
- If the user adds a route from Männlichen to Kleine Scheidegg, Switzerland and the relevant Swiss canton/region can be derived from that route.

The initial dataset is Switzerland, but the architecture is global from the start. See ADR-0001 (pins as source of truth).

### Differentiator

Pin Atlas is a **web app whose primary artifact is a shareable URL** — a map you can hand to anyone with no account and no sign-up. This is the deliberate wedge against the crowded field of account-based, social, mobile-native "travel map" apps. URL-shareable-without-accounts is the property to protect. See ADR-0005.

---

## 2. Core Principles

1. Places and routes are the source of truth.
2. Countries, cantons, states, provinces, and other regions are derived views.
3. The user does not manually mark countries or regions as visited in the core workflow.
4. Small shareable state lives in the URL.
5. Large state, such as uploaded GPX geometry, is stored separately and referenced by ID.
6. Stable opaque IDs are used for storage and URL state.
7. Display names, search terms, aliases, and languages are presentation concerns.
8. Search resolves user-entered names to stable IDs.
9. The product works globally, even though Switzerland is the first curated dataset.
10. V1 remains small: pins only, shareable via URL.
11. Switzerland is data/configuration, not the product boundary. Naming must never imply a Switzerland-only product.

---

## 3. Primary Concepts

### Place

A place is a named point with coordinates.

Examples: Bern, Interlaken, Zermatt, Mürren, Gimmelwald, Allmendhubel, Kleine Scheidegg, Klein Matterhorn, Nice, Monaco, Èze, Menton, Yangon, Bagan, Mandalay.

The app does not force the user to care whether a place is a city, town, village, hamlet, mountain station, viewpoint, landmark, or resort.

For V1, all of these are treated as:

> Place = named point with coordinates.

There are two kinds of place:

- **Curated place** — a durable, hand-authored entry in the dataset, with a stable opaque ID, shared identically by all users. Cities, towns, mountain stations, scenic landmarks. See ADR-0002.
- **Custom pin** — a user-dropped coordinate that is *not* in the dataset, with an optional user label. Identity is the coordinate; the label is personal annotation, not identity. Restaurants, hotels, a friend's house, an unnamed viewpoint. See ADR-0006.

The dividing line: a place earns a curated ID if it is **durable and plausibly meaningful to many users as the same entity**. Everything else is a custom pin.

### Route

A route is a named or user-uploaded line/path.

Examples: Männlichen → Kleine Scheidegg hike; Glacier Express (Zermatt → Chur); SlowUp route; skating route around Basel; Nice → Monaco day trip; a GPX track exported from Strava, Garmin, or Komoot.

Routes are V2+.

### Trip

A trip is an optional grouping of places and routes (e.g. "Switzerland 2014", "South of France 6-month stay"). Trips are a later phase, not V1.

---

## 4. Multi-Scale Map Behaviour

The same underlying data is visualised differently depending on zoom level.

### World View
- Show the whole world.
- Countries containing visited places or routes are coloured/highlighted (derived).
- Pins may be clustered, hidden, or summarised.

### Country View
- Show regional coverage where useful (cantons for Switzerland, regions/departments for France, states for the US, states/regions for Myanmar).
- Pins begin to appear depending on zoom and density.
- The user does not manually colour regions; coverage is derived.

### Regional View
- Individual pins become prominent.
- Route lines may appear.
- Clustering reduces clutter.

### Local View
- Individual pins shown clearly, with labels where appropriate.
- Route geometry shown.
- Clicking a place or route shows details.

---

## 5. V1 Scope — Shareable Pin Map

V1 is deliberately simple.

### V1 Goal
A user can search for places, add pins, and share the resulting map by URL.

### V1 Features
- Display a world map (initial viewport clipped to the available dataset — see §17 and ADR-0007).
- Search for places.
- Add/remove selected places.
- Show selected places as pins.
- Encode selected place IDs in the URL.
- Loading a URL reconstructs the same selected pins.
- Copy/share URL.
- Selected places list/sidebar.
- Clear all.
- No user accounts.
- No backend required (place data bundled or statically hosted).
- No GPX upload, no routes, no trips, no manual country/canton selection.

### V1 Initial Dataset
Switzerland is the first curated dataset. This does not make the app Switzerland-specific; the code is a global app with one initial country dataset.

### V1 Example URL
Stable opaque IDs only:
```text
/?places=ch:place:2660646,ch:place:2659811,ch:place:2657896
```
Do **not** use display names or slugs as production state (`/?places=zermatt,murren,gimmelwald` is readable but wrong — identity must not be tied to spelling or language).

### V1 Acceptance Criteria
- User can search for a known place.
- User can add the place as a pin.
- User can remove the pin.
- URL updates when pins change.
- Reloading the page restores the same pins from the URL.
- Sharing the URL with another person reconstructs the same map.
- Unknown place IDs in the URL are ignored gracefully.
- Duplicate place IDs are deduplicated.
- Map can fit to selected pins.
- Countries containing selected pins can be derived internally, even if country colouring is not fully implemented yet.

---

## 6. V1.5 Scope — Derived Coverage and Zoom Behaviour

Adds derived coverage views without changing the core user input model.

### Goal
Show aggregate coverage at low zoom levels while keeping pins as the source of truth.

### Features
- Derive visited countries from selected pins.
- Optionally colour visited countries when zoomed out.
- Derive administrative coverage for supported countries (cantons for Switzerland).
- Show a coverage summary (e.g. "5 countries represented", "8/26 Swiss cantons represented").
- At higher zoom, show pins instead of only aggregate coverage.

### Mechanism
V1/V1.5 coverage uses **metadata on curated places** (`countryCode`, `admin1`). Polygon containment is a separate mechanism introduced later for routes, GPX, and custom pins — not an upgrade of the same path. See ADR-0004.

### Important Rule
The user still adds pins. The user does not manually select countries, cantons, regions, or states.

### Acceptance Criteria
- Selected places map to countries.
- Swiss places map to cantons where known.
- Country and canton coverage calculated from selected places.
- Multiple pins in the same country/canton do not duplicate coverage.
- Coverage remains derived, not manually selected.
- Visual highlighting can be toggled or introduced after the calculation is proven.
- Edge cases covered by tests: small islands, enclaves, and disputed/ambiguous territories (these are where containment logic breaks first).

---

## 7. V2 Scope — Curated Routes

Adds predefined, shareable routes.

### Route Types (optional metadata)
hike, rail, skate, cycle, walk, road, ferry, scenic, other. The product does not depend heavily on route categories early.

### URL Example
```text
/?places=ch:place:2660646,ch:place:2659811&routes=ch:route:10001
```

### Acceptance Criteria
- User can add/remove predefined routes.
- Routes render as lines.
- Route IDs encoded in the URL.
- Shared URLs reconstruct selected places and routes.
- Country/region coverage derivable from both places and routes (polygon mechanism — ADR-0004).

---

## 8. V3 Scope — GPX Upload

Adds uploaded GPS routes (Strava, Garmin, Komoot, Apple Fitness exports, other GPX tools).

### Important Distinction
Small state goes in the URL. Large geometry does not.

### GPX Modes
- **Option A — Local-only display:** parse and display locally, no sharing, no backend. Simplest first implementation.
- **Option B — Shareable uploaded routes:** backend stores simplified geometry, returns a route ID; shared URL references it. `/?places=ch:place:2660646&uploadedRoutes=rt_abc123`
- **Option C — Account-based library:** rename/delete/group/reuse routes, public/private. Not required early.

GPX upload starts local-only (Option A) before shareable storage. See §22.

### Acceptance Criteria
- User can upload a GPX file; app parses track geometry; route displays.
- App calculates approximate distance if not present.
- App can fit map bounds to the uploaded route.
- Large GPX files are simplified before rendering/storage.

---

## 9. V4 Scope — Trips and Timeline

Trips are optional groupings of places and routes.

### Trip Model
A trip can contain: place IDs, route IDs, uploaded route IDs, date range, notes, optional display colour/label.

```json
{
  "id": "trip:south-france-2010",
  "name": "South of France",
  "placeIds": ["fr:place:nice", "fr:place:cannes", "fr:place:antibes", "fr:place:eze", "fr:place:menton"],
  "routeIds": [],
  "dateFrom": "2010-01-01",
  "dateTo": "2010-06-30"
}
```

Trips are not required for V1. Dates and notes are deferred to this phase, not carried in V1 URL state. See ADR-0005.

---

## 10. Naming Architecture

These are strictly separated.

### Storage Identity
A place or route has a stable opaque ID:
```text
ch:place:2660646
fr:place:2988507
mm:place:1298824
ch:route:10001
```
IDs are opaque and owned by the project. They are **not** display names. The canonical ID scheme is internal, mirrored from GeoNames where possible, with Wikidata as an optional cross-reference. See ADR-0002.

### URL State
URLs contain stable IDs only. URL state does not depend on language, accents, spelling, or display name. The one deliberate exception is custom-pin labels (free text), which annotate identity rather than constituting it. See ADR-0005, ADR-0006.

### Display Names
Presentation. A place can have different names per UI language:
```json
{
  "id": "ch:place:2660646",
  "displayName": { "en": "Geneva", "fr": "Genève", "de": "Genf", "it": "Ginevra", "rm": "Genevra" }
}
```

### Search Aliases
Presentation/search support; resolve user input to stable IDs:
```json
{
  "id": "ch:place:2660646",
  "searchAliases": ["Geneva", "Genève", "Geneve", "Genf", "Ginevra", "Genevra"]
}
```

### Language Support
Curated names are Latin-script only: the official languages of the place's country that use the Latin script, plus English (with accent- and punctuation-normalisation variants). For Switzerland: German, French, Italian, Romansh, and English. Where an official language uses a non-Latin script (Cyrillic, Han, Arabic, Thai, etc.), the native form is not carried, and the English or romanised name serves instead. Exonyms in non-official languages (e.g. Spanish "Ginebra" for Geneva) are not carried. Native non-Latin scripts and transliteration are a separate, deliberate feature. See ADR-0008.

### Swiss Naming Issues Stable IDs Solve
Luzern/Lucerne, Murten/Morat, Genève/Geneva/Genf/Ginevra, Mürren/Murren, Männlichen/Mannlichen, Allmendhubel/Almenhubel.

---

## 11. Data Model

### Place
```ts
export interface Place {
  id: string;            // stable opaque storage + URL identity
  countryCode: string;
  lat: number;
  lng: number;

  displayName: Record<string, string>;  // presentation
  searchAliases: string[];               // search support

  admin1?: string;       // useful for derived regional coverage
  admin2?: string;
  admin3?: string;

  // Optional cross-references for enrichment. Never used as identity. See ADR-0002.
  geonames?: number;
  wikidata?: string;

  importance?: number;
  type?: string;         // must not drive V1 UX
}
```

### CustomPin
```ts
export interface CustomPin {
  lat: number;
  lng: number;
  label?: string;        // optional user annotation; NOT identity. See ADR-0006.
}
```

### Route
```ts
export interface Route {
  id: string;
  countryCodes: string[];   // a route may cross borders, so plural
  name: Record<string, string> | string;
  type?: "hike" | "rail" | "skate" | "cycle" | "walk" | "road" | "ferry" | "scenic" | "other";
  geometry: [number, number][];
  distanceKm?: number;
  source: "curated" | "uploaded";
}
```

### Map State
```ts
export interface MapState {
  placeIds: string[];
  customPins: CustomPin[];
  routeIds: string[];
  uploadedRouteIds: string[];
}
```

No country is selected globally in state; countries are derived from selected places/routes. The application consumes a `MapState` regardless of where it came from (URL today; stored map / short link / user account later). State-source must be swappable without touching the data model. See ADR-0005.

---

## 12. URL State Rules

The URL is shareable application state.

- Use stable IDs.
- Keep ordering deterministic.
- Deduplicate IDs.
- Ignore unknown IDs gracefully.
- Avoid storing large geometry directly in the URL.
- Avoid using display names as state (custom-pin labels are the sole, deliberate exception).
- Keep the URL reasonably compact.
- Custom-pin labels are free text: URL-encode them, enforce a length cap, and ensure separator characters (`,` `;`) inside labels are encoded so they cannot break parsing.
- When URLs become too long — custom pins with labels are the first feature to push this — migrate to stored maps + short links rather than growing the query string. See ADR-0005.

Examples:
```text
/?places=ch:place:2660646,fr:place:2988507,mm:place:1298824
/?places=ch:place:2660646&routes=ch:route:10001
/?places=ch:place:2660646&custom=46.5639,7.8939,Granddad's%20cabin;46.5602,7.8881
/?places=ch:place:2660646&uploadedRoutes=rt_abc123
/m/abc123          # future short link → stored map state
```

---

## 13. Search Behaviour

Search resolves user input to stable place IDs.

Requirements:

- Search globally or within the current visible area.
- Prioritise places near the viewport where useful.
- Match exact names, aliases, and accent-insensitive variants.
- Support fuzzy matching cautiously.
- Show enough context to disambiguate.
- Do not confuse similarly named places.

Example result display:
```text
Mürren — Bern, Switzerland
Murten / Morat — Fribourg, Switzerland
Geneva / Genève / Genf — Geneva, Switzerland
Nice — Provence-Alpes-Côte d'Azur, France
```

Important cases:

- `Murren` → `Mürren`.
- `Almenhubel` → `Allmendhubel`.
- `Luzern` / `Lucerne` → same place.
- `Murten` / `Morat` → same place.
- `Genève` / `Geneva` / `Genf` / `Ginevra` → same place.
- `Grindlewald` → may suggest `Grindelwald` but must not be confused with `Gimmelwald`.

---

## 14. Suggested Architecture

### Frontend
- **TypeScript**
- **React**
- **MapLibre GL** (see ADR-0003)
- **Vite** as build tool
- `URLSearchParams` for URL state
- Static JSON datasets for the initial MVP
- Hosted vector basemap (MapTiler), referenced by style URL with a domain-restricted client-side key in `src/config.ts`. See ADR-0009.

No backend in V1. See §18 and ADR-0005.

### Suggested Directory Structure
```text
src/
  app/
  components/
    map/        MapView, PlacePins, RouteLines, CoverageLayer
    search/     SearchBox, SearchResults
    sidebar/    SelectedPlaces, SelectedRoutes
  data/
    countries/  ch/{places,regions,routes}.json, fr/..., mm/...
  domain/       Place.ts, Route.ts, MapState.ts
  services/
    search/     normaliseText.ts, searchPlaces.ts
    url-state/   parseMapState.ts, serialiseMapState.ts
    coverage/    deriveCountries.ts, deriveRegions.ts
  tests/
```

### Naming Rule (enforced)
Switzerland is data/configuration, not the product boundary. Do **not** name components `SwissMap`, `SwissSearch`, `SwissPlace`, `CantonSelector`. Prefer generic names: `MapView`, `PlaceSearch`, `Place`, `CoverageLayer`.

> **Note on curated data files:** the country JSON datasets are committed source data, not build artifacts. They must never be git-ignored.

---

## 15. Data Source Strategy

### V1
Use curated static place datasets: better quality, predictable search, easier aliases, less noise, faster MVP. For Switzerland include major cities, tourist towns, mountain villages, railway destinations, scenic places — places likely to matter to travellers.

### Later
Consider integrating external sources: OpenStreetMap/Nominatim, GeoNames, Wikidata, Natural Earth (country boundaries), official regional boundary datasets. Do not rely blindly on open search early — OSM returns shops, hotels, bus stops, and duplicates unless filtered carefully. OSM IDs are not used as canonical identity (they are not stable); see ADR-0002.

---

## 16. Derived Coverage

Coverage is computed, not manually tracked.

### Country Coverage
A country is represented if at least one selected place is within it, or at least one selected/uploaded route passes through it.

### Region Coverage
A region is represented if at least one selected place is inside it, or at least one selected/uploaded route intersects it.

### Two distinct mechanisms (see ADR-0004)
- **Metadata-based** (V1/V1.5): each curated place stores `countryCode` and `admin1`. Simple. Works only for curated places.
- **Polygon-based** (V2/V3): boundary polygons compute containment/intersection. Required for routes, GPX, and custom pins (which carry no admin metadata). Better for global scale.

Progression: V1 uses `countryCode` metadata; V1.5 uses `admin1` for Swiss cantons; V2/V3 introduces polygon intersection.

---

## 17. Map UX

### Initial View
The default product opens clipped to the available dataset's bounds (Switzerland initially), not as an empty world map with no coverage elsewhere. This is clearer than inviting the user to pan into empty regions. See ADR-0007. If selected pins exist, the map can fit to selected data. The basemap tiles are served by a hosted vector provider (MapTiler); see ADR-0009.

### Controls
V1: search bar, selected-places list, remove selected place, copy/share URL, clear all, fit to selected.
Later: add route, upload GPX, toggle pins/routes/coverage, filter by trip/year/type, timeline slider.

### Pin Behaviour
Clicking a pin shows name and context; pins cluster when zoomed out; labels appear at suitable zoom; pins remain the most concrete representation of visited places.

### Coverage Behaviour
Country/region colouring is a derived summary — visually secondary to pins when zoomed in, more prominent when zoomed out.

---

## 18. Backend Considerations

No backend in V1. The static V1 frontend is hosted on Cloudflare Pages (ADR-0010); the backend host is a separate decision deferred with the backend itself. A backend becomes useful for: uploaded GPX storage, short links, user accounts, saved maps, trip libraries, photo attachments. Likely Node/TypeScript when introduced (single language across the stack), but that, and where it runs (Cloudflare Workers, Railway, AWS, or elsewhere), is an open decision deferred until V3. See ADR-0005 and ADR-0010.

### Later Backend Entities (sketch)
```text
UploadedRoute  id, name, geometry, simplifiedGeometry, distanceKm, countryCodes, createdAt
ShortLink      id, mapState, createdAt
UserMap        id, userId, name, mapState, createdAt, updatedAt
Trip           id, userId, name, placeIds, routeIds, uploadedRouteIds, dateFrom, dateTo
```

---

## 19. Testing Strategy

### URL State
- Empty URL → empty state.
- Valid IDs parse correctly.
- Duplicates deduplicated.
- Unknown IDs ignored.
- Add/remove updates URL.
- Serialisation deterministic.
- Custom-pin labels round-trip including labels containing separator characters.

### Search
- `Bern`, `Interlaken`, `Zermatt`, `Gimmelwald` resolve correctly.
- `Murren` → `Mürren`.
- `Mürren` → `Mürren`.
- `Almenhubel` → `Allmendhubel`.
- `Luzern` / `Lucerne` → same ID.
- `Murten` / `Morat` → same ID.
- `Geneva` / `Genève` / `Genf` / `Ginevra` → same ID.
- `Ginebra` → no match (unsupported exonym, ADR-0008).

### Coverage
- A pin in Switzerland marks Switzerland represented.
- A pin in Zermatt marks Valais.
- A pin in Mürren marks Bern.
- Multiple pins in one country/canton do not duplicate.
- Coverage stays derived.
- **Island/enclave/disputed-territory cases** (e.g. small island states) are explicitly tested.

### Map
- Selected places display as pins.
- Removing one removes its pin.
- Refreshing the URL restores pins.
- Fit-to-selected adjusts bounds.

---

## 20. Suggested MVP Build Order

1. App shell with world map (clipped to dataset bounds).
2. Domain types: Place, CustomPin, Route, MapState.
3. URL parse/serialise for place IDs.
4. Small curated Switzerland place dataset.
5. Search over local dataset.
6. Selected places state from URL.
7. Render selected places as pins.
8. Update URL on add/remove.
9. Selected-place sidebar.
10. Copy/share URL.
11. Clear all.
12. Fit-to-selected.
13. Basic country derivation from selected places (metadata).
14. Tests: URL state.
15. Tests: search aliases.
16. Tests: derived coverage.

> Build in these small increments. Implement one numbered step, verify it against the matching acceptance criteria above, commit, then proceed. Reference this spec and the ADRs at the start of each session to prevent architectural drift.

---

## 21. Naming

Product name: **Pin Atlas**. Repository: `pin-atlas`.

The project must not be named as if it is Switzerland-only (avoid `swiss-travel-map`, `swiss-pins`, etc.). "Pin Atlas" pairs the input (pin) with the output (atlas) and is distinct from the crowded "pin map / visited countries" field. Keep "Pin" and "Atlas" together as one mark; do not shorten to "Atlas" alone.

---

## 22. Decisions Record

All previously open questions are now settled. Rationale for the hard-to-reverse ones is in `docs/adr/`.

1. **Public product name** → Pin Atlas. (§21)
2. **Map engine** → MapLibre GL. (ADR-0003)
3. **Initial UI view** → open clipped/fitted to the available dataset, not an empty world map. (ADR-0007)
4. **Initial Switzerland dataset size** → curated set of traveller-relevant places (cities, tourist towns, mountain villages, railway/scenic destinations); exact count an implementation detail. (§15)
5. **Custom pins allowed?** → Yes. (ADR-0006)
6. **Custom pin encoding** → coordinate + optional label carried in the URL; no canonical ID; migrate to stored state when URLs grow too long. (ADR-0005, ADR-0006)
7. **Dates/notes** → deferred to trips/accounts; not in V1 URL state. (§9, ADR-0005)
8. **GPX upload** → starts local-only before shareable storage. (§8)
9. **Dense histories** → clustering at low zoom; revisit at scale. (§17)
10. **Routes crossing borders** → mark all crossed countries as represented (`countryCodes` is plural). (§11, §16)
11. **Canonical ID source** → internal IDs, GeoNames-mirrored where possible, Wikidata as optional cross-reference. (ADR-0002)
12. **Basemap provider** → MapTiler free tier for V1, with a documented upgrade path (paid tier if commercial; self-hosted Protomaps only if traffic economics demand). (ADR-0009)
13. **Frontend hosting** → Cloudflare Pages for the static V1 frontend; the backend host is left as a separate, later decision. (ADR-0010)
