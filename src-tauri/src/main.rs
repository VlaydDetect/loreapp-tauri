#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
// #![allow(unused)]

// -- Sub-Modules
#[macro_use]
extern crate simple_log;

use std::ops::{Not, Sub};
use std::sync::Arc;

use serde::Serialize;
// Manager is used by .get_window
use tauri::{self, Manager};
use tauri_plugin_store;
use tauri_plugin_window_state;
use ts_gen::TS;

// -- Re-Exports
pub use error::{Error, Result};
pub use settings::AppSettings;
use tauri_plugins::window_state_manager_plugin::{
    AppHandleExt, Builder as WindowPluginBuilder, StateFlags,
};

use crate::context::ApplicationContext;
use crate::tray::{create_tray, create_tray_event, setup_tray_state};

mod algo;
mod context;
mod error;
mod event;
mod fs;
mod ipc;
mod logger;
mod macros;
mod model;
mod prelude;
mod settings;
mod tauri_plugins;
mod tray;
mod utils;

#[derive(TS, Clone, Serialize)]
#[ts(export)]
struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
}

#[tokio::main] // TODO: main doesn't be async, should await ModelStore in other place
async fn main() -> Result<()> {
    fs::init_workspace();
    logger::init_logger();

    let app_context = Arc::new(ApplicationContext::new().await);

    let system_tray_en = create_tray("en", "main-tray");

    let mut window_state_plugin_builder =
        WindowPluginBuilder::new().with_state_flags(!StateFlags::DECORATIONS);

    model::seed_store_for_dev(&app_context).await?;

    tauri::Builder::default()
        .system_tray(system_tray_en)
        .on_system_tray_event(|app, event| create_tray_event(app, event))
        .invoke_handler(tauri::generate_handler![
            fs::create_directory,
            fs::create_directory_all,
            fs::create_file,
            fs::read_file,
            fs::get_files_recursively,
            fs::read_file_to_data_url,
            fs::is_exists,
            fs::get_app_path,
            // fs::explorer::open_directory,
            ipc::get_settings,
            ipc::change_settings,
            // Document
            ipc::get_document,
            ipc::create_document,
            ipc::update_document,
            ipc::delete_document,
            ipc::list_documents,
            ipc::create_untitled_document,
            // Documents Folder
            ipc::get_documents_folder,
            ipc::create_documents_folder,
            ipc::update_documents_folder,
            ipc::delete_documents_folder,
            ipc::list_documents_folders,
            ipc::create_unnamed_folder,
            ipc::add_folder_or_document,
            ipc::remove_folder_or_document,
            ipc::move_folder_or_document,
            ipc::list_folders_tree,
            // Documents Template
            ipc::get_documents_template,
            ipc::create_documents_template,
            ipc::update_documents_template,
            ipc::delete_documents_template,
            ipc::list_documents_templates,
            // Pictures
            ipc::get_picture,
            ipc::create_picture,
            ipc::update_picture,
            ipc::delete_picture,
            ipc::list_pictures,
            ipc::get_picture_with_url,
            ipc::list_pictures_with_urls,
            // ipc::collect_pictures_from_disk,
            // Tags & Categories
            ipc::get_category,
            ipc::create_category,
            ipc::update_category,
            ipc::delete_category,
            ipc::list_categories,
            ipc::create_new_category,
            ipc::attach_subcategory,
            ipc::detach_subcategory,
            ipc::reattach_subcategory,
            ipc::list_categories_tree,
            ipc::get_tag,
            ipc::create_tag,
            ipc::update_tag,
            ipc::delete_tag,
            ipc::list_tags,
        ])
        // allow only one instance and propagate args and cwd to existing instance
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            println!(
                "single_instance: {}, {args:?}, {cwd}",
                app.package_info().name
            );
            app.emit_all("newInstance", SingleInstancePayload { args, cwd })
                .unwrap();
        }))
        // persistent storage with filesystem
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs_extra::init())
        .plugin(tauri_plugin_fs_watch::init())
        // save window position and size between sessions
        // if you remove this, make sure to uncomment the show_main_window code
        //  in this file and TauriProvider.jsx
        .plugin(window_state_plugin_builder.build())
        // custom setup code
        .setup(|app| setup_tray_state(app))
        .manage(app_context)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
