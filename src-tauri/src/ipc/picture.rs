//! Tauri IPC commands to bridge Project Frontend Model Controller to Backend Model Controller
//!

use std::collections::HashMap;
use serde_json::Value;
use surreal_qb::filter::ListOptions;
use super::{CreateParams, DeleteParams, GetParams, into_response, IpcResponse, ListParams, UpdateParams};
use crate::model::ctx::Ctx;
use crate::model::{Document, Picture, PictureBmc, PictureForCreate, PictureForUpdate, vmap};
use crate::Error;
use crate::model::Error as ModelError;
use tauri::{command, AppHandle, Wry};
use walkdir::WalkDir;
use crate::fs::{IMAGE_EXTENSIONS, read_file_as_data_url};
use crate::error::Result as MainResult;

#[command]
pub async fn get_picture(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_picture(app: AppHandle<Wry>, params: CreateParams<PictureForCreate>) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_picture(app: AppHandle<Wry>, params: UpdateParams<PictureForUpdate>,) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_picture(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_pictures(app: AppHandle<Wry>, filter: Option<Value>, list_options: Option<ListOptions>) -> IpcResponse<Vec<Picture>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => into_response(PictureBmc::list(ctx, filter, list_options).await),
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn get_document_used_in(app: AppHandle<Wry>, id: String) -> IpcResponse<Vec<String>> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::get_document_used_in(ctx, id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn get_picture_with_url(app: AppHandle<Wry>, id: String) -> IpcResponse<Picture> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::get_with_url(ctx, id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_pictures_with_urls(app: AppHandle<Wry>, filter: Option<Value>, list_options: Option<ListOptions>) -> IpcResponse<Vec<Picture>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => into_response(PictureBmc::list_with_urls(ctx, filter, list_options).await),
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn collect_pictures_from_disk(app: AppHandle<Wry>, path: String) -> IpcResponse<Vec<Picture>> {
    let mut paths = Vec::<String>::new();

    WalkDir::new(path)
        .into_iter()
        .filter_map(Result::ok) // TODO: handle entries that could not be read
        .for_each(|entry| {
            let file_path = entry.path().to_string_lossy().to_string();

            if entry.file_type().is_file() {
                let extension = entry.path().extension().unwrap().to_str().unwrap();

                if IMAGE_EXTENSIONS.contains(&extension) {
                    if (!paths.contains(&file_path)) {
                        paths.push(file_path);
                    }
                }
            }
        });

    let data = paths.into_values().collect::<Vec<String>>();

    let sql = "BEGIN; FOR $url IN $data { CREATE picture SET data_url = $url; }; SELECT * FROM picture; COMMIT;";
    let vars = vmap!("data".into() => data.into());

    match Ctx::from_app(app) {
        Ok(ctx) => into_response(PictureBmc::custom_multi_query(ctx, sql, Some(vars.into())).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}
