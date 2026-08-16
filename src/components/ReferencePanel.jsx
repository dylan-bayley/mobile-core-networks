import { memo, useState } from 'react';
import { K, PANEL, EDGE, MONO } from '../theme.js';
import GlossaryPanel from './GlossaryPanel.jsx';

function QosTable({ title, rows, colorFor }) {
  return (
    <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <h3 style={{ fontFamily: MONO, fontSize: 11, color: '#63799c', letterSpacing: '0.12em' }}>{title}</h3>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-baseline gap-3 text-xs" style={{ borderBottom: '1px solid #131d33', paddingBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: colorFor(row), fontSize: 13, fontWeight: 700, width: 24 }}>{row[0]}</span>
            <span className="flex-1">
              <span style={{ color: '#e6edfa' }}>{row[2]}</span>
              <span style={{ color: '#63799c' }}> · {row[1]}</span>
            </span>
            <span style={{ fontFamily: MONO, color: '#63799c' }}>{row[3]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const qciColor = (row) => (row[0] === '1' ? K.media.c : row[0] === '5' ? K.ims.c : K.user.c);
const fiveQiColor = (row) => (row[0] === '1' ? K.media.c : row[0] === '5' ? K.ims.c : K.user.c);

function ReferencePanel({ nodeNaming, qci, fiveQi, eirStatus, glossary }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 w-full rounded px-3 py-2 text-left text-sm"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, color: '#8ea1bf', fontFamily: MONO }}
      >
        {open ? '▾' : '▸'} node naming, QoS values, acronym glossary and how the EIR decides
      </button>

      {open && (
        <div className="mt-2 grid gap-3 lg:grid-cols-3">
          <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
            <h3 style={{ fontFamily: MONO, fontSize: 11, color: '#63799c', letterSpacing: '0.12em' }}>NODE NAMING</h3>
            <div className="mt-2 max-h-80 space-y-2 overflow-y-auto pr-1">
              {nodeNaming.map((row, i) => (
                <div key={i} className="text-xs" style={{ borderBottom: '1px solid #131d33', paddingBottom: 6 }}>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span style={{ color: '#8ea1bf' }}>{row[0]}</span>
                    <span style={{ color: '#3d5178' }}>→</span>
                    <span className="font-semibold" style={{ color: '#e6edfa' }}>
                      {row[1]}
                    </span>
                  </div>
                  <div style={{ color: '#63799c', fontSize: 11 }}>{row[2]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <QosTable title="QCI VALUES YOU'LL MEET DAILY (4G)" rows={qci} colorFor={qciColor} />
            {fiveQi && <QosTable title="5QI VALUES (5G)" rows={fiveQi} colorFor={fiveQiColor} />}
            <p className="text-xs leading-relaxed" style={{ color: '#8ea1bf' }}>
              A VoLTE handset holds three bearers at once: QCI 9 for internet, QCI 5 for SIP on the ims APN, and QCI 1
              brought up only for the duration of a call. SMS needs none of them — it rides NAS signalling.
            </p>
          </div>

          <div className="rounded p-3" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
            <h3 style={{ fontFamily: MONO, fontSize: 11, color: '#63799c', letterSpacing: '0.12em' }}>EIR — EQUIPMENT STATUS</h3>
            <div className="mt-2 space-y-2">
              {eirStatus.map((row, i) => (
                <div key={i} className="text-xs" style={{ borderBottom: '1px solid #131d33', paddingBottom: 6 }}>
                  <span style={{ fontFamily: MONO, color: row[1], fontWeight: 700 }}>{row[0]}</span>
                  <div style={{ color: '#a8b8d4' }}>{row[2]}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: '#8ea1bf' }}>
              The check is a config choice, not a given: whether it runs at attach, at TAU, or per APN, and what
              happens when the EIR is unreachable — fail open and let everyone on, or fail closed and bar them.
              Getting that wrong is how an EIR outage becomes a national outage.
            </p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: '#8ea1bf' }}>
              The IMEISV is useful beyond blocking. Because the last two digits are the software version, operators
              key device-specific policy off it — which handsets are allowed VoLTE, which need a workaround for a
              known radio bug. Australian carriers share a blocked-IMEI register, so a barred handset stays barred
              across networks.
            </p>
          </div>
        </div>
      )}

      {open && <GlossaryPanel glossary={glossary} />}
    </>
  );
}

export default memo(ReferencePanel);
