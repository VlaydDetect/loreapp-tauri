import { invoke } from '@tauri-apps/api';
import { deepFreeze } from 'utils-min';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { IpcResponse } from './interface';

/**
 * Small wrapper on top of tauri api invoke
 */
async function ipcInvoke<T>(method: string, params?: InvokeArgs, isDB = false): Promise<T> {
    const paramsObj = isDB ? { params } : params;

    const response: IpcResponse<T> = await invoke(method, paramsObj);
    if (response.error !== null && response.result === null) {
        console.error(method, params, response.error);
        throw new Error(response.error.message);
    } else if (response.error === null && response.result !== null) {
        return deepFreeze(response.result.data);
    } else {
        throw new Error('Invalid ipc response format');
    }
}

export default ipcInvoke;
