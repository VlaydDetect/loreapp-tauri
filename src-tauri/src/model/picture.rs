//! All model and controller for the Item type
//!

use super::bmc_base::{Bmc, bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use super::{ModelMutateResultData, vmap};
use super::store::x_take::XTake;
use crate::macros::map;
use crate::model::{Error, Result};
use surreal_qb::filter::{FilterNodes, finalize_list_options, ListOptions, OpValsArray, OpValsString};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;
use crate::model::ctx::Ctx;
use crate::utils::LabelValue;

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct Picture {
    pub id: String,
    pub ctime: String,
    pub img_path: String,   // TODO: this can be either a DataURL or an absolute path to the file (under development)
    pub title: Option<String>,
    pub desc: Option<String>,
    pub tags: Option<Vec<LabelValue>>,
    pub categories: Option<Vec<LabelValue>>,
}

impl TryFrom<Object> for Picture {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Picture> {
        let task = Picture {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            img_path: val.x_take_val("img_path")?,
            title: val.x_take("title")?,
            desc: val.x_take("desc")?,
            tags: val.x_take("tags")?,
            categories: val.x_take("categories")?,
        };

        Ok(task)
    }
}

#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct PictureForCreate {
    pub img_path: String
}

impl From<PictureForCreate> for Value {
    fn from(val: PictureForCreate) -> Self {
        let mut data = map!["img_path".into() => val.img_path.into()];
        Value::Object(data.into())
    }
}

impl Creatable for PictureForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct PictureForUpdate {
    pub title: Option<String>,
    pub desc: Option<String>,
    pub tags: Option<Vec<LabelValue>>,
    pub categories: Option<Vec<LabelValue>>,
}

impl From<PictureForUpdate> for Value {
    fn from(val: PictureForUpdate) -> Self {
        let mut data = BTreeMap::new();
        if let Some(title) = val.title {
            data.insert("title".into(), title.into());
        }
        if let Some(desc) = val.desc {
            data.insert("desc".into(), desc.into());
        }
        if let Some(tags) = val.tags {
            data.insert("tags".into(), vec_to_surreal_value(tags.into()));
        }
        if let Some(categories) = val.categories {
            data.insert("tags".into(), vec_to_surreal_value(categories.into()));
        }
        Value::Object(data.into())
    }
}

impl Patchable for PictureForUpdate {}

#[derive(FilterNodes, Debug, Deserialize)]
pub struct PictureFilter {
    pub id: Option<OpValsString>,
    pub ctime: Option<OpValsString>,
    pub title: Option<OpValsString>, // TODO: surrealdb full-text search
    pub desc: Option<OpValsString>, // TODO: surrealdb full-text search
    pub tags: Option<OpValsArray>,
    pub categories: Option<OpValsArray>,
}

impl Filterable for PictureFilter {}

pub struct PictureBmc;

impl Bmc for PictureBmc {
    const ENTITY: &'static str = "picture";
}

impl PictureBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        bmc_get::<Picture>(ctx, Self::ENTITY, id).await
    }

    /// Returns the created Picture struct
    pub async fn create(ctx: Arc<Ctx>, data: PictureForCreate) -> Result<Picture> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: PictureForUpdate) -> Result<Picture> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filter: Option<Vec<PictureFilter>>, list_options: Option<ListOptions>) -> Result<Vec<Picture>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list::<Picture, _>(ctx, Self::ENTITY, filter, list_options).await
    }

    pub async fn get_document_used_in(ctx: Arc<Ctx>, id: &str) -> Result<Vec<String>> {
        let sql = "SELECT id FROM type::table($tb) WHERE $id IN used_pics;";
        let vars = vmap!["tb".into() => "document".into(), "id".into() => id.into()];
        let result = bmc_custom_solo_query::<ModelMutateResultData>(ctx, Self::ENTITY, sql, vars.into()).await?;

        Ok(result.into_iter().map(|v| v.id).collect())
    }

    pub async fn custom_solo_query(ctx: Arc<Ctx>, sql: &str, vars: Object) -> Result<Vec<Picture>> {
        bmc_custom_solo_query::<Picture>(ctx, Self::ENTITY, sql, vars).await
    }

    pub async fn custom_multi_query(ctx: Arc<Ctx>, sqls: &str, vars: Object) -> Result<Vec<Picture>> {
        bmc_custom_multi_query::<Picture>(ctx, Self::ENTITY, sqls, vars).await
    }
}
