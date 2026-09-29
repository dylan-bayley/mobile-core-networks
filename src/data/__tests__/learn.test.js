import { describe, expect, it } from 'vitest';
import { collectLearnWarnings } from '../validateLearn.js';
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
});
