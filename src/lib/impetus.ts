/**
 * Impetus.js - momentum-based scrolling with touch events
 */

// Constants
const stopThresholdDefault = 0.3;
const bounceDeceleration = 0.04;
const bounceAcceleration = 0.11;

// Types
export interface ImpetusOptions {
  /** Element that triggers the events */
  source?: HTMLElement | Document | string;
  /** Callback for position updates */
  update: (x: number, y: number) => void;
  /** Optional callback when movement stops */
  stop?: (el: HTMLElement | Document) => void;
  /** Multiplier for movement */
  multiplier?: number;
  /** Friction factor (0 to 1) */
  friction?: number;
  /** Initial [x, y] values */
  initialValues?: [number, number];
  /** Boundary for x axis [min, max] */
  boundX?: [number, number];
  /** Boundary for y axis [min, max] */
  boundY?: [number, number];
  /** Whether to bounce when hitting boundaries */
  bounce?: boolean;
}

interface TrackingPoint {
  x: number;
  y: number;
  time: number;
}

interface NormalizedEvent {
  x: number;
  y: number;
  id: number | null;
}

interface BoundCheckResult {
  x: number;
  y: number;
  inBounds: boolean;
}

// Fixes weird safari 10 bug where preventDefault is prevented
// @see https://github.com/metafizzy/flickity/issues/457#issuecomment-254501356
window.addEventListener('touchmove', () => {});

export default class Impetus {
  private sourceEl!: HTMLElement | Document;
  private updateCallback!: (x: number, y: number) => void;
  private stopCallback?: (el: HTMLElement | Document) => void;
  private multiplier!: number;
  private friction!: number;
  private boundXmin?: number;
  private boundXmax?: number;
  private boundYmin?: number;
  private boundYmax?: number;
  private bounce!: boolean;
  private pointerLastX: number = 0;
  private pointerLastY: number = 0;
  private pointerCurrentX: number = 0;
  private pointerCurrentY: number = 0;
  private pointerId: number | null = null;
  private decVelX: number = 0;
  private decVelY: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private stopThreshold!: number;
  private ticking: boolean = false;
  private pointerActive: boolean = false;
  private paused: boolean = false;
  private decelerating: boolean = false;
  private trackingPoints: TrackingPoint[] = [];

  constructor({
    source = document,
    update: updateCallback,
    stop: stopCallback,
    multiplier = 1,
    friction = 0.92,
    initialValues,
    boundX,
    boundY,
    bounce = true
  }: ImpetusOptions) {
    
    this.updateCallback = updateCallback;
    this.stopCallback = stopCallback;
    this.multiplier = multiplier;
    this.friction = friction;
    this.bounce = bounce;
    this.stopThreshold = stopThresholdDefault * multiplier;
    
    /**
     * Initialize instance
     */
    const init = () => {
      this.sourceEl = typeof source === 'string' ? 
        document.querySelector(source) as HTMLElement : 
        source;
        
      if (!this.sourceEl) {
        throw new Error('IMPETUS: source not found.');
      }

      if (!this.updateCallback) {
        throw new Error('IMPETUS: update function not defined.');
      }

      if (initialValues) {
        if (initialValues[0]) {
          this.targetX = initialValues[0];
        }
        if (initialValues[1]) {
          this.targetY = initialValues[1];
        }
        this.callUpdateCallback();
      }

      // Initialize bound values
      if (boundX) {
        this.boundXmin = boundX[0];
        this.boundXmax = boundX[1];
      }
      if (boundY) {
        this.boundYmin = boundY[0];
        this.boundYmax = boundY[1];
      }

      this.sourceEl.addEventListener('touchstart', this.onDown as EventListener);
      this.sourceEl.addEventListener('mousedown', this.onDown as EventListener);
    };

    init();
  }

  /**
   * In edge cases where you may need to
   * reinstanciate Impetus on the same sourceEl
   * this will remove the previous event listeners
   */
  destroy = (): null => {
    this.sourceEl.removeEventListener('touchstart', this.onDown as EventListener);
    this.sourceEl.removeEventListener('mousedown', this.onDown as EventListener);

    this.cleanUpRuntimeEvents();

    // however it won't "destroy" a reference
    // to instance if you'd like to do that
    // it returns null as a convinience.
    // ex: `instance = instance.destroy();`
    return null;
  };

  /**
   * Disable movement processing
   * @public
   */
  pause = (): void => {
    this.cleanUpRuntimeEvents();

    this.pointerActive = false;
    this.paused = true;
  };

  /**
   * Enable movement processing
   * @public
   */
  resume = (): void => {
    this.paused = false;
  };

  /**
   * Update the current x and y values
   * @public
   * @param x - New x value
   * @param y - New y value
   */
  setValues = (x?: number, y?: number): void => {
    if (typeof x === 'number') {
      this.targetX = x;
    }
    if (typeof y === 'number') {
      this.targetY = y;
    }
  };

  /**
   * Update the multiplier value
   * @public
   * @param val - New multiplier value
   */
  setMultiplier = (val: number): void => {
    this.multiplier = val;
    this.stopThreshold = stopThresholdDefault * this.multiplier;
  };

  /**
   * Update boundX value
   * @public
   * @param boundX - New boundX array
   */
  setBoundX = (boundX: [number, number]): void => {
    this.boundXmin = boundX[0];
    this.boundXmax = boundX[1];
  };

  /**
   * Update boundY value
   * @public
   * @param boundY - New boundY array
   */
  setBoundY = (boundY: [number, number]): void => {
    this.boundYmin = boundY[0];
    this.boundYmax = boundY[1];
  };

  /**
   * Removes all events set by this instance during runtime
   */
  private cleanUpRuntimeEvents = (): void => {
    // Remove all touch events added during 'onDown' as well.
    document.removeEventListener(
      'touchmove',
      this.onMove as EventListener,
      getPassiveSupported() ? { passive: false } as EventListenerOptions : false
    );
    document.removeEventListener('touchend', this.onUp as EventListener);
    document.removeEventListener('touchcancel', this.stopTracking);
    document.removeEventListener(
      'mousemove',
      this.onMove as EventListener,
      getPassiveSupported() ? { passive: false } as EventListenerOptions : false
    );
    document.removeEventListener('mouseup', this.onUp as EventListener);
  };

  /**
   * Add all required runtime events
   */
  private addRuntimeEvents = (): void => {
    this.cleanUpRuntimeEvents();

    // @see https://developers.google.com/web/updates/2017/01/scrolling-intervention
    document.addEventListener(
      'touchmove',
      this.onMove,
      getPassiveSupported() ? { passive: false } : false
    );
    document.addEventListener('touchend', this.onUp);
    document.addEventListener('touchcancel', this.stopTracking);
    document.addEventListener(
      'mousemove',
      this.onMove,
      getPassiveSupported() ? { passive: false } : false
    );
    document.addEventListener('mouseup', this.onUp);
  };

  /**
   * Executes the update function
   */
  private callUpdateCallback = (): void => {
    this.updateCallback.call(this.sourceEl, this.targetX, this.targetY);
  };

  /**
   * Creates a custom normalized event object from touch and mouse events
   * @param ev - Original event
   * @returns Object with x, y, and id properties
   */
  private normalizeEvent = (ev: MouseEvent | TouchEvent): NormalizedEvent => {
    if (ev.type === 'touchmove' || ev.type === 'touchstart' || ev.type === 'touchend') {
      const touchEv = ev as TouchEvent;
      const touch = touchEv.targetTouches[0] || touchEv.changedTouches[0];
      
      // Ensure the touch object exists
      if (!touch) {
        // Return a default value if no touch is found
        return {
          x: 0,
          y: 0,
          id: null
        };
      }
      
      return {
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier
      };
    }
    // mouse events
    const mouseEv = ev as MouseEvent;
    return {
      x: mouseEv.clientX,
      y: mouseEv.clientY,
      id: null
    };
  };

  /**
   * Initializes movement tracking
   * @param ev - Original event
   */
  private onDown = (ev: MouseEvent | TouchEvent): void => {
    const event = this.normalizeEvent(ev);
    if (!this.pointerActive && !this.paused) {
      this.pointerActive = true;
      this.decelerating = false;
      this.pointerId = event.id;

      this.pointerLastX = this.pointerCurrentX = event.x;
      this.pointerLastY = this.pointerCurrentY = event.y;
      this.trackingPoints = [];
      this.addTrackingPoint(this.pointerLastX, this.pointerLastY);

      this.addRuntimeEvents();
    }
  };

  /**
   * Handles move events
   * @param ev - Original event
   */
  private onMove = (ev: MouseEvent | TouchEvent): void => {
    ev.preventDefault();
    const event = this.normalizeEvent(ev);

    if (this.pointerActive && event.id === this.pointerId) {
      this.pointerCurrentX = event.x;
      this.pointerCurrentY = event.y;
      this.addTrackingPoint(this.pointerLastX, this.pointerLastY);
      this.requestTick();
    }
  };

  /**
   * Handles up/end events
   * @param ev - Original event
   */
  private onUp = (ev: MouseEvent | TouchEvent): void => {
    const event = this.normalizeEvent(ev);

    if (this.pointerActive && event.id === this.pointerId) {
      this.stopTracking();
    }
  };

  /**
   * Stops movement tracking, starts animation
   */
  private stopTracking = (): void => {
    this.pointerActive = false;
    this.addTrackingPoint(this.pointerLastX, this.pointerLastY);
    this.startDecelAnim();

    this.cleanUpRuntimeEvents();
  };

  /**
   * Records movement for the last 100ms
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  private addTrackingPoint = (x: number, y: number): void => {
    const time = Date.now();
    while (this.trackingPoints.length > 0) {
      const firstPoint = this.trackingPoints[0];
      if (firstPoint && time - firstPoint.time <= 100) {
        break;
      }
      this.trackingPoints.shift();
    }

    this.trackingPoints.push({ x, y, time });
  };

  /**
   * Calculate new values, call update function
   */
  private updateAndRender = (): void => {
    const pointerChangeX = this.pointerCurrentX - this.pointerLastX;
    const pointerChangeY = this.pointerCurrentY - this.pointerLastY;

    this.targetX += pointerChangeX * this.multiplier;
    this.targetY += pointerChangeY * this.multiplier;

    if (this.bounce) {
      const diff = this.checkBounds();
      if (diff.x !== 0) {
        this.targetX -= pointerChangeX * this.dragOutOfBoundsMultiplier(diff.x) * this.multiplier;
      }
      if (diff.y !== 0) {
        this.targetY -= pointerChangeY * this.dragOutOfBoundsMultiplier(diff.y) * this.multiplier;
      }
    } else {
      this.checkBounds(true);
    }

    this.callUpdateCallback();

    this.pointerLastX = this.pointerCurrentX;
    this.pointerLastY = this.pointerCurrentY;
    this.ticking = false;
  };

  /**
   * Returns a value from around 0.5 to 1, based on distance
   * @param val - Distance value
   */
  private dragOutOfBoundsMultiplier = (val: number): number => {
    return 0.000005 * Math.pow(val, 2) + 0.0001 * val + 0.55;
  };

  /**
   * prevents animating faster than current framerate
   */
  private requestTick = (): void => {
    if (!this.ticking) {
      requestAnimFrame(this.updateAndRender);
    }
    this.ticking = true;
  };

  /**
   * Determine position relative to bounds
   * @param restrict - Whether to restrict target to bounds
   */
  private checkBounds = (restrict?: boolean): BoundCheckResult => {
    let xDiff = 0;
    let yDiff = 0;

    if (this.boundXmin !== undefined && this.targetX < this.boundXmin) {
      xDiff = this.boundXmin - this.targetX;
    } else if (this.boundXmax !== undefined && this.targetX > this.boundXmax) {
      xDiff = this.boundXmax - this.targetX;
    }

    if (this.boundYmin !== undefined && this.targetY < this.boundYmin) {
      yDiff = this.boundYmin - this.targetY;
    } else if (this.boundYmax !== undefined && this.targetY > this.boundYmax) {
      yDiff = this.boundYmax - this.targetY;
    }

    if (restrict) {
      if (xDiff !== 0) {
        this.targetX = xDiff > 0 ? this.boundXmin! : this.boundXmax!;
      }
      if (yDiff !== 0) {
        this.targetY = yDiff > 0 ? this.boundYmin! : this.boundYmax!;
      }
    }

    return {
      x: xDiff,
      y: yDiff,
      inBounds: xDiff === 0 && yDiff === 0
    };
  };

  /**
   * Initialize animation of values coming to a stop
   */
  private startDecelAnim = (): void => {
    // Check if we have tracking points
    if (this.trackingPoints.length < 2) {
      // Not enough points to calculate velocity
      return;
    }
    
    const firstPoint = this.trackingPoints[0];
    const lastPoint = this.trackingPoints[this.trackingPoints.length - 1];

    // Both points must exist to calculate velocity
    if (!firstPoint || !lastPoint) {
      return;
    }

    const xOffset = lastPoint.x - firstPoint.x;
    const yOffset = lastPoint.y - firstPoint.y;
    const timeOffset = lastPoint.time - firstPoint.time;

    // Avoid division by zero
    const D = timeOffset / 15 / this.multiplier || 1; // Default to 1 if calculation results in 0

    this.decVelX = xOffset / D || 0; // prevent NaN
    this.decVelY = yOffset / D || 0;

    const diff = this.checkBounds();

    if (Math.abs(this.decVelX) > 1 || Math.abs(this.decVelY) > 1 || !diff.inBounds) {
      this.decelerating = true;
      requestAnimFrame(this.stepDecelAnim);
    } else if (this.stopCallback) {
      this.stopCallback(this.sourceEl);
    }
  };

  /**
   * Animates values slowing down
   */
  private stepDecelAnim = (): void => {
    if (!this.decelerating) {
      return;
    }

    this.decVelX *= this.friction;
    this.decVelY *= this.friction;

    this.targetX += this.decVelX;
    this.targetY += this.decVelY;

    const diff = this.checkBounds();

    if (
      Math.abs(this.decVelX) > this.stopThreshold
      || Math.abs(this.decVelY) > this.stopThreshold
      || !diff.inBounds
    ) {
      if (this.bounce) {
        const reboundAdjust = 2.5;

        if (diff.x !== 0) {
          if (diff.x * this.decVelX <= 0) {
            this.decVelX += diff.x * bounceDeceleration;
          } else {
            const adjust = diff.x > 0 ? reboundAdjust : -reboundAdjust;
            this.decVelX = (diff.x + adjust) * bounceAcceleration;
          }
        }
        if (diff.y !== 0) {
          if (diff.y * this.decVelY <= 0) {
            this.decVelY += diff.y * bounceDeceleration;
          } else {
            const adjust = diff.y > 0 ? reboundAdjust : -reboundAdjust;
            this.decVelY = (diff.y + adjust) * bounceAcceleration;
          }
        }
      } else {
        if (diff.x !== 0) {
          if (diff.x > 0) {
            this.targetX = this.boundXmin!;
          } else {
            this.targetX = this.boundXmax!;
          }
          this.decVelX = 0;
        }
        if (diff.y !== 0) {
          if (diff.y > 0) {
            this.targetY = this.boundYmin!;
          } else {
            this.targetY = this.boundYmax!;
          }
          this.decVelY = 0;
        }
      }

      this.callUpdateCallback();

      requestAnimFrame(this.stepDecelAnim);
    } else {
      this.decelerating = false;
      if (this.stopCallback) {
        this.stopCallback(this.sourceEl);
      }
    }
  };
}

/**
 * Cross-browser requestAnimationFrame
 * @see http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
const requestAnimFrame = (function (): (callback: FrameRequestCallback) => number {
  return (
    window.requestAnimationFrame
    || (window as any).webkitRequestAnimationFrame
    || (window as any).mozRequestAnimationFrame
    || function (callback: FrameRequestCallback): number {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
}());

/**
 * Check if passive event listeners are supported
 */
function getPassiveSupported(): boolean {
  let passiveSupported = false;

  try {
    const options = Object.defineProperty({}, 'passive', {
      get() {
        passiveSupported = true;
        return passiveSupported;
      }
    });

    window.addEventListener('test', null as any, options);
  } catch (err) {}

  (getPassiveSupported as any) = () => passiveSupported;
  return passiveSupported;
}
