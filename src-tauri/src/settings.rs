use serde::{Deserialize, Serialize};
use serde_diff::{SerdeDiff, Diff, Apply};
use ts_rs::TS;
use tauri;
use std::{fs, path::PathBuf};
use std::io::{Read, Write};
use std::string::{String};
use crate::fs::{get_settings_path, get_user_path, path_to_string};
use crate::ipc::IpcResponse;

//#region -------- Structs --------
#[derive(Debug, TS, Serialize, Deserialize, Clone, PartialEq, SerdeDiff)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
pub struct LabelValue {
    pub label: String,
    pub value: String
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub enum EditorMode {
    Normal
}

// #[derive(TS, Serialize)]
// #[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
// #[serde(rename_all = "camelCase")]
// struct MarkdownSettings {}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub struct EditorSettings {
    font_size: u16,
    cursor_position: bool
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub enum SortBy {
    Normal,
    CreateDate,
    UpdateDate
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub editor_mode: EditorMode,
    // markdown_settings: MarkdownSettings,
    pub editor: EditorSettings,
    pub sort_by: SortBy,
    pub gallery_path: String,
    pub documents_path: String,
    pub categories: Vec<LabelValue>,
    pub tags: Vec<LabelValue>
}
//endregion -------- /Structs --------

//#region -------- Commands --------
#[tauri::command]
pub fn get_settings() -> IpcResponse<AppSettings> {
    Ok(AppSettings::deserialize()).into()
}

#[tauri::command]
pub fn change_settings(new_settings: String) -> IpcResponse<()> {
    let mut old = AppSettings::deserialize();
    let old_documents_path = super::fs::string_to_path(&old.documents_path);

    let new =  AppSettings::from(new_settings);
    let new_documents_path = super::fs::string_to_path(&new.documents_path);

    // TODO: implement the Levenshtein distance algorithm
    let json_diff_data = serde_json::to_string(&Diff::serializable(&old, &new)).unwrap();
    let mut deserializer = serde_json::Deserializer::from_str(&json_diff_data);
    Apply::apply(&mut deserializer, &mut old).unwrap();

    if old_documents_path != new_documents_path {
        super::fs::move_files_recursively(&old_documents_path, &new_documents_path).unwrap()
    }

    old.serialize();
    Ok(()).into()
}
//endregion -------- /Commands --------

pub fn get_default_settings() -> AppSettings {
    AppSettings {
        editor_mode: EditorMode::Normal,
        editor: EditorSettings {
            font_size: 24,
            cursor_position: false,
        },
        sort_by: SortBy::Normal,
        gallery_path: String::new(),
        documents_path: path_to_string(&PathBuf::from(format!("{}/documents", path_to_string(&get_user_path())))),
        categories: vec![],
        tags: vec![]
    }
}

impl From<String> for AppSettings {
    fn from(value: String) -> Self {
        match serde_json::from_str(value.as_str()) {
            Ok(value) => value,
            Err(err) => {
                error!("Can not read the settings file. Error: {}", err);
                AppSettings::default_settings()
            }
        }
    }
}

impl From<PathBuf> for AppSettings {
    fn from(value: PathBuf) -> Self {
        let mut settings = String::new();
        let file = fs::File::open(value);
        match file {
            Ok(mut val) => {
                val.read_to_string(&mut settings).unwrap();
                return settings.into()
            },
            Err(_) => {
                error!("fs ERROR: settings file not found");
                AppSettings::default_settings()
            }
        }

    }
}

impl AppSettings {
    pub fn default_settings() -> Self {
        get_default_settings()
    }

    pub fn create() {
        let settings = get_default_settings();
        let mut file = fs::File::create(get_settings_path()).unwrap();
        let json = serde_json::to_string(&settings).unwrap();
        write!(file, "{}", json).unwrap();
    }

    pub fn serialize(&self) {
        let mut file = fs::File::create(get_settings_path()).unwrap();
        let json = serde_json::to_string(&self).unwrap();
        write!(file, "{}", json).unwrap();
    }

    pub fn deserialize() -> Self {
        get_settings_path().into()
    }
}
