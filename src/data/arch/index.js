import { LESSON_META } from './lessons.js';
import { resolveScenes } from '../../engine/arch.js';
import { resolveLadderScenes } from '../../engine/ladder.js';
import * as epc from './epc.js';
import * as fivegc from './fivegc.js';
import * as interworking from './interworking.js';
import * as sansa from './sansa.js';
import * as ims from './ims.js';
import * as sip from './sip.js';

const MODULES = { epc, '5gc': fivegc, interworking, 'sa-nsa': sansa, ims, sip };

/**
 * Every lesson: its metadata plus diagram, scenes (pre-resolved), takeaways,
 * quick check and extras. A ladder lesson (`kind: 'ladder'`) has ladders and
 * panels instead of a diagram.
 */
export const LESSONS = Object.fromEntries(
  LESSON_META.map((meta) => {
    const m = MODULES[meta.id];
    const ladder = m.kind === 'ladder';
    return [
      meta.id,
      {
        ...meta,
        kind: m.kind ?? 'arch',
        diagram: m.diagram ?? null,
        ladders: m.ladders ?? null,
        panels: m.panels ?? {},
        tryIt: m.tryIt ?? [],
        scenes: m.scenes,
        resolved: ladder ? resolveLadderScenes(m.ladders, m.scenes) : resolveScenes(m.diagram, m.scenes),
        takeaways: m.takeaways ?? [],
        check: m.check ?? [],
        links: m.links ?? [],
        compare: m.compare ?? null,
        options: m.options ?? null,
      },
    ];
  }),
);

export const DIAGRAMS = Object.fromEntries(
  Object.values(LESSONS)
    .filter((l) => l.diagram)
    .map((l) => [l.diagram.id, l.diagram]),
);
