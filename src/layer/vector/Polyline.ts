import { fabric } from 'fabric';
import { Layer, LayerOptions } from '../Layer';
import { Point, PointLike } from '../../geometry/Point';
import { Group } from '../Group';

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
  public shape: Group;
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
      stroke: this.color || 'grey',
      fill: this.fill || false
    };

    this.shape = new Group([], {
      selectable: false,
      hasControls: false,
      class: this.class,
      parent: this
    });

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
      const line = new fabric.Line(
        [...p1.getArray(), ...p2.getArray()], 
        this.lineOptions
      );
      this.lines.push(line);
      this.shape.addWithUpdate(line);
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
      this.shape.remove(this.lines[i]);
    }
    this.lines = [];
  }
}

export const polyline = (points?: PointLike[], options?: PolylineOptions): Polyline => 
  new Polyline(points, options);

export default Polyline;
