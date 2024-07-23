//! Event layer of the backend.
//!
//! Right now, very simple, just a HubEvent data type.
//!

use serde::{Deserialize, Serialize};
use ts_gen::TS;

#[derive(Serialize, TS, Clone)]
#[ts(export)]
pub struct HubEvent<D: Serialize + Clone> {
    pub hub: String,
    pub topic: String,
    pub label: Option<String>,
    pub data: Option<D>,
}
