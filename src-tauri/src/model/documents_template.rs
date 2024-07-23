use super::bmc_base::{
    bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list,
    bmc_update, Bmc,
};
use super::store::x_take::XTake;
use super::store::{Creatable, Filterable, Patchable};
use super::{vmap, ModelMutateResultData};
use crate::model::bmc_graph::{bmc_delete_edge, bmc_relate, bmc_rerelate_edge};
use crate::model::ctx::Ctx;
use crate::model::{Error, Result};
use crate::prelude::f;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::sync::Arc;
use surreal_qb::filter::{
    finalize_list_options, FilterNode, FilterNodes, IntoFilterNodes, ListOptions, OpValsArray,
    OpValsString,
};
use surrealdb::sql::{Datetime, Object, Value};
use ts_gen::TS;

// TODO: maybe add icon
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export)]
pub struct DocumentsTemplate {
    pub id: String,
    pub ctime: String,
    pub name: String,
    pub description: Option<String>,
    pub data: String,
    // TODO: ?
    // pub tags: Option<Vec<String>>,
    // pub categories: Option<Vec<String>>,
}

impl TryFrom<Object> for DocumentsTemplate {
    type Error = Error;

    fn try_from(mut val: Object) -> std::result::Result<Self, Self::Error> {
        let template = DocumentsTemplate {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
            description: val.x_take("description")?,
            data: val.x_take_val("data")?,
        };

        Ok(template)
    }
}

#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export)]
pub struct DocumentsTemplateForCreate {
    pub name: String,
    #[ts(optional)]
    pub description: Option<String>,
    // TODO: maybe add default value for data field like one __body element
    pub data: String,
}

impl From<DocumentsTemplateForCreate> for Value {
    fn from(val: DocumentsTemplateForCreate) -> Self {
        let mut data = vmap!("name".into() => val.name.into(), "data".into() => val.data.into());

        if let Some(description) = val.description {
            data.insert("description".into(), description.into());
        }

        Value::Object(data.into())
    }
}

impl Creatable for DocumentsTemplateForCreate {}

#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export)]
pub struct DocumentsTemplateForUpdate {
    pub name: Option<String>,
    pub description: Option<String>,
    // TODO: maybe add default value for data field like one __body element
    pub data: Option<String>,
}

impl From<DocumentsTemplateForUpdate> for Value {
    fn from(val: DocumentsTemplateForUpdate) -> Self {
        let mut data = vmap!();

        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }

        if let Some(description) = val.description {
            data.insert("description".into(), description.into());
        }

        if let Some(t_data) = val.data {
            data.insert("data".into(), t_data.into());
        }

        Value::Object(data.into())
    }
}

impl Patchable for DocumentsTemplateForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct DocumentsTemplateFilter {
    pub id: Option<OpValsString>,
    pub ctime: Option<OpValsString>,
    pub name: Option<OpValsString>,
    pub description: Option<OpValsString>,
}

impl Filterable for DocumentsTemplateFilter {}

pub struct DocumentsTemplateBmc;

impl Bmc for DocumentsTemplateBmc {
    const ENTITY: &'static str = "documentsTemplate";
}

impl DocumentsTemplateBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<DocumentsTemplate> {
        bmc_get(ctx, Self::ENTITY, id).await
    }

    pub async fn create(
        ctx: Arc<Ctx>,
        data: DocumentsTemplateForCreate,
    ) -> Result<DocumentsTemplate> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: DocumentsTemplateForUpdate,
    ) -> Result<DocumentsTemplate> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<DocumentsTemplate> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(
        ctx: Arc<Ctx>,
        filters: Option<Vec<DocumentsTemplateFilter>>,
        list_options: Option<ListOptions>,
    ) -> Result<Vec<DocumentsTemplate>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list(ctx, Self::ENTITY, filters, list_options).await
    }
}
