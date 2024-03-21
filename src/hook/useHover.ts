import {RefCallback, useCallback, useRef, useState} from "react";

export function useHover<T extends Element>(): [RefCallback<T>, boolean] {
    const [isHovering, setHovering] = useState(false)
    const previousNode = useRef<T>();

    const handleMouseEnter = useCallback(() => setHovering(true), []);
    const handleMouseLeave = useCallback(() => setHovering(false), []);

    const ref = useCallback<(node: T) => void>((node) => {
        if (previousNode.current?.nodeType === Node.ELEMENT_NODE) {
            previousNode.current.removeEventListener(
                "mouseenter",
                handleMouseEnter
            );
            previousNode.current.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );
        }

        if (node?.nodeType === Node.ELEMENT_NODE) {
            node.addEventListener("mouseenter", handleMouseEnter);
            node.addEventListener("mouseleave", handleMouseLeave);
        }

        previousNode.current = node;
    }, [handleMouseEnter, handleMouseLeave]);

    return [ref, isHovering];
}