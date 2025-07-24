/**
 * Looping function for any framesize.
 * Like fmod.
 *
 * @module  mumath/loop
 *
 */

export default function mod(value: number, left: number, right?: number): number {
  //detect single-arg case, like mod-loop or fmod
  if (right === undefined) {
    right = left;
    left = 0;
  }

  //swap frame order
  if (left > right) {
    const tmp = right;
    right = left;
    left = tmp;
  }

  const frame = right - left;

  value = ((value + left) % frame) - left;
  if (value < left) value += frame;
  if (value > right) value -= frame;

  return value;
}
