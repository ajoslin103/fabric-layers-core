import { fabric } from 'fabric';
import { ICON } from '../../core/Constants';

export interface IconOptions extends fabric.IImageOptions {
  // Add any additional icon options here
}

export class Icon extends fabric.Image {
  public defaults: typeof ICON;
  protected _options?: IconOptions;

  constructor(options?: IconOptions) {
    super(options);
    this.defaults = { ...ICON };
    Object.assign({}, this.defaults);
    Object.assign({}, this._options);
  }
}

export const icon = (options?: IconOptions): Icon => new Icon(options);

export default Icon;
