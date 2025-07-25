import { fabric } from 'fabric';
import Base from '../core/Base';
import Arrow from './Arrow';
import { ExtendedFabricCanvas } from '../types/fabric-extensions';

export enum PaintMode {
  SELECT = 'select',
  DRAWING = 'drawing',
  ARROW = 'arrow',
  TEXT = 'text'
}

export interface PaintCanvasOptions {
  width?: number;
  height?: number;
  lineWidth?: number;
  currentColor?: string;
  fontFamily?: string;
}

export class PaintCanvas extends Base {
  // DOM Elements
  public container: HTMLElement;
  public canvas: ExtendedFabricCanvas;
  protected cursorCanvas?: HTMLCanvasElement;
  protected cursor?: fabric.StaticCanvas;
  protected mousecursor?: fabric.Circle | fabric.Path | null;

  // Canvas State
  public mode: PaintMode;
  public arrows: Arrow[] = [];
  protected activeArrow?: Arrow | null;
  protected mouseDown: boolean = false;

  // Style Properties
  public currentColor: string;
  public lineWidth: number;
  public fontFamily: string;

  constructor(container: HTMLElement, options: PaintCanvasOptions = {}) {
    super(options);

    this.container = container;

    // Create canvas element
    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);
    canvas.setAttribute('id', 'fabric-layers-paint-canvas');

    canvas.width = options.width || this.container.clientWidth;
    canvas.height = options.height || this.container.clientHeight;

    // Initialize properties
    this.currentColor = options.currentColor || 'black';
    this.fontFamily = options.fontFamily || 'Roboto';
    this.lineWidth = options.lineWidth || 10;

    // Create fabric canvas
    this.canvas = new fabric.Canvas(canvas, {
      freeDrawingCursor: 'none'
      // Other options can be set here
    })
    
    // Set up the drawing brush after canvas is created
    const pencilBrush = new fabric.PencilBrush(this.canvas);
    pencilBrush.color = this.currentColor;
    pencilBrush.width = this.lineWidth;
    this.canvas.freeDrawingBrush = pencilBrush;

    this.setLineWidth(this.lineWidth);
    this.addCursor();
    this.addListeners();

    this.mode = PaintMode.ARROW;
    this.setModeAsArrow();
  }

  // Mode Management Methods
  public setModeAsDrawing(): void {
    this.mode = PaintMode.DRAWING;
    this.canvas.isDrawingMode = true;
    this.canvas.selection = false;
    this.onModeChanged();
  }

  public isDrawingMode(): boolean {
    return this.mode === PaintMode.DRAWING;
  }

  public setModeAsSelect(): void {
    this.mode = PaintMode.SELECT;
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.onModeChanged();
  }

  public isSelectMode(): boolean {
    return this.mode === PaintMode.SELECT;
  }

  public setModeAsArrow(): void {
    this.mode = PaintMode.ARROW;
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.onModeChanged();
  }

  public isArrowMode(): boolean {
    return this.mode === PaintMode.ARROW;
  }

  public setModeAsText(): void {
    this.mode = PaintMode.TEXT;
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.onModeChanged();
  }

  public isTextMode(): boolean {
    return this.mode === PaintMode.TEXT;
  }

  protected onModeChanged(): void {
    this.updateCursor();
    this.emit('mode-changed', this.mode);
    this.canvas.getObjects().forEach(obj => {
      obj.evented = this.isSelectMode();
    });
  }

  // Event Handlers
  protected addListeners(): void {
    this.canvas.on('mouse:move', (evt: fabric.IEvent<MouseEvent>) => {
      const mouse = this.canvas.getPointer(evt.e);
      if (this.mousecursor && this.mousecursor instanceof fabric.Circle) {
        this.mousecursor
          .set({
            top: mouse.y,
            left: mouse.x
          })
          .setCoords()
          .canvas?.renderAll();
      }

      if (this.isTextMode()) {
        console.log('text');
      } else if (this.isArrowMode() && this.activeArrow) {
        this.activeArrow.addTempPoint(mouse);
        this.canvas.requestRenderAll();
      }
    });

    this.canvas.on('mouse:out', () => {
      if (!this.mousecursor || !(this.mousecursor instanceof fabric.Circle)) return;
      this.mousecursor
        .set({
          left: -1000,
          top: -1000
        })
        .setCoords();

      this.cursor?.renderAll();
    });

    this.canvas.on('mouse:up', (event: fabric.IEvent<MouseEvent>) => {
      if (this.mouseDown) {
        this.canvas.fire('mouse:click', event);
      }
      this.mouseDown = false;
    });

    this.canvas.on('mouse:move', () => {
      this.mouseDown = false;
    });

    this.canvas.on('mouse:down', () => {
      this.mouseDown = true;
    });

    this.canvas.on('mouse:click', (event: fabric.IEvent<Event>) => {
      console.log('mouse click', event);
      const mouse = this.canvas.getPointer(event.e);
      if (event.target) return;

      if (this.isTextMode()) {
        const text = new fabric.IText('Text', {
          left: mouse.x,
          top: mouse.y,
          width: 100,
          fontSize: 20,
          fontFamily: this.fontFamily,
          lockUniScaling: true,
          fill: this.currentColor,
          stroke: this.currentColor
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();

        this.setModeAsSelect();
      } else if (this.isArrowMode()) {
        console.log('arrow mode');
        if (this.activeArrow) {
          this.activeArrow.addPoint(mouse);
        } else {
          this.activeArrow = new Arrow(mouse, {
            stroke: this.currentColor,
            strokeWidth: this.lineWidth
          });
          this.canvas.add(this.activeArrow);
        }
        this.canvas.requestRenderAll();
      }
    });

    this.canvas.on('mouse:dblclick', () => {
      console.log('mouse:dbclick');
      if (this.isArrowMode() && this.activeArrow) {
        this.arrows.push(this.activeArrow);
        this.activeArrow = null;
      }
    });

    this.canvas.on('selection:created', () => {
      this.emit('selected');
    });

    this.canvas.on('selection:cleared', () => {
      this.emit('unselected');
    });
  }

  // Canvas Management Methods
  public removeSelected(): void {
    const activeObj = this.canvas.getActiveObject();
    if (activeObj) {
      this.canvas.remove(activeObj);
    }
    
    this.canvas.getActiveObjects().forEach(obj => {
      this.canvas.remove(obj);
    });
    
    this.canvas.discardActiveObject().renderAll();
  }

  protected updateCursor(): void {
    if (!this.cursor) return;

    if (this.mousecursor) {
      this.cursor.remove(this.mousecursor);
      this.mousecursor = null;
    }

    const cursorOpacity = 0.3;
    
    if (this.isDrawingMode()) {
      this.mousecursor = new fabric.Circle({
        left: -1000,
        top: -1000,
        radius: this.canvas.freeDrawingBrush.width / 2,
        fill: `rgba(255,0,0,${cursorOpacity})`,
        stroke: 'black',
        originX: 'center',
        originY: 'center'
      });
    } else if (this.isTextMode() || !this.isSelectMode()) {
      const pathData = this.isTextMode() ? 'M0,-10 V10' : 'M0,-10 V10 M-10,0 H10';
      this.mousecursor = new fabric.Path(pathData, {
        left: -1000,
        top: -1000,
        fill: `rgba(255,0,0,${cursorOpacity})`,
        stroke: `rgba(0,0,0,${cursorOpacity})`,
        originX: 'center',
        originY: 'center'
      });
    }

    if (this.isSelectMode()) {
      this.mousecursor = null;
      this.canvas.defaultCursor = 'default';
    } else {
      this.canvas.defaultCursor = 'none';
    }

    if (this.mousecursor) {
      this.cursor.add(this.mousecursor);
    }
  }

  protected addCursor(): void {
    const cursorCanvas = document.createElement('canvas');
    this.canvas.wrapperEl?.appendChild(cursorCanvas);
    cursorCanvas.setAttribute('id', 'fabric-layers-cursor-canvas');
    cursorCanvas.style.position = 'absolute';
    cursorCanvas.style.top = '0';
    cursorCanvas.style.pointerEvents = 'none';
    cursorCanvas.width = this.container.clientWidth;
    cursorCanvas.height = this.container.clientHeight;
    
    this.cursorCanvas = cursorCanvas;
    this.canvas.defaultCursor = 'none';
    this.cursor = new fabric.StaticCanvas(cursorCanvas);
    this.updateCursor();
  }

  // Style Methods
  public setColor(color: string): void {
    this.currentColor = color;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }

    const obj = this.canvas.getActiveObject();
    if (obj) {
      obj.set('stroke', color);
      obj.set('fill', color);
      this.canvas.requestRenderAll();
    }

    if (!this.mousecursor || !(this.mousecursor instanceof fabric.Circle)) return;

    this.mousecursor
      .set({
        left: 100,
        top: 100,
        fill: color
      })
      .setCoords()
      .canvas?.renderAll();
  }

  public setLineWidth(width: number): void {
    this.lineWidth = width;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = width;
    }

    if (!this.mousecursor || !(this.mousecursor instanceof fabric.Circle)) return;

    this.mousecursor
      .set({
        left: 100,
        top: 100,
        radius: width / 2
      })
      .setCoords()
      .canvas?.renderAll();
  }

  public setFontFamily(family: string): void {
    this.fontFamily = family;
    const obj = this.canvas.getActiveObject();
    if (obj instanceof fabric.IText) {
      obj.set('fontFamily', family);
      this.canvas.requestRenderAll();
    }
  }

  public clear(): void {
    this.arrows = [];
    this.canvas.clear();
  }
}

/**
 * Factory function to create a new PaintCanvas
 * @param container - The container element
 * @param options - Configuration options
 * @returns A new PaintCanvas instance
 */
export const paintCanvas = (
  container: HTMLElement,
  options?: PaintCanvasOptions
): PaintCanvas => new PaintCanvas(container, options);

export default PaintCanvas;
