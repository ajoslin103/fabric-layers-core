import { fabric } from 'fabric';

export interface LineOptions extends fabric.ILineOptions {
  strokeWidth?: number;
  class?: string;
}

export class Line extends fabric.Line {
  protected _strokeWidth: number;

  constructor(points: number[], options?: LineOptions) {
    const opts: LineOptions = options || {};
    opts.strokeWidth = opts.strokeWidth || 1;
    opts.class = 'line';
    super(points, opts);
    this._strokeWidth = opts.strokeWidth || 1;
  }

  _renderStroke(ctx: CanvasRenderingContext2D): void {
    const stroke = this._strokeWidth / (this.canvas?.getZoom() || 1);
    this.strokeWidth = stroke > 0.01 ? stroke : 0.01;
    super._renderStroke(ctx);
    this.setCoords();
  }
}

export const line = (points: number[], options?: LineOptions): Line => new Line(points, options);

export default Line;
