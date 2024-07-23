use std::ffi::OsStr;
use std::fmt::Display;
use std::path::{PathBuf, Path};
use std::fs::{rename, create_dir_all, read_dir, File, OpenOptions};
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

pub fn img_to_data_url<T, S>(input: T, extension: S) -> String
    where T: AsRef<[u8]>,
          S: Into<String> + Display,
{
    let base64_data = general_purpose::STANDARD_NO_PAD.encode(&input);
    format!("data:image/{};base64,{}", extension, base64_data)
}

pub fn read_file_as_data_url<P>(filepath: P) -> std::result::Result<String, Error>
    where P: AsRef<Path>,
{
    let mut file = OpenOptions::new().read(true).open(&filepath)?;
    // let mut file = File::open(&filepath)?;
    let extension = Path::new(filepath.as_ref().as_os_str()).extension().and_then(OsStr::to_str);
    if let Some(extension) = extension {
        let mut buffer = Vec::new();

        file.read_to_end(&mut buffer)?;

        let data_url = img_to_data_url(&buffer, extension);

        Ok(data_url)
    } else {
        Err(Error::Other("read_file_as_data_url ERROR: the file doesn't have an extension".to_string()))
    }
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
pub fn read_file_to_data_url(filepath: String) -> IpcResponse<String> {
    read_file_as_data_url(filepath).into()
}
