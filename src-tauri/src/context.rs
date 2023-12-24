use std::ops::Deref;
use std::sync::{Arc, Mutex};
use crate::fs::{FsState, FsStateMux};
use crate::model::{ModelStore, ModelStoreState};
use crate::settings::{AppSettings, AppSettingsState};
use tauri::{AppHandle, Manager, Wry};

pub type ApplicationContextState = Arc<ApplicationContext>;

pub struct ApplicationContext {
    pub settings: AppSettingsState,
    pub store: ModelStoreState,
    pub fs_state: FsStateMux,
}

impl ApplicationContext {
    pub async fn new() -> Self {
        let settings = Arc::new(AppSettings::deserialize().unwrap());
        let store = ModelStore::new().await.unwrap();
        let fs_state = Arc::new(Mutex::new(FsState::default()));

        Self {
            settings,
            store,
            fs_state
        }
    }

    pub fn settings(&self) -> &AppSettings {
        &self.settings
    }

    pub fn store(&self) -> &ModelStore {
        &self.store
    }
}

pub fn get_context(app: &AppHandle<Wry>) -> Arc<ApplicationContext> {
    (*app.state::<Arc<ApplicationContext>>()).clone()
}
