# ADR-0009: Basemap provider — MapTiler free tier, with a documented upgrade path

- Status: Accepted
- Date: 2026-06-13

## Context

ADR-0003 chose MapLibre GL as the map engine and explicitly deferred the
**basemap provider** as a separate decision, noting only that we would "start on
a free tier and switch later if needed." V1 currently points at
`https://demotiles.maplibre.org/style.json`, MapLibre's demonstration tile
server. That source is unsuitable for a public deploy: it carries no usage or
uptime commitment (it is a community courtesy, not a service), and it is
deliberately low-detail. It shows coarse world geometry with little town detail
or
labelling at the local zoom levels where this product actually operates
(spec §4, "Local View"). Shipping it publicly would mean depending on someone
else's demo infrastructure and showing almost no map exactly where the product
needs it.

This is a hobby/portfolio project. The realistic outcomes are "modest traffic
indefinitely" or "abandoned," with an outside chance of a traffic spike if a
blog post or social share lands (more likely once coverage expands beyond
Switzerland). The decision must serve the common case (little to maintain, no
recurring cost) without foreclosing the spike case.

Crucially, the basemap source is a **configuration value** (a style URL and key
in `src/config.ts`), not an architectural commitment. Switching providers later
is a config change, not a migration. This makes the decision low-stakes and
reversible, and is the reason ADR-0003 was comfortable deferring it.

## Decision

Use the **MapTiler Cloud free tier** as the V1 basemap provider: a hosted vector
basemap referenced by style URL with a domain-restricted API key. The key is
client-side (public by nature) and MUST be domain-restricted in the MapTiler
dashboard.

The free tier is **non-commercial** and renders a **MapTiler logo** on the map.
Both are acceptable for a personal portfolio piece: the use is non-commercial
and the logo is small attribution.

A two-trigger upgrade path is recorded as part of this decision (see
Consequences). Self-hosting is explicitly *not* chosen now and is deferred to a
later, traffic-driven decision.

## Alternatives considered

- **Keep `demotiles.maplibre.org`.** Zero work, but unsuitable for a public
  site:
  no usage/uptime guarantee and almost no detail at local zoom; it undercuts the
  exact thing the product shows. Rejected for public deploy; fine for local dev.
- **Self-host Protomaps on Cloudflare R2 now.** A single PMTiles file (a
  Switzerland-clipped extract to start) served from R2, which has no egress
  fees
  (only per-request fees), making a traffic spike cost single-digit dollars
  where
  a provider free tier would break or meter. It also carries no commercial-use
  restriction, no forced logo, keeps the "no external runtime dependency"
  discipline (cf. ADR-0002), and would co-locate with a future Cloudflare
  Workers
  backend (short links, stored maps; ADR-0005). Rejected **for now** only
  because
  it is infrastructure to own and maintain (an R2 bucket, a Worker, a tiles file
  that ages with OSM): a liability if the project is abandoned, and insurance
  against a spike that may never come. Retained as the designated next step *if*
  traffic ever makes the paid tier's per-use cost unattractive.
- **Start directly on a paid MapTiler tier (Flex, $25/mo).** Removes the free
  tier's non-commercial limit, logo, and quota ceiling immediately. Unjustified
  for a hobby project with no commercial use and likely-modest traffic; the
  upgrade is reactive and takes minutes if ever needed. Rejected as the starting
  point.
- **Other hosted providers (Stadia, Thunderforest, etc.).** Similar shape to
  MapTiler with different styles/pricing; no decisive advantage for this
  project.
  Rejected for lack of differentiation.

## Consequences

- V1 deploys with a polished, detailed basemap and effectively **zero infra to
  maintain**. If the project is abandoned, there is nothing to clean up: no
  bucket, no worker, no bill; usage simply stops.
- The free tier's binding limit for our stack is **100,000 tile
  requests/month**;
  exceeding it pauses the maps until the next month (it pauses, it does not
  bill:
  no surprise charge). MapTiler offers two metering models, sessions and
  requests,
  but **session metering is available only via the MapTiler SDK or its Leaflet
  plugin**. We use plain MapLibre GL JS rendering a MapTiler style (ADR-0003),
  i.e. the MapTiler API with a third-party library, which is tracked by requests
  only; switching to sessions is not technically possible for this setup. So the
  plan's separate 5,000-session limit does not accrue for us. At ~4 requests per
  vector map view (1 request per vector tile, plus more as the user pans/zooms),
  100,000 requests is on the order of 25,000 simple map views before interaction
  is counted: ample headroom for a hobby project. MapTiler confirms no surcharge
  for using third-party/open-source rendering libraries. If the request quota is
  ever exceeded, the fix is reactive and fast (see triggers).
- **Two distinct upgrade triggers, not to be conflated:**
  1. **Goes commercial:** upgrade to a paid MapTiler tier (Flex, $25/mo, which
     grants commercial-use rights, removes the logo, and raises the quota with
     budget-capped metered overage). This is a **licensing** step required by
     the
     free tier's non-commercial terms, independent of traffic. Same provider,
     same `config.ts` key: an account upgrade, not a migration.
  2. **Traffic outgrows the economics:** revisit **self-hosting Protomaps on
     Cloudflare R2**. This is the cost-driven decision, evaluated only if usage
     makes per-use pricing unattractive. Because the basemap source is config,
     this remains a cheap switch when/if the time comes.
- The client-side API key is public; domain-restricting it in the MapTiler
  dashboard is mandatory and is the one security task this introduces (cf. the
  CSP/headers work at deploy time, which must also allow MapTiler's tile, style,
  font, and worker fetches).
- ADR-0003's deferred basemap decision is now closed. Nothing here forecloses
  the
  Protomaps path; it is explicitly held in reserve as trigger (2).
