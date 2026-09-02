import { describe, expect, it } from 'vitest';
import { countCompleted, isCompleted, readProgress, recordQuiz, recordStep, writeProgress, STORAGE_KEY } from '../progress.js';

const memStorage = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
};

describe('progress', () => {
  it('tracks the furthest step and marks completion on the last one', () => {
    let p = {};
    p = recordStep(p, '4g', 'data', 3, 14);
    expect(p['4g/data']).toEqual({ maxStep: 3, total: 14, completed: false });
    const same = recordStep(p, '4g', 'data', 1, 14);
    expect(same).toBe(p); // going backwards changes nothing
    p = recordStep(p, '4g', 'data', 13, 14);
    expect(isCompleted(p, '4g', 'data')).toBe(true);
    expect(countCompleted(p, '4g', ['data', 'voice'])).toBe(1);
  });
  it('keeps only the best quiz score', () => {
    let p = recordQuiz({}, 'sa', 'voice', 6, 10);
    p = recordQuiz(p, 'sa', 'voice', 4, 10);
    expect(p['sa/voice'].bestQuiz).toEqual({ score: 6, total: 10 });
    p = recordQuiz(p, 'sa', 'voice', 9, 10);
    expect(p['sa/voice'].bestQuiz).toEqual({ score: 9, total: 10 });
  });
  it('round-trips through storage and tolerates garbage', () => {
    const s = memStorage();
    writeProgress({ 'nsa/sms': { maxStep: 2, total: 5, completed: false } }, s);
    expect(readProgress(s)['nsa/sms'].maxStep).toBe(2);
    s.setItem(STORAGE_KEY, '{not json');
    expect(readProgress(s)).toEqual({});
    expect(readProgress(undefined)).toEqual({});
  });
});
