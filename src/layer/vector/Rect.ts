import { fabric } from 'fabric';

export interface RectOptions extends fabric.IRectOptions {
  strokeWidth?: number;
  class?: string;
}

export class Rect extends fabric.Rect {
  protected _strokeWidth: number;

  constructor(points: any, options?: RectOptions) {
    const opts: RectOptions = options || {};
    opts.strokeWidth = opts.strokeWidth || 1;
    opts.class = 'rect';
    const [ [top, left], [width, height] ] = points;
    super({ ...opts, top, left, width, height });
    this._strokeWidth = opts.strokeWidth || 1;
  }

  _renderStroke(ctx: CanvasRenderingContext2D): void {
    this.strokeWidth = this._strokeWidth / (this.canvas?.getZoom() || 1);
    super._renderStroke(ctx);
  }
}

export const rect = (points: any, options?: RectOptions): Rect => new Rect(points, options);

export default Rect;
