import { fabric } from 'fabric';
import { Map } from '../map/Map';
import Measurer from './Measurer';
import { PointLike } from '../geometry/Point';

/**
 * Manages interactive measurement functionality on a map
 */
export class Measurement {
  protected map: Map;
  protected measurer: Measurer | null = null;

  constructor(map: Map) {
    this.map = map;
  }

  /**
   * Handle mouse movement events for measurement
   * @param e - The fabric.js mouse event
   */
  onMouseMove(e: fabric.IEvent): void {
    if (!e.absolutePointer) return;

    const point: PointLike = {
      x: e.absolutePointer.x,
      y: e.absolutePointer.y,
    };

    if (this.measurer && !this.measurer.completed) {
      this.measurer.setEnd(point);
      this.map.canvas.requestRenderAll();
    }
  }

  /**
   * Handle click events for measurement
   * @param e - The fabric.js mouse event
   */
  onClick(e: fabric.IEvent): void {
    if (!e.absolutePointer) return;

    const point: PointLike = {
      x: e.absolutePointer.x,
      y: e.absolutePointer.y,
    };

    if (!this.measurer) {
      // Create new measurement
      this.measurer = new Measurer({
        start: point,
        end: point,
        map: this.map,
      });
    } else if (!this.measurer.completed) {
      // Complete existing measurement
      this.measurer.setEnd(point);
      this.measurer.complete();
    }
  }
}

export default Measurement;
