/**
 * @module  mumath/closest
 */

function closest(num: number, arr: number[]): number {
  let curr = arr[0];
  let diff = Math.abs(num - curr);
  
  for (let val = 0; val < arr.length; val++) {
    const newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  
  return curr;
}

export default closest;
