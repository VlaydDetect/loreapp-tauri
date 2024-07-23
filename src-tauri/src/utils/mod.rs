//! Application wide utilities. Most will be re-exported.
//!

mod diff;

use serde::{Deserialize, Serialize};
use serde_diff::SerdeDiff;
use ts_gen::TS;

pub use self::diff::*;

/**
* This type was created mainly for cases like react-select, where such objects are used in the selector.
* The `label` field contains the same content as the `value` field, but formatted
**/
#[derive(Debug, TS, Serialize, Deserialize, Clone, PartialEq, SerdeDiff, Default)]
#[ts(export)]
pub struct LabelValue {
    pub label: String,
    pub value: String,
}
