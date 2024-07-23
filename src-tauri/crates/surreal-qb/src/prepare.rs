//! Helper for preparing SQL statements.

use std::collections::BTreeMap;
use crate::*;
pub use std::fmt::Write;
use surrealdb::sql::{Object, Value as SurrealValue};

pub trait SurrelaQLWriter: Write + ToString {
    fn push_param(&mut self, value: Value, query_builder: &dyn QueryBuilder);

    fn insert_param(&mut self, name: &str, value: Value);

    fn as_writer(&mut self) -> &mut dyn Write;
}

// TODO
impl SurrelaQLWriter for String {
    fn push_param(&mut self, value: Value, query_builder: &dyn QueryBuilder) {
        self.push_str(&query_builder.value_to_string(&value))
    }

    fn insert_param(&mut self, _name: &str, _value: Value) {
        unimplemented!("insert_param isn't implemented for String")
    }

    fn as_writer(&mut self) -> &mut dyn Write {
        self as _
    }
}

#[derive(Debug, Clone)]
pub struct SurrelaQLWriterValues {
    counter: usize,
    placeholder: String,
    numbered: bool,
    string: String,
    values: BTreeMap<String, Value>,
}

impl SurrelaQLWriterValues {
    pub fn new<T>(placeholder: T, numbered: bool) -> Self
        where
            T: Into<String>,
    {
        Self {
            counter: 0,
            placeholder: placeholder.into(),
            numbered,
            string: String::with_capacity(256),
            values: BTreeMap::new(),
        }
    }

    pub fn into_object(self) -> (String, Object) {
        let vals: BTreeMap<String, SurrealValue> = self.values.into_iter().map(|(s, v)| (s, v.0)).collect();
        (self.string, vals.into())
    }
}

impl Write for SurrelaQLWriterValues {
    fn write_str(&mut self, s: &str) -> std::fmt::Result {
        write!(self.string, "{s}")
    }
}

impl ToString for SurrelaQLWriterValues {
    fn to_string(&self) -> String {
        self.string.clone()
    }
}

impl SurrelaQLWriter for SurrelaQLWriterValues {
    fn push_param(&mut self, value: Value, _: &dyn QueryBuilder) {
        self.counter += 1;

        let mut var = String::with_capacity(256);

        if self.numbered {
            let counter = self.counter;
            var.push_str(format!("w{}", counter).as_str());
            write!(self.string, "{}{}", self.placeholder, var).unwrap();
        } else {
            var.push_str("w");
            write!(self.string, "{}{}", self.placeholder, var).unwrap();
        }
        self.values.insert(var, value);
    }

    fn insert_param(&mut self, name: &str, value: Value) {
        self.values.insert(name.into(), value);
    }

    fn as_writer(&mut self) -> &mut dyn Write {
        self as _
    }
}
