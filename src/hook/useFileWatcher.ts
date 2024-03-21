import { useEffect, useRef } from 'react';
import * as tauriEvent from '@tauri-apps/api/event';
import { watchDir, Event } from '@/fs/fileWatcher';

interface IProps {
    path: string;
    callback: (event: Event) => void;
    filter?: string[];
    options?: {
        delayMs?: number;
        recursive?: boolean;
        filters?: string[];
    };
}

// TODO: implement filter of files for watching
export function useFileWatcher({ path, callback, options = {} }: IProps) {
    const mountID = useRef<number | null>(null);
    const unlistens = useRef<{ [key: number]: tauriEvent.UnlistenFn }>({});

    useEffect(() => {
        watchDir({ path, mountID, unlistens, callback, options });

        return () => {
            mountID.current = null;
        };
    }, [path]);
}
