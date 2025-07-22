import { EventEmitter2 } from 'eventemitter2';

/**
 * Interface for base options that can be passed to any component
 */
export interface BaseOptions {
  [key: string]: any;
}

/**
 * Base class that all components extend from
 * Provides common functionality like event handling and property access
 */
class Base extends EventEmitter2 {
  /**
   * Internal options storage
   */
  protected _options: BaseOptions;

  /**
   * Constructor for the Base class
   * @param options - Configuration options
   */
  constructor(options?: BaseOptions) {
    super(options);
    this._options = options || {};
    Object.assign(this, options);
  }
  
  /**
   * Set a property value
   * @param key - Property name
   * @param value - Property value
   * @returns - This instance for chaining
   */
  set(key: string, value: any): this {
    this._options[key] = value;
    return this;
  }

  /**
   * Get a property value
   * @param key - Property name
   * @returns - Property value
   */
  get(key: string): any {
    return this._options[key];
  }
}

export default Base;
