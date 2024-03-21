import { LegacyRef, MutableRefObject, RefCallback } from 'react';
import tauriConfJson from '../../src-tauri/tauri.conf.json';
import packageJson from '../../package.json';

export const APP_NAME = tauriConfJson.package.productName;
export const VERSION = packageJson.version;

export const CAN_USE_DOM: boolean =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

export function findDifferences<T extends Object>(
    obj1: T,
    obj2: T,
    parentKey = '',
): { diff: string[]; updatedObj: T } {
    const diff: string[] = [];
    const updatedObj = { ...obj1 };

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    const allKeys = new Set([...keys1, ...keys2]);

    allKeys.forEach(key => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const value1 = (obj1 as any)[key];
        const value2 = (obj2 as any)[key];

        if (value1 !== value2) {
            diff.push(fullKey);
            (updatedObj as any)[key] = value2;
        }

        if (typeof value1 === 'object' && typeof value2 === 'object') {
            const { diff: nestedDifferences, updatedObj: nestedUpdatedObj } = findDifferences(
                value1,
                value2,
                fullKey,
            );

            diff.push(...nestedDifferences);
            (updatedObj as any)[key] = nestedUpdatedObj;
        }
    });

    return { diff, updatedObj };
}

export function mergeRefs<T = any>(
    refs: Array<MutableRefObject<T> | LegacyRef<T>>,
): RefCallback<T> {
    return value => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref !== null) {
                (ref as MutableRefObject<T | null>).current = value;
            }
        });
    };
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export function joinClasses(...args: Array<string | boolean | null | undefined>) {
    return args.filter(Boolean).join(' ');
}

// --------- String Utils --------- //
export function splitAndTrim(str: string, sep: string): string[] {
    if (str == null) {
        return [];
    }
    if (str.indexOf(sep) === -1) {
        return [str.trim()];
    }
    return str.split(sep).map(trim);
}

function trim(str: string): string {
    return str.trim();
}

// --------- Object Utils --------- //

// Convert an indexed object to a pure array in the most efficient way (to-date)
// See: https://jsperf.com/convert-nodelist-to-array, https://jsperf.com/array-from-to-nodelist
export function listAsArray(list: any) {
    const arr = new Array(list.length);
    for (let i = list.length - 1; i >= 0; i--) {
        arr[i] = list[i];
    }
    return arr;
}

export function classNames(...args: any[]): string | undefined {
    if (args) {
        let newClasses: string[] = [];

        for (let i = 0; i < args.length; i++) {
            const className = args[i];

            if (!className) continue;

            const type = typeof className;

            if (type === 'string' || type === 'number') {
                newClasses.push(className);
            } else if (type === 'object') {
                const classes = Array.isArray(className)
                    ? className
                    : Object.entries(className).map(([key, value]) => (value ? key : null));

                newClasses = classes.length
                    ? newClasses.concat(classes.filter(c => !!c))
                    : newClasses;
            }
        }

        return newClasses.join(' ').trim();
    }

    return undefined;
}

export type PassThroughType<T, O> =
    | T
    | ((options?: O) => T | void)
    | null
    | undefined
    | {
          [key: string]: any;
      };

export interface PassThroughOptions {
    mergeSections?: boolean | undefined;
    mergeProps?: boolean | undefined;
    classNameMergeFunction?: (className1: string, className2: string) => string | undefined;
}
