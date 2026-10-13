/*
 * A small original icon per component group, drawn beside group headings on
 * the Components page. Stroke-only on a 24px grid, in the current text colour,
 * and decorative: the heading text is the accessible name.
 */
const ICONS = {
  'Access & mobility': (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </>
  ),
  Radio: (
    <>
      <circle cx="12" cy="7" r="1.8" />
      <path d="M12 10 7 21M12 10l5 11M9 16h6M7.6 4.2a6 6 0 0 0 0 5.6M16.4 4.2a6 6 0 0 1 0 5.6" />
    </>
  ),
  'User plane': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12h7M15 12h7M18.5 8.5 22 12l-3.5 3.5" />
    </>
  ),
  'Subscriber data': (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  'Policy & charging': <path d="M12 4v16M7 20h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />,
  Sessions: (
    <>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M9 12h6" />
    </>
  ),
  'Session control': (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="m10.8 7.3-4.6 9.4M13.2 7.3l4.6 9.4" />
    </>
  ),
  Plumbing: <path d="M4 6h8a5 5 0 0 1 5 5v8M3 3.5v5M14.5 19h5" />,
  Exposure: <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M9 12h9M14 8l4 4-4 4" />,
  Roaming: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z" />
    </>
  ),
  'Breakout & interconnect': <path d="M2 12h7M22 12h-7M6 8.5 9.5 12 6 15.5M18 8.5 14.5 12l3.5 3.5M12 6v12" />,
  Media: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  Analytics: <path d="M5 20v-8M12 20V5M19 20V9M3 20h18" />,
  Services: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
};

/** The icon for a component group, or nothing when the group has none. */
export default function GroupIcon({ group, size = 16 }) {
  const icon = ICONS[group];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {icon}
    </svg>
  );
}
