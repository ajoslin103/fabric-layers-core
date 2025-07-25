/**
 * Check if a value is a valid number
 * @param val - Value to check
 * @returns True if the value is a valid number
 */
const isNum = function (val: any): boolean {
  return typeof val === 'number' && !isNaN(val);
};

/**
 * Event position result interface
 */
export interface EventPosition {
  /** X coordinate relative to target element */
  x: number;
  /** Y coordinate relative to target element */
  y: number;
  /** Whether the event was a right-click */
  isRight: boolean;
}

/**
 * Get normalized event position relative to an element
 * @param ev - Mouse or touch event
 * @param toElement - Optional target element (defaults to currentTarget)
 * @returns Object with x, y coordinates and isRight flag
 */
export default (ev: MouseEvent | TouchEvent, toElement?: HTMLElement): EventPosition => {
  toElement = toElement || (ev.currentTarget as HTMLElement);

  const toElementBoundingRect = toElement.getBoundingClientRect();
  const orgEv = (ev as any).originalEvent || ev;
  const hasTouches = 'touches' in ev && (ev as TouchEvent).touches.length > 0;
  let pageX = 0;
  let pageY = 0;

  if (hasTouches) {
    const touchEv = ev as TouchEvent;
    if (isNum(touchEv.touches[0].pageX) && isNum(touchEv.touches[0].pageY)) {
      pageX = touchEv.touches[0].pageX;
      pageY = touchEv.touches[0].pageY;
    } else if (isNum(touchEv.touches[0].clientX) && isNum(touchEv.touches[0].clientY)) {
      pageX = orgEv.touches[0].clientX;
      pageY = orgEv.touches[0].clientY;
    }
  } else if (isNum((ev as MouseEvent).pageX) && isNum((ev as MouseEvent).pageY)) {
    pageX = (ev as MouseEvent).pageX;
    pageY = (ev as MouseEvent).pageY;
  } else if ((ev as any).currentPoint && isNum((ev as any).currentPoint.x) && isNum((ev as any).currentPoint.y)) {
    pageX = (ev as any).currentPoint.x;
    pageY = (ev as any).currentPoint.y;
  }
  
  let isRight = false;
  if ('which' in ev) {
    // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
    isRight = (ev as MouseEvent).which === 3;
  } else if ('button' in ev) {
    // IE, Opera
    isRight = (ev as MouseEvent).button === 2;
  }

  return {
    x: pageX - toElementBoundingRect.left,
    y: pageY - toElementBoundingRect.top,
    isRight
  };
};
