//! model module and sub-modules contain all of the model types and
//! backend model controllers for the application.
//!
//! The application code call the model controllers, and the
//! model controller calls the store and fire model events as appropriate.
//!

use crate::ctx::Ctx;
use crate::event::HubEvent;
use serde::Serialize;
use store::SurrealStore;
use ts_rs::TS;

mod bmc_base;
mod model_store;
mod document;
mod picture;
mod seed_for_dev;
mod store;
mod collect_db_items;

// --- Re-exports
pub use model_store::*;
pub use document::*;
pub use picture::*;
// For dev only
pub use seed_for_dev::seed_store_for_dev;
pub use collect_db_items::*;

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
