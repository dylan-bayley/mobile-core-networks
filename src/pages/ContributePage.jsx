import { DIVIDER, MONO, MUTED, TEXT, TEXT_2 } from '../theme.js';
import { REPO_URL } from '../lib/repo.js';

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold sm:text-xl" style={{ color: TEXT }}>{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed sm:text-base" style={{ color: TEXT_2 }}>{children}</div>
    </section>
  );
}

const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: TEXT }}>{children}</a>
);

const Code = ({ children }) => (
  <code className="rounded px-1 py-0.5 text-[0.9em]" style={{ fontFamily: MONO, color: TEXT, border: `1px solid ${DIVIDER}` }}>{children}</code>
);

/** How to help: ways to contribute, the content rules, and the fork-and-PR workflow. */
export default function ContributePage() {
  return (
    <div className="mx-auto max-w-[800px] px-3 py-5 sm:px-4 sm:py-6">
      <header>
        <h1 tabIndex={-1} className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: TEXT }}>
          How to contribute
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm sm:text-base" style={{ color: TEXT_2 }}>
          This is an open-source learning tool, and corrections and improvements are welcome. The code and all
          lesson content live on <ExtLink href={REPO_URL}>GitHub</ExtLink>.
        </p>
      </header>

      <Section title="Ways to help">
        <ul className="list-disc space-y-1 pl-5">
          <li>Spot something wrong or unclear? <ExtLink href={`${REPO_URL}/issues`}>Open an issue</ExtLink> and say which page it is on.</li>
          <li>Want a topic covered? Open an issue first, so we can agree the scope.</li>
          <li>Fix a typo, tighten an explanation, or add a missing source with a pull request.</li>
        </ul>
      </Section>

      <Section title="Content rules">
        <ul className="list-disc space-y-1 pl-5">
          <li>Every fact in Learn and Components cites an official source (3GPP, IETF, GSMA and similar). Only give a clause number you have checked in the listed version.</li>
          <li>Diagrams are original. Do not copy figures from books or vendor material.</li>
          <li>Definitions are vendor-neutral. Product names belong only in a labelled &ldquo;in practice&rdquo; note.</li>
          <li>Where industry shorthand is not a standard term, say so.</li>
          <li>Please ask before adding a new main call flow. Short per-component vignettes are fine.</li>
        </ul>
      </Section>

      <Section title="Making a change">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Fork the repository and create a branch. Nobody pushes to <Code>main</Code> directly; every change arrives as a pull request.</li>
          <li>Run <Code>npm install</Code> then <Code>npm run dev</Code> and edit. Lesson, component and flow content is plain data under <Code>src/data</Code>.</li>
          <li>Before you push, run <Code>npm run lint</Code>, <Code>npm test</Code> (a clean run has zero warnings) and <Code>npm run build</Code>. CI runs the same three.</li>
          <li>Open a pull request that says what changed, why, and how you tested it.</li>
        </ol>
        <p style={{ color: MUTED }}>
          The README describes the layout and the data schemas:{' '}
          <ExtLink href={`${REPO_URL}#readme`}>read it on GitHub</ExtLink>.
        </p>
      </Section>
    </div>
  );
}
