import {invoke} from "@tauri-apps/api";
import {deepFreeze} from "utils-min";
import {IpcResponse} from "./interface"
import {InvokeArgs} from "@tauri-apps/api/tauri";

/**
 * Small wrapper on top of tauri api invoke
 */
async function ipcInvoke<T>(method: string, params?: InvokeArgs): Promise<T> {
    const response: IpcResponse<T> = await invoke(method, params);
    if (response.error !== null && response.result === null) {
        console.log('ERROR - ipc_invoke - ipc_invoke error', response);
        throw new Error(response.error.message);
    } else if (response.error === null && response.result !== null) {
        return deepFreeze(response.result.data);
    } else {
        throw new Error("Invalid ipc response format");
    }
}

export default ipcInvoke
