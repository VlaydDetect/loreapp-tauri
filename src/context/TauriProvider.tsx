import React, { useState, useEffect, useContext } from "react";
import { useInterval } from '@mantine/hooks';
import { listen } from '@tauri-apps/api/event';
import * as tauriPath from "@tauri-apps/api/path"
import * as fs from "@tauri-apps/api/fs"
import * as os from "@tauri-apps/api/os"
import { appWindow } from '@tauri-apps/api/window';
import { WindowTitlebar } from "@/components/WindowTitlebar";
import { APP_NAME } from '@/utils/utils';

const WIN32_CUSTOM_TITLEBAR = false;

// NOTE: Add cacheable Tauri calls in this file
//       this you want to use synchronously across components in your app

const TauriContext = React.createContext({
    loading: true,
    downloads: '',
    documents: '',
    appDocuments: '',
    osType: '' as os.OsType,
    fileSep: '/',
    isFullScreen: false,
    usingCustomTitleBar: false,
})

export const useTauriContext = () => useContext(TauriContext)
export function TauriProvider({ children } : { children: any }) {
    const [downloads, setDownloads] = useState<string>('')
    const [documents, setDocuments] = useState<string>('')
    const [osType, setOsType] = useState<os.OsType>('Windows_NT')
    const [loading, setLoading] = useState(false)
    const [fileSep, setFileSep] = useState<string>('')
    const [appDocuments, setAppDocuments] = useState('');
    const [isFullScreen, setFullscreen] = useState(false);
    // false because might be running in web
    const [usingCustomTitleBar, setUsingCustomTitleBar] = useState(false);

    const tauriInterval = useInterval(() => {
        appWindow.isFullscreen().then(setFullscreen);
    }, 200)

    useEffect(() => {
        tauriInterval.start();
        return tauriInterval.stop;
    }, [])

    useEffect(() => {
        if (osType === 'Windows_NT') appWindow.setDecorations(!WIN32_CUSTOM_TITLEBAR);
    }, [osType])

    useEffect(() => {
        // hide titlebar when: in fullscreen, not on Windows, and explicitly allowing custom titlebar
        setUsingCustomTitleBar(!isFullScreen && osType === 'Windows_NT' && WIN32_CUSTOM_TITLEBAR);
    }, [isFullScreen, osType])

    useEffect(() => {
        // if you want to listen for event listeners, use mountID trick to call unlisten on old listeners
        const callTauriAPIs = async () => {
            // Handle additional app launches (url, etc.)
            await listen('newInstance', () => {
                appWindow.unminimize().then(() => appWindow.setFocus());
            });
            setDownloads(await tauriPath.downloadDir());
            const _documents = await tauriPath.documentDir();
            setDocuments(_documents);
            const _osType = await os.type();
            setOsType(_osType);
            const _fileSep = _osType === 'Windows_NT' ? '\\' : '/';
            setFileSep(_fileSep);
            await fs.createDir(APP_NAME, { dir: fs.BaseDirectory.Document, recursive: true });
            setAppDocuments(`${_documents}${APP_NAME}`);
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
        <TauriContext.Provider value={{ loading, fileSep, downloads, documents, osType, appDocuments, isFullScreen, usingCustomTitleBar }}>
            {usingCustomTitleBar && <WindowTitlebar />}
            {children}
        </TauriContext.Provider>
    )
}
