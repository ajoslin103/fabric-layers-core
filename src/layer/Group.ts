import { Group as FabricGroup, Object as FabricObject, IGroupOptions } from 'fabric';
import { Point } from '../geometry/Point';

export interface GroupOptions extends IGroupOptions {
  [key: string]: any; // Allow additional properties
}

export class Group extends FabricGroup {
  /**
   * Create a new Group
   * @param objects - The fabric objects to group
   * @param options - Configuration options
   */
  constructor(objects?: FabricObject[], options: GroupOptions = {}) {
    super(objects || [], options);
  }

  /**
   * Get the bounding coordinates of the group
   * @returns Array of points representing the bounds
   */
  getBounds(): Point[] {
    const coords: Point[] = [];
    coords.push(new Point(this.left - this.width / 2.0, this.top - this.height / 2.0));
    coords.push(new Point(this.left + this.width / 2.0, this.top + this.height / 2.0));
    return coords;
  }
}

/**
 * Factory function to create a new Group
 * @param objects - The fabric objects to group
 * @param options - Configuration options
 * @returns A new Group instance
 */
export const group = (objects?: FabricObject[], options: GroupOptions = {}): Group => 
  new Group(objects, options);

export default Group;
