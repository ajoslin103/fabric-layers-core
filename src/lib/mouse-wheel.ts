import MagicScroll from './MagicScroll';

/**
 * Mouse wheel event listener with normalized behavior
 * @param element - DOM element or window to listen on
 * @param callback - Function to call on wheel events
 * @param noScroll - Whether to prevent default scroll behavior
 * @returns Event handler function
 */
export default function mouseWheelListen(
  element: HTMLElement | Window | Document | ((delta: number, ev?: WheelEvent | MouseEvent) => void),
  callback?: ((delta: number, ev?: WheelEvent | MouseEvent) => void) | boolean,
  _noScroll?: boolean
): (delta: number, ev?: WheelEvent | MouseEvent) => void {
  if (typeof element === 'function') {
    // noScroll = !!callback;
    callback = element;
    element = window;
  }

  const magicScroll = new MagicScroll(element as HTMLElement | Document, 80, 12);

  magicScroll.onUpdate = function(delta: number, ev?: WheelEvent | MouseEvent) {
    (callback as Function)(delta, ev);
  };

  return magicScroll.onUpdate;

  // Commented code preserved from original implementation
  // const lineHeight = toPX('ex', element);
  // const listener = function (ev) {
  //   if (noScroll) {
  //     ev.preventDefault();
  //   }
  //   let dx = ev.deltaX || 0;
  //   let dy = ev.deltaY || 0;
  //   let dz = ev.deltaZ || 0;
  //   const mode = ev.deltaMode;
  //   let scale = 1;
  //   switch (mode) {
  //     case 1:
  //       scale = lineHeight;
  //       break;
  //     case 2:
  //       scale = window.innerHeight;
  //       break;
  //   }
  //   dx *= scale;
  //   dy *= scale;
  //   dz *= scale;
  //   if (dx || dy || dz) {
  //     return callback(dx, dy, dz, ev);
  //   }
  // };
  // element.addEventListener('wheel', listener);
  // return listener;
}
