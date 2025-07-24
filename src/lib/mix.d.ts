/**
 * Type declarations for the mix.js module
 * Based on the actual implementation in mix.js
 */
declare module '../lib/mix' {
  /**
   * A class constructor type
   */
  export type Constructor<T = {}> = new (...args: any[]) => T;
  
  /**
   * A mixin function that takes a superclass and returns a subclass
   */
  export type MixinFunction = <T extends Constructor>(superclass: T) => T;
  
  /**
   * MixinBuilder provides a fluent interface for applying mixins
   */
  export class MixinBuilder<T extends Constructor> {
    superclass: T;
    constructor(superclass: T);
    
    /**
     * Apply mixins in order to the superclass
     */
    with<R>(...mixins: MixinFunction[]): R;
  }
  
  /**
   * Creates a MixinBuilder for applying mixins to a superclass
   */
  export function mix<T extends Constructor>(superclass?: T): MixinBuilder<T>;
}
