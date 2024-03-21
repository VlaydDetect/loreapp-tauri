use std::sync::Arc;
use serde::de::DeserializeOwned;
use serde::Serialize;
use surrealdb::sql::Object;
use crate::model::{Error, Result, ctx::Ctx};

pub(super) trait GraphBmc {
    const RELATION_ENTITY: &'static str;
}

pub(super) async fn bmc_list_tree<E>(ctx: Arc<Ctx>, entity: &'static str) -> Result<Vec<E>>
    where
        E: TryFrom<Object, Error = Error>,
{
    let objects = ctx.get_model_manager().store().exec_select_tree(entity).await?;

    objects.into_iter().map(|o| o.try_into()).collect::<Result<_>>()
}

pub(super) async fn bmc_relate<E>(ctx: Arc<Ctx>, entity: &'static str, from_id: &str, to_id: &str) -> Result<E>
    where
        E: TryFrom<Object, Error=Error> + Sync + Send + DeserializeOwned + Serialize
{
    ctx.get_model_manager().store().exec_add_edge(from_id, entity, to_id).await?.try_into()
}

pub(super) async fn bmc_delete_edge<E>(ctx: Arc<Ctx>, entity: &'static str, from_id: &str, to_id: &str) -> Result<E>
    where
        E: TryFrom<Object, Error=Error> + Sync + Send + DeserializeOwned + Serialize
{
    ctx.get_model_manager().store().exec_delete_edge(from_id, entity, to_id).await?.try_into()
}

pub(super) async fn bmc_rerelate_edge<E>(ctx: Arc<Ctx>, entity: &'static str, id: &str, from_id: Option<&str>, to_id: Option<&str>) -> Result<E>
    where
        E: TryFrom<Object, Error=Error> + Sync + Send + DeserializeOwned + Serialize
{
    ctx.get_model_manager().store().exec_recreate_edge(id, entity, from_id, to_id).await?.try_into()
}