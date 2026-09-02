/**
 * Per-flow learning progress, persisted in localStorage under one key.
 *
 *   { "<net>/<flow>": { maxStep, total, completed, bestQuiz: { score, total } } }
 *
 * The record helpers are pure (progress in, new progress out) so they can be
 * unit-tested; `readProgress`/`writeProgress` do the storage I/O and swallow
 * errors — a lost preference is fine, a crash on a private-mode tab is not.
 */
export const STORAGE_KEY = 'mcn.progress';

export const progressKey = (net, flow) => `${net}/${flow}`;

export function readProgress(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeProgress(progress, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* private mode etc. */
  }
}

export function resetProgress(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return {};
}

/** Marks that the learner has reached `step` (0-based) of a `total`-step flow. Returns the same object if nothing changed. */
export function recordStep(progress, net, flow, step, total) {
  const key = progressKey(net, flow);
  const prev = progress[key] ?? { maxStep: -1, total, completed: false };
  const maxStep = Math.max(prev.maxStep, step);
  const completed = prev.completed || step >= total - 1;
  if (maxStep === prev.maxStep && completed === prev.completed && prev.total === total) return progress;
  return { ...progress, [key]: { ...prev, maxStep, total, completed } };
}

/** Keeps the best quiz score for a flow. */
export function recordQuiz(progress, net, flow, score, total) {
  const key = progressKey(net, flow);
  const prev = progress[key] ?? { maxStep: -1, total: 0, completed: false };
  const best = prev.bestQuiz;
  if (best && best.score / best.total >= score / total) return progress;
  return { ...progress, [key]: { ...prev, bestQuiz: { score, total } } };
}

export const flowProgress = (progress, net, flow) => progress[progressKey(net, flow)] ?? null;

export const isCompleted = (progress, net, flow) => !!flowProgress(progress, net, flow)?.completed;

/** How many of `flowIds` on `net` are completed. */
export const countCompleted = (progress, net, flowIds) => flowIds.filter((f) => isCompleted(progress, net, f)).length;
