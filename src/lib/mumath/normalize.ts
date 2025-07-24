/**
 * Get rid of float remainder
 *
 * @module mumath/normalize
 */

import { FLT_EPSILON } from './almost';

export default function normalize(value: number, eps?: number): number {
  // ignore ints
  const rem = value % 1;
  if (!rem) return value;

  if (eps == null) eps = Number.EPSILON || FLT_EPSILON;

  // pick number's neighbour, which is way shorter, like 0.4999999999999998 → 0.5
  // O(20)
  const range = 5;
  const len = (rem + '').length;

  for (let i = 1; i < range; i += 0.5) {
    const left = rem - eps * i;
    const right = rem + eps * i;

    const leftStr = left + '';
    const rightStr = right + '';

    if (len - leftStr.length > 2) return value - eps * i;
    if (len - rightStr.length > 2) return value + eps * i;

    // if (leftStr[2] != rightStr[2])
  }

  return value;
}
