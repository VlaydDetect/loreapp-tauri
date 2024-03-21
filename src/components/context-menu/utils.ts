import { EventHandlers } from '@/utils';
import React from 'react';
import { Rectangle } from 'react-resizable-panels/dist/declarations/src/utils/rects/types';

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
    if (object === undefined) {
        return {};
    }

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

/**
 * Removes event handlers from the given object.
 * A field is considered an event handler if it is a function with a name beginning with `on`.
 *
 * @param object Object to remove event handlers from.
 * @returns Object with event handlers removed.
 */
export function omitEventHandlers<Props extends Record<string, unknown>>(
    object: Props | undefined,
) {
    if (object === undefined) {
        return {};
    }

    const result = {} as Partial<Props>;

    Object.keys(object)
        .filter(prop => !(prop.match(/^on[A-Z]/) && typeof object[prop] === 'function'))
        .forEach(prop => {
            (result[prop] as any) = object[prop];
        });

    return result;
}

/**
 * Simplifies the display of a type (without modifying it).
 * Taken from https://effectivetypescript.com/2022/02/25/gentips-4-display/
 */
export type Simplify<T> = T extends Function ? T : { [K in keyof T]: T[K] };

/**
 * Type of the ownerState based on the type of an element it applies to.
 * This resolves to the provided OwnerState for React components and `undefined` for host components.
 * Falls back to `OwnerState | undefined` when the exact type can't be determined in development time.
 */
type OwnerStateWhenApplicable<ElementType extends React.ElementType, OwnerState> =
    ElementType extends React.ComponentType<any>
        ? OwnerState
        : ElementType extends keyof JSX.IntrinsicElements
          ? undefined
          : OwnerState | undefined;

export type AppendOwnerStateReturnType<
    ElementType extends React.ElementType,
    OtherProps,
    OwnerState,
> = Simplify<
    OtherProps & {
        ownerState: OwnerStateWhenApplicable<ElementType, OwnerState>;
    }
>;

export function getOffsetTop(rect: Rectangle, vertical: number | 'center' | 'bottom') {
    let offset = 0;

    if (typeof vertical === 'number') {
        offset = vertical;
    } else if (vertical === 'center') {
        offset = rect.height / 2;
    } else if (vertical === 'bottom') {
        offset = rect.height;
    }

    return offset;
}

export function getOffsetLeft(rect: Rectangle, horizontal: number | 'center' | 'right') {
    let offset = 0;

    if (typeof horizontal === 'number') {
        offset = horizontal;
    } else if (horizontal === 'center') {
        offset = rect.width / 2;
    } else if (horizontal === 'right') {
        offset = rect.width;
    }

    return offset;
}

function getTransformOriginValue(transformOrigin: {
    horizontal: number | string;
    vertical: number | string;
}) {
    return [transformOrigin.horizontal, transformOrigin.vertical]
        .map(n => (typeof n === 'number' ? `${n}px` : n))
        .join(' ');
}
