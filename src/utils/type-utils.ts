export type Class = { new(...args: any[]): any; };

export function trueTypeOf(obj: any) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
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

export type NonEmptyArray<T> = [T, ...T[]]

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
        ?
            L extends undefined ?
                R extends undefined ?
                    never :
                    `${R}`:
                R extends undefined ?
                    `${L}` :
                    P extends false ?
                        `${L} ${R}` :
                        `${L} ${R}` | `${R} ${L}`
        :
            L extends undefined ?
                R extends undefined ?
                    never :
                    `${R}` :
                R extends undefined ?
                    `${L}` :
                    never;