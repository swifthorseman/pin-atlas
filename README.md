# Pin Atlas

A personal travel atlas: a shareable, multi-scale map of the places you've
visited. You record concrete **pins** (and later routes); larger coverage —
countries, cantons, regions — is **derived** from them rather than tracked by
hand. A map you can share with anyone via a URL, no account needed.

> Work in progress. Built iteratively; see the docs below for the plan.

## Stack

React + TypeScript + Vite + MapLibre GL. No backend in V1 (static datasets,
state in the URL).

## Documentation

- [`docs/spec.md`](docs/spec.md) — what the product is and does.
- [`docs/adr/`](docs/adr/) — architecture decision records (the *why* behind
  the technical choices).
- [`docs/backlog.md`](docs/backlog.md) — the work breakdown (epics → stories).

## Status

Early development. V1 is a shareable pin map for an initial Switzerland dataset,
architected to grow globally.

## License

[MIT](LICENSE).
