import React, {useCallback, useRef} from "react";

// https://youtu.be/ks8oftGP2oc?t=1220

export function useDebounce<T>(callback: React.Dispatch<React.SetStateAction<T>>, delay: number): React.Dispatch<T> {
    const timer = useRef<NodeJS.Timeout>()

    return useCallback((args: T) => {  // TODO: replace ANY
        if (timer.current) {
            clearTimeout(timer.current)
        }
        timer.current = setTimeout(() => callback(args), delay)
    }, [callback, delay])
}
