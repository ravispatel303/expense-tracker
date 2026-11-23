import { useState } from 'react';

/** A stable "now" captured once per mount, so renders stay pure. */
export function useNow(): Date {
  const [now] = useState(() => new Date());
  return now;
}
