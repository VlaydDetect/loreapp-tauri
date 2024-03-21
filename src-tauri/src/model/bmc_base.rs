//! Base and low level Backend Model Controller functions
//!

use std::fmt::Debug;
use super::store::{Creatable, Filterable, Patchable};
use super::{fire_model_event};
use crate::model::ctx::Ctx;
use crate::model::{Error, Result};
use std::sync::Arc;
use surreal_qb::filter::{FilterGroups, ListOptions};
use serde::de::DeserializeOwned;
use serde::Serialize;
use surrealdb::sql::Object;

/// Backend Model Controller
pub(super) trait Bmc {
    const ENTITY: &'static str;
}

pub(super) async fn bmc_get<E>(ctx: Arc<Ctx>, _entity: &'static str, id: &str) -> Result<E>
    where
        E: TryFrom<Object, Error = Error> + Sync + Send + DeserializeOwned + Serialize,
{
    ctx.get_model_manager().store().exec_get(id).await?.try_into()
}

pub(super) async fn bmc_create<E, D>(ctx: Arc<Ctx>, entity: &'static str, data: D) -> Result<E>
    where
        D: Creatable + Sync + Send + DeserializeOwned + Serialize,
        E: TryFrom<Object, Error = Error> + Sync + Send + DeserializeOwned + Serialize,
{
    let ress = ctx.get_model_manager().store().exec_create(entity, data).await?;
    fire_model_event(&ctx, entity, "create", ress.clone());

    ress.try_into()
}

pub(super) async fn bmc_update<E, D>(ctx: Arc<Ctx>, entity: &'static str, id: &str, data: D) -> Result<E>
    where
        D: Patchable + Sync + Send + DeserializeOwned + Serialize,
        E: TryFrom<Object, Error = Error> + Sync + Send + DeserializeOwned + Serialize,
{
    let ress = ctx.get_model_manager().store().exec_merge(id, data).await?;

    fire_model_event(&ctx, entity, "update", ress.clone());

    ress.try_into()
}

pub(super) async fn bmc_delete<E>(ctx: Arc<Ctx>, entity: &'static str, id: &str) -> Result<E>
    where
        E: TryFrom<Object, Error = Error> + Sync + Send + DeserializeOwned + Serialize,
{
    let ress = ctx.get_model_manager().store().exec_delete(id).await?;

    fire_model_event(&ctx, entity, "delete", ress.clone());

    ress.try_into()
}

pub(super) async fn bmc_list<E, F>(ctx: Arc<Ctx>, entity: &'static str, filter: Option<F>, opts: ListOptions) -> Result<Vec<E>>
    where
        E: TryFrom<Object, Error = Error>,
        F: Into<FilterGroups> + Debug,
{
    let objects = ctx.get_model_manager().store().exec_select(entity, filter, opts).await?;

    objects.into_iter().map(|o| o.try_into()).collect::<Result<_>>()
}

pub(super) async fn bmc_custom_solo_query<E>(ctx: Arc<Ctx>, _entity: &'static str, sql: &str, vars: Option<Object>) -> Result<Vec<E>>
    where E: TryFrom<Object, Error = Error>,
{
    let objects = ctx.get_model_manager().store().exec_custom_solo_query(sql, vars).await?;

    objects.into_iter().map(|o| o.try_into()).collect::<Result<_>>()
}

pub(super) async fn bmc_custom_multi_query<E>(ctx: Arc<Ctx>, _entity: &'static str, sqls: &str, vars: Option<Object>) -> Result<Vec<E>>
    where E: TryFrom<Object, Error = Error>,
{
    let to_take = surreal_qb::analyze_query(sqls).map_err(|ex| Error::QB(ex.into()))?;

    let objects = ctx.get_model_manager().store().exec_custom_multi_query(sqls, vars, to_take).await?;

    objects.into_iter().map(|o| o.try_into()).collect::<Result<_>>()
}
