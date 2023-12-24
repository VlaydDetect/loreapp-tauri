use serde::{Deserialize, Serialize};
use serde_diff::{SerdeDiff, Diff, Apply};
use ts_rs::TS;
use tauri;
use std::{fs, path::PathBuf};
use std::io::{Read, Write};
use std::string::{String};
use std::sync::{Arc};
use crate::fs::{get_settings_path, get_user_path, path_to_string};
use crate::Result as MainResult;
use crate::utils::LabelValue;

//#region -------- Structs --------
#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff, Clone)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub enum EditorMode {
    Normal
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff, Clone)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub struct EditorSettings {
    font_size: u16,
    cursor_position: bool
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff, Clone)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub enum SortBy {
    Normal,
    CreateDate,
    UpdateDate
}

#[derive(TS, Serialize, Deserialize, PartialEq, SerdeDiff, Clone)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub editor_mode: EditorMode,
    pub editor: EditorSettings,
    pub sort_by: SortBy,
    pub categories: Vec<LabelValue>,
    pub tags: Vec<LabelValue>
}

pub type AppSettingsState = Arc<AppSettings>;
//endregion -------- /Structs --------

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            editor_mode: EditorMode::Normal,
            editor: EditorSettings {
                font_size: 24,
                cursor_position: false,
            },
            sort_by: SortBy::Normal,
            categories: vec![],
            tags: vec![]
        }
    }
}

impl From<String> for AppSettings {
    fn from(value: String) -> Self {
        match serde_json::from_str(value.as_str()) {
            Ok(value) => value,
            Err(err) => {
                error!("Can not read the settings file. Error: {}", err);
                AppSettings::default()
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
                AppSettings::default()
            }
        }
    }
}

// FIXME: replace all fs::File methods with OpenOptions, unwraps with error handling
// TODO: make async
impl AppSettings {
    pub fn create() {
        let settings = AppSettings::default();
        let mut file = fs::File::create(get_settings_path()).unwrap();
        let json = serde_json::to_string(&settings).unwrap();
        write!(file, "{}", json).unwrap();
    }

    pub fn serialize(&self) {
        let mut file = fs::File::create(get_settings_path()).unwrap();
        let json = serde_json::to_string(&self).unwrap();
        write!(file, "{}", json).unwrap();
    }

    pub fn deserialize() -> MainResult<Self> {
        let file_content = fs::read(get_settings_path())?;
        match serde_json::from_slice::<Self>(&file_content) {
            Ok(val) => Ok(val),
            Err(err) => Err(err.into())
        }
    }
}
