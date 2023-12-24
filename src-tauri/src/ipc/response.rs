use crate::Result;
// use crate::model::Result as ModelResult;
use serde::Serialize;
use ts_rs::TS;
use crate::prelude::f;

#[derive(TS, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
pub struct IpcError {
    pub message: String,
}

#[derive(TS, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
pub struct IpcSimpleResult<D>
    where
        D: Serialize,
{
    pub data: D,
}

#[derive(TS, Serialize)]
#[ts(export, rename_all="camelCase", export_to = "../src/interface/")]
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


// impl<D> From<ModelResult<D>> for IpcResponse<D>
//     where
//         D: Serialize,
// {
//     fn from(res: ModelResult<D>) -> Self {
//         match res {
//             Ok(data) => IpcResponse {
//                 error: None,
//                 result: Some(IpcSimpleResult { data }),
//             },
//             Err(err) => IpcResponse {
//                 error: Some(IpcError {
//                     message: format!("{err}"),
//                 }),
//                 result: None,
//             },
//         }
//     }
// }
