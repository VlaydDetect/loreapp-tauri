use std::collections::BTreeMap;
use surreal_qb::filter::{FilterGroups, IntoFilterNodes};
use surrealdb::sql::{Object, Value};
use crate::utils::LabelValue;

mod surrealql;
mod surreal_store;
mod try_froms;
mod x_take_impl;
mod error;
pub(super) mod x_take;
// --- Re-export
pub use error::{Error, Result};
pub(super) use surreal_store::SurrealStore;
use crate::prelude::W;

// --- Marker traits for types that can be used for query.
pub trait Creatable: Into<Value> {}
pub trait Patchable: Into<Value> {}
pub trait Filterable: Into<FilterGroups> {}


impl From<LabelValue> for Value {
    fn from(value: LabelValue) -> Self {
        let mut obj: BTreeMap<String, Value> = BTreeMap::new();
        obj.insert("label".into(), value.label.into());
        obj.insert("value".into(), value.value.into());
        Value::Object(obj.into())
    }
}

impl TryFrom<Value> for LabelValue {
    type Error = Error;
    fn try_from(value: Value) -> Result<LabelValue> {
        if let Value::Object(mut obj) = value.clone() {
            let mut l: Option<core::result::Result<String, _>> = obj.remove("label").map(|l| W(l).try_into());
            let mut v: Option<core::result::Result<String, _>> = obj.remove("value").map(|l| W(l).try_into());

            let mut lv = LabelValue::default();

            if let Some(Ok(l)) = l {
                lv.label = l;
            } else {
                return Err(Error::Surreal(surrealdb::Error::Api(surrealdb::error::Api::FromValue {
                    value: value.clone(),
                    error: "Failed try_from LabelValue from Value: object don't contains label".to_string()
                })));
            }

            if let Some(Ok(v)) = v {
                lv.value = v;
            } else {
                return Err(Error::Surreal(surrealdb::Error::Api(surrealdb::error::Api::FromValue {
                    value: value.clone(),
                    error: "Failed try_from LabelValue from Value: object don't contains value".to_string()
                })));
            }

            Ok(lv)
        } else {
            Err(Error::Surreal(surrealdb::Error::Api(surrealdb::error::Api::FromValue {
                value: value.clone(),
                error: "Failed try_from LabelValue from Value: value is not Object".to_string()
            })))
        }
    }
}

pub fn vec_to_surreal_value<T: Into<Value>>(vec: Vec<T>) -> Value {
    let vec: Vec<Value> = vec.into_iter().map(|lv| lv.into()).collect();
    Value::Array(vec.into())
}
