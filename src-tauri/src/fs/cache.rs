use crate::fs::{DIRECTORY, DocumentCache, FILE, PictureCache};
use crate::fs::{FsState, CachedPath, FsStateMux, DirectoryCache};
use lazy_static::lazy_static;
use notify::{Event, event::{CreateKind, ModifyKind, RenameMode}, RecursiveMode, Watcher};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicI32, Ordering};
use notify::event::RemoveKind;
use tauri::{AppHandle, Manager, State};
use walkdir::WalkDir;
use rayon::prelude::*;
use crate::ipc::IpcResponse;
use crate::settings::AppSettings;
use crate::fs::{IMAGE_EXTENSIONS, DOCUMENTS_EXTENSIONS};

lazy_static! {
    pub static ref GALLERY_CACHE_FILE_PATH: String = {
        let mut cache_path = PathBuf::from(AppSettings::deserialize().gallery_path);
        cache_path.push("gallery.cache.json");
        cache_path.to_string_lossy().to_string()
    };
}

lazy_static! {
    pub static ref DOCUMENTS_CACHE_FILE_PATH: String = {
        let mut cache_path = PathBuf::from(AppSettings::deserialize().documents_path);
        cache_path.push("documents.cache.json");
        cache_path.to_string_lossy().to_string()
    };
}


/// Handles filesystem events, currently intended for cache invalidation.
pub struct FsEventHandler {
    state_mux: FsStateMux,
    dir: PathBuf,
}

impl FsEventHandler {
    pub fn new(state_mux: FsStateMux, dir: PathBuf) -> Self {
        Self {
            state_mux,
            dir
        }
    }

    // fn get_from_gallery_cache<'a>(&self, path: String, state: &'a mut FsState) -> &'a mut PictureCache {
    //     state.gallery_cache.get_mut(&path).unwrap_or_else(|| {
    //         panic!(
    //             "Failed to find directory '{:?}' in cache.",
    //             self.dir
    //         )
    //     })
    // }
    //
    // fn get_from_documents_cache<'a>(&self, path: String, state: &'a mut FsState) -> &'a mut DocumentCache {
    //     state.documents_cache.get_mut(&path).unwrap_or_else(|| {
    //         panic!(
    //             "Failed to find directory '{:?}' in cache.",
    //             self.dir
    //         )
    //     })
    // }
    //
    // pub fn handle_create(&self, kind: CreateKind, path: &Path) {
    //     let state = &mut self.state_mux.lock().unwrap();
    //
    //     let file_type = match kind {
    //         CreateKind::File => FILE,
    //         CreateKind::Folder => DIRECTORY,
    //         _ => return,
    //     }.to_string();
    //
    //     let extension = path.extension().unwrap().to_str().unwrap();
    //     let file_path = path.to_string_lossy().to_string();
    //
    //     if file_type == FILE.to_string() {
    //         if self.dir.to_string_lossy().to_string() == AppSettings::deserialize().gallery_path && IMAGE_EXTENSIONS.contains(&extension) {
    //             let cached_dir = self.get_from_gallery_cache(file_path.clone(), state);
    //             cached_dir.push(PictureCache {
    //                 id: -1,
    //                 title: "".to_string(),
    //                 description: "".to_string(),
    //                 img_path: file_path,
    //                 tags: vec![],
    //                 categories: vec![]
    //             });
    //         } else if self.dir.to_string_lossy().to_string() == AppSettings::deserialize().documents_path && DOCUMENTS_EXTENSIONS.contains(&extension) {
    //             let cached_dir = self.get_from_documents_cache(file_path.clone(), state);
    //             cached_dir.push(DocumentCache {
    //                 doc_path: file_path
    //             });
    //         }
    //     }
    // }
    //
    // pub fn handle_delete(&self, kind: RemoveKind, path: &Path) {
    //     let state = &mut self.state_mux.lock().unwrap();
    //
    //     let file_type = match kind {
    //         RemoveKind::File => FILE,
    //         RemoveKind::Folder => DIRECTORY,
    //         _ => return,
    //     }.to_string();
    //
    //     let extension = path.extension().unwrap().to_str().unwrap();
    //     let file_path = path.to_string_lossy().to_string();
    //
    //     if file_type == FILE.to_string() {
    //         if self.dir.to_string_lossy().to_string() == AppSettings::deserialize().gallery_path && IMAGE_EXTENSIONS.contains(&extension) {
    //             let cached_dir = self.get_from_gallery_cache(file_path.clone(), state);
    //             let _ = cached_dir.retain(|elem| elem.img_path != file_path);
    //         } else if self.dir.to_string_lossy().to_string() == AppSettings::deserialize().documents_path && DOCUMENTS_EXTENSIONS.contains(&extension) {
    //             let cached_dir = self.get_from_documents_cache(file_path.clone(), state);
    //             cached_dir.retain(|elem| elem.doc_path != file_path)
    //         }
    //     }
    // }

    // /// Removes file from cache, when `handle_rename_to` is called a new file is added to the cache in place.
    // pub fn handle_rename_from(&mut self, old_path: &Path) {
    //     let state = &mut self.state_mux.lock().unwrap();
    //     let current_volume = self.get_from_cache(state);
    //
    //     let old_path_string = old_path.to_string_lossy().to_string();
    //     let old_filename = old_path.file_name().unwrap().to_string_lossy().to_string();
    //
    //     let empty_vec = &mut Vec::new();
    //     let cached_paths = current_volume.get_mut(&old_filename).unwrap_or(empty_vec);
    //
    //     // If there is only one item in the cached paths, this means it can only be the renamed file and therefore it should be removed from the hashmap
    //     if cached_paths.len() <= 1 {
    //         current_volume.remove(&old_filename);
    //         return;
    //     }
    //
    //     cached_paths.retain(|path| path.entry_path != old_path_string);
    // }
    //
    // /// Adds new file name & path to cache.
    // pub fn handle_rename_to(&self, new_path: &Path) {
    //     let state = &mut self.state_mux.lock().unwrap();
    //     let current_volume = self.get_from_cache(state);
    //
    //     let filename = new_path.file_name().unwrap().to_string_lossy().to_string();
    //     let file_type = if new_path.is_dir() { DIRECTORY } else { FILE };
    //
    //     let path_string = new_path.to_string_lossy().to_string();
    //     current_volume.entry(filename).or_insert_with(|| vec![CachedPath {
    //         entry_path: path_string,
    //         entry_type: String::from(file_type),
    //     }]);
    // }

    pub fn handle_event(&mut self, event: Event) {
        let paths = event.paths;

        // match event.kind {
        //     // notify::EventKind::Modify(modify_kind) => {
        //     //     if modify_kind == ModifyKind::Name(RenameMode::From) {
        //     //         self.handle_rename_from(&paths[0]);
        //     //     } else if modify_kind == ModifyKind::Name(RenameMode::To) {
        //     //         self.handle_rename_to(&paths[0]);
        //     //     }
        //     // }
        //     notify::EventKind::Create(kind) => self.handle_create(kind, &paths[0]),
        //     notify::EventKind::Remove(kind) => self.handle_delete(kind, &paths[0]),
        //     _ => (),
        // };
    }
}

fn watch_changes(dir_path: PathBuf, state_mux: &FsStateMux) {
    let mut fs_event_manager = FsEventHandler::new(state_mux.clone(), dir_path.clone());

    let mut watcher = notify::recommended_watcher(move |res| match res {
        Ok(event) => fs_event_manager.handle_event(event),
        Err(e) => panic!("Failed to handle event: {}", e),
    }).unwrap();

    let path = dir_path.clone();

    std::thread::spawn(move || {
        watcher.watch(&path, RecursiveMode::Recursive).unwrap();

        tokio::task::block_in_place(|| loop {
            std::thread::park();
        });
    });
}

pub fn create_gallery_cache(state_mux: &FsStateMux) {
    let state = &mut state_mux.lock().unwrap();

    let cache = Arc::new(Mutex::new(&mut state.gallery_cache));

    println!("create_gallery_cache create cache");

    let mut id: AtomicI32 = 0.into();

    WalkDir::new(AppSettings::deserialize().gallery_path.clone())
        .into_iter()
        .par_bridge()
        .filter_map(Result::ok)
        .for_each(|entry| {
            let cache_guard = &mut cache.lock().unwrap();

            let file_path = entry.path().to_string_lossy().to_string();

            let walkdir_filetype = entry.file_type();

            if walkdir_filetype.is_file() {
                let extension = entry.path().extension().unwrap().to_str().unwrap();
                if IMAGE_EXTENSIONS.contains(&extension.clone()) {
                    cache_guard
                        .entry(file_path.clone())
                        .or_insert(PictureCache {
                            id: id.load(Ordering::Relaxed),
                            title: "".to_string(),
                            description: "".to_string(),
                            img_path: file_path,
                            tags: vec![],
                            categories: vec![]
                        });
                }
            }

            id.fetch_add(1, Ordering::Relaxed);
        });
}

pub fn create_documents_cache(state_mux: &FsStateMux) {
    let state = &mut state_mux.lock().unwrap();

    let cache = Arc::new(Mutex::new(&mut state.documents_cache));

    WalkDir::new(AppSettings::deserialize().documents_path.clone())
        .into_iter()
        .par_bridge()
        .filter_map(Result::ok)
        .for_each(|entry| {
            let cache_guard = &mut cache.lock().unwrap();

            let file_path = entry.path().to_string_lossy().to_string();

            let walkdir_filetype = entry.file_type();

            if walkdir_filetype.is_file() {
                let extension = entry.path().extension().unwrap().to_str().unwrap();
                if DOCUMENTS_EXTENSIONS.contains(&extension.clone()) {
                    cache_guard
                        .entry(file_path.clone())
                        .or_insert(DocumentCache {
                            doc_path: file_path
                        });
                }
            }
        });
}

// /// Starts a constant interval loop where the cache is updated every ~30 seconds.
// pub fn run_cache_interval(state_mux: &FsStateMux) {
//     let state_clone = Arc::clone(state_mux);
//
//     tokio::spawn(async move { // TODO: main is not tokio::main
//         // We use tokio spawn because async closures with std spawn is unstable
//         let mut interval = time::interval(Duration::from_secs(60));
//         interval.tick().await; // Wait 30 seconds before doing first re-cache
//
//         loop {
//             interval.tick().await;
//
//             let guard = &mut state_clone.lock().unwrap();
//             save_to_cache(guard);
//         }
//     });
// }

/// This takes in an Arc<Mutex<AppState>> and calls `save_to_cache` after locking it.
pub fn save_gallery_cache(state_mux: &FsStateMux) {
    let state = &mut state_mux.lock().unwrap();

    let cache = serde_json::to_string(&state.gallery_cache).unwrap();
    println!("save_gallery_cache cache: {cache}");

    save_to_cache(&GALLERY_CACHE_FILE_PATH[..], cache);
}

pub fn save_documents_cache(state_mux: &FsStateMux) {
    let state = &mut state_mux.lock().unwrap();

    let cache = serde_json::to_string(&state.documents_cache).unwrap();

    save_to_cache(&DOCUMENTS_CACHE_FILE_PATH[..], cache);
}

fn save_to_cache(path: &str, data: String) {

    let mut file = fs::OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(path)
        .unwrap();

    write!(file, "{}", data).unwrap();
}

/// Reads and decodes the cache file and stores it in memory for quick access.
/// Returns false if the cache was unable to deserialize.
pub fn load_gallery_cache(state_mux: &FsStateMux) -> bool {
    let state = &mut state_mux.lock().expect("Failed to lock mutex");

    let mut cache = String::new();

    let mut cache_file = File::open(&GALLERY_CACHE_FILE_PATH[..]).expect(format!("Failed to open gallery cache file").as_str());

    cache_file.read_to_string(&mut cache).unwrap();
    println!("load_gallery_cache cache: {cache}");

    match serde_json::from_str(cache.as_str()) {
        Ok(value) => {
            state.gallery_cache = value;
            true
        },
        Err(_) => {
            println!("Failed to deserialize the gallery cache, recaching...");
            false
        }
    }
}

pub fn load_documents_cache(state_mux: &FsStateMux) -> bool {
    let state = &mut state_mux.lock().expect("Failed to lock mutex");

    let mut cache = String::new();

    let mut cache_file = File::open(&DOCUMENTS_CACHE_FILE_PATH[..]).expect(format!("Failed to open documents cache file").as_str());

    cache_file.read_to_string(&mut cache).unwrap();

    match serde_json::from_str(cache.as_str()) {
        Ok(value) => {
            state.documents_cache = value;
            true
        },
        Err(_) => {
            println!("Failed to deserialize the documents cache, recaching...");
            false
        }
    }
}

#[tauri::command]
pub fn get_gallery_cache(state_mux: State<'_, FsStateMux>) -> IpcResponse<String> {
    let mut cache_exists = fs::metadata(&GALLERY_CACHE_FILE_PATH[..]).is_ok();
    println!("get_documents_cache cache_exists1: {cache_exists}");
    if cache_exists {
        cache_exists = load_gallery_cache(&state_mux);
    } else {
        println!("get_documents_cache file create");
        File::create(&GALLERY_CACHE_FILE_PATH[..]).unwrap();
    }

    println!("get_documents_cache cache_exists2: {cache_exists}");

    if !cache_exists {
        println!("get_documents_cache cache create");
        create_gallery_cache(&state_mux);
    }

    // watch_changes(PathBuf::from(AppSettings::deserialize().gallery_path), &state_mux, &app);

    save_gallery_cache(&state_mux);

    let cache = serde_json::to_string(&state_mux.lock().unwrap().gallery_cache.values().into_iter().collect::<Vec<_>>()).unwrap();

    Ok(cache).into()
}

#[tauri::command]
pub fn update_gallery_cache(state_mux: State<'_, FsStateMux>, data: String) {
    fn update_picture_in_state_cache(state_mux: &FsStateMux, data: String) {
        let state = &mut state_mux.lock().unwrap();
        let picture: PictureCache = serde_json::from_str(&data.as_str()).unwrap();
        state.gallery_cache.insert(picture.img_path.clone(), picture.clone());
    }

    update_picture_in_state_cache(&state_mux, data);
    save_gallery_cache(&state_mux);
}

#[tauri::command]
pub fn get_documents_cache(state_mux: State<'_, FsStateMux>) -> IpcResponse<String> {
    let mut cache_exists = fs::metadata(&DOCUMENTS_CACHE_FILE_PATH[..]).is_ok();
    println!("get_documents_cache cache_exists: {cache_exists}");
    if cache_exists {
        cache_exists = load_documents_cache(&state_mux);
    } else {
        File::create(&DOCUMENTS_CACHE_FILE_PATH[..]).unwrap();
    }

    if !cache_exists {
        create_documents_cache(&state_mux);
    }

    // watch_changes(PathBuf::from(AppSettings::deserialize().documents_path), &state_mux, &app);

    save_documents_cache(&state_mux);

    let cache = serde_json::to_string(&state_mux.lock().unwrap().documents_cache).unwrap();

    Ok(cache).into()
}
