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

## Adding a flow

1. Give every step a stable, kebab-case `id` — deltas and ambient traffic anchor on these, not array position.
2. If the new flow is genuinely identical in signalling to an existing one, re-export it rather than duplicating (see `flows/nsa/sms.js`).
3. If it's an existing flow plus a few extra/changed steps, write a delta in `flows/deltas/` using `insertAfter`/`patch`/`replaceStep` from `flows/compose.js`, and compose it in the new flow file. Keep `p` (the node path) using ids that exist in the target topology — the dev-only validator (`src/data/validate.js`, runs automatically via `npm run dev`) will warn in the console if a step references a node or a delta anchor that doesn't exist.
4. Only fully hand-author a flow when the underlying procedure is genuinely different (this is why 5G SA's data/voice/SMS are authored from scratch rather than composed).
5. Register the flow in `src/data/flows/index.js` under its network.

Runtime controls: space to play/pause, ←/→ to step, and the network/session selection is reflected in the URL (`?net=&session=`) for deep links.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages automatically via `.github/workflows/deploy.yml`. The repo's **Settings → Pages → Build and deployment → Source** must be set to "GitHub Actions" (one-time, manual).
