import { fabric } from 'fabric';
const { Point: FabricPoint } = fabric;

// Type definition for a point-like object
export interface PointLike {
  x: number;
  y: number;
}

/**
 * Point class extending fabric.Point with additional functionality
 */
export class Point extends FabricPoint {
  /**
   * Create a new Point instance
   * @param x - X coordinate or point object/array
   * @param y - Y coordinate if first parameter is a number
   */
  constructor(
    x?: number | PointLike | [number, number],
    y?: number
  ) {
    let xCoord = 0;
    let yCoord = 0;

    if (arguments.length > 1) {
      xCoord = Number(x) || 0;
      yCoord = Number(y) || 0;
    } else if (!x) {
      [xCoord, yCoord] = [0, 0];
    } else if (typeof x === 'object') {
      if ('x' in x && 'y' in x) {
        xCoord = Number(x.x) || 0;
        yCoord = Number(x.y) || 0;
      } else if (Array.isArray(x) && x.length >= 2) {
        xCoord = Number(x[0]) || 0;
        yCoord = Number(x[1]) || 0;
      }
    }

    super(xCoord, yCoord);
  }

  /**
   * Set the X coordinate
   * @param x - The X coordinate
   */
  setX(x: number): void {
    this.x = Number(x) || 0;
  }

  /**
   * Set the Y coordinate
   * @param y - The Y coordinate
   */
  setY(y: number): void {
    this.y = Number(y) || 0;
  }

  /**
   * Copy coordinates from another point
   * @param point - The point to copy from
   */
  copy(point: PointLike): void {
    if (point && typeof point === 'object' && 'x' in point && 'y' in point) {
      this.x = Number(point.x) || 0;
      this.y = Number(point.y) || 0;
    }
  }

  /**
   * Get coordinates as an array
   * @returns Array containing [x, y] coordinates
   */
  getArray(): [number, number] {
    return [this.x, this.y];
  }
}

/**
 * Factory function to create a new Point
 * @param x - X coordinate or point object/array
 * @param y - Y coordinate if first parameter is a number
 * @returns A new Point instance
 */
export const point = (
  x?: number | PointLike | [number, number],
  y?: number
): Point => new Point(x, y);
