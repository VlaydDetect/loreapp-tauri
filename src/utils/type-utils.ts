export type Class = { new(...args: any[]): any; };

export function trueTypeOf(obj: any) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
    /*
        []              -> array
        {}              -> object
        ''              -> string
        new Date()      -> date
        1               -> number
        function () {}  -> function
        async function () {}  -> asyncfunction
        /test/i         -> regexp
        true            -> boolean
        null            -> null
        trueTypeOf()    -> undefined
    */
}

export const isType = <Type>(thing: any): thing is Type => true;


type NonEmptyArray<T> = [T, ...T[]]

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

/**
 *  Use: ValueOf<typeof ...>
 *
 *  Ref: https://youtu.be/VBpmbqTi86Y?t=380
 *  @return: Const Object or Enum as Type
 */
export type ValueOf<T> = T[keyof T]