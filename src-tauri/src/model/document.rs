//! All model and controller for the Project type
use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::ModelMutateResultData;
use crate::ctx::Ctx;
use crate::utils::XTake;
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;
use crate::macros::map;

#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = ".../src/interface/")]
pub struct Document {
    pub id: String,
    pub title: String,
    pub body: String,
    pub ctime: String,
    tags: String,
    categories: String,
}

impl TryFrom<Object> for Document {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Document> {
        let document = Document {
            id: val.x_take_val("id")?,
            title: val.x_take_val("name")?,
            body: val.x_take_val("body")?,
            ctime: val.x_take_val::<i64>("ctime")?.to_string(),
            tags: val.x_take_val("tags")?,
            categories: val.x_take_val("categories")?,
        };

        Ok(document)
    }
}

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentForCreate {
    pub id: String,
    pub name: Option<String>,
}

impl From<DocumentForCreate> for Value {
    fn from(val: DocumentForCreate) -> Self {
        let mut data = map!("id".into() => val.id.into());

        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }

        Value::Object(data.into())
    }
}

impl Creatable for DocumentForCreate {}

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentForUpdate {
    pub name: Option<String>,
    pub body: Option<String>,
    pub tags: Option<String>,
    pub categories: Option<String>,
}

impl From<DocumentForUpdate> for Value {
    fn from(val: DocumentForUpdate) -> Self {
        let mut data = map!();

        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }

        if let Some(body) = val.body {
            data.insert("body".into(), body.into());
        }

        if let Some(tags) = val.tags {
            data.insert("tags".into(), tags.into());
        }

        if let Some(categories) = val.categories {
            data.insert("categories".into(), categories.into());
        }

        data.into()
    }
}

impl Patchable for DocumentForUpdate {}

// TODO: don't support full text search, will be rewritten for the new version of SurrealDB. Use without filters!!!
#[derive(FilterNodes, Deserialize, Debug)]
pub struct DocumentFilter {
    pub id: Option<OpValsString>,
    pub name: Option<OpValsString>,
}

impl Filterable for DocumentFilter {}

pub struct DocumentBmc;

impl DocumentBmc {
    const ENTITY: &'static str = "document";

    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Document> {
        bmc_get(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: DocumentForCreate) -> Result<ModelMutateResultData> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: DocumentForUpdate) -> Result<ModelMutateResultData> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    /// Use without filters!!!
    /// Filtering will be realized in front-end
    pub async fn list(ctx: Arc<Ctx>, filter: Option<DocumentFilter>) -> Result<Vec<Document>> {
        bmc_list(ctx, Self::ENTITY, filter, ListOptions::default()).await
    }
}
