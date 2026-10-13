import { describe, expect, it } from 'vitest';
import * as t from '../theme.js';

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = { BG: t.BG, PANEL: t.PANEL, SURFACE: t.SURFACE, ACTIVE_BG: t.ACTIVE_BG };

describe('theme contrast (WCAG AA)', () => {
  for (const [name, fg] of Object.entries({ TEXT: t.TEXT, TEXT_2: t.TEXT_2, MUTED: t.MUTED, FAINT: t.FAINT })) {
    it(`${name} text is at least 4.5:1 on every surface`, () => {
      for (const [bn, bg] of Object.entries(SURFACES)) expect(ratio(fg, bg), bn).toBeGreaterThanOrEqual(4.5);
    });
  }
  for (const [name, fg] of Object.entries({ CONTROL_EDGE: t.CONTROL_EDGE, ACTIVE_EDGE: t.ACTIVE_EDGE })) {
    it(`${name} control outline is at least 3:1 on PANEL, SURFACE and BG`, () => {
      for (const bn of ['PANEL', 'SURFACE', 'BG']) expect(ratio(fg, SURFACES[bn]), bn).toBeGreaterThanOrEqual(3);
    });
  }
});
