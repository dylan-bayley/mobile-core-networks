import { describe, expect, it } from 'vitest';
import { makeQuestions } from '../makeQuestions.js';
import { NETWORKS, SESSIONS, resolveScenario } from '../../data/index.js';
import { makeGeometry } from '../../engine/geometry.js';

describe('makeQuestions', () => {
  it('generates ten well-formed questions for every flow', () => {
    for (const net of NETWORKS) {
      for (const session of SESSIONS) {
        for (const v of session.variants ?? [{ id: session.id }]) {
          const scenario = resolveScenario(net.id, v.id);
          const qs = makeQuestions(scenario, makeGeometry(scenario.topology), 10);
          expect(qs.length, `${net.id}/${v.id}`).toBe(10);
          for (const q of qs) {
            expect(q.stepIndex).toBeGreaterThanOrEqual(0);
            expect(q.stepIndex).toBeLessThan(scenario.steps.length);
            if (q.type === 'choice') {
              expect(q.options.length).toBe(4);
              expect(q.options.filter((o) => o.correct).length).toBe(1);
              expect(new Set(q.options.map((o) => o.label)).size).toBe(4);
            } else {
              expect(q.items.length).toBe(4);
              expect(q.items.map((i) => i.order).sort()).toEqual([0, 1, 2, 3]);
            }
          }
        }
      }
    }
  });
});
