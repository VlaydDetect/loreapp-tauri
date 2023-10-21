//! All model and controller for the Item type
//!

use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::ModelMutateResultData;
use crate::ctx::Ctx;
use crate::utils::XTake;
use crate::macros::map;
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "./src/interface/")]
pub struct Picture {
    pub id: String,
    pub ctime: String,
    pub img_data_url: String,
    pub document_ids: Option<String>,
    pub title: Option<String>,
    pub desc: Option<String>,
}

impl TryFrom<Object> for Picture {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Picture> {
        let task = Picture {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val::<i64>("ctime")?.to_string(),
            img_data_url: val.x_take_val("img_data_url")?,
            document_ids: val.x_take_val("document_ids")?,
            title: val.x_take_val("title")?,
            desc: val.x_take("desc")?,
        };

        Ok(task)
    }
}

#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "./src/interface/")]
pub struct PictureForCreate {
    pub id: String,
    pub img_data_url: String
}

impl From<PictureForCreate> for Value {
    fn from(val: PictureForCreate) -> Self {
        let mut data = map!["id".into() => val.id.into()];
        Value::Object(data.into())
    }
}

impl Creatable for PictureForCreate {}

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src/interface/")]
pub struct PictureForUpdate {
    pub title: Option<String>,
    pub desc: Option<String>,
    pub document_ids: Option<String>,
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
        if let Some(document_ids) = val.document_ids {
            data.insert("document_ids".into(), document_ids.into());
        }
        Value::Object(data.into())
    }
}

impl Patchable for PictureForUpdate {}

// TODO: don't support full text search, will be rewritten for the new version of SurrealDB. Use without filters!!!
#[derive(FilterNodes, Deserialize, Debug)]
pub struct PictureFilter {
    pub project_id: Option<OpValsString>,
    pub title: Option<OpValsString>,
}

impl Filterable for PictureFilter {}

pub struct PictureBmc;

impl PictureBmc {
    const ENTITY: &'static str = "picture";

    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        bmc_get::<Picture>(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: PictureForCreate) -> Result<ModelMutateResultData> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: PictureForUpdate,
    ) -> Result<ModelMutateResultData> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    /// Use without filters!!!
    /// Filtering will be realized in front-end
    pub async fn list(ctx: Arc<Ctx>, filter: Option<PictureFilter>) -> Result<Vec<Picture>> {
        let opts = ListOptions {
            limit: None,
            offset: None,
            order_bys: Some("!ctime".into()),
        };
        bmc_list(ctx, Self::ENTITY, filter, opts).await
    }
}
