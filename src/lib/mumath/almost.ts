// Type definitions for almost-equal 1.1
// Project: https://github.com/mikolalysenko/almost-equal#readme
// Definitions by: Curtis Maddalozzo <https://github.com/cmaddalozzo>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

const abs = Math.abs;
const min = Math.min;

function almostEqual(a: number, b: number, absoluteError?: number, relativeError?: number): boolean {
  const d = abs(a - b);
  
  if (absoluteError == null) absoluteError = almostEqual.DBL_EPSILON;
  if (relativeError == null) relativeError = absoluteError;
  
  if(d <= absoluteError) {
    return true;
  }
  if(d <= relativeError * min(abs(a), abs(b))) {
    return true;
  }
  return a === b;
}

export const FLT_EPSILON = 1.19209290e-7;
export const DBL_EPSILON = 2.2204460492503131e-16;

// Add properties to the function
almostEqual.FLT_EPSILON = FLT_EPSILON;
almostEqual.DBL_EPSILON = DBL_EPSILON;

// Add index signature to allow for properties
interface AlmostEqualFunction {
  (a: number, b: number, absoluteError?: number, relativeError?: number): boolean;
  FLT_EPSILON: number;
  DBL_EPSILON: number;
}

export default almostEqual as AlmostEqualFunction;
