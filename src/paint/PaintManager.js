import { EventEmitter2 } from 'eventemitter2';
import {
  createCanvas,
  clearCanvas,
  resizeCanvas,
  canvasToDataURL,
  createImageFromURL,
  applyFilter
} from './paint-utils';

/**
 * PaintManager class
 * Provides a comprehensive system for managing canvas painting operations
 */
class PaintManager extends EventEmitter2 {
  /**
   * Creates a new PaintManager instance
   * @param {Object} options - Configuration options
   * @param {number} options.width - Initial canvas width
   * @param {number} options.height - Initial canvas height
   * @param {HTMLElement} options.container - DOM element to append canvas to
   * @param {Object} options.canvasOptions - Additional fabric canvas options
   */
  constructor(options = {}) {
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
  _setupEventHandlers() {
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
  _saveState() {
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
   * @param {string} mode - Mode to set ('pencil', 'line', 'rect', 'circle', 'eraser')
   */
  setMode(mode) {
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
   * @param {string} color - Color in any valid CSS format
   */
  setBrushColor(color) {
    this.brushColor = color;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
    this.emit('brush:color', color);
  }

  /**
   * Sets the brush width
   * @param {number} width - Width in pixels
   */
  setBrushWidth(width) {
    this.brushWidth = width;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = width;
    }
    this.emit('brush:width', width);
  }

  /**
   * Resizes the canvas
   * @param {number} width - New width in pixels
   * @param {number} height - New height in pixels
   * @param {boolean} scaleContent - Whether to scale content with canvas
   */
  resize(width, height, scaleContent = false) {
    this.width = width;
    this.height = height;
    resizeCanvas(this.canvas, width, height, scaleContent);
    this._saveState();
    this.emit('canvas:resized', width, height);
  }

  /**
   * Clears the canvas
   */
  clear() {
    clearCanvas(this.canvas);
    this._saveState();
    this.emit('canvas:cleared');
  }

  /**
   * Undoes the last action
   * @returns {boolean} - Whether undo was successful
   */
  undo() {
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
   * @returns {boolean} - Whether redo was successful
   */
  redo() {
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
   * @param {string} format - Image format (png, jpeg, webp)
   * @param {number} quality - Image quality for jpeg and webp (0-1)
   * @returns {string} - Data URL of the canvas
   */
  exportToDataURL(format = 'png', quality = 0.8) {
    return canvasToDataURL(this.canvas, format, quality);
  }

  /**
   * Destroys the PaintManager instance and cleans up resources
   */
  destroy() {
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