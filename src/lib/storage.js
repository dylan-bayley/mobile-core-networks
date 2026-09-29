/** localStorage JSON helpers that never throw — a lost preference is fine, a crash on a private-mode tab is not. */
export const readStored = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};

export const store = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode etc. */
  }
};
