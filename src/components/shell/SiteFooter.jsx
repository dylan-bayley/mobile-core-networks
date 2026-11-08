import { DIVIDER, MUTED } from '../../theme.js';
import { REPO_URL } from '../../lib/repo.js';

/** Site-wide footer: contributor page and the GitHub repo. Clears the mobile tab bar. */
export default function SiteFooter() {
  return (
    <footer className="px-4 pb-20 pt-4 text-sm sm:pb-6" style={{ borderTop: `1px solid ${DIVIDER}`, color: MUTED }}>
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-5 gap-y-1">
        <a href="#/contribute" className="underline">How to contribute</a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline">View on GitHub</a>
      </div>
    </footer>
  );
}
