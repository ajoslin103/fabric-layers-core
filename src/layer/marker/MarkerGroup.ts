import { fabric } from 'fabric';
import { Rect } from '../vector/Rect';
import { Layer, LayerOptions } from '../Layer';
import { ExtendedFabricObject } from '../../types/fabric-extensions';

export type Bounds = number[][];

export interface MarkerGroupOptions extends LayerOptions {
  bounds?: Bounds;
  stroke?: string;
  color?: string;
}

export interface MarkerGroupCoords {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class MarkerGroup extends Layer {
  public bounds: Bounds;
  public stroke?: string;
  public color?: string;
  public coords: MarkerGroupCoords;
  public style: any;
  // shape property is inherited from Layer class

  constructor(bounds: Bounds, options: MarkerGroupOptions = {}) {
    options.bounds = bounds;
    options.zIndex = options.zIndex || 50;
    options.class = 'markergroup';
    super(options);

    if (!bounds) {
      console.error('bounds is missing!');
      throw new Error('Bounds is required for MarkerGroup');
    }

    this.bounds = bounds;
    this.stroke = options.stroke;
    this.color = options.color;
    
    this.style = {
      strokeWidth: 1,
      stroke: this.stroke || 'black',
      fill: this.color || '#88888822',
      class: this.class,
      zIndex: this.zIndex,
      parent: this
    };

    // Initialize coords with default values
    this.coords = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    
    // Initialize shape with a default Rect as required by the Layer base class
    // This will be updated in the draw() method
    this.shape = new Rect({
      ...this.style,
      width: 0,
      height: 0
    }) as unknown as ExtendedFabricObject;
    
    this.draw();
  }

  setBounds(bounds: Bounds): void {
    this.bounds = bounds;
    this.draw();
  }

  draw(): void {
    if (!this.bounds) return;
    if (!this.bounds[0] || !this.bounds[1]) return;
    
    const bounds0 = this.bounds[0];
    const bounds1 = this.bounds[1];
    
    if (!Array.isArray(bounds0) || bounds0.length < 2 ||
        !Array.isArray(bounds1) || bounds1.length < 2) {
      return;
    }
    
    const x0 = bounds0[0];
    const y0 = bounds0[1];
    const x1 = bounds1[0];
    const y1 = bounds1[1];
    
    if (typeof x0 !== 'number' || typeof y0 !== 'number' || 
        typeof x1 !== 'number' || typeof y1 !== 'number') {
      return;
    }
    
    const width = x1 - x0;
    const height = y1 - y0;
    
    this.coords = {
      left: x0 + width / 2,
      top: y0 + height / 2,
      width,
      height
    };

    if (this.shape) {
      this.shape.set(this.coords);
    } else {
      if (!this.style) {
        this.style = {}; // Initialize with defaults if undefined
      }
      Object.assign(this.style, this.coords);
      // Use fabric.Rect directly with casting to match the Layer class implementation
      this.shape = new fabric.Rect(this.style) as ExtendedFabricObject;
    }
  }
}

export const markerGroup = (bounds: Bounds, options?: MarkerGroupOptions): MarkerGroup => 
  new MarkerGroup(bounds, options);

export default MarkerGroup;
