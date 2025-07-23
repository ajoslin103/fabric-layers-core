import { Canvas, Circle, Line, Text, IEvent } from 'fabric';
import { Point, PointLike } from '../geometry/Point';
import { Map } from '../map/Map';

export interface MeasurerOptions {
  map: Map;
  start: PointLike;
  end: PointLike;
  scale?: number;
  stroke?: string;
  fill?: string;
  radius?: number;
  hasBorders?: boolean;
  selectable?: boolean;
  hasControls?: boolean;
  class?: string;
}

export interface MeasurerShapeOptions {
  left: number;
  top: number;
  strokeWidth: number;
  radius: number;
  fill: string;
  stroke: string;
  hasControls: boolean;
  hasBorders: boolean;
}

export class Measurer {
  protected options: MeasurerOptions;
  public start: Point;
  public end: Point;
  public canvas: Canvas;
  public completed: boolean = false;

  // Fabric objects
  protected objects?: (Line | Text | Circle)[];
  protected line?: Line;
  protected text?: Text;
  protected circle1?: Circle;
  protected circle2?: Circle;
  protected circle11?: Circle;
  protected circle22?: Circle;

  constructor(options: MeasurerOptions) {
    // Set default options
    this.options = {
      hasBorders: false,
      selectable: false,
      hasControls: false,
      class: 'measurer',
      scale: 1,
      ...options
    };

    this.start = new Point(this.options.start);
    this.end = new Point(this.options.end);
    this.canvas = this.options.map.canvas;

    if (!this.start || !this.end) {
      throw new Error('start and end must be defined');
    }

    this.draw();
  }

  /**
   * Remove all measurement objects from canvas
   */
  protected clear(): void {
    if (this.objects) {
      this.objects.forEach(object => {
        this.canvas.remove(object);
      });
    }
  }

  /**
   * Draw measurement objects on canvas
   */
  protected draw(): void {
    this.clear();

    const start = new Point(this.start);
    const end = new Point(this.end);
    const center = start.add(end).multiply(0.5);

    // Create line
    this.line = new Line([start.x, start.y, end.x, end.y], {
      stroke: this.options.stroke || '#3e82ff',
      hasControls: false,
      hasBorders: false,
      selectable: false,
      evented: false,
      strokeDashArray: [5, 5],
    });

    // Create circle options
    const lineEndOptions: MeasurerShapeOptions = {
      left: start.x,
      top: start.y,
      strokeWidth: 1,
      radius: this.options.radius || 1,
      fill: this.options.fill || '#3e82ff',
      stroke: this.options.stroke || '#3e82ff',
      hasControls: false,
      hasBorders: false,
    };

    const lineEndOptions2: MeasurerShapeOptions = {
      ...lineEndOptions,
      radius: this.options.radius || 5,
      fill: this.options.fill || '#3e82ff33',
    };

    // Create circles
    this.circle1 = new Circle(lineEndOptions2);
    this.circle2 = new Circle({
      ...lineEndOptions2,
      left: end.x,
      top: end.y,
    });

    this.circle11 = new Circle(lineEndOptions);
    this.circle22 = new Circle({
      ...lineEndOptions,
      left: end.x,
      top: end.y,
    });

    // Create text label
    let text = Math.round(start.distanceFrom(end));
    text = `${text / 100} m`;
    this.text = new Text(text, {
      textBackgroundColor: 'black',
      fill: 'white',
      left: center.x,
      top: center.y - 10,
      fontSize: 12,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      evented: false,
    });

    // Add all objects to canvas
    this.objects = [this.line, this.text, this.circle11, this.circle22, this.circle1, this.circle2];
    this.objects.forEach(object => {
      this.canvas.add(object);
    });

    this.registerListeners();
  }

  /**
   * Update start point and redraw
   * @param start - New start point
   */
  public setStart(start: PointLike): void {
    this.start = new Point(start);
    this.draw();
  }

  /**
   * Update end point and redraw
   * @param end - New end point
   */
  public setEnd(end: PointLike): void {
    this.end = new Point(end);
    this.draw();
  }

  /**
   * Mark measurement as complete
   */
  public complete(): void {
    this.completed = true;
  }

  /**
   * Register event listeners for interactive measurement
   */
  protected registerListeners(): void {
    this.circle2?.on('moving', (e: IEvent) => {
      if (e.pointer) {
        this.setEnd(e.pointer);
      }
    });

    this.circle1?.on('moving', (e: IEvent) => {
      if (e.pointer) {
        this.setStart(e.pointer);
      }
    });
  }

  /**
   * Apply scale factor to measurement points
   * @param scale - Scale factor to apply
   */
  public applyScale(scale: number): void {
    this.start = new Point(
      this.start.x * scale,
      this.start.y * scale
    );
    this.end = new Point(
      this.end.x * scale,
      this.end.y * scale
    );
    this.draw();
  }
}

export default Measurer;
