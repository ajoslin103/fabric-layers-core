import { EventEmitter2 } from 'eventemitter2';

export interface BaseOptions {
  [key: string]: any;
}

class Base extends EventEmitter2 {
  protected _options: BaseOptions;

  constructor(options?: BaseOptions) {
    super();
    this._options = options || {};
    Object.assign(this, this._options);
  }

  set(key: string, value: any): this {
    (this as any)[key] = value;
    return this;
  }

  get(key: string): any {
    return (this as any)[key];
  }

  // EventEmitter2 methods are already typed by the base class
}

export default Base;
