/* ------------------------------------------------------------------
   Small composition layer for expressing one flow as a base flow plus a
   delta (insert/patch/replace/remove by step id), instead of copy-pasting
   near-duplicate step arrays. Anchors are looked up by id and throw
   immediately with the flow's available ids if missing — since flow
   modules evaluate at import time, a broken anchor is a white screen on
   save, which is the failure mode you want while authoring content.
   ------------------------------------------------------------------ */

const idx = (steps, id) => {
  const i = steps.findIndex((s) => s.id === id);
  if (i === -1) {
    throw new Error(`compose: no step with id "${id}". Available ids: ${steps.map((s) => s.id).join(', ')}`);
  }
  return i;
};

const splice = (steps, start, deleteCount, insert) => {
  const next = steps.slice();
  next.splice(start, deleteCount, ...insert);
  return next;
};

export const compose = (steps, ...ops) => ops.reduce((s, op) => op(s), steps);

export const insertAfter = (id, ...newSteps) => (steps) => splice(steps, idx(steps, id) + 1, 0, newSteps);
export const insertBefore = (id, ...newSteps) => (steps) => splice(steps, idx(steps, id), 0, newSteps);
export const replaceStep = (id, step) => (steps) => splice(steps, idx(steps, id), 1, [step]);
export const removeStep = (id) => (steps) => splice(steps, idx(steps, id), 1, []);
export const prepend = (...newSteps) => (steps) => [...newSteps, ...steps];
export const append = (...newSteps) => (steps) => [...steps, ...newSteps];

export const patch = (id, fn) => (steps) => {
  const i = idx(steps, id);
  return splice(steps, i, 1, [{ ...steps[i], ...fn(steps[i]) }]);
};

export const byId = (steps) => Object.fromEntries(steps.map((s) => [s.id, s]));
