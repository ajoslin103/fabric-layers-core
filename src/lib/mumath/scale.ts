/**
 * Get step out of the set
 *
 * @module mumath/step
 */

import lg from './log10';

export default function scale(minStep: number, srcSteps: number[]): number {
  const power = Math.floor(lg(minStep));

  let order = Math.pow(10, power);
  let steps = srcSteps.map(v => v * order);
  order = Math.pow(10, power + 1);
  steps = steps.concat(srcSteps.map(v => v * order));

  // find closest scale
  let step = 0;
  for (let i = 0; i < steps.length; i++) {
    step = steps[i];
    if (step >= minStep) break;
  }

  return step;
}
