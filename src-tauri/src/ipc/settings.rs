use serde_diff::{Apply, Diff};
use crate::{AppSettings, Error, settings};
use crate::ipc::IpcResponse;
use crate::utils::apply_diff;

#[tauri::command]
pub fn get_settings() -> IpcResponse<AppSettings> {
    // Ok((*settings()).clone().into()).into() // TODO: Maybe for static or another solution
    AppSettings::deserialize().into()
}

#[tauri::command]
pub fn change_settings(new_settings: String) -> IpcResponse<()> {
    let mut old = AppSettings::deserialize().unwrap_or_default();

    let new =  AppSettings::from(new_settings);

    // TODO: implement the Levenshtein distance algorithm
    match apply_diff(&mut old, &new) {
        Ok(()) => {
            old.serialize();
            Ok(()).into()
        },
        Err(err) => Err(Error::Other(err.to_string())).into()
    }
}