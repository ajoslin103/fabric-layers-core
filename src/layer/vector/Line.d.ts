import { fabric } from 'fabric';

export declare class Line extends fabric.Line {
  constructor(points: number[], options?: any);
  _strokeWidth: number;
  _renderStroke(ctx: CanvasRenderingContext2D): void;
}

export declare const line: (points: number[], options?: any) => Line;
export default Line;
