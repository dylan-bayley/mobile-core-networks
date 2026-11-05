import { describe, expect, it } from 'vitest';
import { COMPONENTS } from '../../data/components/index.js';
import { BEST_MAX_TIER, rankComponents } from '../filterComponents.js';

const ids = (query) => rankComponents(COMPONENTS, query).map((r) => r.component.id);
const tierOfId = (query, id) => rankComponents(COMPONENTS, query).find((r) => r.component.id === id)?.tier;

describe('component search ranking', () => {
  it('returns everything for an empty or blank query', () => {
    expect(ids('')).toHaveLength(COMPONENTS.length);
    expect(ids('   ')).toHaveLength(COMPONENTS.length);
  });

  it('puts the component a name belongs to first', () => {
    expect(ids('amf')[0]).toBe('amf');
    expect(ids('upf')[0]).toBe('upf');
    expect(ids('mme')[0]).toBe('mme');
  });

  it('ranks a name above components that only mention it', () => {
    // The SMF and MME both name the UPF / AMF in their text.
    expect(ids('upf').indexOf('upf')).toBeLessThan(ids('upf').indexOf('smf'));
    expect(tierOfId('amf', 'mme')).toBeGreaterThan(BEST_MAX_TIER);
  });

  it('matches a short acronym on names only, not as a substring of prose', () => {
    const result = ids('af');
    expect(result[0]).toBe('af');
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('ignores case, surrounding space and hyphens in names', () => {
    expect(ids('  AMF ')[0]).toBe('amf');
    expect(ids('pcscf')[0]).toBe('pcscf');
    expect(ids('P-CSCF')[0]).toBe('pcscf');
  });

  it('matches the start of a word in the expansion', () => {
    expect(ids('session')).toContain('smf');
    expect(tierOfId('session', 'smf')).toBeLessThanOrEqual(BEST_MAX_TIER);
  });

  it('finds components from their description text', () => {
    expect(ids('voice').length).toBeGreaterThan(0);
    expect(ids('voice').some((id) => ['pcscf', 'tas', 'scscf'].includes(id))).toBe(true);
  });

  it('does not match inside a word', () => {
    expect(ids('ession')).toEqual([]);
  });

  it('returns nothing for a query that matches nothing', () => {
    expect(ids('zzzqx')).toEqual([]);
  });

  it('keeps list order within a tier', () => {
    const result = rankComponents(COMPONENTS, 'function');
    const order = (tier) => result.filter((r) => r.tier === tier).map((r) => COMPONENTS.indexOf(r.component));
    for (const tier of [2, 3, 4]) {
      const o = order(tier);
      expect(o).toEqual([...o].sort((a, b) => a - b));
    }
  });
});
