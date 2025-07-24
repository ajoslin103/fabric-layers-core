/**
 * @module mumath/lerp
 */
export default function lerp(x: number, y: number, a: number): number {
  return x * (1.0 - a) + y * a;
}
