import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { HubEvent } from '@/interface';
// import {useEffect, useRef} from "react";

type EventHandler<D> = (payload: D | undefined) => void;

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

//#region --------- First Implementation --------------------------------
// const modelHandlers: Map<string, HubEvent<any>> = new Map<string, HubEvent<any>>()
type HubEventDesc = {
    topic: string,
    label?: string
};
const modelHandlers: Map<HubEventDesc, EventHandler<any>> = new Map<HubEvent<any>, EventHandler<any>>;

listen<HubEvent<any>>("HubEvent", ({payload}) => {
    if (modelHandlers.has({ topic: payload.topic, label: payload.label })) {
        // @ts-ignore
        modelHandlers.get(payload)();
    }
});

export const useModelEvent = <D>(topic: string, label: string, handler: EventHandler<D>): void => {
    const eventDesc: HubEventDesc = { topic, label };
    modelHandlers.set(eventDesc, handler);
}
//#endregion --------- First Implementation --------------------------------