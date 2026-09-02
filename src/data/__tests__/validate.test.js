import { describe, expect, it } from 'vitest';
import { collectWarnings } from '../validate.js';
import { NETWORKS, SESSIONS, FLOWS, resolveScenario, analogsOf } from '../index.js';
import { sessionForFlow, variantsFor } from '../sessions.js';

describe('data consistency', () => {
  it('has no validator warnings across every network / flow / topology', () => {
    expect(collectWarnings()).toEqual([]);
  });

  it('resolves every session and variant on every network without throwing', () => {
    for (const net of NETWORKS) {
      for (const session of SESSIONS) {
        for (const v of session.variants ?? [{ id: session.id }]) {
          const s = resolveScenario(net.id, v.id);
          expect(s.steps.length).toBeGreaterThan(2);
          expect(s.topology).toBeTruthy();
          for (const a of s.ambient) expect(a.after).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('falls back to the session default when a network lacks a variant', () => {
    const s = resolveScenario('4g', 'voice-epsfb');
    expect(s.flowId).toBe('voice');
    expect(s.fallback).toBe(true);
    expect(variantsFor(sessionForFlow('voice'), FLOWS['4g']).map((v) => v.id)).toEqual(['voice', 'voice-mt']);
    expect(variantsFor(sessionForFlow('voice'), FLOWS.sa).map((v) => v.id)).toEqual(['voice', 'voice-mt', 'voice-epsfb']);
  });

  it('every 5G SA data/voice/sms step has a 4G analogue, and the 4G step points back', () => {
    for (const flowId of ['data', 'voice', 'sms', 'voice-mt', 'data-idle']) {
      const sa = resolveScenario('sa', flowId);
      for (const step of sa.steps) {
        const analogs = analogsOf(step, { networkId: 'sa', flowId });
        expect(analogs.length, `${flowId}/${step.id} has no analogue`).toBeGreaterThan(0);
        const back = analogsOf(analogs[0].step, { networkId: analogs[0].net, flowId: analogs[0].flow });
        expect(back.some((b) => b.step === step)).toBe(true);
      }
    }
  });

  it('composed NSA flows share step objects with 4G, so their analogues resolve too', () => {
    const nsa = resolveScenario('nsa', 'data');
    const updateLocation = nsa.steps.find((s) => s.id === 'update-location');
    const analogs = analogsOf(updateLocation, { networkId: 'nsa', flowId: 'data' });
    expect(analogs.map((a) => `${a.net}/${a.flow}/${a.id}`)).toContain('sa/data/udm-registration');
  });
});
