/**
 * mix.ts - TypeScript implementation of mixins with caching and instanceof support
 */

// used by apply() and isApplicationOf()
const _appliedMixin = '__mixwith_appliedMixin';

/**
 * A function that returns a subclass of its argument.
 */
export interface MixinFunction<T extends new (...args: any[]) => any = any> {
  (superclass: T): T;
}

/**
 * Applies `mixin` to `superclass`.
 *
 * `apply` stores a reference from the mixin application to the unwrapped mixin
 * to make `isApplicationOf` and `hasMixin` work.
 *
 * This function is useful for mixin wrappers that want to automatically enable
 * {@link hasMixin} support.
 *
 * @example
 * const Applier = (mixin) => wrap(mixin, (superclass) => apply(superclass, mixin));
 *
 * // M now works with `hasMixin` and `isApplicationOf`
 * const M = Applier((superclass) => class extends superclass {});
 *
 * class C extends M(Object) {}
 * let i = new C();
 * hasMixin(i, M); // true
 */
export const apply = <T extends new (...args: any[]) => any>(
  superclass: T,
  mixin: MixinFunction<T>
): T => {
  const application = mixin(superclass);
  (application.prototype as any)[_appliedMixin] = unwrap(mixin);
  return application;
};

/**
 * Returns `true` iff `proto` is a prototype created by the application of
 * `mixin` to a superclass.
 *
 * `isApplicationOf` works by checking that `proto` has a reference to `mixin`
 * as created by `apply`.
 */
export const isApplicationOf = (
  proto: object,
  mixin: MixinFunction
): boolean =>
  Object.prototype.hasOwnProperty.call(proto, _appliedMixin) && 
  (proto as any)[_appliedMixin] === unwrap(mixin);

/**
 * Returns `true` iff `o` has an application of `mixin` on its prototype
 * chain.
 */
export const hasMixin = (o: object, mixin: MixinFunction): boolean => {
  let currentObj: object | null = o;
  while (currentObj != null) {
    if (isApplicationOf(currentObj, mixin)) return true;
    currentObj = Object.getPrototypeOf(currentObj);
  }
  return false;
};

// used by wrap() and unwrap()
const _wrappedMixin = '__mixwith_wrappedMixin';

/**
 * Sets up the function `mixin` to be wrapped by the function `wrapper`, while
 * allowing properties on `mixin` to be available via `wrapper`, and allowing
 * `wrapper` to be unwrapped to get to the original function.
 *
 * `wrap` does two things:
 *   1. Sets the prototype of `mixin` to `wrapper` so that properties set on
 *      `mixin` inherited by `wrapper`.
 *   2. Sets a special property on `mixin` that points back to `mixin` so that
 *      it can be retrieved from `wrapper`
 */
export const wrap = <T extends MixinFunction>(
  mixin: T,
  wrapper: T
): T => {
  Object.setPrototypeOf(wrapper, mixin);
  if (!(mixin as any)[_wrappedMixin]) {
    (mixin as any)[_wrappedMixin] = mixin;
  }
  return wrapper;
};

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 */
export const unwrap = <T extends MixinFunction>(wrapper: T): T => 
  (wrapper as any)[_wrappedMixin] || wrapper;

const _cachedApplications = '__mixwith_cachedApplications';

/**
 * Decorates `mixin` so that it caches its applications. When applied multiple
 * times to the same superclass, `mixin` will only create one subclass, memoize
 * it and return it for each application.
 *
 * Note: If `mixin` somehow stores properties its classes constructor (static
 * properties), or on its classes prototype, it will be shared across all
 * applications of `mixin` to a super class. It's recommended that `mixin` only
 * access instance state.
 */
export const Cached = <T extends MixinFunction>(mixin: T): T => 
  wrap(mixin, ((superclass) => {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let cachedApplications: Map<MixinFunction, any> = (superclass as any)[_cachedApplications];
    if (!cachedApplications) {
      cachedApplications = (superclass as any)[_cachedApplications] = new Map();
    }

    let application = cachedApplications.get(mixin);
    if (!application) {
      application = mixin(superclass);
      cachedApplications.set(mixin, application);
    }

    return application;
  }) as T);

/**
 * Decorates `mixin` so that it only applies if it's not already on the
 * prototype chain.
 */
export const DeDupe = <T extends MixinFunction>(mixin: T): T =>
  wrap(
    mixin,
    ((superclass) =>
      hasMixin(superclass.prototype, mixin)
        ? superclass
        : mixin(superclass)) as T
  );

/**
 * Adds [Symbol.hasInstance] (ES2015 custom instanceof support) to `mixin`.
 */
export const HasInstance = <T extends MixinFunction>(mixin: T): T => {
  if (Symbol && Symbol.hasInstance && !(mixin as any)[Symbol.hasInstance]) {
    Object.defineProperty(mixin, Symbol.hasInstance, {
      value(o: any): boolean {
        return hasMixin(o, mixin);
      },
    });
  }
  return mixin;
};

/**
 * A basic mixin decorator that applies the mixin with {@link apply} so that it
 * can be used with {@link isApplicationOf}, {@link hasMixin} and the other
 * mixin decorator functions.
 */
export const BareMixin = <T extends MixinFunction>(mixin: T): T =>
  wrap(mixin, ((s) => apply(s, mixin)) as T);

/**
 * Decorates a mixin function to add deduplication, application caching and
 * instanceof support.
 */
export const Mixin = <T extends MixinFunction>(mixin: T): T =>
  DeDupe(Cached(BareMixin(mixin)));

/**
 * A fluent interface to apply a list of mixins to a superclass.
 *
 * ```typescript
 * class X extends mix(Object).with(A, B, C) {}
 * ```
 *
 * The mixins are applied in order to the superclass, so the prototype chain
 * will be: X->C'->B'->A'->Object.
 *
 * This is purely a convenience function. The above example is equivalent to:
 *
 * ```typescript
 * class X extends C(B(A(Object))) {}
 * ```
 */
export const mix = <T extends new (...args: any[]) => any>(superclass?: T): MixinBuilder<T> => 
  new MixinBuilder<T>(superclass);

/**
 * Builder class for applying mixins using a fluent interface
 */
class MixinBuilder<T extends new (...args: any[]) => any> {
  superclass: T;

  constructor(superclass?: T) {
    this.superclass = superclass || (class {} as T);
  }

  /**
   * Applies `mixins` in order to the superclass given to `mix()`.
   *
   * @param mixins - Array of mixins to apply
   * @return A subclass of `superclass` with `mixins` applied
   */
  with<R extends T>(...mixins: Array<MixinFunction<T>>): R {
    return mixins.reduce((c, m) => m(c), this.superclass) as R;
  }
}
