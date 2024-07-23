export * from './object-utils';
export * from './dom-utils';
export * from './icon-utils';
export * from './romanNums';
export * from './settings';
export * from './string-utils';
export * from './type-utils';
export * from './classes-utils';
export * from './utils';
export * from './setRef';
export * from './json';

/**
 * Safe chained function.
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 */
export function createChainedFunction<Args extends any[], This>(
    ...funcs: Array<(this: This, ...args: Args) => any>
): (this: This, ...args: Args) => void {
    return funcs.reduce(
        (acc, func) => {
            if (func == null) {
                return acc;
            }

            return function (...args) {
                acc.apply(this, args);
                func.apply(this, args);
            };
        },
        () => {},
    );
}
