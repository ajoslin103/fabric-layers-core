/**
 * Base 10 logarithm
 *
 * @module mumath/log10
 */
const log10: (a: number) => number = Math.log10 || function(a: number): number {
  return Math.log(a) / Math.log(10);
};

export default log10;
