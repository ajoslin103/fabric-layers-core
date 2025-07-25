import evPos, { EventPosition } from './ev-pos';
import Impetus from './impetus';
import touchPinch from './touch-pinch';
import raf from './raf';
import MagicScroll from './MagicScroll';

/**
 * Pan-zoom event object
 */
export interface PanzoomEvent {
  target: HTMLElement;
  type: 'mouse' | 'touch';
  dx: number;
  dy: number;
  dz: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  isRight?: boolean;
}

/**
 * Panzoom callback function type
 */
export type PanzoomCallback = (e: PanzoomEvent) => void;

/**
 * Creates a pan-zoom controller for a target element
 * @param target - Element to enable pan-zoom behavior on
 * @param cb - Callback to handle pan-zoom events
 * @returns Function to remove the pan-zoom behavior
 */
const panzoom = (
  target: HTMLElement | string | PanzoomCallback,
  cb?: PanzoomCallback
): () => void => {
  if (target instanceof Function) {
    cb = target;
    target = document.documentElement || document.body;
  }

  if (typeof target === 'string') {
    const queryTarget = document.querySelector(target);
    if (!queryTarget) {
      throw new Error(`Target element not found: ${target}`);
    }
    target = queryTarget as HTMLElement;
  }

  const callback = cb as PanzoomCallback;
  const element = target as HTMLElement;

  let cursor: EventPosition = {
    x: 0,
    y: 0,
    isRight: false
  };

  /**
   * Check for passive event listener support
   */
  const hasPassive = (): boolean => {
    let supported = false;

    try {
      const opts = Object.defineProperty({}, 'passive', {
        get() {
          supported = true;
          return supported;
        }
      });

      window.addEventListener('test', null as any, opts);
      window.removeEventListener('test', null as any, opts);
    } catch (e) {
      supported = false;
    }

    return supported;
  };

  let impetus: Impetus;
  let magicScroll: MagicScroll;

  let initX = 0;
  let initY = 0;
  let init = true;
  const initFn = function(e: MouseEvent | TouchEvent): void {
    init = true;
  };
  element.addEventListener('mousedown', initFn);

  const onMouseMove = (e: MouseEvent): void => {
    cursor = evPos(e);
  };

  element.addEventListener('mousemove', onMouseMove as EventListener);

  const wheelListener = function(e: WheelEvent): void {
    if (e) {
      cursor = evPos(e);
    }
  };

  element.addEventListener('wheel', wheelListener as EventListener, hasPassive() ? { passive: true } : false);
  element.addEventListener('touchstart', initFn as EventListener, hasPassive() ? { passive: true } : false);

  element.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      e.preventDefault();
      return false;
    },
    false
  );

  let lastY = 0;
  let lastX = 0;
  impetus = new Impetus({
    source: element,
    update(x: number, y: number): void {
      if (init) {
        init = false;
        initX = cursor.x;
        initY = cursor.y;
      }

      const e: PanzoomEvent = {
        target: element,
        type: 'mouse',
        dx: x - lastX,
        dy: y - lastY,
        dz: 0,
        x: cursor.x,
        y: cursor.y,
        x0: initX,
        y0: initY,
        isRight: cursor.isRight
      };

      lastX = x;
      lastY = y;

      schedule(e);
    },
    stop(): void {
      const ev: PanzoomEvent = {
        target: element,
        type: 'mouse',
        dx: 0,
        dy: 0,
        dz: 0,
        x: cursor.x,
        y: cursor.y,
        x0: initX,
        y0: initY
      };
      schedule(ev);
    },
    multiplier: 1,
    friction: 0.75
  });

  magicScroll = new MagicScroll(element, 80, 12, 0);

  magicScroll.onUpdate = (dy: number, e?: WheelEvent | MouseEvent): void => {
    schedule({
      target: element,
      type: 'mouse',
      dx: 0,
      dy: 0,
      dz: dy,
      x: cursor.x,
      y: cursor.y,
      x0: cursor.x,
      y0: cursor.y
    });
  };

  // mobile pinch zoom
  const pinch = touchPinch(element);
  const mult = 2;
  let initialCoords: [number, number] | null;

  pinch.on('start', (curr: number) => {
    if (!pinch.fingers || pinch.fingers.length < 2) return;
    
    const f1 = pinch.fingers[0];
    const f2 = pinch.fingers[1];

    initialCoords = [
      f2.position[0] * 0.5 + f1.position[0] * 0.5,
      f2.position[1] * 0.5 + f1.position[1] * 0.5
    ];

    impetus && impetus.pause();
  });
  
  pinch.on('end', () => {
    if (!initialCoords) return;

    initialCoords = null;

    impetus && impetus.resume();
  });
  
  pinch.on('change', (curr: number, prev: number) => {
    if (!pinch.pinching || !initialCoords) return;

    schedule({
      target: element,
      type: 'touch',
      dx: 0,
      dy: 0,
      dz: -(curr - prev) * mult,
      x: initialCoords[0],
      y: initialCoords[1],
      x0: initialCoords[0],
      y0: initialCoords[0]
    });
  });

  // schedule function to current or next frame
  let planned: PanzoomEvent | null;
  let frameId: number | null = null;
  
  function schedule(ev: PanzoomEvent): void {
    if (frameId != null) {
      if (!planned) planned = ev;
      else {
        planned.dx += ev.dx;
        planned.dy += ev.dy;
        planned.dz += ev.dz;

        planned.x = ev.x;
        planned.y = ev.y;
      }

      return;
    }

    // Firefox sometimes does not clear webgl current drawing buffer
    // so we have to schedule callback to the next frame, not the current
    // cb(ev)

    frameId = raf(() => {
      callback(ev);
      frameId = null;
      if (planned) {
        const arg = planned;
        planned = null;
        schedule(arg);
      }
    });
  }

  return function unpanzoom(): void {
    element.removeEventListener('mousedown', initFn);
    element.removeEventListener('mousemove', onMouseMove as EventListener);
    element.removeEventListener('touchstart', initFn as EventListener);

    impetus.destroy();

    element.removeEventListener('wheel', wheelListener as EventListener);

    pinch.disable();

    if (frameId !== null) {
      raf.cancel(frameId);
    }
  };
};

export default panzoom;
