mod document;
mod documents_folder;
mod documents_template;
mod params;
mod picture;
mod response;
mod settings;
mod tags_and_categories;

use crate::prelude::f;
use serde::de::DeserializeOwned;
use serde::Serialize;

// --- re-exports
pub use document::*;
pub use documents_folder::*;
pub use documents_template::*;
pub use params::*;
pub use picture::*;
pub use response::*;
pub use settings::*;
pub use tags_and_categories::*;
pub(crate) fn into_response<D>(result: crate::model::Result<D>) -> IpcResponse<D>
where
    D: Serialize,
{
    match result {
        Ok(val) => IpcResponse {
            error: None,
            result: Some(IpcSimpleResult { data: val }),
        },
        Err(err) => IpcResponse {
            error: Some(IpcError {
                message: f!("{err}"),
            }),
            result: None,
        },
    }
}
