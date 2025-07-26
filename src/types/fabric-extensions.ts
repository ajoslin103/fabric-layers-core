import { fabric } from 'fabric';

/**
 * Extended fabric Canvas that includes properties present at runtime but missing from TypeScript definitions
 */
export interface ExtendedFabricCanvas extends fabric.Canvas {
  wrapperEl?: HTMLElement;
  getContext(contextId?: string): CanvasRenderingContext2D;
  _objects: ExtendedFabricObject[];
}
/**
 * Extended fabric Object that includes properties used in our application
 */
export interface ExtendedFabricObject extends fabric.Object {
  zIndex?: number;
  orgYaw?: number;
  keepOnZoom?: boolean;
  class?: string;
  parent?: any;
  // Line properties
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

/**
 * Extended fabric Group with additional methods and properties
 */
export interface ExtendedFabricGroup extends ExtendedFabricObject, fabric.Group {
  getObjects(): ExtendedFabricObject[];
  removeWithUpdate(obj: fabric.Object): fabric.Group;
  angle?: number;
}

/**
 * Extended fabric event type
 */
export interface ExtendedFabricEvent extends fabric.IEvent {
  target?: ExtendedFabricObject;
}
