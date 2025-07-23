import { Canvas } from 'fabric';
import { Mode } from '../core/Constants';

// Type for the constructor of the class being mixed into
type Constructor<T = {}> = new (...args: any[]) => T;

// Interface that defines what properties/methods the base class must have
interface ModesMixinBase {
  canvas: Canvas;
  mode: Mode;
}

// Interface that defines what the mixin adds
export interface ModesMixinInterface {
  setMode(mode: Mode): void;
  setModeAsDraw(): void;
  setModeAsSelect(): void;
  setModeAsMeasure(): void;
  setModeAsGrab(): void;
  isSelectMode(): boolean;
  isGrabMode(): boolean;
  isMeasureMode(): boolean;
  isDrawMode(): boolean;
}

/**
 * Mixin that adds mode-related functionality to a class
 * @param superclass - The class to mix into
 */
const ModesMixin = <T extends Constructor<ModesMixinBase>>(superclass: T) =>
  class extends superclass implements ModesMixinInterface {
    /**
     * Set the current mode and update canvas properties accordingly
     * @param mode - The mode to set
     */
    setMode(mode: Mode): void {
      this.mode = mode;

      switch (mode) {
        case Mode.SELECT:
          this.canvas.isDrawingMode = false;
          this.canvas.interactive = true;
          this.canvas.selection = true;
          this.canvas.hoverCursor = 'default';
          this.canvas.moveCursor = 'default';
          break;

        case Mode.GRAB:
          this.canvas.isDrawingMode = false;
          this.canvas.interactive = false;
          this.canvas.selection = false;
          this.canvas.discardActiveObject();
          this.canvas.hoverCursor = 'move';
          this.canvas.moveCursor = 'move';
          break;

        case Mode.MEASURE:
          this.canvas.isDrawingMode = true;
          // Type assertion needed because fabric.js types don't include all properties
          (this.canvas as any).freeDrawingBrush.color = 'transparent';
          this.canvas.discardActiveObject();
          break;

        case Mode.DRAW:
          this.canvas.isDrawingMode = true;
          break;

        default:
          const _exhaustiveCheck: never = mode;
          break;
      }
    }

    /**
     * Set mode to DRAW
     */
    setModeAsDraw(): void {
      this.setMode(Mode.DRAW);
    }

    /**
     * Set mode to SELECT
     */
    setModeAsSelect(): void {
      this.setMode(Mode.SELECT);
    }

    /**
     * Set mode to MEASURE
     */
    setModeAsMeasure(): void {
      this.setMode(Mode.MEASURE);
    }

    /**
     * Set mode to GRAB
     */
    setModeAsGrab(): void {
      this.setMode(Mode.GRAB);
    }

    /**
     * Check if current mode is SELECT
     */
    isSelectMode(): boolean {
      return this.mode === Mode.SELECT;
    }

    /**
     * Check if current mode is GRAB
     */
    isGrabMode(): boolean {
      return this.mode === Mode.GRAB;
    }

    /**
     * Check if current mode is MEASURE
     */
    isMeasureMode(): boolean {
      return this.mode === Mode.MEASURE;
    }

    /**
     * Check if current mode is DRAW
     */
    isDrawMode(): boolean {
      return this.mode === Mode.DRAW;
    }
  };

export default ModesMixin;
