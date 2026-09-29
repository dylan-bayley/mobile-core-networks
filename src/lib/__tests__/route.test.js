import { describe, expect, it } from 'vitest';
import { parseHash, hrefFor, legacyRedirect } from '../route.js';

describe('hash routing', () => {
  it('parses path segments and the query after the hash', () => {
    const r = parseHash('#/learn/5gc?scene=sba');
    expect(r.path).toBe('/learn/5gc');
    expect(r.segments).toEqual(['learn', '5gc']);
    expect(r.query.get('scene')).toBe('sba');
  });

  it('treats an empty hash as the home page', () => {
    expect(parseHash('').path).toBe('/');
    expect(parseHash('#/').segments).toEqual([]);
  });

  it('decodes encoded glossary terms', () => {
    expect(parseHash('#/glossary/UDM%20%2F%20HSS').segments).toEqual(['glossary', 'UDM / HSS']);
  });

  it('builds hrefs with an optional query', () => {
    expect(hrefFor('/flows', { net: 'sa', step: 'x' })).toBe('#/flows?net=sa&step=x');
    expect(hrefFor('/components')).toBe('#/components');
  });

  it('redirects pre-sections links into the Flows explorer', () => {
    expect(legacyRedirect('?net=sa&session=data&step=reg&utm=x', '')).toBe('#/flows?net=sa&session=data&step=reg');
    expect(legacyRedirect('?net=sa', '#/learn/epc')).toBeNull();
    expect(legacyRedirect('', '')).toBeNull();
  });
});
