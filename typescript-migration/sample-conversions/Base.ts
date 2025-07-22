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
export default class Base extends EventEmitter2 {
  protected _options: BaseOptions;
  
  /**
   * Constructor for the Base class
   * @param options - Configuration options
   */
  constructor(options: BaseOptions = {}) {
    super();
    this._options = { ...options };
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

  /**
   * Register an event handler
   * @param event - Event name
   * @param handler - Event handler function
   * @returns - This instance for chaining
   */
  on(event: string, handler: Function): this {
    super.on(event, handler);
    return this;
  }

  /**
   * Unregister an event handler
   * @param event - Event name
   * @param handler - Event handler function (optional)
   * @returns - This instance for chaining
   */
  off(event: string, handler?: Function): this {
    if (handler) {
      super.off(event, handler);
    } else {
      super.off(event);
    }
    return this;
  }

  /**
   * Trigger an event
   * @param event - Event name
   * @param args - Event arguments
   * @returns - Whether the event had listeners
   */
  trigger(event: string, ...args: any[]): boolean {
    return this.emit(event, ...args);
  }
}
