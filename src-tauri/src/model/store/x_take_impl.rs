//! XTakeImpl implementations for the surrealdb Object types.
//!
//! Note: Implement the `XTakeImpl' trait on objects, will provide the
//!       `XTake` trait (by blanket implementation)with `.x_take(key)`
//!        and `.x_take_val(key)`.

use crate::prelude::*;
use super::x_take::XTakeImpl;
use crate::model::store::Result;
use surrealdb::sql::{Object};
use crate::utils::LabelValue;

impl XTakeImpl<String> for Object {
    fn x_take_impl(&mut self, k: &str) -> Result<Option<String>> {
        let v = self.remove(k).map(|v| W(v).try_into());
        match v {
            None => Ok(None),
            Some(Ok(val)) => Ok(Some(val)),
            Some(Err(ex)) => Err(ex),
        }
    }
}

impl XTakeImpl<Vec<String>> for Object {
    fn x_take_impl(&mut self, k: &str) -> Result<Option<Vec<String>>> {
        let v = self.remove(k).map(|v| W(v).try_into());
        match v {
            None => Ok(None),
            Some(Ok(val)) => Ok(Some(val)),
            Some(Err(ex)) => Err(ex),
        }
    }
}

impl XTakeImpl<i64> for Object {
    fn x_take_impl(&mut self, k: &str) -> Result<Option<i64>> {
        let v = self.remove(k).map(|v| W(v).try_into());
        match v {
            None => Ok(None),
            Some(Ok(val)) => Ok(Some(val)),
            Some(Err(ex)) => Err(ex),
        }
    }
}

impl XTakeImpl<bool> for Object {
    fn x_take_impl(&mut self, k: &str) -> Result<Option<bool>> {
        Ok(self.remove(k).map(|v| v.is_true()))
    }
}

impl XTakeImpl<Vec<LabelValue>> for Object {
    fn x_take_impl(&mut self, k: &str) -> Result<Option<Vec<LabelValue>>> {
        let v = self.remove(k).map(|v| W(v).try_into());
        match v {
            None => Ok(None),
            Some(Ok(val)) => Ok(Some(val)),
            Some(Err(ex)) => Err(ex),
        }
    }
}
