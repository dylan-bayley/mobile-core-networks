import { describe, expect, it } from 'vitest';
import { checkQuickCheck, checkScenes, collectLearnWarnings, hrefProblem } from '../validateLearn.js';
import { LESSONS } from '../arch/index.js';
import { LESSON_META } from '../arch/lessons.js';
import { COMPONENTS, componentForTerm, flowAppearances } from '../components/index.js';

describe('learn and components content', () => {
  it('has no validator warnings (sources, layouts, scenes, cross-links)', () => {
    expect(collectLearnWarnings()).toEqual([]);
  });

  it('builds every lesson in the learning path', () => {
    for (const meta of LESSON_META) {
      const lesson = LESSONS[meta.id];
      expect(lesson.scenes.length).toBeGreaterThan(3);
      expect(lesson.resolved).toHaveLength(lesson.scenes.length);
      expect(lesson.check.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('links glossary terms to component pages and components to flows', () => {
    expect(componentForTerm('AMF')).toBe('amf');
    expect(componentForTerm('5G-EIR')).toBe('eir5g');
    const amf = COMPONENTS.find((c) => c.id === 'amf');
    const flows = flowAppearances(amf);
    expect(flows.length).toBeGreaterThan(0);
    expect(flows.every((f) => f.net === 'sa' && f.first.p.includes('amf'))).toBe(true);
  });

  describe('validator checks', () => {
    const diagram = {
      id: 'fixture',
      grid: { wide: { cols: 4, rows: 2, w: 600, h: 300 }, narrow: { cols: 2, rows: 4, w: 300, h: 600 } },
      nodes: { a: { t: 'A', gen: '5g' }, b: { t: 'B', gen: '5g' }, c: { t: 'C', gen: '5g' } },
      layouts: { main: { wide: { a: [0, 0], b: [1, 0], c: [2, 0] }, narrow: { a: [0, 0], b: [0, 1], c: [0, 2] } } },
      links: [{ a: 'a', b: 'b', l: 'X1', k: 'control' }],
    };
    const scene = (over) => ({ id: 's1', title: 'T', d: 'D', cites: [{ src: 'ts23501' }], layout: 'main', show: ['a', 'b'], ...over });
    const run = (scenes) => {
      const w = [];
      checkScenes('Fixture', diagram, scenes, w);
      return w.join('\n');
    };

    it('passes a well-formed scene', () => {
      expect(run([scene({ traffic: [{ p: ['a', 'b'], k: 'user' }], focus: { nodes: ['a'], links: ['X1'] } })])).toBe('');
    });
    it('catches duplicate scene ids', () => {
      expect(run([scene(), scene()])).toMatch(/duplicate scene id "s1"/);
    });
    it('keeps checking after an unknown layout', () => {
      const out = run([scene({ layout: 'nope' }), scene({ id: 's2', focus: { nodes: ['c'] } })]);
      expect(out).toMatch(/unknown layout "nope"/);
      expect(out).toMatch(/focus node "c" isn't shown/);
    });
    it('catches traffic hops without a link, unknown kinds and removals', () => {
      const out = run([scene({ show: ['a', 'b', 'c'], remove: ['zz'], traffic: [{ p: ['b', 'c'], k: 'bogus' }] })]);
      expect(out).toMatch(/hop b → c has no drawn link/);
      expect(out).toMatch(/unknown colour kind "bogus"/);
      expect(out).toMatch(/removes unknown node "zz"/);
    });
    it('needs a spawn source in the previous scene', () => {
      const out = run([scene({ show: ['a'] }), scene({ id: 's2', show: ['a', 'c'], spawn: { c: 'b' } })]);
      expect(out).toMatch(/"c" spawns from "b", which the previous scene doesn't show/);
    });
    it('checks quick-check questions', () => {
      const w = [];
      checkQuickCheck('L', [{ q: 'Q', options: ['x', 'x'], answer: 0 }, { q: 'Q', options: ['y', 'z'], answer: 1, why: 'because' }], w);
      expect(w.join('\n')).toMatch(/no explanation/);
      expect(w.join('\n')).toMatch(/repeats an option/);
      expect(w.join('\n')).toMatch(/repeats an earlier question/);
    });
    it('resolves in-app links', () => {
      expect(hrefProblem('#/learn/5gc')).toBeNull();
      expect(hrefProblem('#/learn/5gc?scene=nope')).toMatch(/no scene/);
      expect(hrefProblem('#/learn/nope')).toMatch(/unknown lesson/);
      expect(hrefProblem('#/components/amf')).toBeNull();
      expect(hrefProblem('#/components/nope')).toMatch(/unknown component/);
      expect(hrefProblem('#/flows?net=sa&session=data')).toBeNull();
      expect(hrefProblem('#/flows?net=4g&session=voice&variant=voice-epsfb')).toMatch(/has no/);
      expect(hrefProblem('#/glossary/AMF')).toBeNull();
      expect(hrefProblem('https://www.etsi.org/')).toBeNull();
    });
  });
});
