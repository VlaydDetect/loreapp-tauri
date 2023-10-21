use std::path::Path;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn extend_scope<P: AsRef<Path>>(app: AppHandle, path: P, recursive: bool) {
    let asset_scope = app.asset_protocol_scope();
    asset_scope.allow_directory(&path, recursive).unwrap();
}

#[tauri::command]
pub fn narrow_scope<P: AsRef<Path>>(app: AppHandle, path: P, recursive: bool) {
    let asset_scope = app.asset_protocol_scope();
    asset_scope.forbid_directory(&path, recursive).unwrap();
}