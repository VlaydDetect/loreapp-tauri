// #![allow(unused)]

#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

#![allow(unused)]

// -- Sub-Modules
#[macro_use]
extern crate simple_log;
mod logger;
mod event;
mod error;
mod ipc;
mod fs;
mod settings;
mod macros;
mod algo;
mod model;
mod prelude;
mod utils;
mod context;
mod tray;

use std::sync::Arc;
// -- Re-Exports
pub use error::{Error, Result};
pub use settings::AppSettings;

use serde::Serialize;
use ts_rs::TS;
use tauri_plugin_store;
use tauri_plugin_window_state;
use model::seed_store_for_dev;

// Manager is used by .get_window
use tauri::{self, Manager};

use crate::context::ApplicationContext;
use crate::tray::{create_tray, create_tray_event, setup_tray_state};

use serde_json::json;
use surreal_qb::filter::ListOptions;
use crate::model::PictureFilter;


#[derive(TS, Clone, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
struct SingleInstancePayload {
	args: Vec<String>,
	cwd: String,
}

#[tokio::main] // TODO: main doesn't be async, should await ModelStore in other place
async fn main() -> Result<()> {
	fs::init_workspace();
	logger::init_logger();

	let app_context = Arc::new(ApplicationContext::new().await);

	// for dev only
	// seed_store_for_dev(&app_context).await?;

	let system_tray_en = create_tray("en", "main-tray");

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
			// Pictures
			ipc::get_picture,
			ipc::create_picture,
			ipc::update_picture,
			ipc::delete_picture,
			ipc::list_pictures,
			ipc::add_picture_from_disk,
			ipc::collect_picture_from_disk,
			// Utils (not used in front-end)
			// model::process_pictures,
		])
		// allow only one instance and propagate args and cwd to existing instance
		.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
			println!("single_instance: {}, {args:?}, {cwd}", app.package_info().name);
			app.emit_all("newInstance", SingleInstancePayload { args, cwd }).unwrap();
		}))
		// persistent storage with filesystem
		.plugin(tauri_plugin_store::Builder::default().build())
		.plugin(tauri_plugin_fs_extra::init())
		.plugin(tauri_plugin_fs_watch::init())
		// save window position and size between sessions
		// if you remove this, make sure to uncomment the show_main_window code
		//  in this file and TauriProvider.jsx
		.plugin(tauri_plugin_window_state::Builder::default().build())
		// custom setup code
		.setup(|app| setup_tray_state(app))
		.manage(app_context)
		.run(tauri::generate_context!())
		.expect("error while running tauri application");

    Ok(())
}
