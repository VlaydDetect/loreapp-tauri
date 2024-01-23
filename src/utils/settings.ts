import {AppSettings, LabelValue} from "@/interface";
import ipcInvoke from "@/ipc";

//#region -------- Tauri Events --------
export async function getSettings(): Promise<AppSettings> {
    return await ipcInvoke<AppSettings>("get_settings")
}

export async function changeAppSettings(newAppSettings: AppSettings): Promise<void> {
    await ipcInvoke<void>("change_settings", { newSettings: JSON.stringify(newAppSettings) })
}
//#endregion -------- /Tauri Events --------
