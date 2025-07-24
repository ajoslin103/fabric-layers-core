/**
 * Whether element is between left & right including
 *
 * @param {number} a
 * @param {number} left
 * @param {number} right
 *
 * @return {Boolean}
 */

export default function within(a: number, left: number, right: number): boolean {
  if (left > right) {
    const tmp = left;
    left = right;
    right = tmp;
  }
  
  return a <= right && a >= left;
}
