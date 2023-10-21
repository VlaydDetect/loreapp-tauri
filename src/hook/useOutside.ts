import {useState, useEffect, useRef, Dispatch, SetStateAction, RefObject} from "react";

type TOut = {
    ref: RefObject<HTMLElement>,
    isShow: boolean,
    setIsShow: Dispatch<SetStateAction<boolean>>
}

export default function useOutside(initialIsVisible: boolean): TOut {
    const [isShow, setIsShow] = useState(initialIsVisible)
    const ref = useRef<HTMLElement>(null)

    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setIsShow(false)
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true)
        return () => {
            document.removeEventListener('click', handleClickOutside, true)
        }
    }, []);

    return { ref, isShow, setIsShow }
}
