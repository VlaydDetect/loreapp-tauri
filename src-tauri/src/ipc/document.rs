use super::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::ctx::Ctx;
use crate::model::{
    ModelMutateResultData, Document, DocumentBmc, DocumentForCreate, DocumentForUpdate,
};
use crate::Error;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_document(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Document> {
    match Ctx::from_app(app) {
        Ok(ctx) => DocumentBmc::get(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn create_document(app: AppHandle<Wry>, params: CreateParams<DocumentForCreate>) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => DocumentBmc::create(ctx, params.data).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_document(app: AppHandle<Wry>, params: UpdateParams<DocumentForUpdate>) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => DocumentBmc::update(ctx, &params.id, params.data)
            .await
            .into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_document(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<ModelMutateResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => DocumentBmc::delete(ctx, &params.id).await.into(),
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn list_documents(app: AppHandle<Wry>, params: ListParams<Value>) -> IpcResponse<Vec<Document>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
            Ok(filter) => DocumentBmc::list(ctx, filter).await.into(),
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}