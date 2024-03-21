use serde_json::Value;
use surreal_qb::filter::ListOptions;
use super::{CreateParams, DeleteParams, GetParams, into_response, IpcResponse, ListParams, UpdateParams};
use crate::model::{Category, CategoryBmc, CategoryForCreate, CategoryForUpdate, CategoriesTree, Tag, TagBmc, TagForCreate, TagForUpdate};
use crate::Error;
use crate::model::Error as ModelError;
use tauri::{command, AppHandle, Wry};
use crate::model::ctx::Ctx;

//#region -------------------------------- Categories --------------------------------
#[command]
pub async fn get_category(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Category> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_category(app: AppHandle<Wry>, params: CreateParams<CategoryForCreate>) -> IpcResponse<Category> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_category(app: AppHandle<Wry>, params: UpdateParams<CategoryForUpdate>) -> IpcResponse<Category> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_category(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<Category> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_categories(app: AppHandle<Wry>, filter: Option<Value>) -> IpcResponse<Vec<Category>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => {
                    into_response(CategoryBmc::list(ctx, filter).await)
                },
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_new_category(app: AppHandle<Wry>) -> IpcResponse<Category> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::create_new_category(ctx).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn attach_subcategory(app: AppHandle<Wry>, id: String, sub_id: String) -> IpcResponse<CategoriesTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::attach_subcategory(ctx, id.as_str(), sub_id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn detach_subcategory(app: AppHandle<Wry>, id: String, sub_id: String) -> IpcResponse<CategoriesTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::detach_subcategory(ctx, id.as_str(), sub_id.as_str()).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn reattach_subcategory(app: AppHandle<Wry>, id: String, from_id: Option<String>, to_id: Option<String>) -> IpcResponse<CategoriesTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            let from_id = from_id.as_ref().map(String::as_str);
            let to_id = to_id.as_ref().map(String::as_str);
            into_response(CategoryBmc::reattach_subcategory(ctx, id.as_str(), from_id, to_id).await)
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_categories_tree(app: AppHandle<Wry>) -> IpcResponse<CategoriesTree> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(CategoryBmc::list_tree(ctx).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}
//#endregion -------------------------------- Categories --------------------------------

//#region -------------------------------- Tags --------------------------------
#[command]
pub async fn get_tag(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Tag> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(TagBmc::get(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn create_tag(app: AppHandle<Wry>, params: CreateParams<TagForCreate>) -> IpcResponse<Tag> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(TagBmc::create(ctx, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn update_tag(app: AppHandle<Wry>, params: UpdateParams<TagForUpdate>) -> IpcResponse<Tag> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(TagBmc::update(ctx, &params.id, params.data).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn delete_tag(app: AppHandle<Wry>, params: DeleteParams) -> IpcResponse<Tag> {
    match Ctx::from_app(app) {
        Ok(ctx) => into_response(TagBmc::delete(ctx, &params.id).await),
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}

#[command]
pub async fn list_tags(app: AppHandle<Wry>, filter: Option<Value>, list_options: Option<ListOptions>) -> IpcResponse<Vec<Tag>> {
    match Ctx::from_app(app) {
        Ok(ctx) => {
            match filter.map(serde_json::from_value).transpose() {
                Ok(filter) => {
                    into_response(TagBmc::list(ctx, filter, list_options).await)
                },
                Err(err) => Err(Error::JsonSerde(err)).into(),
            }
        },
        Err(_) => Err(Error::Model(ModelError::CtxFail)).into(),
    }
}
//#endregion -------------------------------- Tags --------------------------------
