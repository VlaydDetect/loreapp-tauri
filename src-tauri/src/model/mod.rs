//! model module and sub-modules contain all of the model types and
//! backend model controllers for the application.
//!
//! The application code call the model controllers, and the
//! model controller calls the store and fire model events as appropriate.
//!

use ctx::Ctx;
use crate::event::HubEvent;
use serde::Serialize;
use surrealdb::sql::Object;
use store::SurrealStore;
use ts_rs::TS;

mod bmc_base;
mod model_store;
mod document;
mod picture;
mod seed_for_dev;
mod store;
pub mod ctx;
mod error;
mod tags_and_categories;

// --- Re-exports
pub use error::{Error, Result};
pub use model_store::*;
pub use document::*;
pub use picture::*;
// For dev only
pub use seed_for_dev::seed_store_for_dev;

fn fire_model_event<D>(ctx: &Ctx, entity: &str, action: &str, data: D)
    where
        D: Serialize + Clone,
{
    ctx.emit_hub_event(HubEvent {
        hub: "Model".to_string(),
        topic: entity.to_string(),
        label: Some(action.to_string()),
        data: Some(data),
    });
}

/// For now, all mutation queries will return an {id} struct.
/// Note: Keep it light, and client can do a get if needed.
#[derive(TS, Serialize, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct ModelMutateResultData {
    pub id: String,
}

impl From<String> for ModelMutateResultData {
    fn from(id: String) -> Self {
        Self { id }
    }
}

impl TryFrom<Object> for ModelMutateResultData {
    type Error = Error;
    fn try_from(mut val: Object) -> std::result::Result<Self, Self::Error> {
        let id = val.x_take_val::<String>("id")?;

        Ok(Self { id })
    }
}

#[cfg(test)]
mod tests {
    use modql::filter::{FilterNodes, OpValString, OpValsString};

    #[derive(Debug, FilterNodes)]
    struct ProjectFilter {
        id: Option<OpValsString>,
    }

    #[test]
    fn test_simple() -> anyhow::Result<()> {
        let pf = ProjectFilter {
            id: Some(OpValString::Eq("hello".to_string()).into()),
        };
        println!("{pf:?}");
        Ok(())
    }
}

macro_rules! vmap {
    () => (
        ::std::collections::BTreeMap::<String, ::surrealdb::sql::Value>::new()
    );
    ($($k:expr => $v:expr),* $(,)?) => {{
		let mut m = ::std::collections::BTreeMap::<String, ::surrealdb::sql::Value>::new();
        $(m.insert($k, $v);)+
        m
    }};
}

pub(crate) use vmap;
use crate::model::store::x_take::XTake;
