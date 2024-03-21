use serde_json::Value;
use surreal_qb::filter::ListOptions;
use tauri::{AppHandle, command, Wry};

use crate::Error;
use crate::model::{DocumentsFolder, DocumentsFolderBmc, DocumentsFolderForCreate, DocumentsFolderForUpdate, DocumentsFolderTree};
use crate::model::ctx::Ctx;
use crate::model::Error as ModelError;

use super::{CreateParams, DeleteParams, GetParams, into_response, IpcResponse, UpdateParams};

#[command]
pub async fn get_documents_folder(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<DocumentsFolder> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_documents_folder(app: AppHandle<Wry>, params: CreateParams<DocumentsFolderForCreate>) -> IpcResponse<DocumentsFolder> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_documents_folder(app: AppHandle<Wry>, params: UpdateParams<DocumentsFolderForUpdate>) -> IpcResponse<DocumentsFolder> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_documents_folder(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<DocumentsFolder> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_documents_folders(app: AppHandle<Wry>, filter: Option<Value>, list_options: Option<ListOptions>) -> IpcResponse<Vec<DocumentsFolder>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => {
                    into_response(DocumentsFolderBmc::list(ctx, filter, list_options).await)
                },
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_unnamed_folder(app: AppHandle<Wry>) -> IpcResponse<DocumentsFolder> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::create_unnamed(ctx).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn add_folder_or_document(app: AppHandle<Wry>, id: String, sub_id: String) -> IpcResponse<DocumentsFolderTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::attach_folder_or_document(ctx, id.as_str(), sub_id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn remove_folder_or_document(app: AppHandle<Wry>, id: String, sub_id: String) -> IpcResponse<DocumentsFolderTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::detach_folder_or_document(ctx, id.as_str(), sub_id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn move_folder_or_document(app: AppHandle<Wry>, id: String, from_id: Option<String>, to_id: Option<String>) -> IpcResponse<DocumentsFolderTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let from_id = from_id.as_ref().map(String::as_str);
            let to_id = to_id.as_ref().map(String::as_str);
            into_response(DocumentsFolderBmc::reattach_folder_or_document(ctx, id.as_str(), from_id, to_id).await)
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_folders_tree(app: AppHandle<Wry>) -> IpcResponse<DocumentsFolderTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsFolderBmc::list_tree(ctx).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}