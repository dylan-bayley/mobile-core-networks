import { useEffect, useRef, useState } from 'react';
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

  // After an answer, focus moves to its explanation (which is then read
  // out); the options stay focusable (aria-disabled, not disabled) so focus
  // never drops to the top of the page.
  const why = useRef([]);
  const [justAnswered, setJustAnswered] = useState(null);
  useEffect(() => {
    if (justAnswered != null) why.current[justAnswered]?.focus();
  }, [justAnswered]);

  const sectionRef = useRef(null);
  const pick = (qi, oi) => {
    if (picked[qi] != null) return;
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    setJustAnswered(qi);
    if (next.every((p) => p != null)) onScore?.(next.filter((p, i) => p === questions[i].answer).length, questions.length);
  };
  const reset = () => {
    setPicked(questions.map(() => null));
    setJustAnswered(null);
    sectionRef.current?.querySelector('[role="group"] button')?.focus();
  };

  return (
    <section ref={sectionRef} aria-labelledby="check-title" className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 id="check-title" className="text-base font-semibold" style={{ color: TEXT }}>
          Quick check
        </h2>
        <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>
          {answered === questions.length ? `${score} / ${questions.length}` : `${answered} of ${questions.length} answered`}
          {best && ` · best ${best.score}/${best.total}`}
        </span>
        {/* Always present, so the final score is announced when it appears. */}
        <span className="sr-only" aria-live="polite">
          {answered === questions.length ? `Quick check done: ${score} out of ${questions.length} right.` : ''}
        </span>
        {answered > 0 && (
          <button type="button" onClick={reset} className="ml-auto min-h-10 px-1 text-xs underline sm:min-h-0" style={{ color: MUTED, background: 'none', border: 0 }}>
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
                      aria-disabled={reveal || undefined}
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
                      {reveal && correct && (
                        <>
                          <span aria-hidden="true"> ✓</span>
                          <span className="sr-only"> (correct answer)</span>
                        </>
                      )}
                      {reveal && chosen && !correct && (
                        <>
                          <span aria-hidden="true"> ✗</span>
                          <span className="sr-only"> (your answer, incorrect)</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {p != null && (
                <p ref={(el) => (why.current[qi] = el)} tabIndex={-1} className="mt-2 text-sm leading-relaxed outline-none" style={{ color: TEXT_2 }}>
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
