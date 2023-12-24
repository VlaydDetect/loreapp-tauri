use serde_json::Value;
use surreal_qb::filter::ListOptions;
use super::{CreateParams, DeleteParams, GetParams, into_response, IpcResponse, ListParams, UpdateParams};
use crate::model::{Document, DocumentBmc, DocumentForCreate, DocumentForUpdate};
use crate::Error;
use crate::model::Error as ModelError;
use tauri::{command, AppHandle, Wry};
use crate::model::ctx::Ctx;

#[command]
pub async fn get_document(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Document> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_document(app: AppHandle<Wry>, params: CreateParams<DocumentForCreate>) -> IpcResponse<Document> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_document(app: AppHandle<Wry>, params: UpdateParams<DocumentForUpdate>) -> IpcResponse<Document> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_document(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<Document> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_documents(app: AppHandle<Wry>, filter: Option<Value>, list_options: Option<ListOptions>) -> IpcResponse<Vec<Document>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => {
                    into_response(DocumentBmc::list(ctx, filter, list_options).await)
                },
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}
