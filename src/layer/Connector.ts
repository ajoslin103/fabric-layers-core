import { Layer, LayerOptions } from './Layer';
import { Line } from './vector/Line';
import { Point } from '../geometry/Point';
import EventEmitter2 from 'eventemitter2';
import { ExtendedFabricObject } from '../types/fabric-extensions';

export interface ConnectorEndpoint extends EventEmitter2 {
  position: Point;
}

export interface ConnectorOptions extends LayerOptions {
  strokeWidth?: number;
  color?: string;
  fill?: boolean | string;
}

export interface ConnectorStyle extends LayerOptions {
  strokeWidth: number;
  stroke: string;
  fill: boolean | string;
  selectable: boolean;
}

export class Connector extends Layer {
  public start: ConnectorEndpoint;
  public end: ConnectorEndpoint;
  public strokeWidth: number;
  public color: string;
  // public shape: Line; // Inherited from Layer

  constructor(start: ConnectorEndpoint, end: ConnectorEndpoint, options: ConnectorOptions = {}) {
    // Set default options
    const connectorOptions: ConnectorOptions = {
      zIndex: options.zIndex || 10,
      class: 'connector',
      ...options
    };
    super(connectorOptions);

    if (!start || !end) {
      console.error('start or end is missing');
      throw new Error('Connector requires both start and end points');
    }

    this.start = start;
    this.end = end;
    this.strokeWidth = options.strokeWidth || 1;
    this.color = options.color || 'grey';

    // Update style with connector-specific properties
    Object.assign(this.style, {
      strokeWidth: this.strokeWidth,
      stroke: this.color,
      fill: options.fill || false,
      selectable: false
    } as ConnectorStyle);

    this.draw();
    this.registerListeners();
  }

  /**
   * Register update listeners to reset the connector line endpoints
   */
  protected registerListeners(): void {
    this.start.on('update:links', () => {
      const x1 = this.start.position.x;
      const y1 = this.start.position.y;
      this.shape.set({
        x1,
        y1
      });
    });

    this.end.on('update:links', () => {
      const x2 = this.end.position.x;
      const y2 = this.end.position.y;
      this.shape.set({
        x2,
        y2
      });
    });
  }

  /**
   * Draw the initial connector line
   */
  protected draw(): void {
    this.shape = new Line(
      [this.start.position.x, this.start.position.y, this.end.position.x, this.end.position.y],
      this.style
    ) as ExtendedFabricObject;
  }

  /**
   * Update the connector line coordinates
   */
  public redraw(): void {
    this.shape.set({
      x1: this.start.position.x,
      y1: this.start.position.y,
      x2: this.end.position.x,
      y2: this.end.position.y
    });
  }

  /**
   * Set a new start point
   * @param start - The new start point
   */
  public setStart(start: ConnectorEndpoint): void {
    this.start = start;
    this.redraw();
  }

  /**
   * Set a new end point
   * @param end - The new end point
   */
  public setEnd(end: ConnectorEndpoint): void {
    this.end = end;
    this.redraw();
  }

  /**
   * Set the connector color
   * @param color - The new color
   */
  public setColor(color: string): void {
    this.color = color;
    this.style.stroke = color;
    this.shape.set('stroke', color);
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }

  /**
   * Set the connector stroke width
   * @param strokeWidth - The new stroke width
   */
  public setStrokeWidth(strokeWidth: number): void {
    this.strokeWidth = strokeWidth;
    this.style.strokeWidth = strokeWidth;
    this.shape.set('strokeWidth', strokeWidth);
    if (this.shape.canvas) {
      this.shape.canvas.renderAll();
    }
  }
}

/**
 * Factory function to create a new Connector
 * @param start - The start point
 * @param end - The end point
 * @param options - Configuration options
 * @returns A new Connector instance
 */
export const connector = (
  start: ConnectorEndpoint,
  end: ConnectorEndpoint,
  options?: ConnectorOptions
): Connector => new Connector(start, end, options);

export default Connector;
