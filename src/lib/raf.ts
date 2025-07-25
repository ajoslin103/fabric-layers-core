/**
 * Request Animation Frame utility with cross-browser support
 */

/**
 * Gets prefixed browser function
 */
function getPrefixed(name: string): Function | undefined {
  return (window as any)['webkit' + name] || 
         (window as any)['moz' + name] || 
         (window as any)['ms' + name];
}

let lastTime = 0;

/**
 * Fallback for IE 7-8
 */
function timeoutDefer(fn: Function): number {
  const time = +new Date(),
        timeToCall = Math.max(0, 16 - (time - lastTime));

  lastTime = time + timeToCall;
  return window.setTimeout(fn as TimerHandler, timeToCall);
}

/**
 * Function binding utility
 */
export function bind(fn: Function, obj: any): Function {
  const slice = Array.prototype.slice;

  if (fn.bind) {
    return fn.bind.apply(fn, slice.call(arguments, 1));
  }

  const args = slice.call(arguments, 2);

  return function(this: any): any {
    return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
  };
}

/**
 * Cross-browser requestAnimationFrame function
 */
export const requestFn: (callback: FrameRequestCallback) => number = 
  window.requestAnimationFrame || 
  getPrefixed('RequestAnimationFrame') as any || 
  timeoutDefer as any;

/**
 * Cross-browser cancelAnimationFrame function
 */
export const cancelFn: (handle: number) => void = 
  window.cancelAnimationFrame || 
  getPrefixed('CancelAnimationFrame') as any ||
  getPrefixed('CancelRequestAnimationFrame') as any || 
  function(id: number): void { window.clearTimeout(id); };

/**
 * Request animation frame interface
 */
interface RAF {
  (fn: FrameRequestCallback, context?: any, immediate?: boolean): number;
  cancel: (id: number) => void;
}

/**
 * Request animation frame with context binding
 */
const raf: RAF = ((fn, context, immediate?) => {
  if (immediate && requestFn === timeoutDefer) {
    fn.call(context, performance.now());
    return 0;
  } else {
    return requestFn.call(window, bind(fn, context) as FrameRequestCallback);
  }
}) as RAF;

/**
 * Cancel a previously scheduled animation frame
 */
raf.cancel = (id: number): void => {
  if (id) {
    cancelFn.call(window, id);
  }
};

export default raf;
