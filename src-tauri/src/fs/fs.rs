use super::utils::*;
use tauri;
use std::{fs, path::PathBuf};
use std::io::Write;
use std::path::Path;
use std::string::ToString;
use walkdir::WalkDir;
use crate::settings::{AppSettings};
use crate::ipc::{IpcError, IpcResponse, IpcSimpleResult};
use serde::{Serialize, Deserialize};
use ts_rs::TS;

//#region -------- Paths --------
pub fn get_tauri_data_dir() -> PathBuf {
    tauri::api::path::data_dir().unwrap()
}

pub fn get_app_data_path() -> PathBuf {
    PathBuf::from(format!("{}/loreapp", path_to_string(&get_tauri_data_dir())))
}

pub fn get_user_path() -> PathBuf {
    PathBuf::from(format!("{}/userdata", path_to_string(&get_app_data_path())))
}

pub fn get_documents_path() -> PathBuf {
    let default_path = PathBuf::from(format!("{}/documents", path_to_string(&get_user_path())));
    let documents_path = string_to_path(&AppSettings::deserialize().documents_path);

    if documents_path == default_path || documents_path.capacity() == 0 {
        return default_path;
    }

    documents_path
}

pub fn get_trash_path() -> PathBuf {
    PathBuf::from(format!("{}/trash", path_to_string(&get_documents_path())))
}

pub fn get_settings_path() -> PathBuf {
    PathBuf::from(format!("{}/app_settings.json", path_to_string(&get_user_path())))
}

pub fn get_gallery_data_path() -> PathBuf {
    PathBuf::from(format!("{}/data/data.json", AppSettings::deserialize().gallery_path))
}

pub fn get_documents_data_path() -> PathBuf {
    PathBuf::from(format!("{}/data/data.json", path_to_string(&get_documents_path())))
}
//#endregion -------- /Paths --------

//#region -------- Main --------
pub fn init_workspace() {
    if !get_app_data_path().exists() {
        fs::create_dir_all(get_app_data_path()).unwrap();
    }

    if !get_user_path().exists() {
        fs::create_dir_all(get_user_path()).unwrap();
    }

    if !get_documents_path().exists() {
        fs::create_dir_all(get_documents_path()).unwrap();
    }

    if !get_trash_path().exists() {
        fs::create_dir_all(get_trash_path()).unwrap();
    }

    if !get_settings_path().exists() {
        AppSettings::create();
    }
}
//#endregion -------- /Main --------

//#region -------- Commands --------
#[derive(TS, Serialize, Deserialize)]
#[ts(export, export_to = "../src/interface/")]
pub enum PathsToGet {
    AppData,
    UserData,
    GalleryData,
    DocumentsData
}

#[tauri::command]
pub fn get_app_path(variant: PathsToGet) -> IpcResponse<String> {
    Ok(path_to_string(&match variant {
        PathsToGet::AppData => get_app_data_path(),
        PathsToGet::UserData => get_user_path(),
        PathsToGet::GalleryData => get_gallery_data_path(),
        PathsToGet::DocumentsData => get_documents_data_path(),
    })).into()
}


#[tauri::command]
pub fn process_file(filepath: String) -> String {
    println!("Processing file: {}", filepath);
    format!("Processing file: {}", filepath)
}

#[tauri::command]
pub fn create_directory(path: String) -> IpcResponse<()> {
    fs::create_dir(path).unwrap();
    Ok(()).into()
}

#[tauri::command]
pub fn create_directory_all(path: String) -> IpcResponse<()> {
    fs::create_dir_all(path).unwrap();
    Ok(()).into()
}

#[tauri::command]
pub fn create_file(filename: String, data: String) -> IpcResponse<()> {
    let path = Path::new(&filename);
    println!("create_fil - File Path to Create: {}", &path.display());

    if let Some(parent) = path.parent() {
        println!("File Parent: {}", parent.display());
        if !parent.exists() {
            fs::create_dir_all(parent).unwrap()
        }
    }

    if !data.is_empty() {
        println!("Data: {}", data);
        let mut file = fs::File::create(path).unwrap();
        file.write_all(&data.into_bytes()).unwrap();
    } else {
        fs::File::create(path).unwrap();
    }

    Ok(()).into()
}

#[tauri::command]
pub fn read_file(filename: String) -> IpcResponse<String> {
    match fs::read_to_string(filename) {
        Ok(data) => IpcResponse {
            error: None,
            result: Some(IpcSimpleResult { data }),
        },
        Err(err) => IpcResponse {
            error: Some(IpcError {
                message: format!("{err}"),
            }),
            result: None,
        },
    }
}

#[tauri::command]
pub fn get_files_recursively(path: String, include_dirs: bool) -> IpcResponse<Vec<String>> {
    let mut result: Vec<String> = vec![];

    for entry in WalkDir::new(path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok()) {
        let file_path = entry.path().display().to_string();
        if !include_dirs && entry.file_type().is_dir() { continue; }
        result.push(file_path);
    }
    Ok(result).into()
}
//endregion -------- /Commands --------
