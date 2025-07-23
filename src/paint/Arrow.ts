import { Group, Object as FabricObject, Point as FabricPoint, Polyline, IGroupOptions } from 'fabric-pure-browser';
import ArrowHead from './ArrowHead';
import { PointLike } from '../geometry/Point';

export interface ArrowOptions extends IGroupOptions {
  strokeWidth?: number;
  stroke?: string;
  class?: string;
  [key: string]: any; // Additional fabric.js properties
}

export class Arrow extends Group {
  protected pointArray: PointLike[];
  protected options: ArrowOptions;
  protected head?: ArrowHead;
  protected polyline?: Polyline;
  protected lastAngle?: number;
  protected strokeWidth: number;

  /**
   * Create a new Arrow
   * @param point - Starting point of the arrow
   * @param options - Configuration options
   */
  constructor(point: PointLike, options: ArrowOptions = {}) {
    // Set default options
    const arrowOptions: ArrowOptions = {
      strokeWidth: options.strokeWidth || 5,
      stroke: options.stroke || '#7db9e8',
      class: 'arrow',
      ...options,
      evented: false
    };

    super([], arrowOptions);

    this.pointArray = [point, { ...point }];
    this.options = arrowOptions;
    this.strokeWidth = arrowOptions.strokeWidth || 5;
    this.draw();
  }

  /**
   * Draw or redraw the arrow
   */
  protected draw(): void {
    // Remove existing shapes if they exist
    if (this.head) {
      this.remove(this.head);
    }

    if (this.polyline) {
      this.remove(this.polyline);
    }

    // Create arrow line
    this.polyline = new Polyline(
      this.pointArray,
      {
        ...this.options,
        strokeLineJoin: 'round',
        fill: false
      }
    );

    this.addWithUpdate(this.polyline);

    // Create arrow head
    const lastPoints = this.getLastPoints();
    const p1 = new FabricPoint(lastPoints[0], lastPoints[1]);
    const p2 = new FabricPoint(lastPoints[2], lastPoints[3]);
    const distance = p1.distanceFrom(p2);
    console.log(`distance = ${distance}`);

    this.head = new ArrowHead(
      lastPoints,
      {
        ...this.options,
        headLength: this.strokeWidth * 2,
        lastAngle: distance <= 10 ? this.lastAngle : undefined
      }
    );

    if (distance > 10) {
      this.lastAngle = this.head.angle;
    }
    this.addWithUpdate(this.head);
  }

  /**
   * Add a new point to the arrow path
   * @param point - New point to add
   */
  public addPoint(point: PointLike): void {
    this.pointArray.push(point);
    this.draw();
  }

  /**
   * Update the last point in the arrow path
   * @param point - New position for the last point
   */
  public addTempPoint(point: PointLike): void {
    const len = this.pointArray.length;
    const lastPoint = this.pointArray[len - 1];
    lastPoint.x = point.x;
    lastPoint.y = point.y;
    this.draw();
  }

  /**
   * Get the coordinates of the last two points
   * @returns Array of coordinates [x1, y1, x2, y2]
   */
  protected getLastPoints(): [number, number, number, number] {
    const len = this.pointArray.length;
    const point1 = this.pointArray[len - 2];
    const point2 = this.pointArray[len - 1];
    return [point1.x, point1.y, point2.x, point2.y];
  }

  /**
   * Set the color of all arrow components
   * @param color - New color to apply
   */
  public setColor(color: string): void {
    this._objects.forEach(obj => {
      if (typeof (obj as any).setColor === 'function') {
        (obj as any).setColor(color);
      }
    });
  }
}

/**
 * Factory function to create a new Arrow
 * @param points - Starting point of the arrow
 * @param options - Configuration options
 * @returns A new Arrow instance
 */
export const arrow = (point: PointLike, options?: ArrowOptions): Arrow => 
  new Arrow(point, options);

export default Arrow;
