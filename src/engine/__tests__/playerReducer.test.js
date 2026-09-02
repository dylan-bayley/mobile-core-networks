import { describe, expect, it } from 'vitest';
import { initPlayer, playerReducer } from '../playerReducer.js';
import { durationFor } from '../useStepPlayer.js';

const tick = (state, dt, extra = {}) => playerReducer(state, { type: 'tick', dt, dur: 1, total: 3, ...extra });

describe('playerReducer', () => {
  it('advances progress and rolls into the next step', () => {
    let s = initPlayer();
    s = tick(s, 0.5);
    expect(s).toMatchObject({ step: 0, progress: 0.5, done: false });
    s = tick(s, 0.6);
    expect(s).toMatchObject({ step: 1, progress: 0, done: false, held: false });
  });

  it('holds at the end of a step when advance is false', () => {
    let s = initPlayer();
    s = tick(s, 1.2, { advance: false });
    expect(s).toMatchObject({ step: 0, progress: 1, held: true, done: false });
  });

  it('marks done at the end of the last step and never overruns', () => {
    let s = { step: 2, progress: 0.9, done: false, held: false };
    s = tick(s, 0.5);
    expect(s).toMatchObject({ step: 2, progress: 1, done: true });
  });

  it('goto and restart reset progress and flags', () => {
    const held = { step: 1, progress: 1, done: false, held: true };
    expect(playerReducer(held, { type: 'goto', step: 2 })).toEqual({ step: 2, progress: 0, done: false, held: false });
    expect(playerReducer(held, { type: 'restart' })).toEqual(initPlayer());
  });
});

describe('durationFor', () => {
  it('scales with description length within bounds and honours an explicit dur', () => {
    const short = durationFor({ d: 'One two three.', p: ['a', 'b'] });
    const long = durationFor({ d: Array(120).fill('word').join(' '), p: ['a', 'b'] });
    expect(short).toBe(3);
    expect(long).toBe(20);
    const mid = durationFor({ d: Array(40).fill('word').join(' '), p: ['a', 'b'] });
    expect(mid).toBeGreaterThan(short);
    expect(mid).toBeLessThan(long);
    expect(durationFor({ d: 'x', p: ['a', 'b'], dur: 7 })).toBe(7);
    expect(durationFor({ d: 'x', p: ['a', 'b'], rt: true })).toBeGreaterThan(durationFor({ d: 'x', p: ['a', 'b'] }) - 1);
  });
});
