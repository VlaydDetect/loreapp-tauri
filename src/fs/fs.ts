import {writeTextFile, createDir, BaseDirectory} from "@tauri-apps/api/fs";
import { desktopDir } from "@tauri-apps/api/path";
import { open as openDialog, DialogFilter } from '@tauri-apps/api/dialog';
import { save } from '@tauri-apps/api/dialog';
import ipcInvoke from "@/ipc";
import {PathsToGet} from "@/interface/PathsToGet";
import {DirectoryContent} from "@/interface";

//#region    ---------- Constants ----------
export const IMAGE_EXTENSIONS = ["bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "tga", "tiff", "webp",]

export const ImageFilter: DialogFilter = {
    name: 'Images',
    extensions: IMAGE_EXTENSIONS
}
//#endregion ---------- /Constants ----------

//#region    ---------- Interfaces ----------
interface IChooseDir {
    multiple?: boolean,
    defaultPath?: string,
    filters?: DialogFilter[]
}

interface ICreateDir {
    path: string,
    recursive?: boolean,
    inBaseDir?: boolean,
    baseDir?: BaseDirectory
}

interface ICreateFile {
    filename: string,
    data: string,
    baseDir?: BaseDirectory
}
//#endregion ---------- /Interfaces ----------

//#region    ---------- Tauri Events ----------
export async function createFile({filename, data, baseDir}: ICreateFile): Promise<void> {
    if (baseDir) {
        return  writeTextFile(filename, data, { dir: baseDir })
    } else {
        return ipcInvoke<void>("create_file", { filename, data })
    }
}

export async function readFile(filename: string): Promise<string> {
    return ipcInvoke<string>("read_file", { filename })
}

export async function deleteFile(filename: string): Promise<void> {
    return ipcInvoke<void>("delete_file", { filename }) // TODO: impl
}

export async function createDirectory({path, recursive = false, inBaseDir = false, baseDir}: ICreateDir): Promise<void> {
    if (inBaseDir) {
        return createDir(path, { dir: baseDir, recursive })
    } else {
        return ipcInvoke<void>(`create_directory${recursive ? '_all': ''}`, { path })
    }
}

export async function chooseDirectoryDialog({multiple = false, defaultPath, filters}: IChooseDir): Promise<null | string | string[]> {
    if (!defaultPath) {
        defaultPath = await desktopDir()
    }

    return openDialog({
        directory: true,
        multiple,
        defaultPath,
        filters
    })
}

export async function saveFileDialog(defaultPath?: string, filters?: DialogFilter[]): Promise<string | null> {
    if (!defaultPath) {
        defaultPath = await desktopDir()
    }

    return save({
        defaultPath,
        filters
    })
}

export async function isExists(path: string): Promise<boolean> {
    return ipcInvoke<boolean>("is_exists", { path })
}

export async function getAppPath(variant: PathsToGet): Promise<string> {
    return ipcInvoke<string>("get_app_path", { variant })
}

export async function readFileToDataUrl(filepath: string): Promise<string> {
    return ipcInvoke<string>("read_file_to_data_url", { filepath })
}

export async function openDirectory(path: string): Promise<DirectoryContent[]> {
    return ipcInvoke<DirectoryContent[]>("open_directory", { path });
}

export async function getCache(cache: 'gallery' | 'documents') {
    switch (cache) {
        case "gallery": return ipcInvoke<string>("get_gallery_cache");
        case "documents": return ipcInvoke<string>("get_documents_cache");
    }
}

export async function updateCache(cache: 'gallery' | 'documents', data: string) {
    switch (cache) {
        case "gallery": return ipcInvoke<string>("update_gallery_cache", {data});
        case "documents": return ipcInvoke<string>("update_documents_cache", {data});
    }
}

export async function list_pictures() {

}
//#endregion ---------- /Tauri Events ----------

//#region    ---------- Functions ----------
export function filterByExtensions(files: string[], filters: string[]): string[] {
    let images: string[] = []

    files.forEach(file => {
        const extension = file.split('.').pop()
        if (extension && filters.includes(extension)) {
            images.push(file)
        }
    })

    return images
}

// TODO: impl folder structure display
export async function getFilesRecursively(directory: string, includeDirs = false): Promise<string[]> {
    return await ipcInvoke<string[]>("get_files_recursively", {path: directory, includeDirs})
}
//#endregion ---------- /Functions ----------
