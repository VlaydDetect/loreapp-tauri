import tauriConfJson from "../../src-tauri/tauri.conf.json"
import packageJson from "../../package.json"
import {LegacyRef, MutableRefObject, RefCallback} from "react";

export const APP_NAME = tauriConfJson.package.productName
export const VERSION = packageJson.version

export const CAN_USE_DOM: boolean =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

// show browser / native notification
export function notify(title: string, body: string) {
    new Notification(title, { body: body || "", });
}

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

// same as ensureMap but for array
export function ensureArray(obj: any, propName: any): any[] {
    return _ensure(obj, propName, Array);
}

function _ensure(obj: any, propName: any, type?: any): any {
    const isMap = (obj instanceof Map);
    let v = (isMap) ? obj.get(propName) : obj[propName];
    if (v == null) {
        v = (type == null) ? {} : (type === Array) ? [] : (new type);
        if (isMap) {
            obj.set(propName, v);
        } else {
            obj[propName] = v;
        }
    }
    return v;
}

