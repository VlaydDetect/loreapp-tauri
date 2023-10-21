// use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
// use notify_debouncer_full::{new_debouncer, DebounceEventResult, Debouncer, FileIdMap};
// use serde::{ser::Serializer, Deserialize, Serialize};
//
// use std::{
//     collections::HashMap,
//     path::{PathBuf, Path},
//     sync::{
//         mpsc::{channel, Receiver},
//         Mutex,
//     },
//     thread::spawn,
//     time::Duration,
// };
// use std::ffi::{OsStr, OsString};
// use tauri::{Manager, Runtime, State, Window};
// use crate::macros::ternary;
//
//
// #[derive(Serialize, Clone)]
// #[serde(rename_all = "camelCase")]
// struct EmittedEventAttributes {
//     info: Option<String>,
//     source: Option<String>,
// }
//
// #[derive(Serialize, Clone)]
// #[serde(rename_all = "camelCase")]
// struct EmittedEvent {
//     kind: EventKind,
//     paths: Vec<String>,
//     attrs: EmittedEventAttributes,
// }
//
// fn convert_event(event: Event, filters: Option<&Vec<String>>) -> EmittedEvent {
//     let mut paths: Vec<String> = vec![];
//
//     for path in event.paths {
//         paths.push(path.display().to_string());
//     }
//
//     let info =
//         if let Some(info) = event.attrs.info() {
//             Some(info.to_string())
//         } else {
//             None
//         };
//
//     let source =
//         if let Some(source) = event.attrs.source() {
//             Some(source.to_string())
//         } else {
//             None
//         };
//
//     EmittedEvent {
//         kind: event.kind,
//         paths,
//         attrs: EmittedEventAttributes {
//             info,
//             source
//         },
//     }
// }
//
// #[derive(Debug, thiserror::Error)]
// pub enum Error {
//     #[error(transparent)]
//     Watch(#[from] notify::Error),
// }
//
// impl Serialize for Error {
//     fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
//         where
//             S: Serializer,
//     {
//         serializer.serialize_str(self.to_string().as_ref())
//     }
// }
//
// enum WatcherKind {
//     // Debouncer(Debouncer<RecommendedWatcher, FileIdMap>),
//     Watcher(RecommendedWatcher),
// }
//
// #[derive(Default)]
// pub struct WatcherCollection(Mutex<HashMap<Id, (WatcherKind, Vec<PathBuf>)>>);
//
// type Result<T> = std::result::Result<T, Error>;
// type Id = u32;
//
// fn raw_watch<R: Runtime>(window: Window<R>, rx: Receiver<notify::Result<Event>>, id: Id, filters: Option<Vec<String>>) {
//     spawn(move || {
//         let event_name = format!("watcher://raw-event/{id}");
//         while let Ok(event) = rx.recv() {
//             if let Ok(event) = event {
//                 // TODO: Should errors be emitted too?
//                 let _ = window.emit(&event_name, convert_event(event, filters.as_ref()));
//             }
//         }
//     });
// }
//
// // fn debounced_watch<R: Runtime>(window: Window<R>, rx: Receiver<DebounceEventResult>, id: Id) {
// //     spawn(move || {
// //         let event_name = format!("watcher://debounced-event/{id}");
// //         while let Ok(event) = rx.recv() {
// //             if let Ok(event) = event {
// //                 // TODO: Should errors be emitted too?
// //                 let _ = window.emit(&event_name, convert_event(event.first().unwrap().event.clone()));
// //             }
// //         }
// //     });
// // }
//
// #[derive(Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct WatchOptions {
//     delay_ms: Option<u64>,
//     recursive: bool,
//     filters: Option<Vec<String>>
// }
//
// #[tauri::command]
// pub async fn watch<R: Runtime>(window: Window<R>, watchers: State<'_, WatcherCollection>, id: Id, paths: Vec<PathBuf>, options: WatchOptions) -> Result<()> {
//     let mode = ternary!(options.recursive => RecursiveMode::Recursive; RecursiveMode::NonRecursive);
//
//     // let watcher =
//     //     if let Some(delay) = options.delay_ms {
//     //         let (tx, rx) = channel();
//     //         let mut debouncer = new_debouncer(Duration::from_millis(delay), None, tx).unwrap();
//     //         for path in &paths {
//     //             debouncer.watcher().watch(path, mode).unwrap();
//     //             debouncer.cache().add_root(path, mode);
//     //         }
//     //         debounced_watch(window, rx, id);
//     //         WatcherKind::Debouncer(debouncer)
//     //     } else {
//     //         let (tx, rx) = channel();
//     //         let mut watcher = RecommendedWatcher::new(tx, Config::default()).unwrap();
//     //         for path in &paths {
//     //             watcher.watch(path, mode).unwrap();
//     //         }
//     //         raw_watch(window, rx, id);
//     //         WatcherKind::Watcher(watcher)
//     //     };
//
//     let config =
//         if let Some(delay) = options.delay_ms {
//             Config::default().with_poll_interval(Duration::from_millis(delay))
//         } else {
//             Config::default()
//         };
//
//     let (tx, rx) = channel();
//
//     let mut watcher = RecommendedWatcher::new(tx, config).unwrap();
//     for path in &paths {
//         watcher.watch(path, mode).unwrap();
//     }
//     raw_watch(window, rx, id, options.filters);
//     let watcher = WatcherKind::Watcher(watcher);
//
//     watchers.0.lock().unwrap().insert(id, (watcher, paths));
//     Ok(())
// }
//
// #[tauri::command]
// pub async fn unwatch(watchers: State<'_, WatcherCollection>, id: Id) -> Result<()> {
//     if let Some((watcher, paths)) = watchers.0.lock().unwrap().remove(&id) {
//         match watcher {
//             // WatcherKind::Debouncer(mut debouncer) => {
//             //     for path in paths {
//             //         debouncer.watcher().unwatch(&path).unwrap()
//             //     }
//             // },
//             WatcherKind::Watcher(mut watcher) => {
//                 for path in paths {
//                     watcher.unwatch(&path).unwrap()
//                 }
//             }
//         };
//     }
//     Ok(())
// }