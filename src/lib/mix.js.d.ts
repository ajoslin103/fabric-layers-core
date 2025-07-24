/**
 * Type declarations for the mix.js module
 */

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

/**
 * Apply a mixin to a superclass
 */
export function apply<T extends Constructor>(superclass: T, mixin: MixinFunction): T;

/**
 * Wrap a mixin with another mixin
 */
export function wrap(mixin: MixinFunction, wrapper: MixinFunction): MixinFunction;

/**
 * Unwrap a mixin to get the original
 */
export function unwrap(wrapper: MixinFunction): MixinFunction;

/**
 * Cache mixin applications
 */
export function Cached(mixin: MixinFunction): MixinFunction;

/**
 * Deduplicate mixin applications
 */
export function DeDupe(mixin: MixinFunction): MixinFunction;

/**
 * Create a bare mixin
 */
export function BareMixin(mixin: MixinFunction): MixinFunction;

/**
 * Create a mixin with deduplication, caching, and instanceof support
 */
export function Mixin(mixin: MixinFunction): MixinFunction;
