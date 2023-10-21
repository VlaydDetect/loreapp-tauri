import {useEffect, useLayoutEffect, useRef, useState} from "react";
import { Store } from "tauri-plugin-store-api";
import Cookies from 'js-cookie';

const SAVE_DELAY = 500;

const stores: { [key: string] : Store } = {};

function getTauriStore(filename: string) {
    if (!(filename in stores)) {
        stores[filename] = new Store(filename);
    }

    return stores[filename];
}

export const useStorage = useTauriStore

/**
 *
 * @param key
 * @param defaultValue
 * @param storeName is a path that it relative to AppData if not absolute
 */
export function useTauriStore(key: string, defaultValue: any, storeName = "data.dat") {
    const [state, setState] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    const store = getTauriStore(storeName);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // useLayoutEffect will be called before DOM painting and before useEffect
    useLayoutEffect(() => {
        let allow = true;
        store.get(key).then(value => {
            if (value === null) throw "";
            if (allow) setState(value);
        }).catch(() => {
            store.set(key, defaultValue).then(() => {
                timeoutRef.current = setTimeout(() => store.save(), SAVE_DELAY);
            });
        }).then(() => {
            if (allow) setLoading(false);
        });
        return () => {
            allow = false;
        };
    }, []);
    // useLayoutEffect doesn't like Promise return values
    useEffect(() => {
        if (!loading) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                store.set(key, state).then(() => {
                    timeoutRef.current = setTimeout(() => store.save(), SAVE_DELAY)
                })
            }
        }
    }, [state]);
    return [state, setState, loading]
}
