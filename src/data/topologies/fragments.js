/* ------------------------------------------------------------------
   Shared topology fragments.

   A fragment only contains links whose *both* endpoints are inside it.
   Anything crossing a fragment boundary (Gm, Rx, Cx, Sh, Mj, SGd, ...) is a
   "seam" link declared by the individual topology file that assembles the
   fragments — that's what lets the IMS core be written once instead of once
   per network type, while still letting each network's core attach to it
   with its own genuinely-different reference points.
   ------------------------------------------------------------------ */

/** IMS registration/session-control core: shared verbatim by 4G, NSA and SA. */
export const imsCore = {
  nodes: {
    sbg: { cx: 560, cy: 460, w: 146, h: 56, t: 'P-CSCF', s: 'SBG + IMS-AGW' },
    cscf: { cx: 740, cy: 460, w: 132, h: 56, t: 'I/S-CSCF', s: 'CSCF' },
    mtas: { cx: 920, cy: 460, w: 132, h: 56, t: 'TAS', s: 'MTAS (MMTel)' },
  },
  links: [
    { a: 'sbg', b: 'cscf', l: 'Mw', k: 'ims', curve: 0 },
    { a: 'cscf', b: 'mtas', l: 'ISC', k: 'ims', curve: 0 },
  ],
  zones: [{ x: 470, y: 404, w: 696, h: 212, rx: 10, fill: '#100c22', label: 'IMS — VOICE, VIDEO AND SMS OVER IP', labelX: 482, labelY: 422, labelColor: '#544a7d' }],
};

/** IP-SM-GW: the SIP MESSAGE <-> legacy SMS interworking function. 4G and NSA only — 5G SA delivers SMS over NAS via the AMF/SMSF instead. */
export const smsGateway = {
  nodes: { ipsmgw: { cx: 1090, cy: 460, w: 150, h: 56, t: 'IP-SM-GW', s: 'SMS over IP' } },
  links: [{ a: 'cscf', b: 'ipsmgw', l: 'ISC (SMS)', k: 'ims', curve: 140 }],
};

/** PSTN breakout for off-net calls: shared by all network types. */
export const imsPstn = {
  nodes: {
    mgcf: { cx: 740, cy: 580, w: 150, h: 52, t: 'MGCF', s: 'M-MGw' },
    pstn: { cx: 920, cy: 580, w: 112, h: 48, t: 'PSTN', s: 'ISUP / BICC' },
  },
  links: [{ a: 'mgcf', b: 'pstn', l: 'ISUP', k: 'tdm', curve: 0 }],
};

/** The CSCF-to-MGCF seam is identical everywhere the IMS core and PSTN breakout both exist. */
export const imsPstnLink = {
  links: [{ a: 'cscf', b: 'mgcf', l: 'Mj', k: 'ims', curve: 0 }],
};

/** Legacy CS-domain anchor for CSFB/SRVCC. 4G and NSA only. */
export const csDomain = {
  nodes: { msc: { cx: 390, cy: 580, w: 140, h: 52, t: 'MSC-S', s: 'CSFB / SRVCC' } },
  links: [],
};

/** The SMS centre itself — present in every network type, wired differently in each. */
export const messaging = {
  nodes: { smsc: { cx: 1090, cy: 175, w: 140, h: 56, t: 'SMS-C', s: 'SMS-SC / GMSC' } },
  links: [],
};

/**
 * Shallow-merges a topology base with any number of fragments: node maps are
 * combined (throwing on a duplicate id — that's a real bug, not something to
 * silently overwrite), links/zones are concatenated.
 */
export function merge(base, ...fragments) {
  const nodes = { ...(base.nodes ?? {}) };
  const links = [...(base.links ?? [])];
  const zones = [...(base.zones ?? [])];

  for (const f of fragments) {
    for (const id of Object.keys(f.nodes ?? {})) {
      if (nodes[id]) throw new Error(`Duplicate node id "${id}" while assembling topology "${base.id}"`);
      nodes[id] = f.nodes[id];
    }
    links.push(...(f.links ?? []));
    zones.push(...(f.zones ?? []));
  }

  return { ...base, nodes, links, zones };
}
