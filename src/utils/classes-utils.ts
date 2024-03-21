import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const globalStateClasses = {
    active: 'active',
    checked: 'checked',
    completed: 'completed',
    disabled: 'disabled',
    error: 'error',
    expanded: 'expanded',
    focused: 'focused',
    focusVisible: 'focusVisible',
    open: 'open',
    readOnly: 'readOnly',
    required: 'required',
    selected: 'selected',
};

export type GlobalStateSlot = keyof typeof globalStateClasses;

const GLOBAL_CLASS_PREFIX = 'base';

function buildStateClass(state: string) {
    return `${GLOBAL_CLASS_PREFIX}--${state}`;
}

function buildSlotClass(componentName: string, slot: string) {
    return `${GLOBAL_CLASS_PREFIX}-${componentName}-${slot}`;
}

export function generateUtilityClass(
    componentName: string,
    slot: string | GlobalStateSlot,
): string {
    const globalStateClass = globalStateClasses[slot as GlobalStateSlot];
    return globalStateClass
        ? buildStateClass(globalStateClass)
        : buildSlotClass(componentName, slot);
}

export function composeClasses<ClassKey extends string>(
    slots: Record<ClassKey, ReadonlyArray<string | false | undefined | null>>,
    getUtilityClass: (slot: string) => string,
    classes: Record<string, string> | undefined = undefined,
): Record<ClassKey, string> {
    const output: Record<ClassKey, string> = {} as any;

    Object.keys(slots).forEach(
        // `Object.keys(slots)` can't be wider than `T` because we infer `T` from `slots`.
        // @ts-expect-error https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208
        (slot: ClassKey) => {
            output[slot] = slots[slot]
                .reduce((acc, key) => {
                    if (key) {
                        const utilityClass = getUtilityClass(key);
                        if (utilityClass !== '') {
                            acc.push(utilityClass);
                        }
                        if (classes && classes[key]) {
                            acc.push(classes[key]);
                        }
                    }
                    return acc;
                }, [] as string[])
                .join(' ');
        },
    );

    return output;
}
