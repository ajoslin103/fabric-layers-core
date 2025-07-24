import { fabric } from 'fabric';
const { Triangle } = fabric;

export interface ArrowHeadOptions {
  headLength?: number;
  stroke?: string;
  lastAngle?: number;
}

/**
 * Triangle-shaped arrow head that can be attached to lines
 */
export class ArrowHead extends Triangle {
  /**
   * Create a new ArrowHead
   * @param points - Array of points [x1, y1, x2, y2] defining arrow direction
   * @param options - Configuration options
   */
  constructor(points: [number, number, number, number], options: ArrowHeadOptions = {}) {
    // Set default options
    const arrowOptions = {
      headLength: options.headLength || 10,
      stroke: options.stroke || '#207cca'
    };

    // Calculate arrow angle
    const [x1, y1, x2, y2] = points;
    const dx = x2 - x1;
    const dy = y2 - y1;
    let angle = Math.atan2(dy, dx);

    // Convert to degrees and adjust
    angle *= 180 / Math.PI;
    angle += 90;

    // Use provided angle if available
    if (options.lastAngle !== undefined) {
      angle = options.lastAngle;
      console.log(`Angle: ${angle}`);
    }

    // Initialize triangle with calculated properties
    super({
      angle,
      fill: arrowOptions.stroke,
      top: y2,
      left: x2,
      height: arrowOptions.headLength,
      width: arrowOptions.headLength,
      originX: 'center',
      originY: 'center',
      selectable: false
    });
  }
}

/**
 * Factory function to create a new ArrowHead
 * @param points - Array of points defining arrow direction
 * @param options - Configuration options
 * @returns A new ArrowHead instance
 */
export const arrowHead = (
  points: [number, number, number, number],
  options?: ArrowHeadOptions
): ArrowHead => new ArrowHead(points, options);

export default ArrowHead;
