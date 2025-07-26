import { fabric } from 'fabric';
import { Layer, LayerOptions } from './Layer';
import { Point, PointLike } from '../geometry/Point';
import { ExtendedFabricGroup } from '../types/fabric-extensions';

export interface TooltipOptions extends LayerOptions {
  content?: string;
  size?: number;
  textColor?: string;
  fill?: string;
  stroke?: string;
  position?: PointLike;
}

export interface TooltipStyle extends LayerOptions {
  left: number;
  top: number;
  [key: string]: any;
}

export class Tooltip extends Layer {
  public content: string;
  public size: number;
  public textColor: string;
  public fill: string;
  public stroke: string;
  public position: Point;
  protected textObj?: fabric.Text;
  // public shape!: Group; // Inherited from Layer

  /**
   * Create a new Tooltip
   * @param position - The tooltip position
   * @param options - Configuration options
   */
  constructor(position: PointLike, options: TooltipOptions = {}) {
    // Set default options
    const tooltipOptions: TooltipOptions = {
      zIndex: options.zIndex || 300,
      keepOnZoom: true,
      position: new Point(position),
      class: 'tooltip',
      ...options
    };
    super(tooltipOptions);

    // Initialize properties with defaults
    this.content = options.content || '';
    this.size = options.size || 10;
    this.textColor = options.textColor || 'black';
    this.fill = options.fill || 'white';
    this.stroke = options.stroke || 'red';
    this.position = new Point(position);

    // Update style with position
    Object.assign(this.style, {
      left: this.position.x,
      top: this.position.y
    } as TooltipStyle);

    // Create text object if content is provided
    if (this.content) {
      this.textObj = new fabric.Text(this.content, {
        fontSize: this.size,
        fill: this.textColor
      });
    }

    this.init();
  }

  /**
   * Initialize the tooltip shape
   */
  protected init(): void {
    const objects = [];
    if (this.textObj) {
      objects.push(this.textObj);
    }
    this.shape = new fabric.Group(objects, this.style) as ExtendedFabricGroup;
    
    // Use Promise instead of process.nextTick for browser compatibility
    Promise.resolve().then(() => {
      this.emit('ready');
    });
  }
}

/**
 * Factory function to create a new Tooltip
 * @param position - The tooltip position
 * @param options - Configuration options
 * @returns A new Tooltip instance
 */
export const tooltip = (position: PointLike, options?: TooltipOptions): Tooltip => 
  new Tooltip(position, options);

export default Tooltip;
