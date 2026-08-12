# Mobile core call-flow explorer

An animated, interactive explainer of 4G, 5G NSA and 5G SA signalling flows —
voice, video, data, SMS and MMS — hosted on GitHub Pages.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
npm run preview
```

## Layout

- `src/data/topologies/` — per-network-type node/link diagrams, assembled from shared fragments in `fragments.js`.
- `src/data/flows/` — per-(network, session) step sequences. Related flows are composed from a base flow plus a delta (see `flows/compose.js`, `flows/deltas/`) rather than duplicated outright — see the "authored vs. composed" table in the project plan.
- `src/engine/` — the animation math (bezier interpolation along a topology's links) and the step-player reducer/hook. Topology-agnostic by design.
- `src/components/` — presentation only; all step/topology content lives in `src/data`.

`reference/epc-call-flow-explorer-v2.jsx` is the original single-file prototype this app was ported from; kept around for diffing ported prose during the build-out.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages automatically via `.github/workflows/deploy.yml`. The repo's **Settings → Pages → Build and deployment → Source** must be set to "GitHub Actions" (one-time, manual).
