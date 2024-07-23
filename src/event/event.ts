import React from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { HubEvent } from '@/interface';

type EventHandler<D extends Record<string, any>> = (payload: D | undefined) => void;

//#region --------- First Implementation --------------------------------
// const useModelEvent = <D>(topic: string, label: string, handler: (event: D | undefined) => void): void => {
//     const unlistenRef = useRef<UnlistenFn | null>(null);
//
//     if (!unlistenRef.current) {
//         listen<HubEvent<D>>("HubEvent", ({ payload }) => {
//             if (payload.topic === topic && payload.label === label) {
//                 handler(payload.data);
//             }
//         }).then(newUnlisten => unlistenRef.current = newUnlisten);
//     }
//
//     return useEffect(() => {
//         return () => {
//             if (unlistenRef.current) {
//                 unlistenRef.current();
//             }
//         };
//     }, []);
// }
//#endregion --------- First Implementation --------------------------------

//#region --------- Second Implementation --------------------------------
// const modelHandlers: Map<string, HubEvent<any>> = new Map<string, HubEvent<any>>()
type HubEventDesc = {
    topic: string;
    label?: string;
};

const modelHandlers: Map<HubEventDesc, EventHandler<any>> = new Map<
    HubEvent<any>,
    EventHandler<any>
>();

listen<HubEvent<any>>('HubEvent', ({ payload }) => {
    if (modelHandlers.has({ topic: payload.topic, label: payload.label })) {
        // @ts-ignore
        modelHandlers.get(payload)(payload.data);
    }
});

export const useModelEvent = <D extends Record<string, any>>(
    topic: string,
    label: string,
    handler: EventHandler<D>,
): void => {
    const eventDesc: HubEventDesc = { topic, label };
    modelHandlers.set(eventDesc, handler);
};

type TExcludeVariants = 'create' | 'update' | 'delete';

type ModelEventsProps<D extends Record<string, any>> = {
    topic: string;
    exclude?: TExcludeVariants[];
    idAttribute: string;
    state: D[];
    setState: (value: D[]) => void;
};

type ModelEventsResult<D extends Record<string, any>> = {
    created: D | undefined;
    updated: D | undefined;
    deleted: D | undefined;
};

export const useModelEvents = <D extends Record<string, any>>({
    topic,
    exclude,
    idAttribute,
    state,
    setState,
}: ModelEventsProps<D>): ModelEventsResult<D> => {
    const result: ModelEventsResult<D> = {
        created: undefined,
        updated: undefined,
        deleted: undefined,
    };

    let excludeCreate = false;
    let excludeUpdate = false;
    let excludeDelete = false;

    if (exclude && exclude.length > 0) {
        excludeCreate = exclude.includes('create');
        excludeUpdate = exclude.includes('update');
        excludeDelete = exclude.includes('delete');
    }

    if (!excludeCreate) {
        useModelEvent<D>(topic, 'create', data => {
            if (data) {
                const newState = [...state, data];
                setState(newState);
                result.created = data;
            }
        });
    }

    if (!excludeUpdate) {
        useModelEvent<D>(topic, 'update', data => {
            if (data) {
                const idx = state.findIndex(d => d[idAttribute] === data[idAttribute]);
                const newState = [...state.slice(0, idx), data, ...state.slice(idx + 1)];
                setState(newState);
                result.updated = data;
            }
        });
    }

    if (!excludeDelete) {
        useModelEvent<D>(topic, 'delete', data => {
            if (data) {
                const idx = state.findIndex(d => d[idAttribute] === data[idAttribute]);
                const newState = [...state.slice(0, idx), ...state.slice(idx + 1)];
                setState(newState);
                result.deleted = data;
            }
        });
    }

    return result;
};
//#endregion --------- Second Implementation --------------------------------
