import { useEffect, useRef, useState } from 'react';
import { K, PANEL, EDGE, MONO, MUTED, FAINT, TEXT_2, TEXT, SURFACE } from '../theme.js';
import { makeQuestions } from '../lib/makeQuestions.js';
import { GLOSSARY } from '../data/reference/glossary.js';
import { autolinkAcronyms } from '../lib/autolinkAcronyms.jsx';

function Choice({ q, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const done = picked != null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {q.options.map((o, i) => {
        const state = !done ? 'idle' : o.correct ? 'right' : i === picked ? 'wrong' : 'idle';
        const colour = state === 'right' ? K.user.c : state === 'wrong' ? K.media.c : EDGE;
        return (
          <button
            key={i}
            aria-disabled={done || undefined}
            onClick={() => {
              if (done) return;
              setPicked(i);
              onAnswer(o.correct);
            }}
            className="rounded px-3 py-2 text-left text-sm"
            style={{ background: state === 'idle' ? SURFACE : `${colour}18`, border: `1px solid ${colour}`, color: TEXT }}
          >
            <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED, marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
            {o.label}
            {state === 'right' && (
              <>
                <span aria-hidden="true" style={{ color: colour }}> ✓</span>
                <span className="sr-only"> (correct answer)</span>
              </>
            )}
            {state === 'wrong' && (
              <>
                <span aria-hidden="true" style={{ color: colour }}> ✗</span>
                <span className="sr-only"> (your answer, incorrect)</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Order({ q, onAnswer }) {
  const [picked, setPicked] = useState([]);
  const done = picked.length === q.items.length;
  const correct = done && picked.every((idx, k) => q.items[idx].order === k);
  return (
    <div className="mt-3 flex flex-col gap-2">
      {q.items.map((it, i) => {
        const pos = picked.indexOf(i);
        const chosen = pos >= 0;
        const colour = !done ? (chosen ? '#3d6ba8' : EDGE) : it.order === pos ? K.user.c : K.media.c;
        return (
          <button
            key={i}
            aria-disabled={chosen || done || undefined}
            onClick={() => {
              if (chosen || done) return;
              const next = [...picked, i];
              setPicked(next);
              if (next.length === q.items.length) onAnswer(next.every((idx, k) => q.items[idx].order === k));
            }}
            className="flex items-start gap-2 rounded px-3 py-2 text-left text-sm"
            style={{ background: chosen ? `${colour}18` : SURFACE, border: `1px solid ${colour}`, color: TEXT }}
          >
            <span style={{ fontFamily: MONO, fontSize: 12, color: chosen ? '#ffffff' : FAINT, minWidth: 16, paddingTop: 2 }}>
              {chosen ? pos + 1 : '·'}
            </span>
            {it.label}
            {done && it.order !== pos && (
              <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
                <span aria-hidden="true">✗ </span>was #{it.order + 1}
              </span>
            )}
            {done && it.order === pos && (
              <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 12, color: K.user.c }}>
                <span aria-hidden="true">✓</span>
                <span className="sr-only">right position</span>
              </span>
            )}
          </button>
        );
      })}
      {done && (
        <p className="text-xs" style={{ color: correct ? K.user.c : K.media.c }}>
          {correct ? 'Right order.' : 'Not quite — the numbers on the right show the real order.'}
        </p>
      )}
    </div>
  );
}

/** What the learner should take away from a question, drawn from the step itself. */
function Explanation({ q, scenario, onGlossaryOpen, activeGlossaryKey }) {
  const s = scenario.steps[q.stepIndex];
  const linkOpts = { activeKey: activeGlossaryKey, onOpen: onGlossaryOpen };
  const correct = q.type === 'choice' ? q.options.find((o) => o.correct)?.label : null;
  return (
    <div className="mt-3 rounded px-3 py-2 text-xs leading-relaxed" style={{ background: SURFACE, border: `1px solid ${EDGE}`, color: TEXT_2 }}>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: FAINT }}>
        WHY{correct ? ` — ${correct}` : ''}
      </div>
      <div className="mt-1 font-semibold" style={{ color: TEXT }}>
        {String(q.stepIndex + 1).padStart(2, '0')} · {autolinkAcronyms(s.t, GLOSSARY, linkOpts)}
        <span style={{ fontFamily: MONO, fontWeight: 400, color: MUTED }}> · {s.m}</span>
      </div>
      <p className="mt-1">{autolinkAcronyms(s.d, GLOSSARY, linkOpts)}</p>
    </div>
  );
}

export default function Quiz({ scenario, geo, onGo, onClose, best, onScore, onGlossaryOpen, activeGlossaryKey }) {
  const [questions, setQuestions] = useState(() => makeQuestions(scenario, geo));
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null); // null | true | false

  const restart = () => {
    setQuestions(makeQuestions(scenario, geo));
    setRound((r) => r + 1);
    setIndex(0);
    setScore(0);
    setAnswered(null);
  };

  // A different flow remounts this component (Explorer keys it on the flow),
  // so there's no reset effect here: one would leave a half-answered question
  // stuck, and would regenerate the first question after it had painted.

  // Answering ends the question; move focus to the verdict so it's read out
  // and Tab continues to "show me" and "Next question".
  const resultRef = useRef(null);
  useEffect(() => {
    if (answered != null) resultRef.current?.focus();
  }, [answered]);

  const q = questions[index];
  const finished = index >= questions.length;

  useEffect(() => {
    if (finished && onScore) onScore(score, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const answer = (ok) => {
    setAnswered(ok);
    if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="rounded p-4" style={{ background: PANEL, border: `1px solid ${EDGE}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: FAINT }}>
          QUIZ · {scenario.network.label.toUpperCase()} · {scenario.label.toUpperCase()}
        </span>
        <span className="ml-auto" style={{ fontFamily: MONO, fontSize: 12, color: MUTED }}>
          {finished ? `${score} / ${questions.length}` : `Q ${index + 1} / ${questions.length} · score ${score}`}
          {best && <span style={{ color: FAINT }}> · best {best.score}/{best.total}</span>}
        </span>
      </div>

      {finished ? (
        <div className="mt-3">
          <h2 className="text-lg font-semibold text-white">
            {score === questions.length ? 'Perfect.' : score >= questions.length * 0.7 ? 'Solid.' : 'Worth another pass.'}
          </h2>
          <p className="mt-2 text-sm" style={{ color: TEXT_2 }}>
            You got {score} of {questions.length} on the {scenario.network.label} {scenario.label.toLowerCase()} flow.
            {best && best.score > score ? ` Your best is ${best.score}.` : ''}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={restart} className="rounded px-3 py-2 text-sm font-semibold" style={{ background: K.control.c, color: '#06101f', border: 0 }}>
              New questions
            </button>
            <button onClick={onClose} className="rounded px-3 py-2 text-sm" style={{ background: 'transparent', border: `1px solid ${EDGE}`, color: MUTED }}>
              Back to the flow
            </button>
          </div>
        </div>
      ) : (
        <div key={`${round}-${index}`} className="mt-3">
          <p className="text-sm leading-relaxed text-white">{q.prompt}</p>
          {q.type === 'choice' ? <Choice q={q} onAnswer={answer} /> : <Order q={q} onAnswer={answer} />}
          {answered != null && (
            <>
              <Explanation q={q} scenario={scenario} onGlossaryOpen={onGlossaryOpen} activeGlossaryKey={activeGlossaryKey} />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span ref={resultRef} tabIndex={-1} className="text-xs outline-none" style={{ color: answered ? K.user.c : K.media.c }}>
                  {answered ? '✓ Correct.' : '✗ Incorrect.'}
                </span>
                <button
                  onClick={() => onGo(q.stepIndex)}
                  className="rounded px-3 py-1.5 text-xs"
                  style={{ background: 'transparent', border: `1px solid ${EDGE}`, color: TEXT, fontFamily: MONO }}
                >
                  show me this step in the diagram →
                </button>
                <button
                  onClick={() => {
                    setIndex((i) => i + 1);
                    setAnswered(null);
                  }}
                  className="ml-auto rounded px-3 py-1.5 text-xs font-semibold"
                  style={{ background: K.control.c, color: '#06101f', border: 0 }}
                >
                  {index + 1 === questions.length ? 'See score' : 'Next question'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
