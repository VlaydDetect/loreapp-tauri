import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { HubEvent } from '@/interface';
import {useRef} from "react";
import {splitAndTrim} from "@/utils/utils";

function buildTopicLabelKey(topic: string, label: string) {
    return topic + "-!-" + label;
}

// static/private: call ref method (with optional label override)
function invokeRef(ref: HubRef, data: any, label?: string) {
    const info = {
        topic: ref.topic,
        label: ref.label || label,
        ns: ref.ns
    };
    ref.fun.call(ref.ctx, data, info);
}

interface HubRef {
    topic: string,
    fun: Function,
    ns?: string,
    ctx?: any,
    label?: string
}

class HubData {
    name: string;
    refsByTopic = new Map<string, HubRef[]>();
    refsByTopicLabel = new Map();

    constructor(name: string) {
        this.name = name;
    }

    getRefs(topics: string[], labels: string[] | null) {
        const refs: HubRef[] = [];
        const refsByTopic = this.refsByTopic;
        const refsByTopicLabel = this.refsByTopicLabel;

        topics.forEach(function (topic) {
            // if we do not have labels, then, just look in the topic dic
            if (labels == null || labels.length === 0) {
                const topicRefs = refsByTopic.get(topic);
                if (topicRefs) {
                    refs.push.apply(refs, topicRefs);
                }
            }
            // if we have some labels, then, take those in accounts
            else {
                labels.forEach(function (label) {
                    const topicLabelRefs = refsByTopicLabel.get(buildTopicLabelKey(topic, label));
                    if (topicLabelRefs) {
                        refs.push.apply(refs, topicLabelRefs);
                    }
                });
            }
        });
        return refs;
    };
}

//#region    ---------- Public Types ----------
export interface Hub {
    /** Publish a message to a hub for a given topic  */
    pub(topic: string, message: any): void;
    /** Publish a message to a hub for a given topic and label  */
    pub(topic: string, label: string, message: any): void;
}
//#endregion ---------- /Public Types ----------


//#region    ---------- Hub Implementation ----------
// User Hub object exposing the public API
const hubDic = new Map<string, HubImpl>();
const hubDataDic = new Map<string, HubData>();

class HubImpl implements Hub {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    /** Publish a message to a hub for a given topic  */
    pub(topic: string, message: any): void;
    /** Publish a message to a hub for a given topic and label  */
    pub(topic: string, label: string, message: any): void;
    pub(topics: string, labels?: string | null, data?: any) {
        // ARG SHIFTING: if data is undefined, we shift args to the RIGHT
        if (typeof data === "undefined") {
            data = labels;
            labels = null;
        }

        //// Normalize topic and label to arrays
        const topicArray = splitAndTrim(topics, ",");
        const labelArray = (labels != null) ? splitAndTrim(labels, ",") : null;

        const hubData = hubDataDic.get(this.name)!;

        const hasLabels = (labels != null && labels.length > 0);

        // if we have labels, then, we send the labels bound events first
        if (hasLabels) {
            hubData.getRefs(topicArray, labelArray).forEach(ref => {
                invokeRef(ref, data);
            });
        }

        // then, we send the topic only bound
        hubData.getRefs(topicArray, null).forEach(ref => {
            // if this sends, has label, then, we make sure we invoke for each of this label
            if (hasLabels) {
                labelArray!.forEach(label => {
                    invokeRef(ref, data, label);
                });
            }
            // if we do not have labels, then, just call it.
            else {
                invokeRef(ref, data);
            }
        });

    }

    deleteHub() {
        hubDic.delete(this.name);
        hubDataDic.delete(this.name);
    }
}
//#endregion    ---------- Hub Implementation ----------


//#region    ---------- Public Factory ----------
/** Singleton hub factory */
export function hub(name: string): Hub {
    if (name == null) {
        throw new Error('loreapp event INVALID API CALLS: hub(name) require a name (no name was given).');
    }
    let hub = hubDic.get(name);
    // if it does not exist, we create and set it.
    if (hub === undefined) {
        hub = new HubImpl(name);
        hubDic.set(name, hub);
        // create the hubData
        hubDataDic.set(name, new HubData(name));
    }
    return hub;
}
//#endregion ---------- /Public Factory ----------


//#region    ---------- Decorators ----------
type OnHubEvent = { methodName: string, hubName: string, topic: string, label?: string };
const _onHubEventByConstructor: Map<Function, OnHubEvent[]> = new Map();

/**
 * `onHub` decorator to bind a hub event to this instance.
 */
export function onHub(hubName: string, topic: string, label?: string) {
    // target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const clazz = target.constructor;

        // get the onEvents array for this clazz
        let onEvents = _onHubEventByConstructor.get(clazz);
        if (onEvents == null) {
            onEvents = [];
            _onHubEventByConstructor.set(clazz, onEvents);
        }

        // create and push the event
        const onEvent: OnHubEvent = {
            methodName: propertyKey,
            hubName,
            topic,
            label
        };
        onEvents.push(onEvent);
    }
}
//#endregion    ---------- Decorators ----------


//#region    ---------- Tauri Handle ----------
// --- Bridge Tauri HubEvent events to hub/pub/sub event
//     (optional, but allows to use hub("Data").sub(..) or
//      @onHub("Data", topic, label) on BaseHTMLElement custom elements)
listen<HubEvent<any>>("HubEvent", ({payload}) => {
    const hubEvent = payload;

    // Get or create the Hub by name (from dom-native)
    //   (a Hub is an event bus namespace silo)
    let _hub = hub(hubEvent.hub);

    // Publish event to the given Hub
    if (hubEvent.label != null) {
        _hub.pub(hubEvent.topic, hubEvent.label, hubEvent.data);
    } else {
        _hub.pub(hubEvent.topic, hubEvent.data);
    }
})
//#endregion    ---------- Tauri Handle ----------
