mod fs;
mod utils;
pub mod fs_watch;
pub mod scope;
pub mod cache;
pub mod explorer;
pub mod search;

pub use fs::*;
pub use utils::*;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::settings::LabelValue;

pub const DIRECTORY: &str = "directory";
pub const FILE: &str = "file";

pub const IMAGE_EXTENSIONS: [&str; 10] = ["bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "tga", "tiff", "webp"];
pub const DOCUMENTS_EXTENSIONS: [&str; 1] = ["jdoc"];

#[derive(Serialize, Deserialize, Clone)]
pub enum DirectoryChild {
    File(String, String), // Name of file, path to file
    Directory(String, String),
}

#[derive(Serialize, Deserialize)]
pub struct CachedPath {
    #[serde(rename = "p")]
    entry_path: String,
    #[serde(rename = "t")]
    entry_type: String,
}

pub type DirectoryCache = HashMap<String, Vec<CachedPath>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PictureCache {
    id: i32,
    title: String,
    description: String,
    #[serde(rename = "imgPath")]
    img_path: String,
    tags: Vec<LabelValue>,
    categories: Vec<LabelValue>,
}

impl PictureCache {
    pub fn new_empty(id: i32, img_path: String) -> Self {
        PictureCache {
            id,
            title: "".to_string(),
            description: "".to_string(),
            img_path,
            tags: vec![],
            categories: vec![]
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct DocumentCache {
    #[serde(rename = "docPath")]
    doc_path: String
}

#[derive(Default)]
pub struct FsState {
    cached_dirs: HashMap<String, DirectoryCache>, // Dir path, dir cache
    gallery_cache: HashMap<String, PictureCache>, // File path, file cache (was Vec)
    documents_cache: HashMap<String, DocumentCache>, // File path, file cache (was Vec)
}

pub type FsStateMux = Arc<Mutex<FsState>>;

pub const fn bytes_to_gb(bytes: u64) -> u16 {
    (bytes / (1e+9 as u64)) as u16
}
