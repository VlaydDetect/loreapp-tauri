use crate::types::{Tabs, Tab, WindowState, WindowStateCache};
use crate::{AppHandleExt, StateFlags, WindowExt, get_cache};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::result::Result;
use tauri::{command, App, AppHandle, Manager, Runtime, State, Window};

#[command]
pub async fn save_window_state<R: Runtime>(
    app: AppHandle<R>,
    flags: u32,
) -> Result<(), String> {
    let flags = StateFlags::from_bits(flags)
        .ok_or_else(|| format!("Invalid state flags bits: {}", flags))?;
    app.save_window_state(flags).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn restore_state<R: Runtime>(
    app: AppHandle<R>,
    label: String,
    flags: u32,
) -> Result<(), String> {
    let flags = StateFlags::from_bits(flags)
        .ok_or_else(|| format!("Invalid state flags bits: {}", flags))?;
    app.get_window(&label)
        .ok_or_else(|| format!("Couldn't find window with label: {}", label))?
        .restore_state(flags)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn update_tabs<R: Runtime>(
    window: Window<R>,
    tabs: Tabs,
) -> Result<(), String> {
    let cache = get_cache(&window);
    let label = window.label().to_string();
    let mut c = cache.lock().unwrap();
    if let Some(state) = c.get_mut(&label) {
        state.tabs = tabs;
    }

    Ok(())

    // let mut cache = state.0.lock().unwrap();
    // let label = window.label().to_string();
    //
    // (*cache).entry(label.clone()).or_insert_with(WindowState::default);
    //
    // if let Some(state) = (*cache).get_mut(&label) {
    //     state.tabs = tabs;
    // }
    //
    // Ok(())
}

#[command]
pub async fn update_last_selected_tab<R: Runtime>(
    window: Window<R>,
    id: String,
) -> Result<(), String> {
    let cache = get_cache(&window);
    let label = window.label().to_string();
    let mut c = cache.lock().unwrap();
    if let Some(state) = c.get_mut(&label) {
        if state.tabs.0.iter().find(|tab| tab.id == id).is_some() {
            state.last_selected_tab_id = id;
        } else {
            return Err(format!("Tab with id {id} does not exist"));
        }
    }

    Ok(())
}

#[command]
pub async fn load_state<R: Runtime>(window: Window<R>) -> Result<WindowState, String> {
    let cache = get_cache(&window);
    let label = window.label().to_string();
    let mut c = cache.lock().unwrap();
    if let Some(state) = c.get(&label) {
        return Ok(state.clone());
    }

    Err(format!("State of window with label {label} does not exist"))
}
