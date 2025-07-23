import GridDefaults from './Grid';

export interface AxisOptions extends Partial<GridDefaults> {
  width?: number;
  height?: number;
  zoom?: number;
  offset?: number;
  range?: number;
  disabled?: boolean;
}

/**
 * Represents an axis in the grid system (either X or Y)
 */
class Axis {
  // Required properties
  public orientation: 'x' | 'y';
  public width: number = 0;
  public height: number = 0;
  public zoom: number = 1;
  public offset: number = 0;
  public range: number = 0;

  // Optional properties from GridDefaults
  public color?: string;
  public lineWidth?: number;
  public axisWidth?: number;
  public axisColor?: number | string;
  public fontFamily?: string;
  public fontSize?: string | number;
  public padding?: number | number[];
  public lineColor?: number | boolean | string | ((state: any) => (string | null)[]);
  public lines?: boolean | ((state: any) => number[]);
  public ticks?: boolean | number | number[] | ((state: any) => number[]);
  public labels?: boolean | string[] | ((state: any) => (string | null)[]);
  public axis?: boolean;
  public axisOrigin?: number;
  public disabled?: boolean;
  public distance?: number;
  public steps?: number[];

  /**
   * Create a new Axis
   * @param orientation - The axis orientation ('x' or 'y')
   * @param options - Configuration options for the axis
   */
  constructor(orientation: 'x' | 'y', options: AxisOptions = {}) {
    Object.assign(this, options);
    this.orientation = orientation;
  }

  /**
   * Get coordinate values for rendering
   * @param values - Array of values to convert to coordinates
   * @returns Array of coordinates [x1, y1, x2, y2, ...]
   */
  getCoords(values?: number[]): number[] {
    const coords: number[] = [];
    if (!values) return coords;

    for (let i = 0; i < values.length; i += 1) {
      const t = this.getRatio(values[i] || 0);
      coords.push(t);
      coords.push(0);
      coords.push(t);
      coords.push(1);
    }
    return coords;
  }

  /**
   * Calculate the range of the axis
   * @returns The calculated range
   */
  getRange(): number {
    let len = this.width;
    if (this.orientation === 'y') len = this.height;
    return len * this.zoom;
  }

  /**
   * Calculate the ratio for a given value
   * @param value - The value to calculate ratio for
   * @returns The calculated ratio
   */
  getRatio(value: number): number {
    return (value - this.offset) / this.range;
  }

  /**
   * Set the offset value
   * @param offset - The new offset value
   */
  setOffset(offset: number): void {
    this.offset = offset;
  }

  /**
   * Update axis properties
   * @param options - New properties to apply
   */
  update(options: Partial<AxisOptions> = {}): void {
    Object.assign(this, options);
    this.range = this.getRange();
  }
}

export default Axis;
