use std::ffi::OsStr;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tokio::{sync::mpsc::{channel, Receiver}};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, State, Window};

use std::{
    collections::HashMap,
    path::PathBuf,
    sync::Mutex,
    thread::spawn,
    time::Duration,
};
use crate::ipc::IpcResponse;
use crate::Result;
use crate::macros::ternary;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct EmittedEventAttributes {
    info: Option<String>,
    source: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct EmittedEvent {
    kind: EventKind,
    paths: Vec<String>,
    attrs: EmittedEventAttributes,
}

fn convert_event(event: Event) -> EmittedEvent {
    let mut paths: Vec<String> = vec![];

    for path in event.paths {
        paths.push(path.display().to_string());
    }

    let info =
        if let Some(info) = event.attrs.info() {
            Some(info.to_string())
        } else {
            None
        };

    let source =
        if let Some(source) = event.attrs.source() {
            Some(source.to_string())
        } else {
            None
        };

    EmittedEvent {
        kind: event.kind,
        paths,
        attrs: EmittedEventAttributes {
            info,
            source
        },
    }
}

type Id = u32;

#[derive(Default)]
pub struct WatcherCollection(Mutex<HashMap<Id, (RecommendedWatcher, Vec<PathBuf>)>>);

fn async_watcher(delay_ms: Option<u64>) -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (tx, rx) = channel(1);

    let config = if let Some(delay) = delay_ms {
        Config::default().with_poll_interval(Duration::from_millis(delay))
    } else {
        Config::default()
    };

    let watcher = RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        config,
    )?;

    Ok((watcher, rx))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchOptions {
    delay_ms: Option<u64>,
    recursive: bool,
    filters: Option<Vec<String>>
}

fn emit<R: Runtime>(window: &Window<R>, event: EmittedEvent, id: Id) {
    let event_name = format!("watcher://raw-event/{id}");
    // TODO: Should errors be emitted too?
    let _ = window.emit(&event_name, event);
}

fn insert_id(watchers_mutex: State<'_, WatcherCollection>, id: Id, value: (RecommendedWatcher, Vec<PathBuf>)) {
    watchers_mutex.0.lock().unwrap().insert(id, value);
}

fn apply_filter(filters: &Vec<String>, path: &PathBuf) -> bool {
    let extension = if let Some(ext) = path.extension().and_then(OsStr::to_str) {
        String::from(ext)
    } else {
        "".to_string()
    };

    println!("Filters: {:?}, ext: {}, isEq: {}", *filters, extension, filters.contains(&extension));
    filters.contains(&extension)
}

async fn async_watch(app: AppHandle, id: Id, paths: Vec<PathBuf>, options: WatchOptions, does_emit_event: bool) -> notify::Result<()> {
    let mode = ternary!(options.recursive => RecursiveMode::Recursive; RecursiveMode::NonRecursive);

    let (mut watcher, mut rx) = async_watcher(options.delay_ms)?;

    for path in &paths {
        watcher.watch(path, mode).unwrap();
    }

    let watchers_mutex = app.state::<WatcherCollection>();
    insert_id(watchers_mutex, id, (watcher, paths));
    // watchers_mutex.0.lock().unwrap().insert(id, (watcher, paths));

    while let Some(res) = rx.recv().await {
        match res {
            Ok(mut event) => {
                let mut emitted_paths: Vec<PathBuf> = vec![];
                println!("changed: {:?}", &event);
                if let Some(filters) = &options.filters {
                    for path in event.paths.clone() {
                        if apply_filter(&filters, &path) {
                            emitted_paths.push(path);
                        }
                    }
                }

                if !emitted_paths.is_empty() && does_emit_event {
                    event.paths = emitted_paths;
                    emit(&app.get_window("main").unwrap(), convert_event(event), id);
                }

            },
            Err(err) => println!("watch error: {:?}", err),
        }
    }

    Ok(())
}

pub fn watch_emitted(app: AppHandle, id: Id, paths: Vec<PathBuf>, options: WatchOptions) -> Result<()> {
    let rt = tokio::runtime::Runtime::new().unwrap();

    spawn(move || {
        rt.block_on(async {
            async_watch(app, id, paths, options, true).await.unwrap();
        });
    });

    Ok(())
}

pub fn watch_simple(app: AppHandle, id: Id, paths: Vec<PathBuf>, options: WatchOptions) -> Result<()> {
    let rt = tokio::runtime::Runtime::new().unwrap();

    spawn(move || {
        rt.block_on(async {
            async_watch(app, id, paths, options, false).await.unwrap();
        });
    });

    Ok(())
}

#[tauri::command]
pub fn watch(app: AppHandle, id: Id, paths: Vec<PathBuf>, options: WatchOptions) -> IpcResponse<()> {
    watch_emitted(app, id, paths, options).into()
}

#[tauri::command]
pub fn unwatch(watchers: State<'_, WatcherCollection>, id: Id) -> IpcResponse<()> {
    if let Some((mut watcher, paths)) = watchers.0.lock().unwrap().remove(&id) {
        for path in paths {
            watcher.unwatch(&path).unwrap()
        }
    }
    Ok(()).into()
}
