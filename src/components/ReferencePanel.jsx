import { memo, useRef, useState } from 'react';
import { K, PANEL, EDGE, MONO, MUTED, FAINT, TEXT, TEXT_2, DIVIDER, ACTIVE_BG, ACTIVE_EDGE } from '../theme.js';

const TABS = [
  { id: 'names', label: 'Vendor names' },
  { id: 'qos', label: 'QoS values' },
  { id: 'eir', label: 'EIR' },
  { id: 'beyond', label: 'Beyond these flows' },
];

function QosTable({ title, rows, colorFor }) {
  return (
    <div>
      <h3 className="text-sm font-semibold" style={{ color: TEXT }}>
        {title}
      </h3>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-baseline gap-3 text-sm" style={{ borderBottom: `1px solid ${DIVIDER}`, paddingBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: colorFor(row), fontWeight: 700, width: 24 }}>{row[0]}</span>
            <span className="flex-1">
              <span style={{ color: TEXT }}>{row[2]}</span>
              <span style={{ color: MUTED }}> · {row[1]}</span>
            </span>
            <span style={{ fontFamily: MONO, color: MUTED }}>{row[3]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const qosColor = (row) => (row[0] === '1' ? K.media.c : row[0] === '5' ? K.ims.c : K.user.c);

function NamesTab({ nodeNaming }) {
  return (
    <>
      <h3 className="text-sm font-semibold" style={{ color: TEXT }}>
        In practice: 3GPP function to Ericsson product
      </h3>
      <p className="mt-1 max-w-[70ch] text-sm" style={{ color: MUTED }}>
        One vendor’s product names, which the call-flow diagrams use for some nodes. They are deployment names, not 3GPP terms.
      </p>
      <div
        role="region"
        aria-label="Vendor node names"
        tabIndex={0}
        className="mt-3 grid max-h-96 gap-x-8 gap-y-2 overflow-y-auto pr-1 md:grid-cols-2"
      >
        {nodeNaming.map((row, i) => (
          <div key={i} className="text-sm" style={{ borderBottom: `1px solid ${DIVIDER}`, paddingBottom: 6 }}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span style={{ color: MUTED }}>{row[0]}</span>
              <span aria-label="is called" style={{ color: FAINT }}>→</span>
              <span className="font-semibold" style={{ color: TEXT }}>
                {row[1]}
              </span>
            </div>
            <div className="text-xs" style={{ color: MUTED }}>{row[2]}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function QosTab({ qci, fiveQi }) {
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        <QosTable title="QCI values you’ll meet daily (4G)" rows={qci} colorFor={qosColor} />
        {fiveQi && <QosTable title="5QI values (5G)" rows={fiveQi} colorFor={qosColor} />}
      </div>
      <p className="mt-4 max-w-[70ch] text-sm leading-relaxed" style={{ color: MUTED }}>
        A VoLTE handset holds three bearers at once: QCI 9 for internet, QCI 5 for SIP on the ims APN, and QCI 1 brought up only
        for the duration of a call. SMS needs none of them — it rides NAS signalling.
      </p>
    </>
  );
}

function EirTab({ eirStatus }) {
  return (
    <div className="max-w-[70ch]">
      <h3 className="text-sm font-semibold" style={{ color: TEXT }}>
        EIR equipment status
      </h3>
      <div className="mt-2 space-y-2">
        {eirStatus.map((row, i) => (
          <div key={i} className="text-sm" style={{ borderBottom: `1px solid ${DIVIDER}`, paddingBottom: 6 }}>
            <span style={{ fontFamily: MONO, color: row[1], fontWeight: 700 }}>{row[0]}</span>
            <div style={{ color: TEXT_2 }}>{row[2]}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
        The check is a config choice, not a given: whether it runs at attach, at TAU, or per APN, and what happens when the EIR is
        unreachable — fail open and let everyone on, or fail closed and bar them. Getting that wrong is how an EIR outage becomes
        a national outage.
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>
        The IMEISV is useful beyond blocking. Because the last two digits are the software version, operators key device-specific
        policy off it — which handsets are allowed VoLTE, which need a workaround for a known radio bug. Australian carriers share a
        blocked-IMEI register, so a barred handset stays barred across networks.
      </p>
    </div>
  );
}

function ReferencePanel({ nodeNaming, qci, fiveQi, eirStatus, beyond, completed, totalFlows, onResetProgress }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('names');
  const tabRefs = useRef({});

  // Arrow keys move between tabs (roving tabindex), as a tablist should.
  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TABS.length - 1;
    if (j === null) return;
    e.preventDefault();
    setTab(TABS[j].id);
    tabRefs.current[TABS[j].id]?.focus();
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 flex w-full flex-wrap items-baseline gap-x-3 rounded px-3 py-2 text-left text-sm"
        style={{ background: PANEL, border: `1px solid ${EDGE}`, color: TEXT }}
      >
        <span className="font-semibold">{open ? '▾' : '▸'} Reference</span>
        <span className="text-xs" style={{ color: MUTED }}>
          Vendor names, QoS values, EIR, and what lies beyond these flows
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded p-3 sm:p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
          <div role="tablist" aria-label="Reference topics" className="flex flex-wrap gap-1" onKeyDown={onTabKey}>
            {TABS.map((t) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  role="tab"
                  id={`ref-tab-${t.id}`}
                  aria-selected={on}
                  aria-controls={`ref-panel-${t.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  className="min-h-10 rounded px-3 py-1.5 text-sm sm:min-h-0"
                  style={{
                    background: on ? ACTIVE_BG : 'transparent',
                    border: `1px solid ${on ? ACTIVE_EDGE : EDGE}`,
                    color: on ? TEXT : MUTED,
                    fontWeight: on ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={`ref-panel-${tab}`} aria-labelledby={`ref-tab-${tab}`} className="mt-4">
            {tab === 'names' && <NamesTab nodeNaming={nodeNaming} />}
            {tab === 'qos' && <QosTab qci={qci} fiveQi={fiveQi} />}
            {tab === 'eir' && <EirTab eirStatus={eirStatus} />}
            {tab === 'beyond' && (
              <p className="max-w-[70ch] text-sm leading-relaxed" style={{ color: TEXT_2 }}>
                {beyond}
              </p>
            )}
          </div>

          <p className="mt-4 text-sm" style={{ color: MUTED }}>
            Looking for an acronym? Press <kbd style={{ fontFamily: MONO }}>/</kbd> to search, or{' '}
            <a href="#/glossary" className="underline" style={{ color: TEXT }}>
              open the full glossary
            </a>
            .
          </p>
        </div>
      )}

      {open && onResetProgress && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: MUTED }}>
          <span>
            Progress is stored in this browser only: {completed} of {totalFlows} flows watched to the end.
          </span>
          <button
            type="button"
            onClick={onResetProgress}
            className="rounded px-2 py-1"
            style={{ background: 'transparent', border: `1px solid ${EDGE}`, color: MUTED, fontFamily: MONO }}
          >
            reset progress
          </button>
        </div>
      )}
    </>
  );
}

export default memo(ReferencePanel);
