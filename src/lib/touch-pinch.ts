import EventEmitter2 from 'eventemitter2';
import eventOffset from './mouse-event-offset';

/**
 * Finger object for touch tracking
 */
class Finger {
  position: [number, number];
  touch: Touch | null;

  constructor() {
    this.position = [0, 0];
    this.touch = null;
  }
}

/**
 * Calculate distance between two points
 */
function distance(a: [number, number], b: [number, number]): number {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}

/**
 * TouchPinch event emitter interface
 */
interface TouchPinchEmitter extends EventEmitter2 {
  readonly pinching: boolean;
  readonly fingers: (Finger | null)[];
  enable: () => void;
  disable: () => void;
  indexOfTouch: (touch: Touch) => number;
}

/**
 * Creates a pinch gesture detector for touch events
 * @param target - DOM element to attach pinch detection to
 * @returns EventEmitter for pinch events
 */
function touchPinch(target?: HTMLElement | Window): TouchPinchEmitter {
  target = target || window;

  const emitter = new EventEmitter2() as TouchPinchEmitter;
  const fingers: [Finger | null, Finger | null] = [null, null];
  let activeCount = 0;

  let lastDistance = 0;
  let ended = false;
  let enabled = false;

  // Add read-only properties to emitter
  Object.defineProperties(emitter, {
    pinching: {
      get(): boolean {
        return activeCount === 2;
      }
    },

    fingers: {
      get(): (Finger | null)[] {
        return fingers;
      }
    }
  });

  /**
   * Find index of a specific touch by identifier
   */
  function indexOfTouch(touch: Touch): number {
    const id = touch.identifier;
    for (let i = 0; i < fingers.length; i++) {
      if (fingers[i] &&
        fingers[i]!.touch &&
        fingers[i]!.touch!.identifier === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Enable touch pinch detection
   */
  function enable(): void {
    if (enabled) return;
    enabled = true;
    target!.addEventListener('touchstart', onTouchStart as EventListener, false);
    target!.addEventListener('touchmove', onTouchMove as EventListener, false);
    target!.addEventListener('touchend', onTouchRemoved as EventListener, false);
    target!.addEventListener('touchcancel', onTouchRemoved as EventListener, false);
  }

  /**
   * Disable touch pinch detection
   */
  function disable(): void {
    if (!enabled) return;
    enabled = false;
    activeCount = 0;
    fingers[0] = null;
    fingers[1] = null;
    lastDistance = 0;
    ended = false;
    target!.removeEventListener('touchstart', onTouchStart as EventListener, false);
    target!.removeEventListener('touchmove', onTouchMove as EventListener, false);
    target!.removeEventListener('touchend', onTouchRemoved as EventListener, false);
    target!.removeEventListener('touchcancel', onTouchRemoved as EventListener, false);
  }

  /**
   * Handle touchstart events
   */
  function onTouchStart(ev: TouchEvent): void {
    for (let i = 0; i < ev.changedTouches.length; i++) {
      const newTouch = ev.changedTouches[i];
      const idx = indexOfTouch(newTouch as Touch);

      if (idx === -1 && activeCount < 2) {
        const first = activeCount === 0;

        // newest and previous finger (previous may be undefined)
        const newIndex = fingers[0] ? 1 : 0;
        const oldIndex = fingers[0] ? 0 : 1;
        const newFinger = new Finger();

        // add to stack
        fingers[newIndex] = newFinger;
        activeCount++;

        // update touch event & position
        newFinger.touch = newTouch as Touch;
        eventOffset(newTouch as unknown as MouseEvent, target as HTMLElement, newFinger.position);

        const oldTouch = fingers[oldIndex] ? fingers[oldIndex]!.touch : null;
        emitter.emit('place', newTouch as Touch, oldTouch);

        if (!first) {
          const initialDistance = computeDistance();
          ended = false;
          emitter.emit('start', initialDistance);
          lastDistance = initialDistance;
        }
      }
    }
  }

  /**
   * Handle touchmove events
   */
  function onTouchMove(ev: TouchEvent): void {
    let changed = false;
    for (let i = 0; i < ev.changedTouches.length; i++) {
      const movedTouch = ev.changedTouches[i];
      const idx = indexOfTouch(movedTouch as Touch);
      if (idx !== -1) {
        changed = true;
        fingers[idx]!.touch = movedTouch as Touch; // avoid caching touches
        eventOffset(movedTouch as unknown as MouseEvent, target as HTMLElement, fingers[idx]!.position);
      }
    }

    if (activeCount === 2 && changed) {
      const currentDistance = computeDistance();
      emitter.emit('change', currentDistance, lastDistance);
      lastDistance = currentDistance;
    }
  }

  /**
   * Handle touchend/touchcancel events
   */
  function onTouchRemoved(ev: TouchEvent): void {
    for (let i = 0; i < ev.changedTouches.length; i++) {
      const removed = ev.changedTouches[i];
      const idx = indexOfTouch(removed as Touch);

      if (idx !== -1) {
        fingers[idx] = null;
        activeCount--;
        const otherIdx = idx === 0 ? 1 : 0;
        const otherTouch = fingers[otherIdx] ? fingers[otherIdx]!.touch : null;
        emitter.emit('lift', removed, otherTouch);
      }
    }

    if (!ended && activeCount !== 2) {
      ended = true;
      emitter.emit('end');
    }
  }

  /**
   * Compute the distance between active fingers
   */
  function computeDistance(): number {
    if (activeCount < 2) return 0;
    return distance(fingers[0]!.position, fingers[1]!.position);
  }

  // Initialize and expose API
  enable();
  emitter.enable = enable;
  emitter.disable = disable;
  emitter.indexOfTouch = indexOfTouch;
  
  return emitter;
}

export default touchPinch;
