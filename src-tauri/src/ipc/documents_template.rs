use super::{into_response, CreateParams, DeleteParams, GetParams, IpcResponse, UpdateParams};
use crate::model::ctx::Ctx;
use crate::model::Error as ModelError;
use crate::model::{
    DocumentsTemplate, DocumentsTemplateBmc, DocumentsTemplateForCreate, DocumentsTemplateForUpdate,
};
use crate::Error;
use serde_json::Value;
use surreal_qb::filter::ListOptions;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_documents_template(
    app: AppHandle<Wry>,
    params: GetParams,
) -> IpcResponse<DocumentsTemplate> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsTemplateBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_documents_template(
    app: AppHandle<Wry>,
    params: CreateParams<DocumentsTemplateForCreate>,
) -> IpcResponse<DocumentsTemplate> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsTemplateBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_documents_template(
    app: AppHandle<Wry>,
    params: UpdateParams<DocumentsTemplateForUpdate>,
) -> IpcResponse<DocumentsTemplate> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsTemplateBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_documents_template(
    app: AppHandle<Wry>,
    params: DeleteParams,
) -> IpcResponse<DocumentsTemplate> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(DocumentsTemplateBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_documents_templates(
    app: AppHandle<Wry>,
    filter: Option<Value>,
    list_options: Option<ListOptions>,
) -> IpcResponse<Vec<DocumentsTemplate>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match filter.map(serde_json::from_value).transpose() {
            Ok(filter) => {
                into_response(DocumentsTemplateBmc::list(ctx, filter, list_options).await)
            }
            Err(err) => Err(Error::JsonSerde(err)).into(),
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}
