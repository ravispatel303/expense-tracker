const KEY = 'last-category';

/** The category used for the previous new expense on this device, so the form can default to it. */
export function readLastCategory(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function rememberLastCategory(id: string): void {
  try {
    if (id) localStorage.setItem(KEY, id);
  } catch {
    // Storage unavailable (e.g. private mode); defaulting is a convenience only.
  }
}
