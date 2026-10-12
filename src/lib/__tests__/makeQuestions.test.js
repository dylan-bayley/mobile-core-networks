import { describe, expect, it } from 'vitest';
import { makeQuestions, maskNodes } from '../makeQuestions.js';
import { NETWORKS, SESSIONS, resolveScenario } from '../../data/index.js';
import { makeGeometry } from '../../engine/geometry.js';

describe('makeQuestions', () => {
  it('generates ten well-formed questions for every flow', () => {
    for (const net of NETWORKS) {
      for (const session of SESSIONS) {
        for (const v of session.variants ?? [{ id: session.id }]) {
          const scenario = resolveScenario(net.id, v.id);
          const qs = makeQuestions(scenario, makeGeometry(scenario.topology), 10);
          expect(qs.length, `${net.id}/${v.id}`).toBeGreaterThanOrEqual(Math.min(10, scenario.steps.length));
          expect(qs.length).toBeLessThanOrEqual(10);
          const seen = qs.map((q) => `${q.type}/${q.prompt}/${q.stepIndex}`);
          expect(new Set(seen).size, `${net.id}/${v.id} repeats a question`).toBe(seen.length);
          for (const q of qs) {
            expect(q.stepIndex).toBeGreaterThanOrEqual(0);
            expect(q.stepIndex).toBeLessThan(scenario.steps.length);
            if (q.prompt.startsWith('Where does')) expect(scenario.steps[q.stepIndex].rt, 'round trips end where they started').toBeFalsy();
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

  it('masks whole node names, longest first', () => {
    const topology = { nodes: { a: { t: 'MME' }, b: { t: 'SMF+PGW-C' }, c: { t: 'SMF' } } };
    expect(maskNodes('S1-MME carries it to the MME.', topology)).toBe('S1-MME carries it to the ▒▒▒.');
    expect(maskNodes('The SMF+PGW-C, not the SMF, answers. MME-initiated.', topology)).toBe('The ▒▒▒, not the ▒▒▒, answers. ▒▒▒-initiated.');
  });
});
