import fabric from 'fabric';
import Base from '../core/Base';
import { Map } from '../map/Map';

/**
 * Style options for a layer's fabric.js object
 */
export interface LayerStyle {
  zIndex: number;
  class?: string;
  parent: Layer;
  keepOnZoom: boolean;
  id?: string;
  hasControls: boolean;
  hasBorders: boolean;
  lockMovementX: boolean;
  lockMovementY: boolean;
  draggable: boolean;
  clickable: boolean;
  evented: boolean;
  selectable: boolean;
  hoverCursor: string;
  moveCursor: string;
  [key: string]: any; // Allow additional fabric.js properties
}

/**
 * Options that can be passed to create a Layer
 */
export interface LayerOptions {
  label?: string;
  draggable?: boolean;
  zIndex?: number;
  opacity?: number;
  keepOnZoom?: boolean;
  clickable?: boolean;
  hoverCursor?: string;
  moveCursor?: string;
  class?: string;
  id?: string;
  [key: string]: any; // Allow additional properties
}

export class Layer extends Base {
  // Properties with default values
  public label: string | null;
  public draggable: boolean;
  public zIndex: number;
  public opacity: number;
  public keepOnZoom: boolean;
  public clickable: boolean;
  public hoverCursor: string;
  public moveCursor: string;
  public class?: string;
  public id?: string;
  public style: LayerStyle;

  // Optional properties
  public shape?: fabric.Object;
  protected _map?: Map;

  constructor(options?: LayerOptions) {
    super(options);

    // Initialize properties with default values
    this.label = options?.label ?? null;
    this.draggable = options?.draggable ?? false;
    this.zIndex = options?.zIndex ?? 1;
    this.opacity = options?.opacity ?? 1;
    this.keepOnZoom = options?.keepOnZoom ?? false;
    this.clickable = options?.clickable ?? false;
    this.class = options?.class;
    this.id = options?.id;

    // Cursor settings
    this.hoverCursor = options?.hoverCursor ?? (this.clickable ? 'pointer' : 'default');
    this.moveCursor = options?.moveCursor ?? 'move';

    // Create style object for fabric.js
    this.style = {
      zIndex: this.zIndex,
      class: this.class,
      parent: this,
      keepOnZoom: this.keepOnZoom,
      id: this.id,
      hasControls: false,
      hasBorders: false,
      lockMovementX: !this.draggable,
      lockMovementY: !this.draggable,
      draggable: this.draggable,
      clickable: this.clickable,
      evented: this.clickable,
      selectable: this.draggable,
      hoverCursor: this.hoverCursor,
      moveCursor: this.moveCursor
    };
  }

  /**
   * Update layer options
   * @param options - Object containing properties to update
   */
  setOptions(options: Partial<LayerStyle>): void {
    if (!this.shape) return;

    Object.keys(options).forEach(key => {
      this.shape!.set(key, options[key]);
    });

    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }

  /**
   * Add or remove this layer from a map
   * @param map - Map instance to add to, or null/undefined to remove from current map
   */
  addTo(map?: Map | null): void {
    if (!map) {
      if (this._map) {
        this._map.removeLayer(this);
      }
      return;
    }
    this._map = map;
    this._map.addLayer(this);
  }
}

/**
 * Factory function to create a new Layer
 * @param options - Layer configuration options
 * @returns A new Layer instance
 */
export const layer = (options?: LayerOptions): Layer => new Layer(options);

export default Layer;
