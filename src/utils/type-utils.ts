import React from 'react';

export type Class = { new (...args: any[]): any };

export function trueTypeOf(obj: any) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    /*
        []                      -> array
        {}                      -> object
        ''                      -> string
        new Date()              -> date
        1                       -> number
        function () {}          -> function
        async function () {}    -> asyncfunction
        /test/i                 -> regexp
        true                    -> boolean
        null                    -> null
        trueTypeOf()            -> undefined
    */
}

export const isType = <Type>(thing: any): thing is Type => true;

export type NonEmptyArray<T> = [T, ...T[]];

export type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

/**
 *  Use: ValueOf<typeof ...>
 *
 *  Ref: https://youtu.be/VBpmbqTi86Y?t=380
 *  @return: Const Object or Enum as Type
 */
export type ValueOf<T> = T[keyof T];

/**
 * @brief Type for creating a Cartesian product of two union types.
 *
 * @template L - first union type,
 * @template R - second union type,
 * @template E - boolean parameter indicating whether the product itself should be excluded (if false, it works simply as a union type),
 * @template P - boolean parameter indicating whether to include permutations in the product (if true: `${L} ${R}` | `${R} ${L}`)
 */
export type Cartesian<
    L extends string | number | boolean | undefined,
    R extends string | number | boolean | undefined,
    E = false,
    P = false,
> = E extends false
    ? L extends undefined
        ? R extends undefined
            ? never
            : `${R}`
        : R extends undefined
          ? `${L}`
          : P extends false
            ? `${L} ${R}`
            : `${L} ${R}` | `${R} ${L}`
    : L extends undefined
      ? R extends undefined
          ? never
          : `${R}`
      : R extends undefined
        ? `${L}`
        : never;

/**
 * Like `T & U`, but using the value types from `U` where their properties overlap.
 *
 * @internal
 */
export type Overwrite<T, U> = DistributiveOmit<T, keyof U> & U;

/**
 * Remove properties `K` from `T`.
 * Distributive for union types.
 *
 * @internal
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/**
 * All standard components exposed by `material-ui` are `StyledComponents` with
 * certain `classes`, on which one can also set a top-level `className` and inline
 * `style`.
 * @internal
 */
export type StandardProps<
    ComponentProps,
    Removals extends keyof ComponentProps = never,
> = DistributiveOmit<ComponentProps, 'classes' | Removals> & {
    className?: string;
    ref?: ComponentProps extends { ref?: infer RefType } ? RefType : React.Ref<unknown>;
    style?: React.CSSProperties;
};

export type EventHandlers = Record<string, React.EventHandler<any>>;

/**
 * Extracts event handlers from a given object.
 * A prop is considered an event handler if it is a function and its name starts with `on`.
 *
 * @param object An object to extract event handlers from.
 * @param excludeKeys An array of keys to exclude from the returned object.
 */
export function extractEventHandlers(
    object: Record<string, any> | undefined,
    excludeKeys: string[] = [],
): EventHandlers {
    if (object === undefined) return {};

    const result: EventHandlers = {};

    Object.keys(object)
        .filter(
            prop =>
                prop.match(/^on[A-Z]/) &&
                typeof object[prop] === 'function' &&
                !excludeKeys.includes(prop),
        )
        .forEach(prop => {
            result[prop] = object[prop];
        });

    return result;
}

export function isAsyncFunction(func?: Function): boolean {
    return func ? func.constructor.name === 'AsyncFunction' : false;
}
