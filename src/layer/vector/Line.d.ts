import { fabric } from 'fabric';
import { ExtendedFabricObject } from '../../map/Map';

export interface LineOptions extends fabric.ILineOptions {
  strokeWidth?: number;
  class?: string;
  zIndex?: number;
  keepOnZoom?: boolean;
  parent?: fabric.Object;
}

export declare class Line extends fabric.Line implements ExtendedFabricObject {
  constructor(points: number[], options?: LineOptions);
  _strokeWidth: number;
  _renderStroke(ctx: CanvasRenderingContext2D): void;
  
  // ExtendedFabricObject properties
  zIndex?: number;
  keepOnZoom?: boolean;
  class?: string;
  parent?: fabric.Object;
}

export declare const line: (points: number[], options?: LineOptions) => Line;
export default Line;
