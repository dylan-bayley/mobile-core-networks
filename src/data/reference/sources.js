/**
 * Official documents the Learn and Components content is based on. Every
 * lesson scene and component record cites one or more of these as
 * `{ src: '<id>', clause?: '<clause number>' }` — the validator rejects
 * unknown ids. Clause numbers were checked against the version listed.
 *
 * ETSI republishes 3GPP specifications unchanged and free of charge as
 * "ETSI TS 1xx xxx"; those PDFs are linked because they're the stable,
 * openly downloadable copies.
 */
export const SOURCES = {
  ts23501: {
    doc: 'TS 23.501',
    title: 'System architecture for the 5G System (5GS)',
    version: 'V18.10.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123500_123599/123501/18.10.00_60/ts_123501v181000p.pdf',
  },
  ts23502: {
    doc: 'TS 23.502',
    title: 'Procedures for the 5G System (5GS)',
    version: 'V18.9.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123500_123599/123502/18.09.00_60/ts_123502v180900p.pdf',
  },
  ts23401: {
    doc: 'TS 23.401',
    title: 'GPRS enhancements for E-UTRAN access (the EPC architecture)',
    version: 'V18.8.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123400_123499/123401/18.08.00_60/ts_123401v180800p.pdf',
  },
  ts23002: {
    doc: 'TS 23.002',
    title: 'Network architecture',
    version: 'V18.0.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123000_123099/123002/18.00.00_60/ts_123002v180000p.pdf',
  },
  ts23203: {
    doc: 'TS 23.203',
    title: 'Policy and charging control architecture',
    version: 'V18.0.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123200_123299/123203/18.00.00_60/ts_123203v180000p.pdf',
  },
  ts23228: {
    doc: 'TS 23.228',
    title: 'IP Multimedia Subsystem (IMS); Stage 2',
    version: 'V18.10.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123200_123299/123228/18.10.00_60/ts_123228v181000p.pdf',
  },
  ts23214: {
    doc: 'TS 23.214',
    title: 'Control and user plane separation of EPC nodes (CUPS)',
    version: 'V16.2.0 (Rel-16)',
    url: 'https://www.etsi.org/deliver/etsi_ts/123200_123299/123214/16.02.00_60/ts_123214v160200p.pdf',
  },
  ts32240: {
    doc: 'TS 32.240',
    title: 'Charging management; charging architecture and principles',
    version: 'V18.9.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/132200_132299/132240/18.09.00_60/ts_132240v180900p.pdf',
  },
  ts33501: {
    doc: 'TS 33.501',
    title: 'Security architecture and procedures for 5G System',
    version: 'V18.8.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/133500_133599/133501/18.08.00_60/ts_133501v180800p.pdf',
  },
  ts33203: {
    doc: 'TS 33.203',
    title: '3G security; access security for IP-based services (IMS)',
    version: 'V18.1.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/133200_133299/133203/18.01.00_60/ts_133203v180100p.pdf',
  },
  ts37340: {
    doc: 'TS 37.340',
    title: 'NR; Multi-connectivity; overall description (EN-DC and other MR-DC)',
    version: 'V19.2.0 (Rel-19)',
    url: 'https://www.etsi.org/deliver/etsi_ts/137300_137399/137340/19.02.00_60/ts_137340v190200p.pdf',
  },
  ts38300: {
    doc: 'TS 38.300',
    title: 'NR and NG-RAN overall description',
    version: 'V18.6.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/138300_138399/138300/18.06.00_60/ts_138300v180600p.pdf',
  },
  tr38801: {
    doc: 'TR 38.801',
    title: 'Study on new radio access technology: radio access architecture and interfaces (origin of the deployment-option numbers)',
    version: 'V14.0.0 (Rel-14)',
    url: 'https://www.3gpp.org/ftp/Specs/archive/38_series/38.801/',
  },
  gsma5g: {
    doc: 'GSMA',
    title: 'Road to 5G: Introduction and Migration (white paper, April 2018)',
    version: '2018',
    url: 'https://www.gsma.com/futurenetworks/resources/road-to-5g-introduction-and-migration-whitepaper/',
  },
};

/** Short label for a citation: "TS 23.501 §6.2.6". */
export const citeLabel = ({ src, clause }) => {
  const s = SOURCES[src];
  if (!s) return src;
  if (!clause) return s.doc;
  return /^\d/.test(clause) ? `${s.doc} §${clause}` : `${s.doc} ${clause}`;
};
