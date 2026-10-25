import { describe, expect, it } from 'vitest';
import { ladderLayout, minLaneFor, resolveLadderScenes, MIN_LANE, HEAD, ROW_H, FOOT, CHAR_W, LABEL_PAD } from '../ladder.js';

const ladder = {
  actors: [{ id: 'a', t: 'Alice' }, { id: 'p', t: 'Proxy' }, { id: 'b', t: 'Bob' }],
  rows: [
    { id: 'inv', f: 'a', t: 'p', m: 'INVITE', k: 'req' },
    { id: 'inv2', f: 'p', t: 'b', m: 'INVITE', k: 'req' },
    { id: 'n', note: 'Bob’s phone rings', a: 'b', b: 'b' },
    { id: 'ok', f: 'b', t: 'a', m: '200 OK (SDP answer, a long label)', k: 'res' },
    { id: 'ack', f: 'a', t: 'b', m: 'ACK', k: 'req' },
  ],
};

describe('ladder engine', () => {
  it('widens lanes until each label fits between the lifelines it spans', () => {
    const lane = minLaneFor(ladder);
    // The long 200 OK spans two lanes; INVITE fits in MIN_LANE.
    expect(lane).toBe(Math.max(MIN_LANE, Math.ceil(('200 OK (SDP answer, a long label)'.length * CHAR_W + LABEL_PAD) / 2)));
    expect(minLaneFor({ actors: ladder.actors, rows: [ladder.rows[0]] })).toBe(MIN_LANE);
  });

  it('spreads lanes across the width, and overflows rather than squeezing', () => {
    const wide = ladderLayout(ladder, 900);
    expect(wide.w).toBe(900);
    const xs = wide.actors.map((a) => a.x);
    expect(xs[1] - xs[0]).toBeCloseTo(xs[2] - xs[1]);
    const narrow = ladderLayout(ladder, 200);
    expect(narrow.w).toBeGreaterThan(200);
    expect(narrow.lane).toBe(minLaneFor(ladder));
    expect(narrow.h).toBe(HEAD + ladder.rows.length * ROW_H + FOOT);
  });

  it('gives each message its direction and keeps notes inside the drawing', () => {
    const { rows, w } = ladderLayout(ladder, 300);
    expect(rows[0].dir).toBe(1);
    expect(rows[3].dir).toBe(-1);
    const note = rows[2].box;
    expect(note.x).toBeGreaterThanOrEqual(4);
    expect(note.x + note.w).toBeLessThanOrEqual(w - 4);
  });

  it('reveals rows cumulatively and animates only the new ones', () => {
    const r = resolveLadderScenes({ l: ladder, other: ladder }, [
      { id: '1', ladder: 'l', upto: 'inv2' },
      { id: '2', ladder: 'l', upto: 'ack', focus: ['ok'] },
      { id: '3', ladder: 'l', upto: 'ack' },
      { id: '4', ladder: 'other', upto: 'inv', focus: ['inv'] },
      { id: '5', ladder: 'l' },
    ]);
    expect([...r[0].visible]).toEqual(['inv', 'inv2']);
    expect(r[0].fresh).toEqual(['inv', 'inv2']);
    expect(r[1].fresh).toEqual(['n', 'ok', 'ack']);
    expect(r[1].focus.has('ok')).toBe(true);
    expect(r[2].fresh).toEqual([]);
    expect(r[3].fresh).toEqual(['inv']); // a new ladder: its focus rows
    expect(r[4].visible.size).toBe(ladder.rows.length); // no upto: every row
    expect(r[4].fresh).toHaveLength(ladder.rows.length);
  });

  it('throws on unknown ladders, rows and undrawn focus rows', () => {
    expect(() => resolveLadderScenes({ l: ladder }, [{ id: 'x', ladder: 'nope' }])).toThrow(/unknown ladder "nope"/);
    expect(() => resolveLadderScenes({ l: ladder }, [{ id: 'x', ladder: 'l', upto: 'zz' }])).toThrow(/no row "zz"/);
    expect(() => resolveLadderScenes({ l: ladder }, [{ id: 'x', ladder: 'l', upto: 'inv', focus: ['ack'] }])).toThrow(/focus row "ack"/);
  });
});
