import { LESSON_META } from './lessons.js';
import { resolveScenes } from '../../engine/arch.js';
import * as epc from './epc.js';
import * as fivegc from './fivegc.js';
import * as interworking from './interworking.js';
import * as sansa from './sansa.js';
import * as ims from './ims.js';

const MODULES = { epc, '5gc': fivegc, interworking, 'sa-nsa': sansa, ims };

/** Every lesson: its metadata plus diagram, scenes (pre-resolved), takeaways, quick check and extras. */
export const LESSONS = Object.fromEntries(
  LESSON_META.map((meta) => {
    const m = MODULES[meta.id];
    return [
      meta.id,
      {
        ...meta,
        diagram: m.diagram,
        scenes: m.scenes,
        resolved: resolveScenes(m.diagram, m.scenes),
        takeaways: m.takeaways ?? [],
        check: m.check ?? [],
        links: m.links ?? [],
        compare: m.compare ?? null,
        options: m.options ?? null,
      },
    ];
  }),
);

export const DIAGRAMS = Object.fromEntries(Object.values(LESSONS).map((l) => [l.diagram.id, l.diagram]));
