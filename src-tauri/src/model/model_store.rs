//! ModelStore is just a Store wrapper so that Store does not have to be exposed outside the model module tree.
//!
//! This pattern allows to:
//!   1) Expose only the "new" to outside the model module tree.
//!   2) Access to the underlying store is allowed only for the model module tree.
//!
//! Design:
//! - The Model layer normalizes the application's data type
//!   structures and access.
//! - App application code data access must go through the Model layer.
//! - The `ModelManager` holds the internal states/resources
//!   needed by ModelControllers to access data. (e.g. db)
//! - Model Controllers (e.g `PictureBmc`, `DocumentBmc`) implement
//!   CRUD and other data access methods on a given "entity" (e.g. `Picture`, `Document`)
//!   (`Bmc` is short for Backend Model Controller)
//! - In Tauri Framework, `ModelManager` are typically used as App State.
//! - ModelManager are designed to be passed as an argument to
//!   all Model Controllers functions.

use std::sync::Arc;
use super::SurrealStore;
use crate::model::Result;

pub struct ModelStore(SurrealStore);
pub type ModelStoreState = Arc<ModelStore>;

impl ModelStore {
    /// Create a new ModelStore instance and its corresponding SurrealStore
    pub async fn new() -> Result<ModelStoreState> {
        Ok(Arc::new(ModelStore(SurrealStore::new().await?)))
    }

    pub(in crate::model) fn store(&self) -> &SurrealStore {
        &self.0
    }
}