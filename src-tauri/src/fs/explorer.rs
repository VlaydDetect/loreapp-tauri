use std::fs;
use std::fs::read_dir;
use std::ops::Deref;
use std::path::{Path, PathBuf};
use notify::event::CreateKind;
use tauri::State;
use crate::error::{Error, Result};
use crate::fs::cache::FsEventHandler;
use crate::fs::utils::get_mount_point;
use crate::fs::{DirectoryChild, FsStateMux};
use crate::ipc::IpcResponse;

// /// Opens a file at the given path. Returns a string if there was an error.
// NOTE(conaticus): I tried handling the errors nicely here but Tauri was mega cringe and wouldn't let me nest results in async functions, so used string error messages instead.
// #[tauri::command]
// pub async fn open_file(path: String) -> Result<()> {
//     let output_res = open::commands(path)[0].output();
//     let output = match output_res {
//         Ok(output) => output,
//         Err(err) => {
//             let err_msg = format!("Failed to get open command output: {}", err);
//             return Err(Error::Other(err_msg));
//         }
//     };
//
//     if output.status.success() {
//         return Ok(());
//     }
//
//     let err_msg = String::from_utf8(output.stderr).unwrap_or(String::from("Failed to open file and deserialize stderr."));
//     Err(Error::Other(err_msg))
// }
// TODO: ?

/// Searches and returns the files in a given directory. This is not recursive.
#[tauri::command]
pub async fn open_directory(path: String) -> IpcResponse<Vec<DirectoryChild>> {
    let Ok(directory) = read_dir(path) else {
        return Ok(Vec::new()).into();
    };

    Ok(directory
        .map(|entry| {
            let entry = entry.unwrap();

            let file_name = entry.file_name().to_string_lossy().to_string();
            let entry_is_file = entry.file_type().unwrap().is_file();
            let entry = entry.path().to_string_lossy().to_string();

            if entry_is_file {
                return DirectoryChild::File(file_name, entry);
            }

            DirectoryChild::Directory(file_name, entry)
        })
        .collect()).into()
}
//
// #[tauri::command]
// pub async fn create_file(state_mux: State<'_, StateSafe>, path: String) -> Result<()> {
//     let mount_point_str = get_mount_point(path.clone()).unwrap_or_default();
//
//     let fs_event_manager = FsEventHandler::new(state_mux.deref().clone(), mount_point_str.into());
//     fs_event_manager.handle_create(CreateKind::File, Path::new(&path));
//
//     let res = fs::File::create(path);
//     match res {
//         Ok(_) => {
//             Ok(())
//         },
//         Err(err) => Err(Error::Other(err.to_string())),
//     }
// }
//
// #[tauri::command]
// pub async fn create_directory(state_mux: State<'_, StateSafe>, path: String) -> Result<()> {
//     let mount_point_str = get_mount_point(path.clone()).unwrap_or_default();
//
//     let fs_event_manager = FsEventHandler::new(state_mux.deref().clone(), mount_point_str.into());
//     fs_event_manager.handle_create(CreateKind::Folder, Path::new(&path));
//
//     let res = fs::create_dir(path);
//     match res {
//         Ok(_) => {
//             Ok(())
//         },
//         Err(err) => Err(Error::Other(err.to_string())),
//     }
// }
//
// #[tauri::command]
// pub async fn rename_file(state_mux: State<'_, StateSafe>, old_path: String, new_path: String) -> Result<()> {
//     let mount_point_str = get_mount_point(old_path.clone()).unwrap_or_default();
//
//     let mut fs_event_manager = FsEventHandler::new(state_mux.deref().clone(), mount_point_str.into());
//     fs_event_manager.handle_rename_from(Path::new(&old_path));
//     fs_event_manager.handle_rename_to(Path::new(&new_path));
//
//     let res = fs::rename(old_path, new_path);
//     match res {
//         Ok(_) => {
//             Ok(())
//         },
//         Err(err) => Err(Error::Other(err.to_string())),
//     }
// }
//
// #[tauri::command]
// pub async fn delete_file(state_mux: State<'_, StateSafe>, path: String) -> Result<()> {
//     let mount_point_str = get_mount_point(path.clone()).unwrap_or_default();
//
//     let fs_event_manager = FsEventHandler::new(state_mux.deref().clone(), mount_point_str.into());
//     fs_event_manager.handle_delete(Path::new(&path));
//
//     let res = fs::remove_file(path);
//     match res {
//         Ok(_) => {
//             Ok(())
//         },
//         Err(err) => Err(Error::Other(err.to_string())),
//     }
// }
