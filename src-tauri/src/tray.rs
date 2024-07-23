use serde::Serialize;
use std::sync::Mutex;
use tauri::{
    self, App, AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, SystemTraySubmenu, Wry,
};
use ts_gen::TS;
use window_shadows::set_shadow;

#[derive(TS, Clone, Serialize)]
#[ts(export)]
struct SystemTrayPayload {
    message: String,
}

enum TrayState {
    NotPlaying,
    Paused,
    Playing,
}

pub fn create_tray_menu(lang: &str) -> SystemTrayMenu {
    /// https://docs.rs/tauri/1.2.2/tauri/struct.SystemTrayMenu.html
    SystemTrayMenu::new()
        // https://docs.rs/tauri/1.2.2/tauri/struct.SystemTraySubmenu.html
        .add_submenu(SystemTraySubmenu::new(
            "Sub Menu!",
            SystemTrayMenu::new()
                .add_item(CustomMenuItem::new(
                    "bf-sep".to_string(),
                    "Before Separator",
                ))
                // https://docs.rs/tauri/1.2.2/tauri/enum.SystemTrayMenuItem.html
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(CustomMenuItem::new("af-sep".to_string(), "After Separator")),
        ))
        // https://docs.rs/tauri/1.2.2/tauri/struct.CustomMenuItem.html#
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
        .add_item(CustomMenuItem::new(
            "toggle-visibility".to_string(),
            "Hide Window",
        ))
        .add_item(CustomMenuItem::new(
            "toggle-tray-icon".to_string(),
            "Toggle the tray icon",
        ))
}

pub fn create_tray(lang: &str, id: &str) -> SystemTray {
    /// https://docs.rs/tauri/1.2.2/tauri/struct.SystemTray.html
    SystemTray::new()
        .with_menu(create_tray_menu(lang))
        .with_id(id)
}

pub fn create_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let main_window = app.get_window("main").unwrap();
            main_window
                .emit(
                    "systemTray",
                    SystemTrayPayload {
                        message: id.clone(),
                    },
                )
                .unwrap();
            let item_handle = app.tray_handle().get_item(&id);
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "toggle-tray-icon" => {
                    let tray_state_mutex = app.state::<Mutex<TrayState>>();
                    let mut tray_state = tray_state_mutex.lock().unwrap();
                    match *tray_state {
                        TrayState::NotPlaying => {
                            app.tray_handle()
                                .set_icon(tauri::Icon::Raw(
                                    include_bytes!("../icons/tray.ico").to_vec(),
                                ))
                                .unwrap();
                            *tray_state = TrayState::Playing;
                        }
                        TrayState::Playing => {
                            app.tray_handle()
                                .set_icon(tauri::Icon::Raw(
                                    include_bytes!("../icons/tray.ico").to_vec(),
                                ))
                                .unwrap();
                            *tray_state = TrayState::NotPlaying;
                        }
                        TrayState::Paused => {}
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
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let main_window = app.get_window("main").unwrap();
            main_window
                .emit(
                    "system-tray",
                    SystemTrayPayload {
                        message: "left-click".into(),
                    },
                )
                .unwrap();
            println!("system tray received a left click")
        }
        SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a right click")
        }
        SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            println!("system tray received a double click")
        }
        _ => {}
    }
}

pub fn setup_tray_state(app: &mut App<Wry>) -> Result<(), Box<dyn std::error::Error>> {
    app.manage(Mutex::new(TrayState::NotPlaying));
    if let Some(window) = app.get_window("main") {
        set_shadow(&window, true).ok();
    }

    Ok(())
}
