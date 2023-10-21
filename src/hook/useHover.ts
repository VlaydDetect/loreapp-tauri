import {MutableRefObject, useEffect, useRef, useState} from "react";

// https://youtu.be/ks8oftGP2oc?t=290
export function useHover<T = undefined>(ref: MutableRefObject<T | undefined>) {
    const [isHovering, setHovering] = useState(false)

    const on = () => setHovering(true)
    const off = () => setHovering(false)

    useEffect(() => {
        if (!ref.current) return
        const node = ref.current

        // @ts-ignore
        node.addEventListener('mouseenter', on)
        // @ts-ignore
        node.addEventListener('mousemove', on)
        // @ts-ignore
        node.addEventListener('mouseleave', off)

        return () => {
            // @ts-ignore
            node.removeEventListener('mouseenter', on)
            // @ts-ignore
            node.removeEventListener('mousemove', on)
            // @ts-ignore
            node.removeEventListener('mouseleave', off)
        }
    }, [])

    return isHovering
}