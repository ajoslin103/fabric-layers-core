import alpha from '../lib/color-alpha';
import Base from '../core/Base';

import {
  clamp,
  almost,
  len,
  parseUnit,
  toPx,
  isObj,
} from '../lib/mumath/index';

import gridStyle from './gridStyle';
import Axis from './Axis';
import { Point, PointLike } from '../geometry/Point';

// Extended Point class that includes zoom for Grid component
class GridPoint extends Point implements GridCenter {
  zoom: number;
  
  constructor(x: number, y: number, zoom: number = 1) {
    super(x, y);
    this.zoom = zoom;
  }
  
  // Create from a GridCenter object
  static fromCenter(center: GridCenter): GridPoint {
    return new GridPoint(center.x, center.y, center.zoom);
  }
}

// Interfaces for grid state and configuration
interface GridCenter {
  x: number;
  y: number;
  zoom: number;
}

interface GridDefaults {
  type: string;
  name: string;
  units: string;
  state: Record<string, any>;

  // Range params
  minZoom: number;
  maxZoom: number;
  min: number;
  max: number;
  offset: number;
  origin: number;
  center: GridCenter;
  zoom: number;
  zoomEnabled: boolean;
  panEnabled: boolean;

  // Pin settings
  pinnedCorner: string;
  pinnedAbsolute: PointLike;
  isPinned: boolean;
  pinMargin: number;

  // Style settings
  labels: boolean;
  fontSize: string;
  fontFamily: string;
  padding: number | number[];
  color: string;

  // Line settings
  lines: boolean | ((state: GridState) => any[]);
  tick: number;
  tickAlign: number;
  lineWidth: number;
  distance: number;
  style: string;
  lineColor: number | boolean | string | ((state: GridState) => (string | null)[]);

  // Axis settings
  axis: boolean;
  axisOrigin: number;
  axisWidth: number;
  axisColor: number | string;

  // Methods
  getCoords: (values: number[], state: GridState) => number[];
  getRatio: (value: number, state: GridState) => number;
  format: (v: number) => string | number;
}

// Export GridState interface for use in other files
export interface GridState {
  coordinate: Axis;
  opposite?: GridState;
  shape: [number, number];
  grid: Grid;
  range: number;
  offset: number;
  zoom: number;
  axisColor: string;
  axisWidth: number;
  lineWidth: number;
  tickAlign: number;
  labelColor: string;
  padding: number[];
  fontSize: number;
  fontFamily: string;
  lines: number[];
  lineColors: (string | null)[];
  ticks: number[];
  labels: (string | number | null)[];
  labelCoords?: number[];
}

interface GridOptions extends Partial<GridDefaults> {
  width?: number;
  height?: number;
  autostart?: boolean;
}

export class Grid extends Base {
  // Canvas elements
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  
  // Grid state
  public state: { x: GridState; y: GridState };
  // Use the extended GridPoint type which includes the zoom property
  public center!: GridPoint;
  public axisX!: Axis;
  public axisY!: Axis;
  
  // Configuration
  public pixelRatio!: number;
  public autostart!: boolean;
  public interactions!: boolean;
  public defaults!: GridDefaults;
  
  // Pin settings
  public isPinned!: boolean;
  public pinnedCorner!: string;
  public pinnedAbsolute!: PointLike;
  public pinMargin!: number;
  public zoomOverMouse!: boolean;

  // Constructor accepts either GridOptions or a Map instance
  constructor(canvas: HTMLCanvasElement, optsOrMap?: GridOptions | any) {
    // If second parameter is a plain object (GridOptions) or undefined, pass it to super
    // Otherwise, assume it's a Map instance and pass an empty object to super
    const isGridOptions = optsOrMap === undefined || 
      (optsOrMap && typeof optsOrMap === 'object' && !('canvas' in optsOrMap));
    
    super(isGridOptions ? optsOrMap : {});
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d')!;
    this.state = {} as { x: GridState; y: GridState };
    this.setDefaults();
    this.update(isGridOptions ? optsOrMap : {});
  }

  setOriginPin(corner: string): void {
    this.isPinned = corner !== 'NONE';
    this.pinnedCorner = corner;
    this.emit('originpin:change', corner);
    this.pinnedAbsolute = { x: this.getPinnedX(), y: this.getPinnedY() };
  }

  setPinMargin(margin: number): void {
    this.pinMargin = margin;
    this.emit('pinmargin:change', margin);
  }

  setZoomOverMouse(followMouse: boolean): void {
    this.zoomOverMouse = followMouse;
    this.emit('zoomovermouse:change', followMouse);
  }

  getPinnedX(): number {
    const { width } = this.canvas;
    const effectiveWidth = width / this.center.zoom;
    const scaledMargin = this.pinMargin / this.center.zoom;
    if (this.pinnedCorner.includes('RIGHT')) {
      return -((effectiveWidth/2) - scaledMargin);
    }
    return ((effectiveWidth/2) - scaledMargin);
  }

  getPinnedY(): number {
    const { height } = this.canvas;
    const effectiveHeight = height / this.center.zoom;
    const scaledMargin = this.pinMargin / this.center.zoom;
    if (this.pinnedCorner.includes('BOTTOM')) { 
      return (effectiveHeight/2) - scaledMargin;
    }
    return -(effectiveHeight/2) + scaledMargin;
  }

  render(): this {
    this.draw();
    return this;
  }

  getCenterCoords(): { x: number; y: number } {
    let state = this.state.x;
    // Ensure shape and padding are defined with default values if needed
    let [width = 0, height = 0] = state.shape || [0, 0];
    // Use default value of 0 for each padding element if undefined
    let [pt = 0, pr = 0, pb = 0, pl = 0] = state.padding || [0, 0, 0, 0];
    
    // Update state on the opposite axis before calling getCoords
    if (state.opposite && 'setState' in state.opposite.coordinate) {
      (state.opposite.coordinate as any).setState(state.opposite);
    }
    
    // Ensure axisOrigin is defined before passing it to getCoords
    const axisOrigin = state.coordinate?.axisOrigin ?? 0;
    let axisCoords = state.opposite?.coordinate.getCoords(
      [axisOrigin]
    ) || [];
    
    // Ensure array element exists before using it
    const axisCoord1 = axisCoords[1] ?? 0;
    const y = pt + axisCoord1 * (height - pt - pb);
    
    // Ensure state.y is not undefined before assignment
    if (this.state.y) {
      state = this.state.y;
      // Ensure shape and padding are also defined
      if (state.shape) {
        [width, height] = state.shape;
      } else {
        // Default values if shape is undefined
        width = this.canvas?.width ?? 0;
        height = this.canvas?.height ?? 0;
      }
      if (state.padding) {
        // Provide default values inline with destructuring
        [pt = 0, pr = 0, pb = 0, pl = 0] = state.padding;
      } else {
        // Default padding values if undefined
        pt = pr = pb = pl = 0;
      }
    }
    // Update state before calling getCoords
    if ('setState' in state.opposite!.coordinate) {
      (state.opposite!.coordinate as any).setState(state.opposite!);
    }
    // Ensure axisOrigin is defined before passing it to getCoords
    const axisOrigin2 = state.coordinate.axisOrigin ?? 0;
    axisCoords = state.opposite!.coordinate.getCoords([axisOrigin2]);
    // Ensure array element exists before using it
    const axisCoord0 = axisCoords[0] ?? 0;
    const x = pl + axisCoord0 * (width - pr - pl);
    return { x, y };
  }

  setSize(width: number, height: number): void {
    this.setWidth(width);
    this.setHeight(height);
  }

  setWidth(width: number): void {
    this.canvas.width = width;
  }

  setHeight(height: number): void {
    this.canvas.height = height;
  }

  // re-evaluate lines, calc options for renderer
  update(opts?: Partial<GridOptions>): this {
    const shape: [number, number] = [this.canvas.width, this.canvas.height];

    // recalc state
    this.state.x = this.calcCoordinate(this.axisX, shape);
    this.state.y = this.calcCoordinate(this.axisY, shape);
    this.state.x.opposite = this.state.y;
    this.state.y.opposite = this.state.x;
    this.emit('update', opts);
    return this;
  }

  // re-evaluate lines, calc options for renderer
  update2(center: GridCenter): void {
    if (this.isPinned) {
      center.x = this.getPinnedX();
      center.y = this.getPinnedY();
    }
    const shape: [number, number] = [this.canvas.width, this.canvas.height];
    Object.assign(this.center, center);
    
    // recalc state
    this.state.x = this.calcCoordinate(this.axisX, shape);
    this.state.y = this.calcCoordinate(this.axisY, shape);
    this.state.x.opposite = this.state.y;
    this.state.y.opposite = this.state.x;
    this.emit('update', center);

    this.axisX.offset = center.x;
    this.axisX.zoom = 1 / center.zoom;

    this.axisY.offset = center.y;
    this.axisY.zoom = 1 / center.zoom;
  }

  // get state object with calculated params, ready for rendering
  calcCoordinate(coord: Axis, shape: [number, number]): GridState {
    // Initialize GridState with all required properties
    const state: GridState = {
      coordinate: coord,
      shape,
      grid: this,
      range: 0,          // Will be set below
      offset: 0,         // Will be set below
      zoom: coord.zoom,
      axisColor: '',     // Will be set below
      axisWidth: 0,      // Will be set below
      lineWidth: 0,      // Will be set below
      tickAlign: 0,      // Will be set below
      labelColor: '',    // Will be set below
      padding: [0, 0, 0, 0], // Will be set below
      fontSize: 0,       // Will be set below
      fontFamily: '',    // Will be set below
      lines: [],         // Will be set below
      lineColors: [],    // Will be set below
      ticks: [],         // Will be set below
      labels: []         // Will be set below
    };

    // If it's our custom axis with setState method, call it to provide state
    if ('setState' in coord) {
      (coord as any).setState(state);
    }

    // calculate real offset/range
    state.range = coord.getRange();
    // Use this.defaults instead of coord for min/max properties
    state.offset = clamp(
      coord.offset - state.range * clamp(0.5, 0, 1),
      Math.max(this.defaults.min ?? -Number.MAX_VALUE + 1, -Number.MAX_VALUE + 1),
      Math.min(this.defaults.max ?? Number.MAX_VALUE, Number.MAX_VALUE) - state.range
    );

    // calc style
    state.axisColor = typeof coord.axisColor === 'number'
      ? alpha(coord.color ?? '#000000', coord.axisColor)
      : coord.axisColor || coord.color || '#000000'; // Default to black if both values are undefined

    state.axisWidth = coord.axisWidth ?? coord.lineWidth ?? 1;
    state.lineWidth = coord.lineWidth ?? 1;
    // Use a default value for tickAlign if not available on coord
    state.tickAlign = (coord as any).tickAlign ?? this.defaults.tickAlign ?? 0.5;
    // Use coordinate color or default color for label color
    state.labelColor = coord.color ?? this.defaults.color ?? '#000000';

    // get padding
    if (typeof coord.padding === 'number') {
      state.padding = Array(4).fill(coord.padding);
    } else if (coord.padding instanceof Function) {
      state.padding = coord.padding(state);
    } else if (Array.isArray(coord.padding)) {
      state.padding = coord.padding;
    } else {
      // Default padding if none specified
      state.padding = [0, 0, 0, 0];
    }

    // calc font
    if (typeof coord.fontSize === 'number') {
      state.fontSize = coord.fontSize;
    } else {
      const units = parseUnit(coord.fontSize ?? '12px');
      const u0 = units[0];
      const u1 = units[1];
      if (u0 && u1) {
        const px = toPx(u1);
        if (px) {
          state.fontSize = u0 * px;
        }
      }
    }
    state.fontFamily = coord.fontFamily ?? this.defaults.fontFamily ?? 'sans-serif';

    // get lines stops, including joined list of values
    let lines: number[];
    if (coord.lines === false) {
      lines = [];
    } else if (typeof coord.lines === 'function') {
      lines = (coord.lines as Function)(state);
    } else {
      // Handle the case where coord.lines is a boolean or undefined
      if (coord.lines === true || coord.lines === undefined) {
        lines = [];
      } else {
        // Handle the case where it's a number array
        lines = Array.isArray(coord.lines) ? coord.lines : [];
      }
    }
    state.lines = lines;

    // calc colors
    if (coord.lineColor instanceof Function) {
      state.lineColors = coord.lineColor(state);
    } else if (Array.isArray(coord.lineColor)) {
      state.lineColors = coord.lineColor;
    } else {
      let color = typeof coord.lineColor === 'number' 
        ? alpha(coord.color ?? '#000000', coord.lineColor)
        : coord.lineColor === false || coord.lineColor == null ? null : (coord.color ?? '#000000');
      state.lineColors = Array(lines.length).fill(color);
    }

    // calc ticks
    let ticks: number[];
    if (coord.ticks instanceof Function) {
      ticks = coord.ticks(state);
    } else if (Array.isArray(coord.ticks)) {
      ticks = coord.ticks;
    } else {
      const tick = coord.ticks === true ? state.axisWidth * 2 : coord.ticks || 0;
      ticks = Array(lines.length).fill(tick);
    }
    state.ticks = ticks;

    // calc labels
    let labels: (string | number | null)[];
    if (coord.labels === true) {
      // Convert number lines to string/number array
      labels = state.lines.map(line => line); // This preserves the numbers
    } else if (typeof coord.labels === 'function') {
      labels = (coord.labels as Function)(state);
    } else if (Array.isArray(coord.labels)) {
      labels = coord.labels as (string | number | null)[];
    } else if (coord.labels && typeof coord.labels === 'object' && !Array.isArray(coord.labels)) {
      // Convert object to array of labels using type assertion
      labels = Object.values(coord.labels as Record<string, string | number | null>);
    } else if (coord.labels === false) {
      labels = Array(state.lines.length).fill(null);
    } else {
      // Default case for undefined or other unexpected values
      labels = Array(state.lines.length).fill(null);
    }
    state.labels = labels;

    // convert hashmap ticks/labels to lines + colors
    // Use type guards to check if ticks is an object (not array, not null, and not a primitive)
    if (ticks && typeof ticks === 'object' && !Array.isArray(ticks)) {
      state.ticks = Array(lines.length).fill(0);
    }
    // Use type guards to check if labels is an object (not array, not null, and not a primitive)
    if (labels && typeof labels === 'object' && !Array.isArray(labels)) {
      state.labels = Array(state.lines.length).fill(null);
    }
    // Handle object ticks (using type guard instead of isObj)
    if (ticks && typeof ticks === 'object' && !Array.isArray(ticks)) {
      Object.keys(ticks).forEach((value, tick) => {
        state.ticks.push(tick);
        // Ensure value is a string before parsing to float
        state.lines.push(parseFloat(String(value)));
        state.lineColors.push(null);
        state.labels.push(null);
      });
    }

    if (isObj(labels)) {
      Object.keys(labels).forEach((label, value) => {
        state.labels.push(label);
        // Ensure value is a string before parsing to float
        state.lines.push(parseFloat(String(value)));
        state.lineColors.push(null);
        state.ticks.push(0);
      });
    }

    return state;
  }

  setDefaults(): void {
    this.pixelRatio = window.devicePixelRatio;
    this.autostart = true;
    this.interactions = true;

    this.defaults = Object.assign(
      {
        type: 'linear',
        name: '',
        units: '',
        state: {},

        // visible range params
        minZoom: -Infinity,
        maxZoom: Infinity,
        min: -Infinity,
        max: Infinity,
        offset: 0,
        origin: 0.5,
        center: {
          x: 0,
          y: 0,
          zoom: 1
        },
        zoom: 1,
        zoomEnabled: true,
        panEnabled: true,

        pinnedCorner: 'NONE',
        pinnedAbsolute: { x: 0, y: 0 },
        isPinned: false,
        pinMargin: 0,

        // labels
        labels: true,
        fontSize: '11pt',
        fontFamily: 'sans-serif',
        padding: 0,
        color: 'rgb(0,0,0,1)',

        // lines params
        lines: true,
        tick: 8,
        tickAlign: 0.5,
        lineWidth: 1,
        distance: 13,
        style: 'lines',
        lineColor: 0.4,

        // axis params
        axis: true,
        axisOrigin: 0,
        axisWidth: 2,
        axisColor: 0.8,

        // stub methods
        getCoords: () => [0, 0, 0, 0],
        getRatio: () => 0,
        format: (v: number) => v
      },
      gridStyle,
      this._options
    );

    // Create custom GridAxis classes to handle the different method signatures
    class GridXAxis extends Axis {
      private state?: GridState;

      constructor(defaults: any, center: GridPoint) {
        super('x', { ...defaults, offset: center.x });
      }

      setState(state: GridState): void {
        this.state = state;
      }

      // Override with grid-specific implementation
      getCoords(values?: number[]): number[] {
        const coords: number[] = [];
        if (!values || !this.state) return coords;
        
        for (let i = 0; i < values.length; i += 1) {
          // Use the base class getRatio with our single parameter
          const t = this.getRatio(values[i] ?? 0);
          coords.push(t);
          coords.push(0);
          coords.push(t);
          coords.push(1);
        }
        return coords;
      }

      // Override with grid-specific implementation
      getRange(): number {
        return this.state ? this.state.shape[0] * this.zoom : super.getRange();
      }

      // Override with grid-specific implementation
      getRatio(value: number): number {
        if (!this.state) return super.getRatio(value);
        return (value - this.state.offset) / this.state.range;
      }
    }

    class GridYAxis extends Axis {
      private state?: GridState;

      constructor(defaults: any, center: GridPoint) {
        super('y', { ...defaults, offset: center.y });
      }

      setState(state: GridState): void {
        this.state = state;
      }

      // Override with grid-specific implementation
      getCoords(values?: number[]): number[] {
        const coords: number[] = [];
        if (!values || !this.state) return coords;
        
        for (let i = 0; i < values.length; i += 1) {
          // Use the base class getRatio with our single parameter
          const t = this.getRatio(values[i] ?? 0);
          coords.push(0);
          coords.push(t);
          coords.push(1);
          coords.push(t);
        }
        return coords;
      }

      // Override with grid-specific implementation
      getRange(): number {
        return this.state ? this.state.shape[1] * this.zoom : super.getRange();
      }

      // Override with grid-specific implementation
      getRatio(value: number): number {
        if (!this.state) return super.getRatio(value);
        return 1 - (value - this.state.offset) / this.state.range;
      }
    }

    this.axisX = new GridXAxis(this.defaults, this.center);
    this.axisY = new GridYAxis(this.defaults, this.center);

    Object.assign(this, this.defaults);
    Object.assign(this, this._options);

    // Use GridPoint instead of Point to include the zoom property
    const centerObj = this.center || this.defaults.center;
    this.center = new GridPoint(
      centerObj?.x || 0, 
      centerObj?.y || 0, 
      centerObj?.zoom || 1
    );
  }

  // Draw methods
  draw(): this {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLines(this.state.x);
    this.drawLines(this.state.y);
    return this;
  }

  drawLines(state: GridState): void {
    if (!state?.coordinate) return;

    const ctx = this.context;
    const [width, height] = state.shape;
    const [pt, pr, pb, pl] = state.padding;

    // Fix function call to match Axis.getRatio signature (only takes one parameter)
    let axisRatio = state.opposite!.coordinate.getRatio(state.coordinate.axisOrigin || 0);
    axisRatio = clamp(axisRatio, 0, 1);
    // Fix function call to match Axis.getCoords signature (only takes one parameter)
    const coords = state.coordinate.getCoords(state.lines);

    // draw lines
    ctx.lineWidth = 1;
    for (let i = 0, j = 0; i < coords.length; i += 4, j += 1) {
      const color = state.lineColors[j];
      if (!color) continue;
      
      ctx.strokeStyle = color;
      ctx.beginPath();
      
      if (pl === undefined || pr === undefined || pt === undefined || pb === undefined) {
        continue;
      }
      
      const c0 = coords[i];
      const c1 = coords[i + 1];
      const c2 = coords[i + 2];
      const c3 = coords[i + 3];

      if (c0 === undefined || c1 === undefined || c2 === undefined || c3 === undefined) {
        continue;
      }

      const x1 = pl + c0 * (width - pr - pl);
      const y1 = pt + c1 * (height - pb - pt);
      const x2 = pl + c2 * (width - pr - pl);
      const y2 = pt + c3 * (height - pb - pt);

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    }

    // Calculate normals
    const normals: number[] = [];
    for (let i = 0; i < coords.length; i += 4) {
      const x1 = coords[i];
      const y1 = coords[i + 1];
      const x2 = coords[i + 2];
      const y2 = coords[i + 3];
      // Ensure we have valid number values
      const xDif = (x2 ?? 0) - (x1 ?? 0);
      const yDif = (y2 ?? 0) - (y1 ?? 0);
      
      // Safely call len with defined numbers
      const dist = len(xDif, yDif) || 1; // Avoid division by zero
      
      normals.push(xDif / dist);
      normals.push(yDif / dist);
    }

    // Calculate tick and label coordinates
    const tickCoords: number[] = [];
    state.labelCoords = [];
    const ticks = state.ticks;

    for (let i = 0, j = 0, k = 0; i < normals.length; k += 1, i += 2, j += 4) {
      const x1 = coords[j];
      const y1 = coords[j + 1];
      const x2 = coords[j + 2];
      const y2 = coords[j + 3];
      const xDif = (x2 ?? 0) - (x1 ?? 0);
      const yDif = (y2 ?? 0) - (y1 ?? 0);
      // Add null safety to padding values
      const safePl = pl ?? 0;
      const safePr = pr ?? 0;
      const safePt = pt ?? 0;
      const safePb = pb ?? 0;
      
      const ni0 = normals[i];
      const ni1 = normals[i + 1];
      const tk = ticks[k];

      if (!ni0 || !ni1 || !tk) continue;

      const tick = [
        (ni0 * tk) / (width - safePl - safePr),
        (ni1 * tk) / (height - safePt - safePb)
      ];
      
      const t0 = tick[0];
      const t1 = tick[1];
      if (!t0 || !t1) continue;
      
      if (!x1 || !y1) continue;
      
      tickCoords.push(ni0 * (xDif + t0 * state.tickAlign) + x1);
      tickCoords.push(ni1 * (yDif + t1 * state.tickAlign) + y1);
      tickCoords.push(ni0 * (xDif - t0 * (1 - state.tickAlign)) + x1);
      tickCoords.push(ni1 * (yDif - t1 * (1 - state.tickAlign)) + y1);
      // Initialize labelCoords array if undefined
      if (!state.labelCoords) {
        state.labelCoords = [];
      }
      state.labelCoords.push(ni0 * xDif + x1);
      state.labelCoords.push(ni1 * yDif + y1);
    }

    // draw ticks
    if (ticks.length) {
      ctx.lineWidth = state.axisWidth / 2;
      ctx.beginPath();
      for (let i = 0, j = 0; i < tickCoords.length; i += 4, j += 1) {
        const line = state.lines[j];
        if (!line) continue;
        const tc0 = tickCoords[i];
        const tc1 = tickCoords[i + 1];
        const tc2 = tickCoords[i + 2];
        const tc3 = tickCoords[i + 3];
        if (!tc0 || !tc1 || !tc2 || !tc3) continue;
        if (almost(line, state.opposite?.coordinate.axisOrigin ?? 0)) continue;
        const x1 = (pl ?? 0) + tc0 * (width - (pl ?? 0) - (pr ?? 0));
        const y1 = (pt ?? 0) + tc1 * (height - (pt ?? 0) - (pb ?? 0));
        const x2 = (pl ?? 0) + tc2 * (width - (pl ?? 0) - (pr ?? 0));
        const y2 = (pt ?? 0) + tc3 * (height - (pt ?? 0) - (pb ?? 0));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = state.axisColor;
      ctx.stroke();
      ctx.closePath();
    }

    // draw axis
    if (state.coordinate.axis && state.axisColor) {
      // Update state on axis before calling getCoords
      if (state.opposite && 'setState' in state.opposite.coordinate) {
        (state.opposite.coordinate as any).setState(state.opposite);
      }
      // Get coordinates for axis origin
      const axisOrigin = state.coordinate.axisOrigin ?? 0;
      const axisCoords = state.opposite?.coordinate.getCoords(
        [axisOrigin]
      ) ?? [0, 0, 0, 0];
      ctx.lineWidth = state.axisWidth / 2;
      // Ensure values are defined before passing to clamp function
      const safeAxisCoords0 = axisCoords[0] ?? 0;
      const safeAxisCoords1 = axisCoords[1] ?? 0;
      const safeAxisCoords2 = axisCoords[2] ?? 0;
      const safeAxisCoords3 = axisCoords[3] ?? 0;
      
      const safeWidth = width ?? 0;
      const safeHeight = height ?? 0;
      const safePl = pl ?? 0;
      const safePr = pr ?? 0;
      const safePt = pt ?? 0;
      const safePb = pb ?? 0;
      
      const x1 = safePl + clamp(safeAxisCoords0, 0, 1) * (safeWidth - safePr - safePl);
      const y1 = safePt + clamp(safeAxisCoords1, 0, 1) * (safeHeight - safePt - safePb);
      const x2 = safePl + clamp(safeAxisCoords2, 0, 1) * (safeWidth - safePr - safePl);
      const y2 = safePt + clamp(safeAxisCoords3, 0, 1) * (safeHeight - safePt - safePb);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = state.axisColor;
      ctx.stroke();
      ctx.closePath();
    }

    // draw labels
    this.drawLabels(state);
  }

  drawLabels(state: GridState): void {
    if (!state.labels) return;

    const ctx = this.context;
    const [width, height] = state.shape;
    const [pt, pr, pb, pl] = state.padding;

    ctx.font = `300 ${state.fontSize}px ${state.fontFamily}`;
    ctx.fillStyle = state.labelColor;
    ctx.textBaseline = 'top';
    const textHeight = state.fontSize;
    const indent = state.axisWidth + 1.5;
    const textOffset = state.tickAlign < 0.5
      ? -textHeight - state.axisWidth * 2 
      : state.axisWidth * 2;
    // Check if opposite axis should be considered as disabled by checking if its coordinate exists
    const isOpp = state.coordinate.orientation === 'y' && state.opposite?.coordinate != null;

    for (let i = 0; i < state.labels.length; i += 1) {
      let label = state.labels[i];
      if (label == null) continue;

      if (isOpp && almost(state.lines[i] ?? 0, state.opposite?.coordinate?.axisOrigin ?? 0)) continue;

      const textWidth = ctx.measureText(String(label)).width;
      let textLeft = (state.labelCoords?.[i * 2] ?? 0) * (width - (pl ?? 0) - (pr ?? 0)) + indent + (pl ?? 0);

      if (state.coordinate.orientation === 'y') {
        textLeft = clamp(textLeft, indent, width - textWidth - 1 - state.axisWidth);
        label = Number(label) * -1;
      }

      let textTop = (state.labelCoords?.[i * 2 + 1] ?? 0) * (height - (pt ?? 0) - (pb ?? 0)) + textOffset + (pt ?? 0);
      if (state.coordinate.orientation === 'x') {
        textTop = clamp(textTop, 0, height - textHeight - textOffset);
      }

      ctx.fillText(String(label), textLeft, textTop);
    }
  }
}

export default Grid;
