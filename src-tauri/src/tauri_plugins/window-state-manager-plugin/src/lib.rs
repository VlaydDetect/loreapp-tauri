#[allow(dead_code)]
#[allow(unused)]

mod commands;
mod types;
mod error;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
pub use types::*;

pub use commands::*;
pub use error::*;

use tauri::{Runtime, Window, Manager};

pub const STATE_FILENAME: &str = ".window-state";

pub(in crate) fn get_cache<R: Runtime>(window: &Window<R>) -> Arc<Mutex<HashMap<String, WindowState>>> {
    let app = window.app_handle();
    let cache = app.state::<WindowStateCache>();
    let cache: Arc<Mutex<HashMap<String, WindowState>>> = cache.0.clone();
    let label = window.label().to_string();

    {
        cache
            .lock()
            .unwrap()
            .entry(label.clone())
            .or_insert_with(WindowState::default);
    }

    cache
}
