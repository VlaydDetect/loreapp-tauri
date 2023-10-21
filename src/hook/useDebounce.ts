import {useCallback, useRef} from "react";

// https://youtu.be/ks8oftGP2oc?t=1220

export function useDebounce(callback: Function, delay: number): Function {
    const timer = useRef<NodeJS.Timeout>()

    return useCallback((...args: any) => {  // TODO: replace ANY
        if (timer.current) {
            clearTimeout(timer.current)
        }
        timer.current = setTimeout(() => callback(...args), delay)
    }, [callback, delay])
}