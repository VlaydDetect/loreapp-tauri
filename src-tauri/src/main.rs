// #![allow(unused)]

#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use serde::Serialize;
use ts_rs::TS;
use tauri_plugin_store;
use tauri_plugin_window_state;
use window_shadows::set_shadow;
use std::{process::Command, sync::Mutex};
use std::sync::Arc;
use model::{seed_store_for_dev, ModelStore};

// Manager is used by .get_window
use tauri::{self, Manager, SystemTray, SystemTrayMenu, SystemTraySubmenu, CustomMenuItem, SystemTrayMenuItem, SystemTrayEvent};


// -- Re-Exports
pub use error::{Error, Result};

// -- Sub-Modules
#[macro_use]
extern crate simple_log;
mod logger;
mod ctx;
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


#[derive(TS, Clone, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
struct SingleInstancePayload {
	args: Vec<String>,
	cwd: String,
}

#[derive(TS, Clone, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
struct SystemTrayPayload {
	message: String
}

enum TrayState {
	NotPlaying,
	Paused,
	Playing
}

fn create_tray_menu(lang: String) -> SystemTrayMenu {
	SystemTrayMenu::new()
	// .add_item("id".into(), t!("Label", locale = lang))
	// .add_item("id".into(), t!("Label")
	// .add_submenu("Submenu")
	// .add_native_item(item)
}

#[tokio::main] // TODO: main doesn't be async, should await ModelStore in other place
async fn main() -> Result<()> {
	fs::init_workspace();
	logger::init_logger();

	let model_manager = ModelStore::new().await?;

	// for dev only
	seed_store_for_dev(model_manager.clone()).await?;

	// https://docs.rs/tauri/1.2.2/tauri/struct.SystemTrayMenu.html
	let tray_menu_en = SystemTrayMenu::new()
	// https://docs.rs/tauri/1.2.2/tauri/struct.SystemTraySubmenu.html
		.add_submenu(SystemTraySubmenu::new("Sub Menu!", SystemTrayMenu::new()
			.add_item(CustomMenuItem::new("bf-sep".to_string(), "Before Separator"))
			// https://docs.rs/tauri/1.2.2/tauri/enum.SystemTrayMenuItem.html
			.add_native_item(SystemTrayMenuItem::Separator)
			.add_item(CustomMenuItem::new("af-sep".to_string(), "After Separator"))
		))
		// https://docs.rs/tauri/1.2.2/tauri/struct.CustomMenuItem.html#
		.add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
		.add_item(CustomMenuItem::new("toggle-visibility".to_string(), "Hide Window"))
		.add_item(CustomMenuItem::new("toggle-tray-icon".to_string(), "Toggle the tray icon"));
	// https://docs.rs/tauri/1.2.2/tauri/struct.SystemTray.html
	let system_tray = SystemTray::new().with_menu(tray_menu_en).with_id("main-tray");

	tauri::Builder::default()
		.system_tray(system_tray)
		.on_system_tray_event(|app, event| match event {
			SystemTrayEvent::MenuItemClick { id, .. } => {
				let main_window = app.get_window("main").unwrap();
				main_window.emit("systemTray", SystemTrayPayload { message: id.clone() }).unwrap();
				let item_handle = app.tray_handle().get_item(&id);
				match id.as_str() {
					"quit" => { std::process::exit(0); }
					"toggle-tray-icon" => {
						let tray_state_mutex = app.state::<Mutex<TrayState>>();
						let mut tray_state = tray_state_mutex.lock().unwrap();
						match *tray_state {
							TrayState::NotPlaying => {
								app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/tray.ico").to_vec())).unwrap();
								*tray_state = TrayState::Playing;
							}
							TrayState::Playing => {
								app.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/tray.ico").to_vec())).unwrap();
								*tray_state = TrayState::NotPlaying;
							}
							TrayState::Paused => {},
						};
					}
					"toggle-visibility" => {
						// update menu item example
						if main_window.is_visible().unwrap() {
							main_window.hide().unwrap();
							item_handle.set_title("Show Window").unwrap();
						} else {
							main_window.show().unwrap();
							item_handle.set_title("Hide Window").unwrap();
						}
					}
					_ => {}
				}
			}
			SystemTrayEvent::LeftClick {position: _, size: _, ..} => {
				let main_window = app.get_window("main").unwrap();
				main_window.emit("system-tray", SystemTrayPayload { message: "left-click".into() }).unwrap();
				println!("system tray received a left click")
			}
			SystemTrayEvent::RightClick {position: _, size: _, ..} => {
				println!("system tray received a right click")
			}
			SystemTrayEvent::DoubleClick {position: _, size: _, ..} => {
				println!("system tray received a double click")
			}
			_ => {}
		})
		.invoke_handler(tauri::generate_handler![
			show_in_folder,
			fs::process_file,
			fs::create_directory,
			fs::create_directory_all,
			fs::create_file,
			fs::read_file,
			fs::get_files_recursively,
			fs::read_file_to_data_url,
			fs::is_exists,
			fs::get_app_path,
			fs::fs_watch::watch,
			fs::fs_watch::unwatch,
			fs::cache::get_gallery_cache,
			fs::cache::update_gallery_cache,
			fs::cache::get_documents_cache,
			fs::explorer::open_directory,
			settings::get_settings,
			settings::change_settings,
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
			// Utils (not used in front-end)
			model::process_pictures,
		])
		// allow only one instance and propagate args and cwd to existing instance
		.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
			println!("{}, {args:?}, {cwd}", app.package_info().name);
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
		.setup(|app| {
			app.manage(Mutex::new(TrayState::NotPlaying));
			if let Some(window) = app.get_window("main") {
				set_shadow(&window, true).ok();
			}

			app.manage(fs::fs_watch::WatcherCollection::default());

			Ok(())
		})
		.manage(Arc::new(Mutex::new(fs::FsState::default())))
		.manage(model_manager)
		.run(tauri::generate_context!())
		.expect("error while running tauri application");

    Ok(())
}
