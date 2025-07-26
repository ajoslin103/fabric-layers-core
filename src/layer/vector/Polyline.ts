import { fabric } from 'fabric';
import { Layer, LayerOptions } from '../Layer';
import { Point, PointLike } from '../../geometry/Point';
import { Group } from '../Group';
import { ExtendedFabricObject } from '../../types/fabric-extensions';

export interface PolylineOptions extends LayerOptions {
  strokeWidth?: number;
  stroke?: string;
  fill?: boolean | string;
}

export interface LineOptions {
  strokeWidth: number;
  stroke: string;
  fill: boolean | string;
}

export class Polyline extends Layer {
  public points: Point[] = [];
  public lines: fabric.Line[] = [];
  public lineOptions: LineOptions;
  public shape!: ExtendedFabricObject; // Type as ExtendedFabricObject to match parent class
  private _shapeGroup: Group; // Store the actual Group instance separately
  public strokeWidth: number;
  protected _points: PointLike[];

  constructor(_points?: PointLike[], options: PolylineOptions = {}) {
    const opts: PolylineOptions = {
      points: _points || [],
      ...options
    };
    super(opts);
    
    this._points = _points || [];
    this.lines = [];
    this.class = 'polyline';
    this.strokeWidth = 1;

    this.lineOptions = {
      strokeWidth: this.strokeWidth,
      stroke: options.stroke || 'grey',
      fill: options.fill || false
    };

    // Create a Group for the shape
    this._shapeGroup = new Group([], {
      selectable: false,
      hasControls: false,
      class: this.class,
      parent: this
    });
    
    // Assign the group to shape with type assertion
    this.shape = this._shapeGroup as unknown as ExtendedFabricObject;

    this.setPoints(this._points);
  }

  addPoint(point?: PointLike): void {
    if (point) {
      this.points.push(new Point(point));
    }

    if (this.points.length > 1) {
      const i = this.points.length - 1;
      const j = this.points.length - 2;
      const p1 = this.points[i];
      const p2 = this.points[j];
      
      // Ensure both points exist before creating a line
      if (p1 && p2) {
        const line = new fabric.Line(
          [...p1.getArray(), ...p2.getArray()], 
          this.lineOptions as fabric.ILineOptions
        );
        this.lines.push(line);
        this._shapeGroup.addWithUpdate(line);
      }
    }
  }

  setStrokeWidth(strokeWidth: number): void {
    this.lines.forEach(line => {
      line.set('strokeWidth', strokeWidth);
    });
  }

  setPoints(points: PointLike[] = []): void {
    this.removeLines();
    this.points = [];
    for (let i = 0; i < points.length; i += 1) {
      const point = new Point(points[i]);
      this.points.push(point);
      this.addPoint();
    }
  }

  removeLines(): void {
    for (let i = 0; i < this.lines.length; i += 1) {
      this._shapeGroup.remove(this.lines[i] as fabric.Object);
    }
    this.lines = [];
  }
}

export const polyline = (points?: PointLike[], options?: PolylineOptions): Polyline => 
  new Polyline(points, options);

export default Polyline;
