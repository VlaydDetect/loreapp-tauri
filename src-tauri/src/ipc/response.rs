use crate::prelude::f;
use crate::Result;
use serde::Serialize;
use ts_gen::TS;

#[derive(TS, Serialize)]
#[ts(export)]
pub struct IpcError {
    pub message: String,
}

#[derive(TS, Serialize)]
#[ts(export)]
pub struct IpcSimpleResult<D>
where
    D: Serialize,
{
    pub data: D,
}

#[derive(TS, Serialize)]
#[ts(export)]
pub struct IpcResponse<D>
where
    D: Serialize,
{
    pub error: Option<IpcError>,
    pub result: Option<IpcSimpleResult<D>>,
}

impl<D> From<Result<D>> for IpcResponse<D>
where
    D: Serialize,
{
    fn from(res: Result<D>) -> Self {
        match res {
            Ok(data) => IpcResponse {
                error: None,
                result: Some(IpcSimpleResult { data }),
            },
            Err(err) => IpcResponse {
                error: Some(IpcError {
                    message: f!("{err}"),
                }),
                result: None,
            },
        }
    }
}
