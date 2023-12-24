//! All model and controller for the Document type
use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update, Bmc};
use super::store::x_take::XTake;
use super::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use super::{ModelMutateResultData, vmap};
use crate::macros::map;
use crate::model::ctx::Ctx;
use crate::model::{Error, Result};
use surreal_qb::filter::{FilterNode, FilterNodes, finalize_list_options, IntoFilterNodes, ListOptions, OpValsArray, OpValsString};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;
use crate::utils::LabelValue;

//#region ---------- Document ----------
/// Name must be unique
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct Document {
    pub title: String,
    pub ctime: String,
    pub body: Option<String>,
    pub tags: Option<Vec<LabelValue>>,
    pub categories: Option<Vec<LabelValue>>,
    pub used_pics: Option<Vec<String>>
}

impl TryFrom<Object> for Document {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Document> {
        let document = Document {
            title: val.x_take_val("title")?,
            ctime: val.x_take_val("ctime")?,
            body: val.x_take("body")?,
            tags: val.x_take("tags")?,
            categories: val.x_take("categories")?,
            used_pics: val.x_take("used_pics")?,
        };

        Ok(document)
    }
}

/// Folder must be created with default tittle `New Document` + number of default named folders + 1
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentForCreate {
    pub title: String,
}

impl From<DocumentForCreate> for Value {
    fn from(val: DocumentForCreate) -> Self {
        let mut data = map!("title".into() => val.title.into());

        Value::Object(data.into())
    }
}

impl Creatable for DocumentForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentForUpdate {
    pub title: Option<String>,
    pub body: Option<String>,
    pub tags: Option<Vec<LabelValue>>,
    pub categories: Option<Vec<LabelValue>>,
    pub used_pics: Option<Vec<String>>
}

impl From<DocumentForUpdate> for Value {
    fn from(val: DocumentForUpdate) -> Self {
        let mut data = map!();

        if let Some(title) = val.title {
            data.insert("title".into(), title.into());
        }

        if let Some(body) = val.body {
            data.insert("body".into(), body.into());
        }

        if let Some(tags) = val.tags {
            data.insert("tags".into(), vec_to_surreal_value(tags.into()));
        }

        if let Some(categories) = val.categories {
            data.insert("categories".into(), vec_to_surreal_value(categories.into()));
        }

        if let Some(used_pics) = val.used_pics {
            data.insert("used_pics".into(), vec_to_surreal_value(used_pics.into()));
        }

        data.into()
    }
}

impl Patchable for DocumentForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct DocumentFilter {
    pub id: Option<OpValsString>,
    pub title: Option<OpValsString>, // TODO: surrealdb full-text search
    pub body: Option<OpValsString>, // TODO: surrealdb full-text search
    pub ctime: Option<OpValsString>,
    pub tags: Option<OpValsArray>,
    pub categories: Option<OpValsArray>,
    pub used_pics: Option<OpValsArray>
}

impl Filterable for DocumentFilter {}

pub struct DocumentBmc;

impl Bmc for DocumentBmc {
    const ENTITY: &'static str = "document";
}

impl DocumentBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Document> {
        bmc_get(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: DocumentForCreate) -> Result<Document> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: DocumentForUpdate) -> Result<Document> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<Document> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filters: Option<Vec<DocumentFilter>>, list_options: Option<ListOptions>) -> Result<Vec<Document>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list(ctx, Self::ENTITY, filters, list_options).await
    }
}
//#endregion ---------- Document ----------
