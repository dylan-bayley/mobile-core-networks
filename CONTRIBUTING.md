# Contributing

Corrections and improvements are welcome. The site also has this guide at `#/contribute`.

## Ways to help

- Report an error or an unclear explanation by opening an issue, and say which page it is on.
- Suggest a topic by opening an issue first, so the scope can be agreed.
- Fix a typo, tighten an explanation or add a missing source with a pull request.

## Content rules

- Every fact in Learn and Components cites an official source. Add new documents to `src/data/reference/sources.js` and cite as `{ src, clause }`. Only give a clause number you have checked in the listed version.
- Diagrams are original. Do not reproduce figures from books or vendor material.
- Keep definitions vendor-neutral. Vendor product names belong only in a labelled `inPractice` note.
- Say where industry shorthand is not a standard term.
- Ask before adding a main call flow. Short per-component vignettes are fine.

## Making a change

1. Fork the repository and create a branch. Changes reach `main` only through a pull request.
2. `npm install`, then `npm run dev` and edit. The README describes the layout and data schemas.
3. Before pushing, run `npm run lint`, `npm test` (a clean run has zero warnings) and `npm run build`. CI runs the same three.
4. Open a pull request describing what changed, why, and how you tested it.
