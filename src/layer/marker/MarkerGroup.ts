import { Rect } from '../vector/Rect';
import { Layer, LayerOptions } from '../Layer';

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
    
    this.draw();
  }

  setBounds(bounds: Bounds): void {
    this.bounds = bounds;
    this.draw();
  }

  draw(): void {
    if (!this.bounds) return;
    if (!this.bounds[0] || !this.bounds[1]) return;

    const width = this.bounds[1][0] - this.bounds[0][0];
    const height = this.bounds[1][1] - this.bounds[0][1];
    
    this.coords = {
      left: this.bounds[0][0] + width / 2,
      top: this.bounds[0][1] + height / 2,
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
      this.shape = new Rect(this.style);
    }
  }
}

export const markerGroup = (bounds: Bounds, options?: MarkerGroupOptions): MarkerGroup => 
  new MarkerGroup(bounds, options);

export default MarkerGroup;
