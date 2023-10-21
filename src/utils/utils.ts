import tauriConfJson from "../../src-tauri/tauri.conf.json"
import packageJson from "../../package.json"
import {LegacyRef, MutableRefObject, RefCallback} from "react";

export const APP_NAME = tauriConfJson.package.productName
export const VERSION = packageJson.version

export const CAN_USE_DOM: boolean =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

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

// show browser / native notification
export function notify(title: string, body: string) {
    new Notification(title, { body: body || "", });
}

type NonEmptyArray<T> = [T, ...T[]]

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

/**
 *  Use: ValueOf<typeof ...>
 *
 *  Ref: https://youtu.be/VBpmbqTi86Y?t=380
 *  @return: Const Object or Enum as Type
 */
export type ValueOf<T> = T[keyof T]

export function findDifferences<T extends Object>(obj1: T, obj2: T, parentKey = ''): { diff: string[]; updatedObj: T } {
    const diff: string[] = [];
    const updatedObj = { ...obj1 };

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const value1 = (obj1 as any)[key];
        const value2 = (obj2 as any)[key];

        if (value1 !== value2) {
            diff.push(fullKey);
            (updatedObj as any)[key] = value2;
        }

        if (typeof value1 === 'object' && typeof value2 === 'object') {
            const { diff: nestedDifferences, updatedObj: nestedUpdatedObj } =
                findDifferences(value1, value2, fullKey);

            diff.push(...nestedDifferences);
            (updatedObj as any)[key] = nestedUpdatedObj;
        }
    }

    return { diff, updatedObj };
}

export function mergeRefs<T = any>(refs: Array<MutableRefObject<T> | LegacyRef<T>>): RefCallback<T> {
    return (value) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value)
            } else if (ref !== null) {
                ;(ref as MutableRefObject<T | null>).current = value
            }
        })
    }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export function joinClasses(
    ...args: Array<string | boolean | null | undefined>
) {
    return args.filter(Boolean).join(' ');
}
