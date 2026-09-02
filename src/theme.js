export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
export const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const K = {
  radio: { c: '#f5b544', n: 'Radio / NAS' },
  control: { c: '#4fb3ff', n: 'GTP-C / S1AP / NGAP' },
  diameter: { c: '#ff6fae', n: 'Diameter / MAP' },
  sbi: { c: '#e46fff', n: 'HTTP/2 service-based interface' },
  ims: { c: '#b08cff', n: 'SIP' },
  user: { c: '#3fd6a0', n: 'User plane' },
  media: { c: '#ff8a5c', n: 'Voice / video media' },
  tdm: { c: '#8fa3bf', n: 'Legacy / CS domain' },
};

export const BG = '#070b14';
export const PANEL = '#0d1424';
export const EDGE = '#1e2a42';

/* Text tokens, all checked against PANEL for WCAG AA (≥ 4.5:1 for body text). */
export const TEXT = '#e6edfa'; // headings, primary
export const TEXT_2 = '#a8b8d4'; // body copy
export const MUTED = '#8ea1bf'; // secondary (≈7:1)
export const FAINT = '#7d92b5'; // section labels, step numbers (≈5.8:1)

/* Interactive states. */
export const ACTIVE_BG = '#152441';
export const ACTIVE_EDGE = '#3d6ba8';
export const FOCUS = '#7cc4ff';
