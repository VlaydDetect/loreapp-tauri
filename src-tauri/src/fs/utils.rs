use std::ffi::OsStr;
use std::fmt::Display;
use std::path::{PathBuf, Path};
use std::fs::{rename, create_dir_all, read_dir, File};
use std::io::Read;
use crate::ipc::{IpcResponse, IpcSimpleResult, IpcError};
use base64::{Engine as _, engine::general_purpose};
use crate::{Error, Result};

pub fn path_to_string(path: &PathBuf) -> String {
    path.display().to_string()
}

pub fn string_to_path(path: &String) -> PathBuf {
    PathBuf::from(path)
}

// TODO: add new documents and gallery paths to the scope and delete old paths from it
pub fn move_files_recursively(source: &PathBuf, dest: &PathBuf) -> crate::error::Result<()> {
    if source.is_file() {
        let new_path = dest.join(source.file_name().unwrap());
        rename(source, new_path)?;
    } else if source.is_dir() {
        create_dir_all(dest)?;

        for entry in read_dir(source)? {
            let entry = entry?;
            let source_path = entry.path();
            let dest_path = dest.join(entry.file_name());

            move_files_recursively(&source_path, &dest_path)?;
        }
    }

    Ok(())
}

pub fn get_mount_point(path: String) -> Option<String> {
    let path = Path::new(&path);
    let root = path.components().next()?;
    let mount_point = root.as_os_str().to_string_lossy().into_owned();

    let mut mount_point_path = PathBuf::new();
    mount_point_path.push(&mount_point);
    mount_point_path.push("\\");
    Some(mount_point_path.to_string_lossy().into_owned())
}

pub fn img_to_data_url<T, S>(input: T, extension: S) -> String
    where T: AsRef<[u8]>,
          S: Into<String> + Display,
{
    let base64_data = general_purpose::STANDARD_NO_PAD.encode(&input);
    format!("data:image/{};base64,{}", extension, base64_data)
}

pub fn read_file_as_data_url<P>(filepath: P) -> Result<String>
    where P: AsRef<Path> + AsRef<OsStr>,
{
    let mut file = File::open(&filepath)?;
    let extension = Path::new(&filepath).extension().and_then(OsStr::to_str).unwrap();  // TODO
    let mut buffer = Vec::new();

    file.read_to_end(&mut buffer)?;

    let data_url = img_to_data_url(&buffer, extension);

    Ok(data_url)
}

#[tauri::command]
pub fn is_exists(path: String) -> IpcResponse<bool> {
    match Path::new(path.as_str()).try_exists() {
        Ok(data) => IpcResponse {
            error: None,
            result: Some(IpcSimpleResult { data }),
        },
        Err(err) => IpcResponse {
            error: Some(IpcError {
                message: format!("{err}"),
            }),
            result: None,
        },
    }
}

#[tauri::command]
pub fn read_file_to_data_url<P>(filepath: P) -> IpcResponse<String>
    where P: AsRef<Path> + AsRef<OsStr>,
{
    read_file_as_data_url(filepath).into()
}
