import { fabric } from 'fabric';
import { Point } from '../geometry/Point';
import { ExtendedFabricObject } from '../types/fabric-extensions';

export interface GroupOptions extends fabric.IGroupOptions {
  zIndex?: number;
  orgYaw?: number;
  keepOnZoom?: boolean;
  class?: string;
  parent?: any;
  [key: string]: any; // Allow additional properties
}

export class Group extends fabric.Group implements ExtendedFabricObject {
  /**
   * Create a new Group
   * @param objects - The fabric objects to group
   * @param options - Configuration options
   */
  constructor(objects?: fabric.Object[], options: GroupOptions = {}) {
    super(objects || [], options);
  }

  /**
   * Get the bounding coordinates of the group
   * @returns Array of points representing the bounds
   */
  getBounds(): Point[] {
    const coords: Point[] = [];
    const left = this.left ?? 0;
    const top = this.top ?? 0;
    const width = this.width ?? 0;
    const height = this.height ?? 0;
    
    coords.push(new Point(left - width / 2.0, top - height / 2.0));
    coords.push(new Point(left + width / 2.0, top + height / 2.0));
    return coords;
  }
}

/**
 * Factory function to create a new Group
 * @param objects - The fabric objects to group
 * @param options - Configuration options
 * @returns A new Group instance
 */
export const group = (objects?: fabric.Object[], options: GroupOptions = {}): Group => 
  new Group(objects, options);

export default Group;
