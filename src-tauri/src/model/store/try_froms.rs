//! TryFrom implementations for store related types

use crate::prelude::*;
use crate::model::store::{Error, Result};
use surrealdb::sql::{Array, Object, Strand, Thing, Value};
use crate::utils::LabelValue;

impl TryFrom<W<Value>> for Object {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Object> {
        match val.0 {
            Value::Object(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Object")),
        }
    }
}

impl TryFrom<W<Value>> for Thing {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Thing> {
        match val.0 {
            Value::Thing(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Thing")),
        }
    }
}

impl TryFrom<W<Value>> for Strand {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Strand> {
        match val.0 {
            Value::Strand(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Strand")),
        }
    }
}

impl TryFrom<W<Value>> for Array {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<Array> {
        match val.0 {
            Value::Array(obj) => Ok(obj),
            _ => Err(Error::XValueNotOfType("Array")),
        }
    }
}

impl TryFrom<W<Value>> for i64 {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<i64> {
        match val.0 {
            Value::Number(obj) => Ok(obj.as_int()),
            _ => Err(Error::XValueNotOfType("i64")),
        }
    }
}

impl TryFrom<W<Value>> for bool {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<bool> {
        match val.0 {
            Value::Bool(b) => Ok(b),
            _ => Err(Error::XValueNotOfType("bool")),
        }
    }
}

impl TryFrom<W<Value>> for String {
    type Error = Error;
    fn try_from(val: W<Value>) -> Result<String> {
        match val.0 {
            Value::Strand(strand) => Ok(strand.as_string()),
            Value::Thing(thing) => Ok(thing.to_string()),
            _ => Err(Error::XValueNotOfType("String")),
        }
    }
}

impl TryFrom<W<Value>> for Vec<String> {
    type Error = Error;
    fn try_from(val: W<Value>) -> std::result::Result<Self, Self::Error> {
        match val.0 {
            Value::Array(Array(values)) => {
                values.into_iter().map(|v| W(v).try_into()).collect::<std::result::Result<Self, Self::Error>>()
            },
            _ => Err(Error::XValueNotOfType("Vec<String>")),
        }
    }
}

impl TryFrom<W<Value>> for Vec<LabelValue> {
    type Error = Error;
    fn try_from(val: W<Value>) -> std::result::Result<Self, Self::Error> {
        match val.0 {
            Value::Array(Array(values)) => {
                values.into_iter().map(|v| v.try_into()).collect::<std::result::Result<Self, Self::Error>>()
            },
            _ => Err(Error::XValueNotOfType("Vec<LabelValue>")),
        }
    }
}