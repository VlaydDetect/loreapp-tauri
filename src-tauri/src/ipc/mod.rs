mod params;
mod document;
mod response;
mod picture;
mod settings;
mod tags_and_categories;

use serde::de::DeserializeOwned;
use serde::Serialize;
use crate::prelude::f;

// --- re-exports
pub use params::*;
pub use document::*;
pub use response::*;
pub use picture::*;
pub use tags_and_categories::*;
pub use settings::*;
pub(crate) fn into_response<D>(result: crate::model::Result<D>) -> IpcResponse<D>
    where D: Serialize
{
    match result {
        Ok(val) => IpcResponse {
            error: None,
            result: Some(IpcSimpleResult {
                data: val
            }),
        },
        Err(err) => IpcResponse {
            error: Some(IpcError {
                message: f!("{err}"),
            }),
            result: None,
        }
    }
}
