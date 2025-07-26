/**
 * MagicScroll class for smooth scrolling with momentum
 */
class MagicScroll {
  public speed: number;
  public smooth: number;
  public moving: boolean;
  public scrollTop: number;
  public pos: number;
  public frame: HTMLElement;
  public onUpdate?: (delta: number, e?: WheelEvent | MouseEvent) => void;

  /**
   * Create a new MagicScroll instance
   * @param target - Target element to apply scroll behavior to
   * @param speed - Scrolling speed factor
   * @param smooth - Smoothing factor
   * @param current - Initial position
   * @param passive - Whether to use passive event listeners
   */
  constructor(
    target: HTMLElement | Document = document, 
    speed: number = 80, 
    smooth: number = 12, 
    current: number = 0, 
    passive: boolean = false
  ) {
    if (target === document) {
      target = document.scrollingElement as HTMLElement
        || document.documentElement as HTMLElement
        || document.body.parentNode as HTMLElement
        || document.body;
    } // cross browser support for document scrolling

    this.speed = speed;
    this.smooth = smooth;
    this.moving = false;
    this.scrollTop = current * 3000;
    this.pos = this.scrollTop;
    this.frame = target === document.body && document.documentElement ? 
      document.documentElement : 
      target as HTMLElement; // safari is the new IE

    const scope = this;
    
    function scrolled(this: any, e: WheelEvent): void {
      e.preventDefault(); // disable default scrolling

      const delta = scope.normalizeWheelDelta(e);

      scope.pos += -delta * scope.speed;
      // scope.pos = Math.max(0, Math.min(scope.pos, 3000)); // limit scrolling

      if (!scope.moving) scope.update(e);
    }

    target.addEventListener('wheel', scrolled as EventListener, { passive });
    target.addEventListener('DOMMouseScroll', scrolled as EventListener, { passive });
  }

  /**
   * Normalize wheel delta across browsers
   * @param e - Wheel event
   * @returns Normalized delta value
   */
  normalizeWheelDelta(e: WheelEvent): number {
    if (e.detail) {
      if ((e as any).wheelDelta) return ((e as any).wheelDelta / e.detail / 40) * (e.detail > 0 ? 1 : -1);
      // Opera
      return -e.detail / 3; // Firefox
    }
    return (e as any).wheelDelta / 120; // IE,Safari,Chrome
  }

  /**
   * Update scroll position with smooth animation
   * @param e - Optional event that triggered the update
   */
  update(e?: WheelEvent | MouseEvent): void {
    this.moving = true;

    const delta = (this.pos - this.scrollTop) / this.smooth;

    this.scrollTop += delta;

    // this.scrollTop = Math.round(this.scrollTop);

    if (this.onUpdate) {
      this.onUpdate(delta, e);
    }
    
    const scope = this;
    if (Math.abs(delta) > 1) {
      requestFrame(() => {
        scope.update();
      });
    } else this.moving = false;
  }
}

export default MagicScroll;

/**
 * Cross-browser requestAnimationFrame function
 */
const requestFrame = (function (): (callback: FrameRequestCallback) => number {
  // requestAnimationFrame cross browser
  return (
    window.requestAnimationFrame
    || (window as any).webkitRequestAnimationFrame
    || (window as any).mozRequestAnimationFrame
    || (window as any).oRequestAnimationFrame
    || (window as any).msRequestAnimationFrame
    || function (func: FrameRequestCallback): number {
      return window.setTimeout(func, 1000);
    }
  );
}());
