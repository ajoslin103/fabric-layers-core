import { fabric } from 'fabric';
import { ICON } from '../../core/Constants';

export interface IconOptions extends fabric.IImageOptions {
  // Add any additional icon options here
  src?: string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
}

export class Icon extends fabric.Image {
  public defaults: typeof ICON;
  protected _options?: IconOptions;

  constructor(imageSource: string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, options?: IconOptions) {
    super(imageSource, options);
    this.defaults = { ...ICON };
    this._options = options;
  }
}

export const icon = (imageSource: string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, options?: IconOptions): Icon => new Icon(imageSource, options);

export default Icon;
