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
  
  // Find the first step greater than or equal to minStep
  for (let i = 0; i < steps.length; i++) {
    const currentStep = steps[i];
    // Ensure the step exists and is valid
    if (currentStep !== undefined && currentStep >= minStep) {
      step = currentStep;
      break;
    }
  }

  return step;
}
