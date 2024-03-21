// import * as tauriEvent from "@tauri-apps/api/event";
// import { watch, watchImmediate, RawEvent, DebouncedEvent } from "tauri-plugin-fs-watch-api";
// import {MutableRefObject} from "react";
// import {isExists} from "@/fs/fs";
//
// interface IProps {
//     path: string,
//     mountID: MutableRefObject<number | null>,
//     unlistens: MutableRefObject<{ [key: number]: tauriEvent.UnlistenFn }>,
//     event: () => void,
//     filter?: string[]
//     options?: {
//         delayMs?: number,
//         recursive?: boolean
//     }
// }
//
// export function watch_dir({ path, mountID, unlistens, event, options = {} }: IProps) {
//     const thisMoundID = Math.random()
//     mountID.current = thisMoundID
//
//     isExists(path).then(exists => {
//         if (mountID.current !== thisMoundID) {
//             if (unlistens.current[thisMoundID]) {
//                 unlistens.current[thisMoundID]()
//             }
//         } else {
//             if (exists) {
//
//                 if (options.delayMs !== undefined) {
//                     watch(path, event, options).then(newUnlisten => {
//                         unlistens.current[thisMoundID] = newUnlisten
//                     })
//                 } else {
//                     watchImmediate(path, event, options).then(newUnlisten => {
//                         unlistens.current[thisMoundID] = newUnlisten
//                     })
//                 }
//
//             }
//         }
//     })
// }

import * as tauriEvent from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { UnlistenFn } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { MutableRefObject } from 'react';
import {
    createFile,
    filterByExtensions,
    getAppPath,
    getFilesRecursively,
    IMAGE_EXTENSIONS,
    isExists,
    readFile,
} from '@/fs/fs';
import { Document, Picture, AppSettings } from '@/interface';

//#region -------- API --------
export interface WatchOptions {
    delayMs?: number;
    recursive?: boolean;
    filters?: string[];
}

// See Notify Event, EventKind and EventAttributes
const enum EAccessMode {
    Any,
    Execute,
    Read,
    Write,
    Other,
}

type TAccessKind = 'any' | 'read' | { open: EAccessMode } | { close: EAccessMode };

const enum ECreateKind {
    Any,
    File,
    Folder,
    Other,
}

const enum EDataChange {
    Any,
    Size,
    Content,
    Other,
}

const enum EMetadataKind {
    Any,
    AccessTime,
    WriteTime,
    Permissions,
    Ownership,
    Extended,
    Other,
}

const enum ERenameMode {
    Any,
    To,
    From,
    Both,
    Other,
}

type TModifyKind =
    | 'any'
    | { data: EDataChange }
    | { metadata: EMetadataKind }
    | { name: ERenameMode }
    | 'other';

enum ERemoveKind {
    Any,
    File,
    Folder,
    Other,
}

type EventKind =
    | 'any'
    | { access: TAccessKind }
    | { create: ECreateKind }
    | { modify: TModifyKind }
    | { remove: ERemoveKind }
    | 'other';

type TEventAttributes = {
    info?: string;
    source?: string;
};

export type Event = {
    type: EventKind;
    paths: string[];
    attrs?: TEventAttributes;
    filters?: string[];
};

async function unwatch(id: number): Promise<void> {
    await invoke('unwatch', { id });
}

async function watch(
    paths: string | string[],
    callback: (event: Event) => void,
    options: WatchOptions = {},
): Promise<UnlistenFn> {
    const opts = {
        delayMs: null,
        recursive: false,
        filters: null,
        ...options,
    };

    let watchPaths;
    if (typeof paths === 'string') {
        watchPaths = [paths];
    } else {
        watchPaths = paths;
    }

    const id = window.crypto.getRandomValues(new Uint32Array(1))[0];

    await invoke('watch', { id, paths: watchPaths, options: opts });

    const unlisten = await appWindow.listen<Event>(`watcher://raw-event/${id}`, event => {
        callback(event.payload);
    });

    return () => {
        void unwatch(id);
        unlisten();
    };
}
//#endregion -------- /API --------

interface IProps {
    path: string;
    mountID: MutableRefObject<number | null>;
    unlistens: MutableRefObject<{ [key: number]: tauriEvent.UnlistenFn }>;
    callback: (event: Event) => void;
    options?: {
        delayMs?: number;
        recursive?: boolean;
        filters?: string[];
    };
}

export function watchDir({ path, mountID, unlistens, callback, options = {} }: IProps) {
    const thisMoundID = Math.random();
    mountID.current = thisMoundID;

    isExists(path).then(exists => {
        if (mountID.current !== thisMoundID) {
            if (unlistens.current[thisMoundID]) {
                unlistens.current[thisMoundID]();
            }
        } else {
            if (exists) {
                watch(path, callback, options).then(newUnlisten => {
                    unlistens.current[thisMoundID] = newUnlisten;
                });
            }
        }
    });
}

export const picturesFileWatcherCallback = (
    event: Event,
    appSettings: AppSettings,
    pictures: IPicture[],
    callback: (newPictures: IPicture[]) => void,
) => {
    getAppPath('GalleryData').then(path => {
        getFilesRecursively(appSettings.galleryPath, true).then(result => {
            const imgs = filterByExtensions(result, IMAGE_EXTENSIONS);
            const pics: IPicture[] = [];

            imgs.forEach((image, index) => {
                pics.push({
                    id: index,
                    title: '',
                    description: '',
                    imgPath: image,
                    tags: [],
                    categories: [],
                });
            });

            createFile({ filename: path, data: JSON.stringify(pics) }).then(() => {
                readFile(path).then(result => {
                    callback(JSON.parse(result) as IPicture[]);
                });
            });
        });
    });
};

export const documentsFileWatcherCallback = (
    event: Event,
    appSettings: AppSettings,
    documents: IDocument[],
    callback: (newDocuments: IDocument[]) => void,
) => {
    getAppPath('DocumentsData').then(path => {
        getFilesRecursively(appSettings.documentsPath, true).then(result => {
            const docs = filterByExtensions(result, ['jdoc']);
            const newDocuments: IDocument[] = [];
            console.log(`File Watcher Docs: ${docs}`);

            docs.forEach(doc => {
                readFile(doc).then(data => {
                    let thisDoc = JSON.parse(data) as IDocument;
                    if (!thisDoc.body) {
                        thisDoc.body = undefined;
                    }
                    newDocuments.push(thisDoc);
                });
            });

            console.log(`File Watcher New Documents: ${newDocuments}`);

            createFile({ filename: path, data: JSON.stringify(newDocuments) }).then(() => {
                readFile(path).then(result => {
                    callback(JSON.parse(result) as IDocument[]);
                });
            });
        });
    });
};
