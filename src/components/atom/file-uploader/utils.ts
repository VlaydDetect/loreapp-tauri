import { ResponseEsque } from './types';

export async function safeParseJSON<T>(
    input: string | ResponseEsque | Request,
): Promise<T | Error> {
    if (typeof input === 'string') {
        try {
            return JSON.parse(input) as T;
        } catch (err) {
            console.error(`Error parsing JSON, got '${input}'`);
            return new Error(`Error parsing JSON, got '${input}'`);
        }
    }

    const text = await input.text();
    try {
        return JSON.parse(text ?? 'null') as T;
    } catch (err) {
        console.error(`Error parsing JSON, got '${text}'`);
        return new Error(`Error parsing JSON, got '${text}'`);
    }
}

/** typesafe Object.keys */
export function objectKeys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}
