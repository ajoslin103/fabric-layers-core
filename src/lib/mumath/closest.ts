/**
 * @module  mumath/closest
 */

function closest(num: number, arr: number[]): number {
  // Handle empty array
  if (arr.length === 0) {
    return num; // Return the input number if no array elements to compare
  }
  
  // Now we can safely access arr[0] since we know the array is not empty
  // Using non-null assertion because we've checked arr.length > 0
  const firstValue = arr[0]!;
  let curr = firstValue;
  let diff = Math.abs(num - firstValue);
  
  // Start from index 1 since we've already processed index 0
  for (let val = 1; val < arr.length; val++) {
    // Using non-null assertion because val < arr.length ensures this element exists
    const current = arr[val]!;
    const newdiff = Math.abs(num - current);
    if (newdiff < diff) {
      diff = newdiff;
      curr = current;
    }
  }
  
  return curr;
}

export default closest;
