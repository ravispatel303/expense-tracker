export const MAX_AMOUNT = 9_999_999_999.99;
export const MAX_NOTE_LENGTH = 200;
export const MAX_CATEGORY_NAME_LENGTH = 40;

/**
 * Parse a user-typed amount like "12", "12.5", "$1,234.56".
 * Returns the number, or an error message.
 */
export function parseAmount(raw: string): { value: number } | { error: string } {
  const cleaned = raw.replace(/[$,\s]/g, '');
  if (!cleaned) return { error: 'Enter an amount.' };
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { error: 'Use a number with up to 2 decimals.' };
  const value = Number(cleaned);
  if (value <= 0) return { error: 'Amount must be more than 0.' };
  if (value > MAX_AMOUNT) return { error: 'That amount is too large.' };
  return { value };
}

export function validateCategoryName(name: string, existing: string[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Enter a name.';
  if (trimmed.length > MAX_CATEGORY_NAME_LENGTH)
    return `Keep it under ${MAX_CATEGORY_NAME_LENGTH} characters.`;
  if (existing.some((n) => n.toLowerCase() === trimmed.toLowerCase()))
    return 'You already have that category.';
  return null;
}
