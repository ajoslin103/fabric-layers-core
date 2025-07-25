import { EventEmitter2 } from 'eventemitter2';
import { fabric } from 'fabric';
import {
  createCanvas,
  clearCanvas,
  resizeCanvas,
  canvasToDataURL
} from './paint-utils';
import { ExtendedFabricCanvas } from '../types/fabric-extensions';

/**
 * Configuration options for the PaintManager
 */
export interface PaintManagerOptions {
  /** Initial canvas width */
  width?: number;
  /** Initial canvas height */
  height?: number;
  /** DOM element to append canvas to */
  container?: HTMLElement | null;
  /** Additional fabric canvas options */
  canvasOptions?: fabric.ICanvasOptions;
}

/**
 * PaintManager class
 * Provides a comprehensive system for managing canvas painting operations
 */
class PaintManager extends EventEmitter2 {
  /** Canvas width */
  public width: number;
  /** Canvas height */
  public height: number;
  /** Container element */
  public container: HTMLElement | null;
  /** Current brush color */
  public brushColor: string;
  /** Current brush width in pixels */
  public brushWidth: number;
  /** Current painting mode */
  public mode: string;
  /** Canvas history for undo/redo */
  protected history: any[];
  /** Current position in history */
  protected historyIndex: number;
  /** Maximum number of history steps to keep */
  protected maxHistorySteps: number;
  /** Fabric canvas instance */
  public canvas: ExtendedFabricCanvas;

  /**
   * Creates a new PaintManager instance
   * @param options - Configuration options
   */
  constructor(options: PaintManagerOptions = {}) {
    super();

    const {
      width = 800,
      height = 600,
      container = null,
      canvasOptions = {}
    } = options;

    this.width = width;
    this.height = height;
    this.container = container;
    this.brushColor = '#000000';
    this.brushWidth = 5;
    this.mode = 'pencil';
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySteps = 50;

    // Initialize canvas
    this.canvas = createCanvas(width, height, canvasOptions);

    // Append to container if provided
    if (container && this.canvas.wrapperEl) {
      container.appendChild(this.canvas.wrapperEl);
    }

    // Set up event handlers
    this._setupEventHandlers();
  }

  /**
   * Sets up event handlers for the canvas
   * @private
   */
  private _setupEventHandlers(): void {
    this.canvas.on('path:created', () => {
      this._saveState();
      this.emit('path:created');
    });

    this.canvas.on('object:modified', () => {
      this._saveState();
      this.emit('object:modified');
    });
  }

  /**
   * Saves the current canvas state to history
   * @private
   */
  private _saveState(): void {
    // Remove any states after current index if we've gone back in history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    const json = this.canvas.toJSON();
    this.history.push(json);

    // Limit history size
    if (this.history.length > this.maxHistorySteps) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
    this.emit('history:updated', this.historyIndex, this.history.length);
  }

  /**
   * Sets the painting mode
   * @param mode - Mode to set ('pencil', 'line', 'rect', 'circle', 'eraser')
   */
  public setMode(mode: string): void {
    this.mode = mode;

    // Disable any active selection
    this.canvas.discardActiveObject();

    // Configure canvas based on mode
    switch (mode) {
      case 'pencil':
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.brushColor;
        this.canvas.freeDrawingBrush.width = this.brushWidth;
        break;
      case 'eraser':
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = '#ffffff';
        this.canvas.freeDrawingBrush.width = this.brushWidth * 2;
        break;
      default:
        this.canvas.isDrawingMode = false;
        break;
    }
    this.emit('mode:changed', mode);
  }

  /**
   * Sets the brush color
   * @param color - Color in any valid CSS format
   */
  public setBrushColor(color: string): void {
    this.brushColor = color;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
    this.emit('brush:color', color);
  }

  /**
   * Sets the brush width
   * @param width - Width in pixels
   */
  public setBrushWidth(width: number): void {
    this.brushWidth = width;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = width;
    }
    this.emit('brush:width', width);
  }

  /**
   * Resizes the canvas
   * @param width - New width in pixels
   * @param height - New height in pixels
   * @param scaleContent - Whether to scale content with canvas
   */
  public resize(width: number, height: number, scaleContent: boolean = false): void {
    this.width = width;
    this.height = height;
    resizeCanvas(this.canvas, width, height, scaleContent);
    this._saveState();
    this.emit('canvas:resized', width, height);
  }

  /**
   * Clears the canvas
   */
  public clear(): void {
    clearCanvas(this.canvas);
    this._saveState();
    this.emit('canvas:cleared');
  }

  /**
   * Undoes the last action
   * @returns Whether undo was successful
   */
  public undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
        this.canvas.renderAll();
        this.emit('history:undo', this.historyIndex, this.history.length);
      });
      return true;
    }
    return false;
  }

  /**
   * Redoes the last undone action
   * @returns Whether redo was successful
   */
  public redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
        this.canvas.renderAll();
        this.emit('history:redo', this.historyIndex, this.history.length);
      });
      return true;
    }
    return false;
  }

  /**
   * Exports the canvas as a data URL
   * @param format - Image format (png, jpeg, webp)
   * @param quality - Image quality for jpeg and webp (0-1)
   * @returns Data URL of the canvas
   */
  public exportToDataURL(format: string = 'png', quality: number = 0.8): string {
    return canvasToDataURL(this.canvas, format, quality);
  }

  /**
   * Destroys the PaintManager instance and cleans up resources
   */
  public destroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      if (this.container && this.canvas.wrapperEl) {
        this.container.removeChild(this.canvas.wrapperEl);
      }
    }
    this.removeAllListeners();
    this.history = [];
  }
}

export default PaintManager;
