# Mobile core

An animated, interactive guide to the mobile core network, in four sections:

- **Learn** — four animated architecture lessons: the 4G EPC, the 5G core (service-based and reference-point views, CUPS, slicing), EPC/5GC interworking, and 5G SA vs NSA (options 2, 3, 3a, 3x).
- **Components** — one page per network element (8 EPC, 18 5GC, plus the eNodeB and gNB): responsibilities, interfaces, services, 4G/5G counterparts, where it appears in the flows, and short animated vignettes.
- **Flows** — the call-flow explorer described below.
- **Glossary** — every acronym, each with its own link.

Lesson and component content cites the official documents (3GPP specifications via their free ETSI copies, and the GSMA migration white paper) down to the clause; the registry is `src/data/reference/sources.js`. The diagrams are original.

The Flows explorer is an animated, interactive explainer of 4G, 5G NSA and 5G SA signalling flows —
voice (originating, terminating, EPS fallback), video, data (attach, idle mode
and TAU), SMS and MMS — hosted on GitHub Pages. Built to *learn* from, whether or not you already know the mobile core: every
step has a description, a clickable acronym glossary, an "in practice" note
where there is one, and a link to the same step in the other generation.

## Development

```
npm install
npm run dev      # dev server; the data validator logs any inconsistencies to the console
npm test         # vitest: data validator + unit tests (also runs in CI before deploy)
npm run lint     # oxlint
```

## Build

```
npm run build
npm run preview
```

## Layout

- `src/data/topologies/` — per-network-type node/link diagrams, assembled from shared fragments in `fragments.js`. Links may carry `labelT` (0–1 position along the curve) and `lx`/`ly` offsets to keep labels out of node boxes; the validator warns about collisions.
- `src/data/flows/` — per-(network, flow) step sequences. Related flows are composed from a base flow plus a delta (see `flows/compose.js`, `flows/deltas/`) rather than duplicated outright.
- `src/data/sessions.js` — the session groups in the selector. A group may have `variants` (e.g. voice → originating / terminating / EPS fallback); each variant id is a `FLOWS` key.
- `src/engine/` — the animation math (bezier interpolation along a topology's links) and the step-player reducer/hook. Topology-agnostic by design. Step duration is a reading-time model (see `durationFor`).
- `src/lib/` — pure helpers: glossary resolution, prose auto-linking, quiz question generation.
- `src/components/` — presentation only; all step/topology content lives in `src/data`.
- `src/App.jsx`, `src/pages/` — the site shell and pages. Routing is a small hash router (`src/lib/route.js`, `useRoute.js`): `#/`, `#/learn/<lesson>?scene=<id>`, `#/components/<id>`, `#/flows?net=…`, `#/glossary/<term>`. Old `/?net=…` links redirect to `#/flows?…`.
- `src/data/arch/` — the architecture lessons (see *Lesson data* below).
- `src/data/components/` — component records and vignettes.
- `src/data/reference/sources.js` — the citation registry.

## Lesson data

Each lesson module exports a `diagram`, `scenes`, `takeaways`, a quick `check`, and `links`. The diagram is drawn by `src/components/arch/ArchDiagram.jsx` from pure state computed in `src/engine/arch.js`:

```js
diagram = {
  grid: { wide: { cols, rows, w, h }, narrow: { … } },     // viewBox and a placement grid per width mode
  nodes: { amf: { t: 'AMF', s: 'Access & mobility', gen: '5g', g?: 'glossary key' } },
  layouts: {                                                // named arrangements; scenes pick one
    sba: { wide: { amf: [col, row] }, narrow: { … }, bus: { wide: row, narrow: { col } }, bands: { wide: { control: [r0, r1] } } },
    slice: { extends: 'sba', hide: ['sepp'], wide: { … }, narrow: { … } },
  },
  links: [{ a, b, l: 'N11', k: 'sbi', in?: ['refpoint'], curve?, dash?, labelT? }],   // labelT: 0–1 along a→b, or { wide, narrow }
  svc: { amf: 'Namf' },                                     // service-bus stub labels
}
scene = {
  id, title, d /* caption; sets the reading-time duration */, cites: [{ src: 'ts23501', clause: '6.2.1' }],
  layout: 'sba', show?: [...] | 'all', add?: [...], remove?: [...],   // visibility is cumulative scene to scene
  focus?: { nodes, links }, traffic?: [{ p: ['ue', 'gnb', '@amf'], k, n, label }],   // '@x' = the bus point at node x
  spawn?: { amf: 'mme' },                                   // new node grows out of an old one (the 4G→5G split)
}
```

Moving between scenes tweens node positions and fades, draws new links in, and streams traffic dots along routes; under `prefers-reduced-motion` (tracked live) everything snaps to its end state and autoplay stops. Every diagram has a `wide` layout and a portrait `narrow` one for phones. `npm test` validates lessons, vignettes and components: known sources, nodes placed inside the viewBox in both modes, scenes that only reference drawn nodes and links, and cross-links that resolve.

### Authored vs. composed

| Network | Authored from scratch | Composed (base + delta) | Re-exported |
|---|---|---|---|
| 4G | data, voice, voice-mt, data-idle, sms | video (voice + video delta), mms (data + sms notify step) | — |
| 5G NSA | — | data (4G data + SgNB addition), voice (4G voice + NR release), video, mms | sms, voice-mt, data-idle (identical to 4G) |
| 5G SA | data, voice, voice-mt, data-idle, sms | video, mms, voice-epsfb (SA voice + EPC fallback on the `epsfb` topology) | — |

## Step fields

```js
{
  id: 'update-location',          // stable kebab-case id; deltas, ambient traffic, deep links and analogues anchor on it
  t: 'Update Location',           // title
  m: 'S6a ULR / ULA',             // message label drawn on the diagram (glossary-known tokens become clickable)
  p: ['mme', 'hss'],              // node path; every consecutive pair must be a link in the topology
  k: 'diameter',                  // protocol family (theme.js K) — colour and legend
  rt: true,                       // optional: round trip (dot goes out and back)
  tag: 'nsa',                     // optional: small chip
  dur: 6,                         // optional: seconds at 1×, overrides the reading-time model
  d: '…',                         // description: the mechanism
  pitfall: '…',                   // optional: "in practice" callout — operational insight, failure modes, vendor specifics
  analog: { net: '4g', flow: 'data', id: 'update-location' }, // optional: the same step in another generation (or an array)
}
```

`analog` is indexed by step *object*, so a composed flow that reuses its base's steps (NSA data reuses 4G data's) inherits the analogues, and the 4G step gets the reverse link for free. The **Compare** strip in the step panel is built from this.

## Adding a flow

1. Give every step a stable, kebab-case `id`.
2. If the new flow is genuinely identical in signalling to an existing one, re-export it (see `flows/nsa/sms.js`).
3. If it's an existing flow plus a few extra/changed steps, write a delta using `insertAfter`/`insertBefore`/`patch`/`replaceStep`/`removeStep` from `flows/compose.js` (see `flows/sa/voice-epsfb.js`). A flow module may export `topologyId` to draw on a different topology.
4. Only fully hand-author a flow when the underlying procedure is genuinely different.
5. Register the flow in `src/data/flows/index.js` under its network, and make sure its id is a session or session variant in `src/data/sessions.js`.
6. Run `npm test` — the validator checks node ids, links, ambient anchors, duplicate ids, analogues, glossary coverage of every label, and label collisions.

## Runtime

- **First visit**: an intro card explains the site, lists the suggested learning order and holds playback until *Start*. Dismissed state lives in `localStorage` (`mcn.introSeen`); the header **? help** button reopens it. The default landing flow is 4G data attach (`DEFAULT_FLOW` in `sessions.js`).
- **Playback**: each step's duration is derived from its description length (≈200 wpm, clamped 3–20 s). Speeds 0.5×–2×. The *auto-advance* switch, when off, holds at the end of every step; Play/Space continues.
- **Views**: Topology (animated) or Sequence (ladder diagram of the same steps). On screens narrower than the `xl` breakpoint the step text is rendered under the transport controls and the diagram scrolls horizontally to follow the current step.
- **Progress**: furthest step and completion per (network, flow), plus best quiz score, in `localStorage` (`mcn.progress`, see `src/lib/progress.js`). Completed flows get a tick in the selector; *reset progress* is in the reference panel.
- **Quiz**: ten questions generated from the current flow (which interface carries a message, where a step ends up, order four steps). Each answer is followed by the step's own description as the explanation.
- **Glossary**: every acronym in prose, node and link labels is clickable; the header search (`/`) looks up any term; a node definition offers *show on diagram*.
- **Keyboard**: Space play/pause, ←/→ step, Home/End first/last, `/` glossary search, `?` shortcut help, `g` then `h`/`c`/`f`/`g` to jump between sections, `m` to switch the 5G core drawing in lessons.
- **URL**: `#/flows?net=&session=&variant=&step=&view=` — every step is deep-linkable ("copy link" in the step panel); browser back/forward works for user-initiated jumps.
- **Sessions** carry a `tagline` (plain-language one-liner shown under the selector) and a `path` number (suggested learning order); see `src/data/sessions.js`.

## Deployment

Pushing to `main` runs lint, tests and build, then deploys to GitHub Pages via `.github/workflows/deploy.yml`. Pull requests run lint/test/build only. The repo's **Settings → Pages → Build and deployment → Source** must be set to "GitHub Actions" (one-time, manual).
