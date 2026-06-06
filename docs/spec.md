# Visited Map — Requirements and Suggested Design

## 1. Overall Vision

Build a web application for creating shareable visited-place maps.

The initial focus is Switzerland, but the design must not be hard-coded as a Switzerland-only product. The long-term model should support multiple countries using reusable app logic and country-specific data/configuration.

The product should let users record where they have been using pins, then later add routes such as hikes, skating routes, scenic railway journeys, cycling routes, and uploaded GPS tracks.

The core principle is:

- Small shareable state should live in the URL.
- Large state, such as uploaded GPX route geometry, can later be stored externally and referenced by an ID.

The inspiration is the stateless/shareable style of `https://douwe.com/projects/visited`, where the selected items are encoded in the URL so that anyone opening the URL sees the same map.

## 2. Product Concept

The product is not primarily an administrative checklist such as “visited cantons”.

The main concept is:

> A personal travel map made of visited places and routes.

For Switzerland, users should be able to search for any named place and add a pin. Examples:

- Bern
- Interlaken
- Zermatt
- Mürren
- Gimmelwald
- Allmendhubel
- Kleine Scheidegg
- Klein Matterhorn
- Chur
- St. Moritz
- Appenzell
- Ebenalp
- Aescher

These are not all the same administrative type. Some are cities, towns, villages, hamlets, mountain stations, viewpoints, restaurants, or landmarks. The product should not force users to care about those categories in V1. From the user’s perspective, they are all “places”.

V1 should therefore use a neutral place model:

> Place = named point with coordinates.

V2 should add routes:

> Route = named line/path with coordinates.

V3 should add uploaded GPS files:

> Uploaded GPX = user-supplied route geometry, optionally saved and shareable.

## 3. Core User Goals

Users should be able to:

1. Open a country map.
2. Search for a place by name.
3. Select the intended place from search results.
4. Add it as a visited pin.
5. See all selected pins on the map.
6. Share the map by copying the URL.
7. Open a shared URL and see the same selected places.

Future goals:

1. Add predefined routes, for example hikes, scenic railways, SlowUp routes, skating routes, or cycling routes.
2. Upload GPX files exported from Strava, Garmin, Komoot, etc.
3. Show trips or timelines by year/date.
4. Support multiple countries.

## 4. Non-Goals for V1

Do not build the following in V1 unless trivial:

- User accounts.
- Backend persistence.
- GPX upload.
- Route drawing.
- Photo storage.
- Social features.
- Complex categorisation of places.
- Canton completion logic.
- Municipal boundary colouring.

V1 should be a clean, shareable pin map.

## 5. Phased Delivery Plan

### Phase 1 — Switzerland Pin Map MVP

Goal: searchable, shareable Switzerland map using pins only.

Features:

- Display Switzerland map.
- Search for places within Switzerland.
- Add/remove visited places.
- Selected places shown as pins.
- Selected place IDs encoded in the URL query string.
- Loading a URL reconstructs the same selected pins.
- No login and no backend required.
- Basic list/sidebar of selected places.
- Copy/share URL button.

Example URL shape using stable opaque IDs:

```text
/ch?places=ch:place:2660646,ch:place:2659811,ch:place:2657896
```

The URL must encode stable place IDs, not display names, slugs, or search terms.

Human-readable names belong in the presentation/search layer only. The URL is not presentation. It is shareable application state.

Do not use URLs like this as the production model:

```text
/ch?places=zermatt,murren,gimmelwald
```

That style is readable, but it couples identity to spelling, language, and naming conventions. It becomes problematic for names such as Luzern/Lucerne, Murten/Morat, and Genève/Geneva/Genf.

Acceptance criteria:

- User can add Bern, Interlaken, Zermatt, Mürren, Gimmelwald and Allmendhubel as pins.
- Refreshing the page keeps the same pins because they are read from the URL.
- Sharing the URL with another user reconstructs the same map.
- Removing a pin updates the URL.
- No server-side state is needed.

### Phase 1.5 — Derived Regional Coverage and Zoom-Level Behaviour

Goal: keep V1 focused on pins, but prepare the product for richer map behaviour once the pin model is proven.

The app should eventually support different display modes depending on zoom level.

At low zoom levels, the map may show aggregate coverage rather than individual pins. At higher zoom levels, it should show the actual pins.

For example:

- World view: show visited countries, possibly coloured.
- Country view: show visited regions, such as Swiss cantons, derived from pins.
- Local view: show individual visited place pins.

For Switzerland specifically:

- The user should add pins only.
- The app should later derive canton coverage from those pins.
- The user should not manually mark a canton as visited in the core pin workflow.

Example:

If the user pins Zermatt, the app can infer canton coverage for Valais.

If the user pins Mürren, Gimmelwald, Interlaken, or Kleine Scheidegg, the app can infer canton coverage for Bern.

This should be treated as derived metadata, not the primary user input.

Suggested future UI behaviour:

```text
Zoomed out: show Switzerland, with cantons lightly highlighted based on pins.
Zoomed in: show actual visited pins.
Very zoomed in: show pin labels and route details.
```

For a global product, the same idea can generalise:

```text
World zoom: countries coloured by whether they contain visited pins/routes.
Country zoom: regions/states/cantons/provinces coloured by whether they contain visited pins/routes.
Local zoom: individual pins and routes displayed.
```

This should not be required for V1, but the data model should not block it.

Implementation notes:

- Places should include stable references to administrative regions where known.
- For Switzerland, a place may include canton metadata.
- Later, if using spatial boundaries, region coverage can be derived geometrically from coordinates.
- Derived region colouring should be optional and reversible.
- Pins remain the source of truth.

Acceptance criteria for Phase 1.5:

- Each Switzerland place can optionally identify its canton.
- App can calculate which cantons contain selected pins.
- App can display a simple canton coverage summary, for example `8/26 cantons represented`.
- Visual canton colouring can be added after the calculation is proven.
- User still selects places, not cantons.

### Phase 2 — Multi-Country Architecture

Goal: avoid Switzerland-only assumptions.

The app should support country-specific configuration.

Example routes:

```text
/ch?places=...
/jp?places=...
/de?places=...
/it?places=...
```

Suggested structure:

```text
src/
  app/
  components/
  map/
  search/
  url-state/
  countries/
    ch/
      country.config.json
      places.json
      routes.json
    jp/
      country.config.json
      places.json
      routes.json
```

Each country config should define:

- Country code.
- Country name.
- Map bounds.
- Default centre.
- Default zoom.
- Place data source.
- Route data source.
- Supported languages/spelling variants.

The rendering, URL parsing, search UI, and selected-item logic should be reusable across countries.

Acceptance criteria:

- Switzerland remains the first working country.
- Adding a second country should be mostly data/config work, not app rewrite.
- No component should assume Swiss-specific terminology such as canton unless explicitly in Switzerland-only metadata.

### Phase 3 — Predefined Routes

Goal: add shareable named routes.

Examples:

- Männlichen → Kleine Scheidegg hike.
- Ebenalp → Aescher → Seealpsee hike.
- Glacier Express Zermatt → Chur.
- Bernina Express.
- SlowUp route.
- Skating route around Basel or Zurich.

Routes should render as lines on the map.

Example URL:

```text
/ch?places=zermatt,murren,gimmelwald&routes=mannlichen-kleine-scheidegg,glacier-express-zermatt-chur
```

Route model:

```json
{
  "id": "ch:route:mannlichen-kleine-scheidegg",
  "name": "Männlichen → Kleine Scheidegg",
  "countryCode": "ch",
  "type": "hike",
  "distanceKm": 4.5,
  "geometry": [[46.611, 7.943], [46.585, 7.961]],
  "source": "curated"
}
```

Route types should be optional metadata, not central to V1. Potential values:

- hike
- rail
- skate
- cycle
- walk
- scenic
- other

Acceptance criteria:

- User can add/remove predefined routes.
- Routes are encoded in the URL by ID.
- Shared URL reconstructs pins and routes.
- Pins and routes can coexist cleanly.

### Phase 4 — GPX Upload / Imported Routes

Goal: allow users to upload activity routes from services such as Strava, Garmin, Komoot, or Apple Fitness if exported as GPX.

Important distinction:

- Small state goes in the URL.
- Large route geometry should not be encoded directly in the URL.

Suggested behaviour:

1. User uploads GPX file.
2. App parses the GPX locally.
3. App displays the route as a line.
4. User can optionally save/share the route.
5. Saved route receives an ID.
6. Shared URL references the uploaded route by ID.

Example:

```text
/ch?places=zermatt,murren&uploadedRoutes=rt_abc123
```

Possible implementation options:

#### Option A — Local-only GPX display

- User uploads GPX.
- Route appears locally.
- No sharing of uploaded route.
- No backend required.
- Good first implementation for GPX parsing.

#### Option B — Backend saved route

- User uploads GPX.
- Backend stores simplified route geometry.
- Backend returns route ID.
- Shared URL references route ID.
- No account required initially.

#### Option C — Account-based route library

- User can manage, rename, delete, and organise uploaded routes.
- Suitable later, not required early.

Acceptance criteria for first GPX version:

- User can upload a GPX file.
- App parses and displays it correctly.
- App calculates approximate distance if not already provided.
- App can fit map bounds to the uploaded route.

Acceptance criteria for shareable GPX version:

- Uploaded route can be saved.
- Shared URL reconstructs the uploaded route from stored ID.
- Very large GPX files are simplified before storage/display.

### Phase 5 — Trips / Timeline

Goal: group places and routes into trips or years.

Examples:

- Switzerland 2014.
- Glacier Express trip.
- Switzerland skating trip 2027.
- Bernese Oberland hike day.

Model:

```json
{
  "id": "trip-switzerland-2014",
  "name": "Switzerland 2014",
  "countryCode": "ch",
  "placeIds": ["ch:place:zermatt", "ch:place:chur"],
  "routeIds": ["ch:route:glacier-express-zermatt-chur"],
  "dateFrom": "2014-07-30",
  "dateTo": "2014-08-01"
}
```

This can remain optional. The product should still work as a simple pin map.

## 6. Data Model

### Place

```json
{
  "id": "ch:place:2657994",
  "countryCode": "ch",
  "lat": 46.0207,
  "lng": 7.7491,
  "displayName": {
    "en": "Zermatt",
    "de": "Zermatt",
    "fr": "Zermatt",
    "it": "Zermatt",
    "rm": "Zermatt"
  },
  "searchAliases": [
    "Zermatt"
  ],
  "admin1": "Valais",
  "admin2": null,
  "type": "place"
}
```

Notes:

- `id` is the stable identity used in URLs and internal references.
- `displayName` is presentation and may vary by UI language.
- `searchAliases` is presentation/search support and should not be used as identity.
- `type` should be generic in V1.
- Avoid forcing city/town/village/landmark classification into the UX.
- Stable IDs are important because place names vary by language and spelling.
- Administrative metadata, such as canton, can later support derived region coverage.

Examples of useful aliases:

- Mürren / Murren
- Männlichen / Mannlichen
- Kleine Scheidegg / Klein Scheidegg typo handling may be needed
- Allmendhubel / Almenhubel
- Luzern / Lucerne
- Murten / Morat
- Genève / Geneva / Genf

Stable ID examples should be opaque or dataset-backed:

```text
ch:place:2660646
ch:place:2659811
ch:place:2657896
```

Do not make the stable ID depend on the English, German, French, Italian, or Romansh display name.

The stable ID identifies the underlying place. Display names and aliases can vary by language, but the selected item in the URL should remain stable.

### Route

```json
{
  "id": "ch:route:glacier-express-zermatt-chur",
  "name": "Glacier Express: Zermatt → Chur",
  "countryCode": "ch",
  "type": "rail",
  "distanceKm": null,
  "geometry": [],
  "source": "curated"
}
```

### URL State

Suggested parsed shape:

```json
{
  "countryCode": "ch",
  "placeIds": ["ch:place:2660646", "ch:place:2659811"],
  "routeIds": ["ch:route:10001"],
  "uploadedRouteIds": []
}
```

Rules:

- URL is the source of truth for V1 state.
- Adding/removing pins updates the URL.
- Loading URL reconstructs the selected pins.
- Unknown IDs should be ignored gracefully and optionally reported.
- Duplicate IDs should be deduplicated.
- Order should be stable for cleaner URLs.

## 7. Search Behaviour

Search belongs to the presentation layer. It should resolve user-entered names to stable place IDs.

Search requirements:

- Search within the active country by default.
- For Switzerland, officially support English plus the four Swiss official languages: German, French, Italian, and Romansh.
- Match exact names, aliases, and accent-insensitive variants.
- Support small places as well as major cities.
- Show enough context to disambiguate results.
- Do not treat every possible world-language exonym as a guaranteed supported search term.
- Common unsupported-language aliases may be added on a best-effort curated basis.

Example search results:

```text
Mürren — Bernese Oberland, Switzerland
Gimmelwald — Bernese Oberland, Switzerland
Zermatt — Valais, Switzerland
Bern — Bern, Switzerland
```

Important cases:

- User types `Murren`; should find `Mürren`.
- User types `Almenhubel`; should find `Allmendhubel`.
- User types `Luzern`; should find the same place as `Lucerne`.
- User types `Murten`; should find the same place as `Morat`.
- User types `Genève`, `Geneva`, or `Genf`; all should resolve to the same stable place ID.
- User types `Ginevra`; should resolve to Geneva because Italian is one of the supported Swiss languages.
- User types `Ginebra`; this may work only if added as a best-effort extra alias, but it should not be required for V1.
- User types `Grindlewald`; possibly suggest `Grindelwald`, but should not confuse it with `Gimmelwald`.
- User types `Klein Matterhorn`; should find `Klein Matterhorn`.

Search should prioritise:

1. Exact name match.
2. Alias match.
3. Accent-insensitive match.
4. Fuzzy match.
5. Popularity/importance as tie-breaker.

## 8. Map UX

V1 UI suggestion:

- Map takes most of the screen.
- Search bar at top or side.
- Selected places list in a collapsible sidebar.
- Each selected place has remove button.
- Copy/share URL button.
- Fit-to-selected button.
- Reset/clear all button.

Pin behaviour:

- Clicking a pin shows place name.
- Selected pins should be visually distinct.
- When a place is added, map may pan/zoom to it.
- Avoid clutter when many pins are selected.

Later route behaviour:

- Routes shown as lines.
- Clicking a route shows route name and metadata.
- Different line styles can represent route type later, but not necessary early.

## 9. Technical Design Suggestions

Possible frontend stack:

- React or Vue.
- TypeScript.
- MapLibre GL or Leaflet.
- GeoJSON for place/route data.
- URLSearchParams for query-string state.

Suggested TypeScript types:

```ts
export type CountryCode = string;

export interface CountryConfig {
  code: CountryCode;
  name: string;
  bounds: [[number, number], [number, number]];
  defaultCenter: [number, number];
  defaultZoom: number;
}

export interface Place {
  id: string;
  name: string;
  countryCode: CountryCode;
  lat: number;
  lng: number;
  aliases?: string[];
  admin1?: string;
  admin2?: string;
  importance?: number;
}

export interface Route {
  id: string;
  name: string;
  countryCode: CountryCode;
  type?: "hike" | "rail" | "skate" | "cycle" | "walk" | "scenic" | "other";
  geometry: [number, number][];
  distanceKm?: number;
  source: "curated" | "uploaded";
}

export interface MapState {
  countryCode: CountryCode;
  placeIds: string[];
  routeIds: string[];
  uploadedRouteIds: string[];
}
```

Core modules:

```text
url-state/
  parseMapState.ts
  serialiseMapState.ts
  normaliseIds.ts

search/
  normaliseSearchText.ts
  searchPlaces.ts

countries/
  loadCountryConfig.ts
  loadPlaces.ts
  loadRoutes.ts

map/
  MapView.tsx
  PlacePins.tsx
  RouteLines.tsx
```

## 10. Stateless Sharing Design

The main sharing mechanism should be the URL.

Example V1:

```text
/ch?places=ch:place:2660646,ch:place:2659811,ch:place:2657896
```

Example V2:

```text
/ch?places=ch:place:2660646,ch:place:2659811&routes=ch:route:10001
```

Example V3:

```text
/ch?places=ch:place:zermatt&uploadedRoutes=rt_abc123
```

URL design rules:

- Keep URLs deterministic.
- Sort IDs before serialising unless manual order becomes meaningful later.
- Use compact stable IDs rather than display names.
- Use compact IDs if URLs become too long.
- Avoid putting raw GPX or large geometry in URL.
- Unknown IDs should not break the page.

Rationale for stable IDs:

There must be a strict separation between storage identity, URL state, display, and search.

- Storage identity: stable opaque ID.
- URL state: stable IDs only.
- Display: selected UI language.
- Search: supported aliases that resolve to stable IDs.

A user may search for `Lucerne`, `Luzern`, or `Lucern`, but the URL should encode the same selected place ID. Similarly, `Murten` and `Morat` should resolve to the same place, and `Genève`, `Geneva`, `Genf`, and `Ginevra` should resolve to the same place. The public URL should not depend on the exact spelling or language used during search.

For Switzerland V1, officially supported search/display languages are:

- English
- German
- French
- Italian
- Romansh

Other names, such as Spanish `Ginebra`, can be added as optional curated aliases, but they are not part of the guaranteed language support.

## 11. Backend Considerations

No backend is required for V1 if place data is bundled or statically hosted.

Backend may become useful for:

- Uploaded GPX route storage.
- Short share links.
- User accounts.
- Personal saved maps.
- Photo attachments.

Suggested later backend entities:

```text
SavedRoute
  id
  name
  countryCode
  geometry
  distanceKm
  createdAt
  source

ShortLink
  id
  targetUrl
  createdAt

UserMap
  id
  userId
  name
  mapState
  createdAt
  updatedAt
```

For early backend route storage, no account is required. Uploaded routes can be anonymous saved objects referenced by ID.

## 12. Data Source Strategy

For the MVP, use a curated Switzerland place list rather than trying to ingest all OpenStreetMap data immediately.

Reason:

- Better search quality.
- Fewer irrelevant results.
- Easier to handle aliases and spelling variants.
- Faster MVP.

Initial Switzerland place list should include:

- Major cities.
- Tourist towns.
- Mountain villages.
- Railway destinations.
- Common scenic places.
- Places likely to matter to travellers.

Later, add OpenStreetMap/Nominatim-style search if needed.

Potential issue:

A fully open search can return too many irrelevant objects, including shops, hotels, bus stops, restaurants, and duplicate names. This may make the UX worse unless filtered carefully.

## 13. Key Design Principles

1. Do not force categories in V1.
2. A place is simply a named point.
3. A route is simply a named line.
4. A trip is a collection of places and routes.
5. URL state should be the source of truth for shareable maps.
6. Switzerland is the first dataset, not the whole product architecture.
7. Keep GPX upload separate from the stateless URL model.
8. Start with curated data before broad open search.
9. Favour stable opaque IDs over pretty names.
10. Pins remain the source of truth; region/country colouring should be derived from pins and routes.
11. Zoomed-out views may show aggregate coverage; zoomed-in views should show concrete pins and routes.
12. Keep the MVP small enough to build and validate quickly.

## 14. Suggested MVP Build Order

1. Create app shell with `/ch` route.
2. Add Switzerland country config.
3. Add small curated place dataset.
4. Render base map centred on Switzerland.
5. Implement search over local place dataset.
6. Add selected pins to map.
7. Encode selected place IDs in query string.
8. Decode selected place IDs from query string on load.
9. Add selected-place sidebar.
10. Add copy/share URL button.
11. Add remove pin and clear all.
12. Add tests for URL parsing/serialisation.
13. Add tests for search normalisation and aliases.

## 15. Initial Test Cases

### URL State

- Empty URL produces empty selected places.
- `?places=ch:place:bern` selects Bern.
- Duplicate place IDs are deduplicated.
- Unknown place IDs are ignored gracefully.
- Removing a place updates the URL.
- Adding a place updates the URL.

### Search

- `Bern` finds Bern.
- `Interlaken` finds Interlaken.
- `Zermatt` finds Zermatt.
- `Murren` finds Mürren.
- `Mürren` finds Mürren.
- `Gimmelwald` finds Gimmelwald.
- `Almenhubel` finds Allmendhubel.
- `Allmendhubel` finds Allmendhubel.
- `Kleine Scheidegg` finds Kleine Scheidegg.
- `Klein Matterhorn` finds Klein Matterhorn.

### Map

- Selected places appear as pins.
- Removing a selected place removes its pin.
- Refreshing the page preserves pins through URL state.

## 16. Open Questions

These can be deferred until after the MVP:

1. Should the app use pretty slugs or opaque stable IDs in the public URL?
2. How large should the curated Switzerland place dataset be initially?
3. Should the user be able to add a custom pin if search does not find the place?
4. Should dates/notes be encoded in URL or remain local-only?
5. Should route type colours be shown in V2?
6. Should uploaded GPX routes be shareable without accounts?
7. Should the product eventually support photos, captions, or Instagram-style story pages?

## 17. Recommended MVP Definition

The MVP is complete when a user can create and share a Switzerland visited-place map using only pins, with all selected places stored in the URL.

Anything involving routes, GPX upload, trips, accounts, backend storage, or photos should be treated as a later phase.

