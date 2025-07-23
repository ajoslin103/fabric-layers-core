import { fabric } from 'fabric';

export interface CircleOptions extends fabric.ICircleOptions {
  class?: string;
}

export class Circle extends fabric.Circle {
  constructor(options?: CircleOptions) {
    super(options);
  }
}

export const circle = (options?: CircleOptions): Circle => new Circle(options);

export default Circle;
