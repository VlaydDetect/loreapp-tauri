mod fs;
mod utils;
pub mod scope;

pub use fs::*;
pub use utils::*;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::utils::LabelValue;

pub const IMAGE_EXTENSIONS: [&str; 10] = ["bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "tga", "tiff", "webp"];
pub const DOCUMENTS_EXTENSIONS: [&str; 1] = ["jdoc"];

#[derive(Default)]
pub struct FsState {}

pub type FsStateMux = Arc<Mutex<FsState>>;
