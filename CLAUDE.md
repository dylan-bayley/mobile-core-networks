# CLAUDE.md

Guidance for working in this repo. The README covers layout, data schemas and runtime behaviour; read it first.

## Commands

- `npm run dev`: Vite dev server at `http://localhost:5173/mobile-core-networks/`. Routes live in the hash (`#/learn/5gc?scene=sba`, `#/components/amf`, `#/flows?net=sa…`).
- `npm test`: vitest, including the data validators (`src/data/validate.js` for flows and topologies, `src/data/validateLearn.js` for lessons, components and sources). Run it after any data edit. A clean run means zero warnings.
- `npm run lint`: oxlint. Keep component files exporting only components; `react/only-export-components` warns otherwise.
- `npm run build`: must pass before a PR. CI runs lint, test and build, and deploys to GitHub Pages only from `main`.

## Content rules

- **Every fact in Learn and Components cites an official source.** Add the document to `src/data/reference/sources.js` if it's new, and cite as `{ src, clause }`. Only give a clause number you have checked in the listed version; otherwise cite the document without a clause.
- **Diagrams are original.** Don't reproduce figures from books or vendor material. Rommer et al., *The Core Network for 5G Advanced*, is the inspiration for the lesson style, not a source to copy.
- **Keep definitions vendor-neutral.** Vendor product names belong only in a component's labelled `inPractice` note.
- **Say where industry shorthand isn't standard.** For example, "option 3x" isn't a 3GPP term: 3GPP names the bearer types (TS 37.340 §4.2.2).
- **Ask before adding a main call flow.** Short per-component vignettes (`src/data/components/vignettes.js`) are fine; they stay out of `FLOWS`.

## Architecture lessons

- Lesson content is data: `src/data/arch/<lesson>.js` exports `diagram`, `scenes`, `takeaways`, `check` and `links`. Rendering and animation are in `src/components/arch/ArchDiagram.jsx`; the pure state and tweening are in `src/engine/arch.js`, which has unit tests.
- Every layout needs both a `wide` and a portrait `narrow` placement. The validator fails if a node box leaves the viewBox in either mode.
- Scene visibility is cumulative (`show` / `add` / `remove`). `spawn: { newNode: oldNode }` makes a node grow out of another; `'@node'` in a traffic path is the service-bus point for that node.
- `ArchDiagram` re-animates whenever the `current` object changes identity. Memoise it, or build it once as a module constant; a fresh object every render restarts the tween every frame.
- SVG glow filters on paths must use `filterUnits="userSpaceOnUse"`. A perfectly horizontal or vertical path has a zero-size bounding box and disappears under a bounding-box filter. `TopologyDiagram.jsx` (the Flows explorer) still uses a bounding-box filter on links.
- React StrictMode double-runs effects. Don't use "first run" ref flags for one-time behaviour such as deep-link jumps; key them on the value that changed (see `LessonPage.jsx`).

## Style

- Colours come from `src/theme.js`. For text use `TEXT`, `TEXT_2`, `MUTED` and `FAINT` rather than raw hex greys, to keep AA contrast. `GEN` holds the 4G, 5G and radio accents; `K` holds the protocol colours.
- Pacing is the reading-time model `durationFor` in `src/engine/useStepPlayer.js`; lessons reuse it. Honour `useReducedMotion()`: snap animations to their end state and stop autoplay.
- Commits and PRs: no emoji, and no mention of AI generation. PR bodies cover what changed, why, and how it was tested.

## Verifying UI changes

The Chrome window can't be resized narrower than about 750px. To check phone layouts, replace the page body with 390px-wide iframes pointing at the dev-server URLs.
