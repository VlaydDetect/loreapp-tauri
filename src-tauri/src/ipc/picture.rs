//! Tauri IPC commands to bridge Project Frontend Model Controller to Backend Model Controller
//!

use super::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::ctx::Ctx;
use crate::model::{
    ModelMutateResultData, Picture, PictureBmc, PictureForCreate, PictureForUpdate,
};
use crate::Error;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_picture(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => PictureBmc::get(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn create_picture(app: AppHandle<Wry>, params: CreateParams<PictureForCreate>) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => PictureBmc::create(ctx, params.data).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_picture(app: AppHandle<Wry>, params: UpdateParams<PictureForUpdate>,) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => PictureBmc::update(ctx, &params.id, params.data)
            .await
            .into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_picture(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => PictureBmc::delete(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn list_pictures(app: AppHandle<Wry>, params: ListParams<Value>) -> IpcResponse<Vec<Picture>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => PictureBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}