# Travel Atlas — Product Requirements and Suggested Design (Draft 2)

## 1. Product Vision

Build a personal travel atlas: a shareable, multi-scale map of places visited and routes travelled.

The product should start simple, but the long-term vision is global:

- A world map zoomed out, with visited countries visually indicated.
- Zooming into a country reveals the exact places visited.
- Zooming further reveals individual pins, route lines, and local detail.
- Routes can represent hikes, skating routes, rail journeys, road trips, ferry journeys, cycling routes, or uploaded GPS tracks.

The product is not primarily a “visited countries checklist”. It is a map-based record of travel history.

The key concept:

> The user records concrete places and routes. Larger coverage such as countries, regions, cantons, states, and provinces is derived from those places and routes.

Examples:

- If the user pins Zermatt, Switzerland becomes visited and Valais becomes represented.
- If the user pins Nice, France becomes visited and Provence-Alpes-Côte d’Azur becomes represented.
- If the user pins Yangon, Myanmar becomes visited.
- If the user adds a route from Männlichen to Kleine Scheidegg, Switzerland and the relevant Swiss canton/region can be derived from that route.

The initial dataset may be Switzerland, but the architecture must be global from the start.

## 2. Core Principles

1. Places and routes are the source of truth.
2. Countries, cantons, states, provinces, and other regions are derived views.
3. The user should not manually mark countries or regions as visited in the core workflow.
4. Small shareable state lives in the URL.
5. Large state, such as uploaded GPX geometry, is stored separately and referenced by ID.
6. Stable opaque IDs must be used for storage and URL state.
7. Display names, search terms, aliases, and languages are presentation concerns.
8. Search should resolve user-entered names to stable IDs.
9. The product must work globally, even if Switzerland is the first curated dataset.
10. V1 should remain small: pins only, shareable via URL.

## 3. Primary Concepts

### Place

A place is a named point with coordinates.

Examples:

- Bern
- Interlaken
- Zermatt
- Mürren
- Gimmelwald
- Allmendhubel
- Kleine Scheidegg
- Klein Matterhorn
- Nice
- Monaco
- Èze
- Menton
- Yangon
- Bagan
- Mandalay

The app should not force the user to care whether a place is a city, town, village, hamlet, mountain station, viewpoint, landmark, or resort.

For V1, all of these can be treated as:

> Place = named point with coordinates.

### Route

A route is a named or user-uploaded line/path.

Examples:

- Männlichen → Kleine Scheidegg hike
- Glacier Express: Zermatt → Chur
- SlowUp route
- Skating route around Basel
- Nice → Monaco day trip
- GPX track exported from Strava, Garmin, Komoot, or another service

Routes are V2+.

### Trip

A trip is an optional grouping of places and routes.

Examples:

- Switzerland 2014
- South of France 6-month stay
- Myanmar travels
- Switzerland skating trip 2027
- Glacier Express trip

Trips are later-phase functionality, not V1.

## 4. Multi-Scale Map Behaviour

The same underlying data should be visualised differently depending on zoom level.

### World View

At the world zoom level:

- Show the whole world.
- Countries containing visited places or routes are coloured or highlighted.
- Pins may be clustered, hidden, or summarised.
- Country coverage is derived from place/route data.

Example:

If the user has pins in Switzerland, France, Myanmar, Japan, and Germany, those countries are highlighted.

### Country View

When zoomed into a country:

- Show regional coverage if useful.
- For Switzerland, this may mean cantons.
- For France, this may mean regions/departments.
- For the United States, this may mean states.
- For Myanmar, this may mean states/regions.
- Pins start to appear depending on zoom and density.

The user should not manually colour regions. Region coverage should be calculated from selected places/routes.

### Regional View

When zoomed further:

- Individual pins become prominent.
- Route lines may appear.
- Clustering should reduce visual clutter.

Example around the Côte d’Azur:

- Nice
- Cannes
- Antibes
- Èze
- Menton
- Monaco
- Saint-Jean-Cap-Ferrat

### Local View

At local zoom:

- Show individual pins clearly.
- Show labels if appropriate.
- Show route geometry.
- Clicking a place or route shows details.

## 5. V1 Scope — Shareable Pin Map

V1 should be deliberately simple.

### V1 Goal

A user can search for places, add pins, and share the resulting map by URL.

### V1 Features

- Display a world map.
- Search for places.
- Add/remove selected places.
- Show selected places as pins.
- Encode selected place IDs in the URL.
- Loading a URL reconstructs the same selected pins.
- Copy/share URL.
- Selected places list/sidebar.
- Clear all.
- No user accounts.
- No backend required if place data is bundled or statically hosted.
- No GPX upload.
- No routes.
- No trips.
- No manual country/canton selection.

### V1 Initial Dataset

Switzerland may be the first curated dataset.

This does not mean the app is Switzerland-specific.

The code should be written as a global app with one initial country dataset.

### V1 Example URL

Use stable opaque IDs:

```text
/?places=ch:place:2660646,ch:place:2659811,ch:place:2657896
```

Do not use display names or slugs as the production state:

```text
/?places=zermatt,murren,gimmelwald
```

The second form is readable but wrong for the long-term design because identity becomes tied to spelling and language.

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

## 6. V1.5 Scope — Derived Coverage and Zoom Behaviour

V1.5 adds derived coverage views without changing the core user input model.

### V1.5 Goal

Show aggregate coverage at low zoom levels while keeping pins as the source of truth.

### Features

- Derive visited countries from selected pins.
- Optionally colour visited countries when zoomed out.
- Derive administrative coverage for supported countries.
- For Switzerland, derive cantons from pins.
- Show a coverage summary, for example:
  - 5 countries represented
  - 8/26 Swiss cantons represented
- At higher zoom levels, show pins instead of only aggregate coverage.

### Important Rule

The user still adds pins. The user does not manually select countries, cantons, regions, or states.

### Switzerland Example

If selected pins include:

- Zermatt
- Geneva
- Mürren
- Gimmelwald
- Chur

Then the app can derive:

- Country: Switzerland
- Cantons represented: Valais, Geneva, Bern, Graubünden

### Acceptance Criteria

- Selected places can be mapped to countries.
- Swiss places can be mapped to cantons where known.
- Country coverage can be calculated from selected places.
- Canton coverage can be calculated from selected Swiss places.
- Visual highlighting can be toggled or introduced after the calculation is proven.

## 7. V2 Scope — Curated Routes

V2 adds predefined, shareable routes.

### Route Types

Route type is optional metadata. Possible values:

- hike
- rail
- skate
- cycle
- walk
- road
- ferry
- scenic
- other

The product should not depend too heavily on route categories early.

### Examples

- Männlichen → Kleine Scheidegg
- Ebenalp → Aescher → Seealpsee
- Glacier Express: Zermatt → Chur
- Bernina Express
- SlowUp route
- Friday Night Skate route
- Nice → Monaco route

### URL Example

```text
/?places=ch:place:2660646,ch:place:2659811&routes=ch:route:10001
```

### Acceptance Criteria

- User can add/remove predefined routes.
- Routes render as lines.
- Route IDs are encoded in the URL.
- Shared URLs reconstruct selected places and routes.
- Country/region coverage can be derived from both places and routes.

## 8. V3 Scope — GPX Upload

V3 adds uploaded GPS routes from services such as:

- Strava
- Garmin
- Komoot
- Apple Fitness, if exported as GPX
- Other GPX-producing tools

### Important Distinction

Small state goes in the URL.

Large geometry should not be placed in the URL.

### GPX Modes

#### Option A — Local-only GPX Display

- User uploads GPX.
- App parses it locally.
- Route is displayed.
- No sharing of uploaded route.
- No backend required.

This is the simplest first GPX implementation.

#### Option B — Shareable Uploaded Routes

- User uploads GPX.
- Backend stores simplified route geometry.
- Backend returns a route ID.
- Shared URL references that uploaded route ID.

Example:

```text
/?places=ch:place:2660646&uploadedRoutes=rt_abc123
```

#### Option C — Account-Based Route Library

Later, users may have accounts to manage uploaded routes.

Features could include:

- Rename route.
- Delete route.
- Group routes into trips.
- Make route public/private.
- Reuse uploaded route in multiple maps.

Not required early.

### GPX Acceptance Criteria

- User can upload a GPX file.
- App parses track geometry.
- Route displays on the map.
- App calculates approximate distance if not present.
- App can fit map bounds to the uploaded route.
- Large GPX files are simplified before rendering/storage.

## 9. V4 Scope — Trips and Timeline

Trips are optional groupings of places and routes.

### Examples

- Switzerland 2014
- Six months in South of France
- Myanmar travels
- Japan trip
- Switzerland skating trip 2027

### Trip Model

A trip can contain:

- Place IDs
- Route IDs
- Uploaded route IDs
- Date range
- Notes
- Optional display colour or label

### Example

```json
{
  "id": "trip:south-france-2010",
  "name": "South of France",
  "placeIds": [
    "fr:place:nice",
    "fr:place:cannes",
    "fr:place:antibes",
    "fr:place:eze",
    "fr:place:menton"
  ],
  "routeIds": [],
  "dateFrom": "2010-01-01",
  "dateTo": "2010-06-30"
}
```

Trips are not required for V1.

## 10. Identity, Storage, URL, Display, and Search

These must be strictly separated.

### Storage Identity

A place or route has a stable opaque ID.

Examples:

```text
ch:place:2660646
fr:place:2988507
mm:place:1298824
ch:route:10001
```

The exact numeric source can come from a curated dataset, OpenStreetMap, GeoNames, or an internal ID system.

The important point is that IDs should not be display names.

### URL State

URLs should contain stable IDs only.

Example:

```text
/?places=ch:place:2660646,ch:place:2659811&routes=ch:route:10001
```

URL state should not depend on language, accents, spelling, or display name.

### Display Names

Display names are presentation.

A place can have different names depending on UI language.

Example:

```json
{
  "id": "ch:place:2660646",
  "displayName": {
    "en": "Geneva",
    "fr": "Genève",
    "de": "Genf",
    "it": "Ginevra",
    "rm": "Genevra"
  }
}
```

### Search Aliases

Search aliases are also presentation/search support.

They resolve user input to stable IDs.

Example:

```json
{
  "id": "ch:place:2660646",
  "searchAliases": [
    "Geneva",
    "Genève",
    "Geneve",
    "Genf",
    "Ginevra",
    "Genevra"
  ]
}
```

A user searching any of those names should resolve to the same ID.

### Language Support

For Switzerland V1, officially support:

- English
- German
- French
- Italian
- Romansh

Other language exonyms can be added as best-effort aliases, but they are not guaranteed.

Example:

- Spanish `Ginebra` for Geneva may be added as an extra alias.
- If it works, good.
- If not, it is not a V1 defect.

### Examples of Swiss Naming Issues

- Luzern / Lucerne
- Murten / Morat
- Genève / Geneva / Genf / Ginevra
- Mürren / Murren
- Männlichen / Mannlichen
- Allmendhubel / Almenhubel

Stable IDs solve this.

## 11. Data Model

### Place

```ts
export interface Place {
  id: string;
  countryCode: string;
  lat: number;
  lng: number;

  displayName: Record<string, string>;
  searchAliases: string[];

  admin1?: string;
  admin2?: string;
  admin3?: string;

  importance?: number;
  type?: string;
}
```

Notes:

- `id` is the stable storage and URL identity.
- `displayName` is presentation.
- `searchAliases` is search support.
- `admin1/admin2/admin3` are useful for derived regional coverage.
- `type` should not drive the V1 user experience.

### Route

```ts
export interface Route {
  id: string;
  countryCodes: string[];
  name: Record<string, string> | string;
  type?: "hike" | "rail" | "skate" | "cycle" | "walk" | "road" | "ferry" | "scenic" | "other";
  geometry: [number, number][];
  distanceKm?: number;
  source: "curated" | "uploaded";
}
```

A route may cross country borders, so `countryCodes` is plural.

### Map State

```ts
export interface MapState {
  placeIds: string[];
  routeIds: string[];
  uploadedRouteIds: string[];
}
```

No country needs to be selected globally in the state. Countries can be derived from selected places/routes.

A country-specific URL path may still be useful later, but the main product should support a world map.

## 12. URL State Rules

The URL is shareable application state.

Rules:

- Use stable IDs.
- Keep ordering deterministic.
- Deduplicate IDs.
- Ignore unknown IDs gracefully.
- Avoid storing large geometry directly in the URL.
- Avoid using display names as state.
- Keep the URL reasonably compact.
- If URLs become too long, introduce short links later.

Examples:

### Pins only

```text
/?places=ch:place:2660646,fr:place:2988507,mm:place:1298824
```

### Pins and curated routes

```text
/?places=ch:place:2660646&routes=ch:route:10001
```

### Pins and uploaded routes

```text
/?places=ch:place:2660646&uploadedRoutes=rt_abc123
```

### Future short link

```text
/m/abc123
```

A short link would resolve to a stored map state.

## 13. Search Behaviour

Search should resolve user input to stable place IDs.

Requirements:

- Search globally or within the current visible map area.
- Prioritise places near the current map viewport if useful.
- Match exact names.
- Match aliases.
- Match accent-insensitive variants.
- Support fuzzy matching cautiously.
- Show enough context to disambiguate results.
- Do not confuse similarly named places.

Example result display:

```text
Mürren — Bern, Switzerland
Murten / Morat — Fribourg, Switzerland
Geneva / Genève / Genf — Geneva, Switzerland
Nice — Provence-Alpes-Côte d’Azur, France
```

Important cases:

- `Murren` finds `Mürren`.
- `Almenhubel` finds `Allmendhubel`.
- `Luzern` and `Lucerne` resolve to the same place.
- `Murten` and `Morat` resolve to the same place.
- `Genève`, `Geneva`, `Genf`, and `Ginevra` resolve to the same place.
- `Ginebra` may resolve to Geneva only if added as a best-effort extra alias.
- `Grindlewald` may suggest `Grindelwald`, but should not confuse it with `Gimmelwald`.

## 14. Suggested Architecture

### Frontend

Recommended:

- TypeScript
- React or Vue
- MapLibre GL or Leaflet
- URLSearchParams for URL state
- Static JSON datasets for initial MVP

MapLibre is better for a polished vector-map experience. Leaflet may be simpler for an MVP.

### Suggested Directory Structure

```text
src/
  app/
  components/
    map/
      MapView.tsx
      PlacePins.tsx
      RouteLines.tsx
      CoverageLayer.tsx
    search/
      SearchBox.tsx
      SearchResults.tsx
    sidebar/
      SelectedPlaces.tsx
      SelectedRoutes.tsx
  data/
    countries/
      ch/
        places.json
        regions.json
        routes.json
      fr/
        places.json
        regions.json
        routes.json
      mm/
        places.json
        regions.json
        routes.json
  domain/
    Place.ts
    Route.ts
    MapState.ts
  services/
    search/
      normaliseText.ts
      searchPlaces.ts
    url-state/
      parseMapState.ts
      serialiseMapState.ts
    coverage/
      deriveCountries.ts
      deriveRegions.ts
  tests/
```

### Important Architecture Rule

Avoid components named as if the app is Switzerland-only.

Do not build:

```text
SwissMap
SwissSearch
SwissPlace
CantonSelector
```

Prefer:

```text
MapView
PlaceSearch
Place
CoverageLayer
```

Switzerland is data/configuration, not the product boundary.

## 15. Data Source Strategy

### V1

Use curated static place datasets.

Reason:

- Better quality.
- Predictable search.
- Easier aliases.
- Less irrelevant noise.
- Faster MVP.

For Switzerland initial data, include:

- Major cities.
- Tourist towns.
- Mountain villages.
- Railway destinations.
- Scenic places.
- Places likely to matter to travellers.

### Later

Consider integrating external data sources:

- OpenStreetMap / Nominatim
- GeoNames
- Wikidata
- Natural Earth for country boundaries
- Official regional boundary datasets

Do not rely blindly on open search in the early product. OpenStreetMap may return shops, hotels, bus stops, restaurants, and duplicate local objects unless filtered carefully.

## 16. Derived Coverage

Coverage should be computed from geometry.

### Country Coverage

A country is represented if:

- At least one selected place is within it, or
- At least one selected/uploaded route passes through it.

### Region Coverage

A region is represented if:

- At least one selected place is inside it, or
- At least one selected/uploaded route intersects it.

### Implementation Options

Option 1: Metadata-based

Each curated place stores:

```json
{
  "countryCode": "ch",
  "admin1": "Valais"
}
```

Simple and good for V1/V1.5.

Option 2: Geometry-based

Use boundary polygons to calculate containment/intersection.

Better for global scalability, routes, and uploaded GPX.

Likely progression:

- V1: use countryCode metadata on places.
- V1.5: use admin metadata for Switzerland cantons.
- V2/V3: use polygon intersection for routes and GPX.

## 17. Map UX

### Initial View

The default product should open as a world map.

If selected pins exist, the map can optionally fit to selected data.

### Controls

V1 controls:

- Search bar.
- Selected places list.
- Remove selected place.
- Copy/share URL.
- Clear all.
- Fit to selected.

Later controls:

- Add route.
- Upload GPX.
- Toggle pins/routes/coverage.
- Filter by trip/year/type.
- Timeline slider.

### Pin Behaviour

- Clicking a pin shows place name and context.
- Pins may cluster when zoomed out.
- Labels appear only at suitable zoom levels.
- Pins remain the most concrete representation of visited places.

### Coverage Behaviour

- Country/region colouring is a derived summary.
- It should be visually secondary to pins/routes when zoomed in.
- It should become more prominent when zoomed out.

## 18. Backend Considerations

No backend is required for V1.

Backend becomes useful for:

- Uploaded GPX route storage.
- Short links.
- User accounts.
- Saved maps.
- Trip libraries.
- Photo attachments.

### Later Backend Entities

```text
UploadedRoute
  id
  name
  geometry
  simplifiedGeometry
  distanceKm
  countryCodes
  createdAt

ShortLink
  id
  mapState
  createdAt

UserMap
  id
  userId
  name
  mapState
  createdAt
  updatedAt

Trip
  id
  userId
  name
  placeIds
  routeIds
  uploadedRouteIds
  dateFrom
  dateTo
```

## 19. Testing Strategy

### URL State Tests

- Empty URL produces empty state.
- Valid place IDs parse correctly.
- Duplicate IDs are deduplicated.
- Unknown IDs are ignored gracefully.
- Adding a place updates the URL.
- Removing a place updates the URL.
- Serialisation is deterministic.

### Search Tests

- `Bern` finds Bern.
- `Interlaken` finds Interlaken.
- `Zermatt` finds Zermatt.
- `Murren` finds Mürren.
- `Mürren` finds Mürren.
- `Gimmelwald` finds Gimmelwald.
- `Almenhubel` finds Allmendhubel.
- `Luzern` and `Lucerne` resolve to the same ID.
- `Murten` and `Morat` resolve to the same ID.
- `Geneva`, `Genève`, `Genf`, and `Ginevra` resolve to the same ID.
- `Ginebra` is optional unless explicitly added as an extra alias.

### Coverage Tests

- A pin in Switzerland marks Switzerland represented.
- A pin in Zermatt marks Valais represented.
- A pin in Mürren marks Bern represented.
- Multiple pins in the same country do not duplicate country coverage.
- Country coverage remains derived, not manually selected.

### Map Tests

- Selected places display as pins.
- Removing a selected place removes its pin.
- Refreshing the URL restores pins.
- Fit-to-selected adjusts map bounds.

## 20. Suggested MVP Build Order

1. Create app shell with world map.
2. Define domain types: Place, Route, MapState.
3. Implement URL parse/serialise for place IDs.
4. Add small curated Switzerland place dataset.
5. Implement search over local dataset.
6. Add selected places state from URL.
7. Render selected places as pins.
8. Update URL when pins are added/removed.
9. Add selected-place sidebar.
10. Add copy/share URL.
11. Add clear all.
12. Add fit-to-selected.
13. Add basic country derivation from selected places.
14. Add tests for URL state.
15. Add tests for search aliases.
16. Add tests for derived coverage.

## 21. Naming Direction

The project should not be named as if it is Switzerland-only.

Avoid:

- switzerland-visited-map
- swiss-travel-map
- swiss-pins

Better directions:

- Travel Atlas
- Personal Atlas
- Waypoints
- PinAtlas
- TrailAtlas
- Mapmarks
- Journey Atlas
- Travel Mapbook

The GitHub repository can be descriptive even if the product name is more polished.

Possible repository names:

- travel-atlas
- personal-atlas
- waypoints
- pin-atlas
- journey-atlas
- mapmarks

Current recommended working name:

> Travel Atlas

This best captures the broader vision: places, routes, countries, GPX tracks, trips, and multi-scale travel history.

## 22. Open Questions

These do not block V1:

1. Should the public product name be “Travel Atlas”, “Waypoints”, “PinAtlas”, or something else?
2. Which map engine should be used: MapLibre or Leaflet?
3. Should the first UI open globally or fit to selected/available dataset?
4. How large should the initial Switzerland place dataset be?
5. Should users be able to add custom pins not in the dataset?
6. Should custom pins be encoded in URL, stored locally, or stored server-side?
7. Should dates/notes be supported in URL or deferred to accounts/trips?
8. Should GPX upload start local-only before shareable storage?
9. How should very dense travel histories be clustered?
10. Should routes crossing borders mark all crossed countries as represented?

## 23. Final MVP Definition

The MVP is complete when a user can:

1. Open a world map.
2. Search for curated places.
3. Add selected places as pins.
4. Share the map through a URL containing stable opaque place IDs.
5. Reload or share that URL and reconstruct the same pins.
6. Derive visited countries from the selected pins.

Everything else — regional colouring, predefined routes, GPX upload, trips, accounts, photo support, timeline, and route libraries — is a later phase.

The MVP should still be architected so those later phases fit naturally.
