import { fabric } from 'fabric';
import panzoom from '../lib/panzoom';
import { clamp } from '../lib/mumath/index';

import Base from '../core/Base';
import { MAP, Mode, OriginPinType, MapConfig } from '../core/Constants';
import Grid from '../grid/Grid';
import { Point, PointLike } from '../geometry/Point';
import ModesMixin from './ModesMixin';
import Measurement from '../measurement/Measurement';
import { mix } from '../lib/mix';
import { Layer } from '../layer/Layer';

import { ExtendedFabricCanvas, ExtendedFabricEvent, ExtendedFabricGroup, ExtendedFabricObject } from '../types/fabric-extensions';

export interface PanZoomEvent {
  dz: number;
  dx: number;
  dy: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  isRight: boolean;
}

export interface MapOptions {
  width?: number;
  height?: number;
  autostart?: boolean;
  pinMargin?: number;
  zoomOverMouse?: boolean;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  gridEnabled?: boolean;
  zoomEnabled?: boolean;
  selectEnabled?: boolean;
  mode?: Mode;
  showGrid?: boolean;
  originPin?: OriginPinType;
  enablePan?: boolean;
  center?: Point;
}

// Declare properties and methods that Map will have via mixins
declare class MapBase {
  emit(event: string, ...args: any[]): boolean;
  on(event: string, listener: (...args: any[]) => void): this;
  clear(): void;
  setMode(mode: Mode): void;
  _options: MapOptions;
}

export class Map extends mix(Base).with(ModesMixin) {
  public container: HTMLElement;
  public canvas: ExtendedFabricCanvas;
  public context: CanvasRenderingContext2D;
  public _options: MapOptions;
  public gridCanvas?: HTMLCanvasElement;
  public grid?: Grid;
  public measurement: Measurement;

  // Map state properties
  public zoom: number = 1;
  public center: Point;
  public originX: number = 0;
  public originY: number = 0;
  public x: number = 0;
  public y: number = 0;
  public dx: number = 0;
  public dy: number = 0;
  public isRight: boolean = false;
  public lastUpdatedTime?: number;

  // Map configuration properties
  public defaults: MapConfig;
  public originPin: OriginPinType = OriginPinType.NONE;
  public pinMargin: number = 10;
  public zoomOverMouse: boolean = true;
  public zoomEnabled: boolean = true;
  public minZoom: number = 0;
  public maxZoom: number = 20;
  public mode: Mode = Mode.GRAB;
  public modeToggleByKey: boolean = false;

  constructor(container: HTMLElement | string, options?: MapOptions) {
    super(options);

    this.defaults = { ...MAP };
    
    // Initialize options
    this._options = options || {};
    // set defaults
    Object.assign(this, this.defaults);

    // overwrite options
    Object.assign(this, this._options);

    this.center = options?.center ? new Point(options.center) : new Point(0, 0);

    // Handle container parameter
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) throw new Error(`Container element "${container}" not found`);
      this.container = el as HTMLElement;
    } else {
      this.container = container || document.body;
    }

    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);
    canvas.setAttribute('id', 'fabric-layers-canvas');

    canvas.width = options?.width || this.container.clientWidth;
    canvas.height = options?.height || this.container.clientHeight;

    this.canvas = new fabric.Canvas(canvas, {
      preserveObjectStacking: true,
      renderOnAddRemove: true
    });
    this.context = this.canvas.getContext('2d');

    this.on('render', () => {
      if (options?.autostart) this.clear();
    });

    this.originX = -this.canvas.width / 2;
    this.originY = -this.canvas.height / 2;

    this.canvas.absolutePan({
      x: this.originX,
      y: this.originY
    });

    this.x = this.center.x;
    this.y = this.center.y;

    if (options?.showGrid) {
      this.addGrid();
    }

    this.setMode(this.mode || Mode.GRAB);

    // Set up panzoom
    panzoom(this.container, (e: PanZoomEvent) => {
      this.panzoom(e);
    });

    this.registerListeners();

    setTimeout(() => {
      this.emit('ready', this);
    }, 300);

    this.measurement = new Measurement(this);
  }

/**
 * Clears the map canvas
 */
public clear(): void {
  // Clear the canvas
  if (this.canvas) {
    this.canvas.clear();
    this.canvas.renderAll();
  }
  
  // Reset any other state as needed
  this.emit('clear');
}

addLayer(layer: Layer): void {
    if (!layer.shape) {
      console.error('shape is undefined');
      return;
    }
    this.canvas.add(layer.shape);
    this.canvas._objects.sort((o1, o2) => (o1.zIndex || 0) - (o2.zIndex || 0));

    if (layer.shape.keepOnZoom) {
      const scale = 1.0 / this.zoom;
      layer.shape.set('scaleX', scale);
      layer.shape.set('scaleY', scale);
      layer.shape.setCoords();
      this.emit(`${layer.class}scaling`, layer);
    }
    if (layer.class) {
      this.emit(`${layer.class}:added`, layer);
    }

    this.canvas.requestRenderAll();
  }

  removeLayer(layer?: Layer): void {
    if (!layer?.shape) return;
    if (layer.class) {
      this.emit(`${layer.class}:removed`, layer);
    }
    this.canvas.remove(layer.shape);
  }

  addGrid(): void {
    this.gridCanvas = document.createElement('canvas');
    this.gridCanvas.className = 'grid-canvas';
    this.container.appendChild(this.gridCanvas);
    this.gridCanvas.setAttribute('id', 'fabric-layers-grid-canvas');
    this.grid = new Grid(this.gridCanvas, this);
    
    // Set grid properties from map settings
    this.grid.setOriginPin(this.originPin);
    this.grid.setPinMargin(this.pinMargin);
    this.grid.setZoomOverMouse(this.zoomOverMouse);
    
    this.grid.draw();
  }

  moveTo(obj: Layer, index?: number): void {
    if (index !== undefined) {
      obj.shape.zIndex = index;
    }
    if (!this.grid?.isPinned) {
      this.canvas.moveTo(obj.shape, obj.shape.zIndex || 0);
    }
  }

  cloneCanvas(): HTMLCanvasElement {
    const canvas = this.canvas;
    const clone = document.createElement('canvas');
    clone.width = canvas.width || 0;
    clone.height = canvas.height || 0;
    canvas.wrapperEl?.appendChild(clone);
    return clone;
  }

  setZoom(zoom: number): void {
    const { width = 0, height = 0 } = this.canvas;
    this.zoom = clamp(zoom, this.minZoom, this.maxZoom);
    this.dx = 0;
    this.dy = 0;
    this.x = width / 2.0;
    this.y = height / 2.0;
    this.update();
    setTimeout(() => {
      this.update();
    }, 0);
  }

  getBounds(): [Point, Point] {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
  
    this.canvas.forEachObject(obj => {
      const rect = obj.getBoundingRect();
      
      // Calculate the four corners of the bounding rect
      const topLeft = { x: rect.left, y: rect.top };
      const topRight = { x: rect.left + rect.width, y: rect.top };
      const bottomLeft = { x: rect.left, y: rect.top + rect.height };
      const bottomRight = { x: rect.left + rect.width, y: rect.top + rect.height };
      
      // Update min and max coordinates using the corners
      [topLeft, topRight, bottomLeft, bottomRight].forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    });
  
    return [new Point(minX, minY), new Point(maxX, maxY)];
  }
  
  fitBounds(padding: number = 100): void {
    this.onResize();

    const { width = 0, height = 0 } = this.canvas;
    this.originY = -height / 2;
    this.originX = -width / 2;

    const bounds = this.getBounds();

    this.center.x = (bounds[0].x + bounds[1].x) / 2.0;
    this.center.y = -(bounds[0].y + bounds[1].y) / 2.0;

    const boundWidth = Math.abs(bounds[0].x - bounds[1].x) + padding;
    const boundHeight = Math.abs(bounds[0].y - bounds[1].y) + padding;
    const scaleY = height / boundHeight;
    const scaleX = width / boundWidth;

    this.zoom = Math.min(scaleX, scaleY);

    this.canvas.setZoom(this.zoom);

    this.canvas.absolutePan({
      x: this.originX + this.center.x * this.zoom,
      y: this.originY - this.center.y * this.zoom
    });

    this.update();
    setTimeout(() => {
      this.update();
    }, 0);
  }

  setCursor(cursor: string): void {
    this.container.style.cursor = cursor;
  }

  reset(): void {
    const { width = 0, height = 0 } = this.canvas;
    this.zoom = (this._options as MapOptions)?.zoom || 1;
    this.center = new Point();
    this.originX = -width / 2;
    this.originY = -height / 2;
    this.canvas.absolutePan({
      x: this.originX,
      y: this.originY
    });
    this.x = width / 2.0;
    this.y = height / 2.0;
    this.update();
    setTimeout(() => {
      this.update();
    }, 0);
  }

  onResize(width?: number, height?: number): void {
    const { width: oldWidth = 0, height: oldHeight = 0 } = this.canvas;

    height = height || this.container.clientHeight;
    width = width || this.container.clientWidth;

    this.canvas.setWidth(width);
    this.canvas.setHeight(height);

    if (this.grid) {
      this.grid.setSize(width, height);
    }

    const dx = width / 2.0 - oldWidth / 2.0;
    const dy = height / 2.0 - oldHeight / 2.0;

    this.canvas.relativePan({
      x: dx,
      y: dy
    });

    this.update();
  }

  update(): void {
    const canvas = this.canvas;

    if (this.grid) {
      this.grid.update2({
        x: this.center.x,
        y: this.center.y,
        zoom: this.zoom
      });
    }

    this.emit('update', this);
    
    if (this.grid) {
      this.grid.render();
    }

    if (this.isGrabMode() || this.isRight) {
      canvas.relativePan(new Point(this.dx, this.dy));
      this.emit('panning');
      this.setCursor('grab');
    } else {
      this.setCursor('pointer');
    }

    const now = Date.now();
    if (!this.lastUpdatedTime || Math.abs(this.lastUpdatedTime - now) < 100) {
      return;
    }
    this.lastUpdatedTime = now;

    const objects = canvas.getObjects() as ExtendedFabricObject[];
    let hasKeepZoom = false;
    for (let i = 0; i < objects.length; i += 1) {
      const object = objects[i];
      if (object?.keepOnZoom) {
        object.set('scaleX', 1.0 / this.zoom);
        object.set('scaleY', 1.0 / this.zoom);
        object.setCoords();
        hasKeepZoom = true;
        this.emit(`${object.class}scaling`, object);
      }
    }
    if (hasKeepZoom) canvas.requestRenderAll();
  }

  panzoom(e: PanZoomEvent): void {
    const { width = 0, height = 0 } = this.canvas;
    const zoom = clamp(-e.dz, -height * 0.75, height * 0.75) / height;

    const prevZoom = 1 / this.zoom;
    let curZoom = prevZoom * (1 - zoom);
    curZoom = clamp(curZoom, this.minZoom, this.maxZoom);

    let { x, y } = this.center;

    // pan
    const oX = 0.5;
    const oY = 0.5;
    if (this.isGrabMode() || e.isRight) {
      x -= prevZoom * e.dx;
      y += prevZoom * e.dy;
      this.setCursor('grab');
    } else {
      this.setCursor('pointer');
    }

    if (this.zoomEnabled) {
      let tx, ty;
      if (this.grid && this.grid.zoomOverMouse) {
        // Zoom centered on mouse position
        tx = e.x / width - oX;
        ty = oY - e.y / height;
      } else {
        // Zoom centered on viewport center
        tx = 0;
        ty = 0;
      }
      x -= width * (curZoom - prevZoom) * tx;
      y -= height * (curZoom - prevZoom) * ty;
    }

    this.center.setX(x);
    this.center.setY(y);
    this.zoom = 1 / curZoom;
    this.dx = e.dx;
    this.dy = e.dy;
    this.x = e.x0;
    this.y = e.y0;
    this.isRight = e.isRight;

    this.update();
  }

  setView(view: PointLike): void {
    this.dx = 0;
    this.dy = 0;
    this.x = 0;
    this.y = 0;
    view.y *= -1;

    const dx = this.center.x - view.x;
    const dy = -this.center.y + view.y;

    this.center.copy(view);

    this.canvas.relativePan(new Point(dx * this.zoom, dy * this.zoom));

    this.canvas.renderAll();

    this.update();

    setTimeout(() => {
      this.update();
    }, 0);
  }

  setOriginPin(corner: OriginPinType): void {
    this.originPin = corner;
    if (this.grid) {  
      this.grid.setOriginPin(corner);
    }
  }

  setPinMargin(margin: number): void {
    this.pinMargin = margin;
    if (this.grid) {
      this.grid.setPinMargin(margin);
    }
  }

  setZoomOverMouse(followMouse: boolean): void {
    this.zoomOverMouse = followMouse;
    if (this.grid) {
      this.grid.setZoomOverMouse(followMouse);
    }
  }

  registerListeners(): void {
    const vm = this;

    this.canvas.on('object:scaling', (e: ExtendedFabricEvent) => {
      if (!e.target) return;
      if (e.target.class) {
        vm.emit(`${e.target.class}:scaling`, e.target.parent);
        e.target.parent.emit('scaling', e.target.parent);
        return;
      }
      const group = e.target as ExtendedFabricGroup;
      if (!group.getObjects) return;

      const objects = group.getObjects() as ExtendedFabricObject[];
      group.removeWithUpdate(e.target);
      for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];
        if (object) {
          object.orgYaw = object.parent?.yaw || 0;
          object.fire('moving', object.parent);
          vm.emit(`${object.class}:moving`, object.parent);
        }
      }
      vm.update();
      vm.canvas.requestRenderAll();
    });

    this.canvas.on('object:rotating', (e: ExtendedFabricEvent) => {
      if (!e.target) return;
      if (e.target.class) {
        vm.emit(`${e.target.class}:rotating`, e.target.parent, e.target.angle);
        e.target.parent.emit('rotating', e.target.parent, e.target.angle);
        return;
      }
      const group = e.target as ExtendedFabricGroup;
      if (!group.getObjects) return;
      const objects = group.getObjects() as ExtendedFabricObject[];
      for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];
        if (object) {
          if (object.class === 'marker') {
            object._set('angle', -(group.angle || 0));
            object.parent.yaw = -(group.angle || 0) + (object.orgYaw || 0);
            object.fire('moving', object.parent);
            vm.emit(`${object.class}:moving`, object.parent);
          object.fire('rotating', object.parent);
          vm.emit(`${object.class}:rotating`, object.parent);
          }
        }
      }
      this.update();
    });

    this.canvas.on('object:moving', (e: ExtendedFabricEvent) => {
      if (!e.target) return;
      if (e.target.class) {
        vm.emit(`${e.target.class}:moving`, e.target.parent);
        e.target.parent.emit('moving', e.target.parent);
        return;
      }
      const group = e.target as ExtendedFabricGroup;
      if (!group.getObjects) return;
      const objects = group.getObjects() as ExtendedFabricObject[];
      for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];
        if (object) {
          if (object.class) {
            object.fire('moving', object.parent);
            vm.emit(`${object.class}:moving`, object.parent);
          }
        }
      }
      this.update();
    });

    this.canvas.on('object:moved', (e: ExtendedFabricEvent) => {
      if (!e.target) return;
      if (e.target.class) {
        vm.emit(`${e.target.class}dragend`, e);
        vm.emit(`${e.target.class}:moved`, e.target.parent);
        e.target.parent.emit('moved', e.target.parent);
        this.update();
        return;
      }
      const group = e.target as ExtendedFabricGroup;
      if (!group.getObjects) return;
      const objects = group.getObjects() as ExtendedFabricObject[];
      for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];
        if (object) {
          if (object.class) {
            object.fire('moved', object.parent);
            vm.emit(`${object.class}:moved`, object.parent);
          }
        }
      }
      this.update();
    });

    window.addEventListener('resize', () => {
      vm.onResize();
    });
  }

  unregisterListeners(): void {
    this.canvas.off('object:moving');
    this.canvas.off('object:moved');
  }

  getMarkerById(id: string): any | null {
    const objects = this.canvas.getObjects() as ExtendedFabricObject[];
    for (let i = 0; i < objects.length; i += 1) {
      const obj = objects[i];
      if (obj) {
        if (obj.class === 'marker' && obj.parent?.id === id) {
          return obj.parent;
        }
      }
    }
    return null;
  }

  getMarkers(): any[] {
    const list: any[] = [];
    const objects = this.canvas.getObjects() as ExtendedFabricObject[];
    for (let i = 0; i < objects.length; i += 1) {
      const obj = objects[i];
      if (obj) {
        if (obj.class === 'marker') {
          list.push(obj.parent);
        }
      }
    }
    return list;
  }

  // Methods from ModesMixin that we use but need to declare for TypeScript
  isGrabMode(): boolean {
    return true; // Implementation provided by mixin
  }
}

export const map = (container: HTMLElement | string, options?: MapOptions): Map => new Map(container, options);
