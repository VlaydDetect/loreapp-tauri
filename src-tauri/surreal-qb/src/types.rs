//! Base types used throughout sea-query.

use crate::{expr::*, query::*, FunctionCall};
pub use std::sync::Arc;
use surrealdb::sql::Value as SurrealValue;
use serde_json::Value as Json;

pub trait ValueType: Sized {
    fn try_from(v: Value) -> Result<Self, ValueTypeErr>;

    fn unwrap(v: Value) -> Self {
        Self::try_from(v).unwrap()
    }

    fn expect(v: Value, msg: &str) -> Self {
        Self::try_from(v).expect(msg)
    }

    fn type_name() -> String;
}

#[derive(Debug)]
pub struct ValueTypeErr;

impl std::error::Error for ValueTypeErr {}

impl std::fmt::Display for ValueTypeErr {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Value type mismatch")
    }
}

#[derive(Clone, Debug, derivative::Derivative)]
#[derivative(Hash, PartialEq, Eq)]
pub struct Value(pub SurrealValue);

#[derive(Clone, Debug, PartialEq)]
pub struct Values(pub Vec<Value>);

impl Value {
    pub fn unwrap<T>(self) -> T
        where
            T: ValueType,
    {
        T::unwrap(self)
    }

    pub fn expect<T>(self, msg: &str) -> T
        where
            T: ValueType,
    {
        T::expect(self, msg)
    }
}

impl Values {
    pub fn iter(&self) -> impl Iterator<Item = &Value> {
        self.0.iter()
    }
}

impl IntoIterator for Values {
    type Item = Value;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

macro_rules! type_to_value {
    ( $type: ty ) => {
        impl From<$type> for Value {
            fn from(x: $type) -> Value {
                Value(x.into())
            }
        }

        impl ValueType for $type {
            fn try_from(v: Value) -> Result<Self, ValueTypeErr> {
                if let Value(x) = v {
                    x.try_into().map_err(|_| ValueTypeErr)
                } else {
                    Err(ValueTypeErr)
                }
            }

            fn type_name() -> String {
                stringify!($type).to_owned()
            }
        }
    };
}

type_to_value!(bool);
type_to_value!(i8);
type_to_value!(i16);
type_to_value!(i32);
type_to_value!(i64);
type_to_value!(u8);
type_to_value!(u16);
type_to_value!(u32);
type_to_value!(u64);
type_to_value!(f32);
type_to_value!(f64);
type_to_value!(Vec<u8>);
type_to_value!(String);
// type_to_value!(Json);

impl From<&[u8]> for Value {
    fn from(x: &[u8]) -> Value {
        Value(SurrealValue::Bytes(x.to_vec().into()))
    }
}

// impl<T> From<T> for Value
//     where T: Into<String>
// {
//     fn from(value: T) -> Self {
//         Value(SurrealValue::Strand(value.into()))
//     }
// }

impl From<&str> for Value {
    fn from(x: &str) -> Value {
        let string: String = x.into();
        Value(SurrealValue::Strand(string.into()))
    }
}

impl From<&String> for Value {
    fn from(x: &String) -> Value {
        let string: String = x.into();
        Value(SurrealValue::Strand(string.into()))
    }
}

#[derive(Clone, Debug, PartialEq, Hash, Eq)]
pub enum ValueTuple {
    One(Value),
    Two(Value, Value),
    Three(Value, Value, Value),
    Many(Vec<Value>),
}

pub trait IntoValueTuple {
    fn into_value_tuple(self) -> ValueTuple;
}

impl IntoIterator for ValueTuple {
    type Item = Value;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            ValueTuple::One(v) => vec![v].into_iter(),
            ValueTuple::Two(v, w) => vec![v, w].into_iter(),
            ValueTuple::Three(u, v, w) => vec![u, v, w].into_iter(),
            ValueTuple::Many(vec) => vec.into_iter(),
        }
    }
}

impl IntoValueTuple for ValueTuple {
    fn into_value_tuple(self) -> ValueTuple {
        self
    }
}

pub trait FromValueTuple: Sized {
    fn from_value_tuple<I>(i: I) -> Self
        where I: IntoValueTuple;
}

impl<V> IntoValueTuple for V
    where
        V: Into<Value>,
{
    fn into_value_tuple(self) -> ValueTuple {
        ValueTuple::One(self.into())
    }
}

impl<V, W> IntoValueTuple for (V, W)
    where
        V: Into<Value>,
        W: Into<Value>,
{
    fn into_value_tuple(self) -> ValueTuple {
        ValueTuple::Two(self.0.into(), self.1.into())
    }
}

impl<U, V, W> IntoValueTuple for (U, V, W)
    where
        U: Into<Value>,
        V: Into<Value>,
        W: Into<Value>,
{
    fn into_value_tuple(self) -> ValueTuple {
        ValueTuple::Three(self.0.into(), self.1.into(), self.2.into())
    }
}

macro_rules! impl_into_value_tuple {
    ( $($idx:tt : $T:ident),+ $(,)? ) => {
        impl< $($T),+ > IntoValueTuple for ( $($T),+ )
        where
            $($T: Into<Value>),+
        {
            fn into_value_tuple(self) -> ValueTuple {
                ValueTuple::Many(vec![
                    $(self.$idx.into()),+
                ])
            }
        }
    };
}

#[rustfmt::skip]
mod impl_into_value_tuple {
    use super::*;

    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6, 7:T7);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6, 7:T7, 8:T8);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6, 7:T7, 8:T8, 9:T9);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6, 7:T7, 8:T8, 9:T9, 10:T10);
    impl_into_value_tuple!(0:T0, 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6, 7:T7, 8:T8, 9:T9, 10:T10, 11:T11);
}

impl<V> FromValueTuple for V
    where
        V: Into<Value> + ValueType,
{
    fn from_value_tuple<I>(i: I) -> Self
        where
            I: IntoValueTuple,
    {
        match i.into_value_tuple() {
            ValueTuple::One(u) => u.unwrap(),
            _ => panic!("not ValueTuple::One"),
        }
    }
}

impl<V, W> FromValueTuple for (V, W)
    where
        V: Into<Value> + ValueType,
        W: Into<Value> + ValueType,
{
    fn from_value_tuple<I>(i: I) -> Self
        where
            I: IntoValueTuple,
    {
        match i.into_value_tuple() {
            ValueTuple::Two(v, w) => (v.unwrap(), w.unwrap()),
            _ => panic!("not ValueTuple::Two"),
        }
    }
}

impl<U, V, W> FromValueTuple for (U, V, W)
    where
        U: Into<Value> + ValueType,
        V: Into<Value> + ValueType,
        W: Into<Value> + ValueType,
{
    fn from_value_tuple<I>(i: I) -> Self
        where
            I: IntoValueTuple,
    {
        match i.into_value_tuple() {
            ValueTuple::Three(u, v, w) => (u.unwrap(), v.unwrap(), w.unwrap()),
            _ => panic!("not ValueTuple::Three"),
        }
    }
}

macro_rules! impl_from_value_tuple {
    ( $len:expr, $($T:ident),+ $(,)? ) => {
        impl< $($T),+ > FromValueTuple for ( $($T),+ )
        where
            $($T: Into<Value> + ValueType),+
        {
            fn from_value_tuple<Z>(i: Z) -> Self
            where
                Z: IntoValueTuple,
            {
                match i.into_value_tuple() {
                    ValueTuple::Many(vec) if vec.len() == $len => {
                        let mut iter = vec.into_iter();
                        (
                            $(<$T as ValueType>::unwrap(iter.next().unwrap())),+
                        )
                    }
                    _ => panic!("not ValueTuple::Many with length of {}", $len),
                }
            }
        }
    };
}

#[rustfmt::skip]
mod impl_from_value_tuple {
    use super::*;

    impl_from_value_tuple!( 4, T0, T1, T2, T3);
    impl_from_value_tuple!( 5, T0, T1, T2, T3, T4);
    impl_from_value_tuple!( 6, T0, T1, T2, T3, T4, T5);
    impl_from_value_tuple!( 7, T0, T1, T2, T3, T4, T5, T6);
    impl_from_value_tuple!( 8, T0, T1, T2, T3, T4, T5, T6, T7);
    impl_from_value_tuple!( 9, T0, T1, T2, T3, T4, T5, T6, T7, T8);
    impl_from_value_tuple!(10, T0, T1, T2, T3, T4, T5, T6, T7, T8, T9);
    impl_from_value_tuple!(11, T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10);
    impl_from_value_tuple!(12, T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11);
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Quote(pub(crate) u8, pub(crate) u8);

/// Table references
#[derive(Debug, Clone, PartialEq)]
pub enum TableRef {
    /// Table identifier without any schema / database prefix
    Table(String),
    /// Table identifier with alias
    TableAlias(String, String),
    /// Subquery with alias
    SubQuery(SelectStatement, String),
    /// Values list with alias
    ValuesList(Vec<ValueTuple>, String),
    /// Function call with alias
    FunctionCall(FunctionCall, String),
}

pub trait IntoTableRef {
    fn into_table_ref(self) -> TableRef;
}

impl IntoTableRef for TableRef {
    fn into_table_ref(self) -> TableRef {
        self
    }
}

impl<T: 'static> IntoTableRef for T
    where T: Into<String>,
{
    fn into_table_ref(self) -> TableRef {
        TableRef::Table(self.into())
    }
}

impl TableRef {
    /// Add or replace the current alias
    pub fn alias(self, alias: String) -> Self {
        match self {
            Self::Table(table) => Self::TableAlias(table, alias),
            Self::TableAlias(table, _) => Self::TableAlias(table, alias),
            Self::SubQuery(statement, _) => Self::SubQuery(statement, alias),
            Self::ValuesList(values, _) => Self::ValuesList(values, alias),
            Self::FunctionCall(func, _) => Self::FunctionCall(func, alias),
        }
    }
}

/// Unary operator
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum UnaryOper {
    Not,
}

/// Binary operator
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum BinaryOper {
    And,
    Or,
    Is,
    IsNot,
    In,
    NotIn,
    AllIn,
    AnyIn,
    NoneIn,
    Contains,
    NotContains,
    ContainsAll,
    ContainsAny,
    ContainsNone,
    Equal,
    NotEqual,
    EqualAny,
    EqualAll,
    SmallerThan,
    GreaterThan,
    SmallerThanOrEqual,
    GreaterThanOrEqual,
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    As,
    Custom(&'static str),
}

/// Logical chain operator
#[derive(Debug, Clone, PartialEq)]
pub enum LogicalChainOper {
    And(SimpleExpr),
    Or(SimpleExpr),
}

/// Ordering options
#[derive(Debug, Clone, PartialEq)]
pub enum Order {
    Asc,
    Desc,
    Field(Values),
}

/// Order expression
#[derive(Debug, Clone, PartialEq)]
pub struct OrderExpr {
    pub(crate) expr: SimpleExpr,
    pub(crate) order: Order,
}

/// Helper for create name alias
#[derive(Debug, Clone)]
pub struct Alias(String);

/// SQL Keywords
#[derive(Debug, Clone, PartialEq)]
pub enum Keyword {
    Null,
    CurrentDate,
    CurrentTime,
    CurrentTimestamp,
}

impl Quote {
    pub fn new(c: u8) -> Self {
        Self(c, c)
    }

    pub fn left(&self) -> char {
        char::try_from(self.0).unwrap()
    }

    pub fn right(&self) -> char {
        char::try_from(self.1).unwrap()
    }
}

impl From<char> for Quote {
    fn from(c: char) -> Self {
        (c as u8).into()
    }
}

impl From<(char, char)> for Quote {
    fn from((l, r): (char, char)) -> Self {
        (l as u8, r as u8).into()
    }
}

impl From<u8> for Quote {
    fn from(u8: u8) -> Self {
        Quote::new(u8)
    }
}

impl From<(u8, u8)> for Quote {
    fn from((l, r): (u8, u8)) -> Self {
        Quote(l, r)
    }
}

impl Alias {
    pub fn new<T>(n: T) -> Self
        where T: Into<String>,
    {
        Self(n.into())
    }
}
