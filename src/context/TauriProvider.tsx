import React, { useState, useEffect, useContext } from "react";
import { listen } from '@tauri-apps/api/event';
import * as os from "@tauri-apps/api/os"
import { appWindow } from '@tauri-apps/api/window';

// NOTE: Add cacheable Tauri calls in this file
//       this you want to use synchronously across components in your app

type TauriContextType = {
    loading: boolean,
    osType: os.OsType,
    fileSep: string,
};

const TauriContext = React.createContext<TauriContextType>({
    loading: true,
    osType: '' as os.OsType,
    fileSep: '/',
})

export const useTauriContext = () => useContext(TauriContext)

const TauriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [osType, setOsType] = useState<os.OsType>('Windows_NT');
    const [loading, setLoading] = useState(false);
    const [fileSep, setFileSep] = useState<string>('');

    useEffect(() => {
        // if you want to listen for event listeners, use mountID trick to call unlisten on old listeners
        const callTauriAPIs = async () => {
            // Handle additional app launches (url, etc.)
            await listen('newInstance', () => {
                appWindow.unminimize().then(() => appWindow.setFocus());
            });

            const _osType = await os.type();
            setOsType(_osType);
            const _fileSep = _osType === 'Windows_NT' ? '\\' : '/';
            setFileSep(_fileSep);
            setLoading(false);
            // if you aren't using the window-state plugin,
            //  you need to manually show the window (uncomment code)
            // import { invoke } from '@tauri-apps/api';
            // invoke('show_main_window');
            // Why? The default background color of webview is white
            //  so we should show the window when the react app loads
            // See: https://github.com/tauri-apps/tauri/issues/1564
        }
        callTauriAPIs().catch(console.error);
    }, [])

    return (
        <TauriContext.Provider value={{ loading, fileSep, osType}}>
            {children}
        </TauriContext.Provider>
    )
}

export default TauriProvider;
