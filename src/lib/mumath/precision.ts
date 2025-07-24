/**
 * @module  mumath/precision
 *
 * Get precision from float:
 *
 * @example
 * 1.1 → 1, 1234 → 0, .1234 → 4
 *
 * @param {number} n
 *
 * @return {number} decimap places
 */

import almost from './almost';
import norm from './normalize';

export default function precision(n: number, eps?: number): number {
  n = norm(n);

  const str = n + '';

  // 1e-10 etc
  const e = str.indexOf('e-');
  if (e >= 0) return parseInt(str.substring(e+2));

  // imperfect ints, like 3.0000000000000004 or 1.9999999999999998
  const remainder = Math.abs(n % 1);
  const remStr = remainder + '';

  if (almost(remainder, 1, eps) || almost(remainder, 0, eps)) return 0;

  // usual floats like .0123
  const d = remStr.indexOf('.') + 1;

  if (d) return remStr.length - d;

  // regular inte
  return 0;
}
