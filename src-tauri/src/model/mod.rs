//! model module and sub-modules contain all of the model types and
//! backend model controllers for the application.
//!
//! The application code call the model controllers, and the
//! model controller calls the store and fire model events as appropriate.
//!

use crate::event::HubEvent;
use ctx::Ctx;
use serde::Serialize;
use store::SurrealStore;
use surrealdb::sql::{Object, Value};
use ts_gen::TS;

mod bmc_base;
mod bmc_graph;
pub mod ctx;
mod document;
mod documents_folder;
mod documents_template;
mod error;
mod model_store;
mod picture;
mod seed_for_dev;
mod store;
mod tags_and_categories;

// --- Re-exports
pub use document::*;
pub use documents_folder::*;
pub use documents_template::*;
pub use error::{Error, Result};
pub use model_store::*;
pub use picture::*;
pub use tags_and_categories::*;
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

fn get_parent_id(mut val: Object) -> Option<String> {
    let mut parent: Option<String> = None;

    if let Some(parent_obj) = val.remove("parent") {
        if let Value::Array(surrealdb::sql::Array(parent_obj_vec)) = parent_obj {
            // eprintln!("Parents len: {} \n", parent_obj_vec.len());
            if let Some(parent_obj) = parent_obj_vec.iter().next() {
                if let Value::Thing(parent_obj) = parent_obj {
                    parent = Some(parent_obj.to_raw());
                }
            }
        }
    }

    parent
}

/// For now, all mutation queries will return an {id} struct.
/// Note: Keep it light, and client can do a get if needed.
#[derive(TS, Serialize, Clone)]
#[ts(export)]
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
    use surreal_qb::filter::{FilterNodes, OpValString, OpValsString};

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

use crate::model::store::x_take::XTake;
pub(crate) use vmap;
