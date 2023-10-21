import {useState} from "react";

export function useToggle() {
    const [status, setStatus] = useState(false);
    const toggleStatus = () => setStatus(prev => !prev)

    return {status, toggleStatus}
}