# ADR-0010: Frontend hosting — Cloudflare Pages

- Status: Accepted
- Date: 2026-06-13

## Context

V1 must be deployed to a public URL to realise the product's core differentiator
(a shareable, account-free map; spec §1) and to support a planned blog post,
which needs a live link. V1 is a **static single-page app**: HTML/JS/CSS plus
bundled JSON datasets, with all shareable state in the URL and **no backend**
(ADR-0003, ADR-0005). The basemap is a hosted provider (ADR-0009), not something
we serve. So the hosting problem for V1 is narrowly "serve static assets from a
CDN," nothing more.

A backend does appear later (V3+: short links, stored maps, GPX storage;
ADR-0005), which raises the question of whether to pick a host *now* that
pre-positions that backend. But the state-source boundary (ADR-0005) means the
frontend reaches any future backend over plain HTTP and does not care where it
runs. The frontend host and the backend host are therefore **separable
decisions**; this ADR settles only the former.

## Decision

Host the V1 frontend on **Cloudflare Pages**: connect the repository, build with
the existing `npm run build`, and serve the static `dist/` output from
Cloudflare's CDN. SPA fallback is configured so cold-loaded deep links (e.g. a
shared `?places=…` URL) resolve to the app rather than a host 404. Response
headers / CSP (V1.1-E3) are applied via Pages' headers configuration. The custom
domain `pinatlas.com` is pointed at the Pages project.

The **backend host is explicitly left open** and is not decided here (see
Consequences).

## Alternatives considered

- **Vercel / Netlify.** Same category: static SPA on a CDN, near-zero config,
  free tier, custom domains, headers config for CSP. Genuinely fine and roughly
  equivalent in effort. Not chosen only because they lack the minor
  backend-adjacency perk below; either would be an acceptable substitute, and if
  one were
  already in the workflow it would be the right call by "don't add a tool for no
  reason." No strong differentiator over Pages for this project.
- **Railway (or similar always-on container host).** Designed to run a server
  process. V1 has no server; serving static files from an always-on container is
  infrastructure heavier than the problem, paying for and operating a runtime
  that
  does nothing a CDN doesn't do better. Rejected for V1. Note this verdict is
  workload-specific and **reverses once a real backend exists**: a container
  running a server is exactly Railway's right shape, so Railway is a legitimate
  *backend* option later (see Consequences).
- **AWS S3 + CloudFront.** Static-on-CDN, never needs migrating, and AWS would
  host a future backend too. But it is the most setup for the least V1 benefit
  (bucket policy, OAC, ACM cert, cache invalidation), and for *our* future
  backend,
  small, edge-shaped KV/object lookups (short links, stored maps), AWS is more
  glue (Lambda + API Gateway + DynamoDB + CloudFront origin routing) than the
  equivalent on Cloudflare, with S3 egress fees where R2 has none. It only wins
  if
  the backend grows large and relational, which is not the trajectory the ADRs
  describe. Rejected as over-provisioning for the actual system.

## Consequences

- The host is **right-sized to a static SPA**: a CDN serving files, with the
  smallest operational surface (nothing to run, patch, or keep alive, and
  nothing
  to clean up if the project is paused or abandoned). This matters for a solo
  hobby
  project.
- **The backend host remains a separate, later, open decision.** Because the
  frontend reaches a backend over HTTP through the state-source boundary
  (ADR-0005), the V3+ backend may run on Cloudflare Workers (+ KV/D1/R2),
  **Railway**, **AWS**, or elsewhere, chosen then against the backend's actual
  shape. This ADR does not commit it.
- **Cloudflare Workers is the convenient (not mandatory) backend path.** If the
  backend is the expected small KV/object-lookup service, Workers + KV/R2 attach
  to the same project with the frontend untouched, one deploy toolchain, and
  R2's
  no-egress pricing (the same property that motivated ADR-0009's spike
  resilience).
  Forgoing it to host the backend on Railway/AWS costs only a "two platforms"
  tax (notably CORS between origins), not a rewrite.
- CSP (V1.1-E3) must permit the basemap provider's fetches (ADR-0009) and is set
  in Pages' headers config; this is the one serving-layer detail the host choice
  introduces.
- Deployment automation (build-on-push) is available but not required; a manual
  deploy is acceptable if CI-driven deploy is deferred, preserving the existing
  branch-protection / `verify`-gate discipline.
