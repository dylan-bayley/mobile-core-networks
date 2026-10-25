/**
 * Official documents the Learn and Components content is based on. Every
 * lesson scene and component record cites one or more of these as
 * `{ src: '<id>', clause?: '<clause number>' }` — the validator rejects
 * unknown ids. Clause numbers were checked against the version listed.
 *
 * ETSI republishes 3GPP specifications unchanged and free of charge as
 * "ETSI TS 1xx xxx"; those PDFs are linked because they're the stable,
 * openly downloadable copies. SIP and SDP themselves are IETF protocols, so
 * the SIP lesson also cites RFCs (an RFC never changes once published, so
 * its number is its version) and the GSMA IMS profiles.
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
  ts24229: {
    doc: 'TS 24.229',
    title: 'IP multimedia call control protocol based on SIP and SDP; Stage 3 (the IMS profile of SIP)',
    version: 'V18.11.0 (Rel-18)',
    url: 'https://www.etsi.org/deliver/etsi_ts/124200_124299/124229/18.11.00_60/ts_124229v181100p.pdf',
  },
  rfc3261: {
    doc: 'RFC 3261',
    title: 'SIP: Session Initiation Protocol',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3261',
  },
  rfc3262: {
    doc: 'RFC 3262',
    title: 'Reliability of provisional responses in SIP (PRACK)',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3262',
  },
  rfc3264: {
    doc: 'RFC 3264',
    title: 'An offer/answer model with the Session Description Protocol (SDP)',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3264',
  },
  rfc3311: {
    doc: 'RFC 3311',
    title: 'The SIP UPDATE method',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3311',
  },
  rfc3312: {
    doc: 'RFC 3312',
    title: 'Integration of resource management and SIP (preconditions)',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3312',
  },
  rfc3428: {
    doc: 'RFC 3428',
    title: 'SIP extension for instant messaging (MESSAGE)',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc3428',
  },
  rfc6665: {
    doc: 'RFC 6665',
    title: 'SIP-specific event notification (SUBSCRIBE and NOTIFY)',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc6665',
  },
  rfc8866: {
    doc: 'RFC 8866',
    title: 'SDP: Session Description Protocol',
    version: 'IETF',
    url: 'https://www.rfc-editor.org/rfc/rfc8866',
  },
  ir92: {
    doc: 'GSMA IR.92',
    title: 'IMS Profile for Voice and SMS (VoLTE)',
    version: 'V24.0 (October 2026)',
    url: 'https://www.gsma.com/newsroom/wp-content/uploads//IR.92-v24.0.pdf',
  },
  ng114: {
    doc: 'GSMA NG.114',
    title: 'IMS Profile for Voice, Video and Messaging over 5GS (VoNR)',
    version: 'V11.0 (September 2026)',
    url: 'https://www.gsma.com/newsroom/wp-content/uploads//NG.114-v11.0.pdf',
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
