import {useEffect, useState} from "react";
import Cookies, {CookieAttributes} from 'js-cookie';

type CookieOptions = Pick<CookieAttributes, 'expires' | 'sameSite' | 'path'>

/**
 * Cookie expires in a millenia.
 * Synchronous
 * @param key
 * @param defaultValue
 * @param expires
 * @param sameSite != 'strict' because the cookie is not read for sensitive actions
 * @param path
 */
export function useCookie(key: string, defaultValue?: any, {expires = 365000, sameSite = 'lax', path = '/'}: CookieOptions = {}) {
    const cookieValue = Cookies.get(key)
    const [state, setState] = useState(cookieValue || defaultValue)
    useEffect(() => {
        Cookies.set(key, state, {expires, sameSite, path});
    }, [state]);
    return [state, setState];
}

// export default function useCookie(key: string, defaultValue?: any) {
//     const [value, setValue] = useState(() => {
//         const cookieValue = Cookies.get(key)
//         if (cookieValue) return cookieValue
//
//         Cookies.set(key, defaultValue)
//         return defaultValue
//     })
//
//     const updateCookie = useCallback(() => (newValue: any, {expires = 365000, sameSite = 'lax', path = '/'}: CookieOptions = {}) => {
//         Cookies.set(key, newValue, { expires, sameSite, path })
//         setValue(newValue)
//     }, [key])
//
//     const deleteCookie = useCallback( () => {
//         Cookies.remove(key)
//         setValue(null)
//     }, [key])
//
//     return { value, updateCookie, deleteCookie }
// }