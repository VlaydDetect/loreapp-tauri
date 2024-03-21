//! All model and controller for the Document type
use super::bmc_base::{
    Bmc, bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update,
    bmc_custom_multi_query, bmc_custom_solo_query,
};
use super::store::x_take::XTake;
use super::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use super::{vmap, ModelMutateResultData};
use crate::model::bmc_graph::{GraphBmc, bmc_delete_edge, bmc_relate, bmc_rerelate_edge};
use crate::model::ctx::Ctx;
use crate::model::{Error, Result};
use crate::prelude::f;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::HashMap;
use std::sync::Arc;
use surreal_qb::filter::{
    finalize_list_options, FilterNode, FilterNodes, IntoFilterNodes, ListOptions, OpValsArray,
    OpValsString,
};
use surrealdb::sql::{Datetime, Object, Value};
use ts_rs::TS;

// TODO: Does it need an Option for Vec's if they can be empty?

//#region ---------- Document ----------
/// Name must be unique
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone, PartialEq)]
#[ts(export, export_to = "../src/interface/")]
pub struct Document {
    pub id: String,
    pub ctime: String,
    pub title: String,
    pub body: Option<String>,
    pub tags: Option<Vec<String>>,
    pub categories: Option<Vec<String>>,
    pub used_pics: Option<Vec<String>>,
}

impl TryFrom<Object> for Document {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Document> {
        let document = Document {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            title: val.x_take_val("title")?,
            body: val.x_take("body")?,
            tags: val.x_take("tags")?,
            categories: val.x_take("categories")?,
            used_pics: val.x_take("used_pics")?,
        };

        Ok(document)
    }
}

/// Folder must be created with default tittle `New Document` + number of default named folders + 1
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentForCreate {
    pub title: String,
}

impl From<DocumentForCreate> for Value {
    fn from(val: DocumentForCreate) -> Self {
        let mut data = vmap!("title".into() => val.title.into());
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
    pub tags: Option<Vec<String>>,
    pub categories: Option<Vec<String>>,
    pub used_pics: Option<Vec<String>>,
}

impl From<DocumentForUpdate> for Value {
    fn from(val: DocumentForUpdate) -> Self {
        let mut data = vmap!();

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
    pub ctime: Option<OpValsString>,
    pub title: Option<OpValsString>, // TODO: surrealdb full-text search
    pub body: Option<OpValsString>,  // TODO: surrealdb full-text search
    pub tags: Option<OpValsArray>,
    pub categories: Option<OpValsArray>,
    pub used_pics: Option<OpValsArray>,
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

    pub async fn list(
        ctx: Arc<Ctx>,
        filters: Option<Vec<DocumentFilter>>,
        list_options: Option<ListOptions>,
    ) -> Result<Vec<Document>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list(ctx, Self::ENTITY, filters, list_options).await
    }

    pub async fn create_untitled(ctx: Arc<Ctx>) -> Result<Document> {
        // let sql = "CREATE document SET title = function() {\ // TODO: when scripting features will compile (when rquicksj will compile)
        // const allUntitledDocs = (await surrealdb.query(\"SELECT count(string::startsWith(title,\"untitled\")) FROM document GROUP ALL\"))[0].count;\
        // return `untitled${allUntitledDocs + 1}`; }";
        let sql = "LET $count = (SELECT count(string::startsWith(title,\"untitled\")) FROM document GROUP ALL)[0].count;\
        IF $count = None THEN \
        (CREATE document SET title = \"untitled1\", ctime = $ctime) \
        ELSE \
        (CREATE document SET title = string::concat(\"untitled\", <string>($count+1)), ctime = $ctime) \
        END";
        let now = Datetime::default().to_string();
        let vars = vmap!("ctime".into() => now.into());
        let result = bmc_custom_multi_query::<Document>(ctx, Self::ENTITY, sql, Some(vars.into())).await?;

        result
            .into_iter()
            .next()
            .ok_or(Error::Store(crate::model::store::Error::ResponseIsEmpty))
    }
}
//#endregion ---------- Document ----------
