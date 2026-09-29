import { useState } from 'react';
import { PANEL, EDGE, MONO, FAINT, MUTED, TEXT, TEXT_2, ACTIVE_BG, ACTIVE_EDGE, K } from '../../theme.js';

/**
 * A few multiple-choice questions at the end of a lesson. Each answer is
 * revealed with its reason (and citation) as soon as it's picked; the score
 * is reported once every question has an answer.
 */
export default function QuickCheck({ questions, best, onScore }) {
  const [picked, setPicked] = useState(() => questions.map(() => null));
  const answered = picked.filter((p) => p != null).length;
  const score = picked.filter((p, i) => p === questions[i].answer).length;

  const pick = (qi, oi) => {
    if (picked[qi] != null) return;
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every((p) => p != null)) onScore?.(next.filter((p, i) => p === questions[i].answer).length, questions.length);
  };

  return (
    <section aria-labelledby="check-title" className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 id="check-title" className="text-base font-semibold" style={{ color: TEXT }}>
          Quick check
        </h2>
        <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>
          {answered === questions.length ? `${score} / ${questions.length}` : `${answered} of ${questions.length} answered`}
          {best && ` · best ${best.score}/${best.total}`}
        </span>
        {answered > 0 && (
          <button type="button" onClick={() => setPicked(questions.map(() => null))} className="ml-auto text-xs underline" style={{ color: MUTED, background: 'none', border: 0 }}>
            try again
          </button>
        )}
      </div>
      <ol className="mt-3 grid gap-4">
        {questions.map((q, qi) => {
          const p = picked[qi];
          return (
            <li key={q.q}>
              <p className="text-sm font-medium" style={{ color: TEXT }}>
                <span style={{ fontFamily: MONO, color: FAINT, marginRight: 6 }}>{qi + 1}</span>
                {q.q}
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Answers for question ${qi + 1}`}>
                {q.options.map((o, oi) => {
                  const chosen = p === oi;
                  const correct = oi === q.answer;
                  const reveal = p != null;
                  const col = reveal && correct ? K.user.c : reveal && chosen ? K.media.c : null;
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => pick(qi, oi)}
                      disabled={reveal}
                      aria-pressed={chosen}
                      className="min-h-10 rounded px-3 py-1.5 text-sm sm:min-h-0"
                      style={{
                        background: chosen ? ACTIVE_BG : 'transparent',
                        border: `1px solid ${col ?? (chosen ? ACTIVE_EDGE : EDGE)}`,
                        color: col ?? (reveal ? MUTED : TEXT_2),
                        cursor: reveal ? 'default' : 'pointer',
                      }}
                    >
                      {o}
                      {reveal && correct && ' ✓'}
                      {reveal && chosen && !correct && ' ✗'}
                    </button>
                  );
                })}
              </div>
              {p != null && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT_2 }} aria-live="polite">
                  <strong style={{ color: p === q.answer ? K.user.c : K.media.c }}>{p === q.answer ? 'Right. ' : 'Not quite. '}</strong>
                  {q.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
