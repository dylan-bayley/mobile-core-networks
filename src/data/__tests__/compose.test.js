import { describe, expect, it } from 'vitest';
import { compose, insertAfter, insertBefore, replaceStep, removeStep, patch, byId } from '../flows/compose.js';

const base = [
  { id: 'a', t: 'A' },
  { id: 'b', t: 'B' },
  { id: 'c', t: 'C' },
];
const ids = (s) => s.map((x) => x.id);

describe('compose', () => {
  it('inserts after / before an anchor', () => {
    expect(ids(compose(base, insertAfter('a', { id: 'x' })))).toEqual(['a', 'x', 'b', 'c']);
    expect(ids(compose(base, insertBefore('c', { id: 'x' }, { id: 'y' })))).toEqual(['a', 'b', 'x', 'y', 'c']);
  });

  it('replaces, removes and patches without mutating the base', () => {
    const out = compose(base, replaceStep('b', { id: 'b2' }), removeStep('c'), patch('a', (s) => ({ t: `${s.t}!` })));
    expect(ids(out)).toEqual(['a', 'b2']);
    expect(out[0].t).toBe('A!');
    expect(base[0].t).toBe('A');
    expect(ids(base)).toEqual(['a', 'b', 'c']);
  });

  it('throws with the available ids when an anchor is missing', () => {
    expect(() => compose(base, insertAfter('nope', { id: 'x' }))).toThrow(/no step with id "nope".*a, b, c/);
  });

  it('byId indexes steps', () => {
    expect(byId(base).b.t).toBe('B');
  });
});
