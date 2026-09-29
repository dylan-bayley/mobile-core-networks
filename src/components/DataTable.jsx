import { PANEL, EDGE, MONO, FAINT, TEXT, TEXT_2 } from '../theme.js';
import Sources from './SourceChip.jsx';

/** A simple comparison/reference table that scrolls sideways inside itself on narrow screens. */
export default function DataTable({ title, caption, columns, rows, cites, rowHeader = true }) {
  return (
    <section className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <h2 className="text-base font-semibold" style={{ color: TEXT }}>
        {title}
      </h2>
      {caption && (
        <p className="mt-1 text-sm" style={{ color: TEXT_2 }}>
          {caption}
        </p>
      )}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col" className="px-2 py-1.5" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: FAINT, borderBottom: `1px solid ${EDGE}` }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) =>
                  i === 0 && rowHeader ? (
                    <th key={i} scope="row" className="px-2 py-2 align-top font-medium" style={{ color: TEXT, borderBottom: '1px solid #131d33' }}>
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-2 py-2 align-top" style={{ color: TEXT_2, borderBottom: '1px solid #131d33' }}>
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Sources cites={cites} className="mt-3" />
    </section>
  );
}
