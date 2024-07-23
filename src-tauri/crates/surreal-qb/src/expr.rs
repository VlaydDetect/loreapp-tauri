//! SurrealQL expression for building blocks of SurrealQL statements
use crate::{func::*, query::*, types::*};

/// Helper to build a [`SimpleExpr`].
#[derive(Debug, Clone)]
pub struct Expr {
    pub(crate) left: SimpleExpr,
    pub(crate) right: Option<SimpleExpr>,
    pub(crate) uopr: Option<UnaryOper>,
    pub(crate) bopr: Option<BinaryOper>,
}

/// Represents a Simple Expression in SQL.
///
/// [`SimpleExpr`] is a node in the expression tree and can represent identifiers, function calls,
/// various operators and sub-queries.
#[derive(Debug, Clone, PartialEq)]
pub enum SimpleExpr {
    Column(String),
    Tuple(Vec<SimpleExpr>),
    Unary(UnaryOper, Box<SimpleExpr>),
    Binary(Box<SimpleExpr>, BinaryOper, Box<SimpleExpr>),
    FunctionCall(FunctionCall),
    SubQuery(Option<String>, Box<SubQueryStatement>),
    Value(Value),
    Values(Vec<Value>),
    Keyword(Keyword),
    Constant(Value),
}

pub(crate) mod private {
    use crate::{BinaryOper, SimpleExpr, UnaryOper};

    pub trait Expression: Sized {
        fn un_op(self, o: UnaryOper) -> SimpleExpr;

        fn bin_op<O, T>(self, op: O, right: T) -> SimpleExpr
            where
                O: Into<BinaryOper>,
                T: Into<SimpleExpr>;
    }
}

use private::Expression;

impl Expression for Expr {
    fn un_op(mut self, o: UnaryOper) -> SimpleExpr {
        self.uopr = Some(o);
        self.into()
    }

    fn bin_op<O, T>(mut self, op: O, right: T) -> SimpleExpr
        where
            O: Into<BinaryOper>,
            T: Into<SimpleExpr>,
    {
        self.bopr = Some(op.into());
        self.right = Some(right.into());
        self.into()
    }
}

impl Expr {
    fn new_with_left<T>(left: T) -> Self
        where T: Into<SimpleExpr>,
    {
        let left = left.into();
        Self {
            left,
            right: None,
            uopr: None,
            bopr: None,
        }
    }

    /// Express the target column without table prefix.
    pub fn col(n: String) -> Self {
        Self::new_with_left(n)
    }

    /// Wraps tuple of `SimpleExpr`, can be used for tuple comparison
    pub fn tuple<I>(n: I) -> Self
        where I: IntoIterator<Item = SimpleExpr>,
    {
        Expr::expr(SimpleExpr::Tuple(
            n.into_iter().collect::<Vec<SimpleExpr>>(),
        ))
    }

    /// Express a [`Value`], returning a [`Expr`].
    pub fn val<V>(v: V) -> Self
        where V: Into<Value>,
    {
        Self::new_with_left(v)
    }

    /// Wrap a [`SimpleExpr`] and perform some operation on it.
    pub fn expr<T>(expr: T) -> Self
        where T: Into<SimpleExpr>,
    {
        Self::new_with_left(expr)
    }

    /// Express a [`Value`], returning a [`SimpleExpr`].
    pub fn value<V>(v: V) -> SimpleExpr
        where V: Into<SimpleExpr>,
    {
        v.into()
    }

    /// Express an equal (`=`) expression.
    pub fn eq<V>(self, v: V) -> SimpleExpr
        where V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Equal, v)
    }

    /// Express a not equal (`<>`) expression.
    pub fn ne<V>(self, v: V) -> SimpleExpr
        where V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::NotEqual, v)
    }

    /// Express a equal expression between two table columns,
    /// you will mainly use this to relate identical value between two table columns.
    pub fn equals(self, col: String) -> SimpleExpr {
        self.binary(BinaryOper::Equal, col)
    }

    /// Express a not equal expression between two table columns,
    /// you will mainly use this to relate identical value between two table columns.
    pub fn not_equals(self, col: String) -> SimpleExpr {
        self.binary(BinaryOper::NotEqual, col)
    }

    /// Express a greater than (`>`) expression.
    pub fn gt<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::GreaterThan, v.into())
    }

    /// Express a greater than or equal (`>=`) expression.
    pub fn gte<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::GreaterThanOrEqual, v)
    }

    /// Express a less than (`<`) expression.
    pub fn lt<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::SmallerThan, v)
    }

    /// Express a less than or equal (`<=`) expression.
    pub fn lte<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::SmallerThanOrEqual, v)
    }

    /// Express an arithmetic addition operation.
    pub fn add<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Add, v)
    }

    /// Express an arithmetic subtraction operation.
    pub fn sub<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Sub, v)
    }

    /// Express an arithmetic multiplication operation.
    pub fn mul<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Mul, v)
    }

    /// Express an arithmetic division operation.
    pub fn div<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Div, v)
    }

    /// Express an arithmetic modulo operation.
    pub fn modulo<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Mod, v)
    }

    // TODO
    /// Express a `IS NULL` expression.
    pub fn is_null(self) -> SimpleExpr {
        self.binary(BinaryOper::Is, Keyword::Null)
    }

    /// Express a `IS` expression.
    pub fn is<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Is, v)
    }

    /// Express a `IS NOT NULL` expression.
    pub fn is_not_null(self) -> SimpleExpr {
        self.binary(BinaryOper::IsNot, Keyword::Null)
    }

    /// Express a `IS NOT` expression.
    pub fn is_not<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::IsNot, v)
    }

    /// Create any binary operation
    pub fn binary<O, T>(self, op: O, right: T) -> SimpleExpr
        where
            O: Into<BinaryOper>,
            T: Into<SimpleExpr>,
    {
        self.bin_op(op, right)
    }

    /// Negates an expression with `NOT`.
    pub fn not(self) -> SimpleExpr {
        self.un_op(UnaryOper::Not)
    }

    /// Express a `MAX` function.
    pub fn max(self) -> SimpleExpr {
        Func::max(self.left).into()
    }

    /// Express a `MIN` function.
    pub fn min(self) -> SimpleExpr {
        Func::min(self.left).into()
    }

    /// Express a `SUM` function.
    pub fn sum(self) -> SimpleExpr {
        Func::sum(self.left).into()
    }

    /// Express a `COUNT` function.
    pub fn count(self) -> SimpleExpr {
        Func::count(self.left).into()
    }

    /// Express a `IF NULL` function.
    pub fn if_null<V>(self, v: V) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
    {
        Func::if_null(self.left, v).into()
    }

    /// Express a `IN` expression.
    pub fn is_in<V, I>(mut self, v: I) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
            I: IntoIterator<Item = V>,
    {
        self.bopr = Some(BinaryOper::In);
        self.right = Some(SimpleExpr::Tuple(v.into_iter().map(|v| v.into()).collect()));
        self.into()
    }

    /// Express a `IN` sub expression.
    pub fn in_tuples<V, I>(mut self, v: I) -> SimpleExpr
        where
            V: IntoValueTuple,
            I: IntoIterator<Item = V>,
    {
        self.bopr = Some(BinaryOper::In);
        self.right = Some(SimpleExpr::Tuple(
            v.into_iter()
                .map(|m| SimpleExpr::Values(m.into_value_tuple().into_iter().collect()))
                .collect(),
        ));
        self.into()
    }

    /// Express a `NOT IN` expression.
    pub fn is_not_in<V, I>(mut self, v: I) -> SimpleExpr
        where
            V: Into<SimpleExpr>,
            I: IntoIterator<Item = V>,
    {
        self.bopr = Some(BinaryOper::NotIn);
        self.right = Some(SimpleExpr::Tuple(v.into_iter().map(|v| v.into()).collect()));
        self.into()
    }

    /// Express a `IN` sub-query expression.
    pub fn in_subquery(mut self, sel: SelectStatement) -> SimpleExpr {
        self.bopr = Some(BinaryOper::In);
        self.right = Some(SimpleExpr::SubQuery(
            None,
            Box::new(sel.into_sub_query_statement()),
        ));
        self.into()
    }

    /// Express a `NOT IN` sub-query expression.
    pub fn not_in_subquery(mut self, sel: SelectStatement) -> SimpleExpr {
        self.bopr = Some(BinaryOper::NotIn);
        self.right = Some(SimpleExpr::SubQuery(
            None,
            Box::new(sel.into_sub_query_statement()),
        ));
        self.into()
    }

    /// Keyword `CURRENT_TIMESTAMP`.
    pub fn current_date() -> Expr {
        Expr::new_with_left(Keyword::CurrentDate)
    }

    /// Keyword `CURRENT_TIMESTAMP`.
    pub fn current_time() -> Expr {
        Expr::new_with_left(Keyword::CurrentTime)
    }
}

impl From<Expr> for SimpleExpr {
    /// Convert into SimpleExpr
    fn from(src: Expr) -> Self {
        if let Some(uopr) = src.uopr {
            SimpleExpr::Unary(uopr, Box::new(src.left))
        } else if let Some(bopr) = src.bopr {
            SimpleExpr::Binary(Box::new(src.left), bopr, Box::new(src.right.unwrap()))
        } else {
            src.left
        }
    }
}

impl<T> From<T> for SimpleExpr
    where T: Into<Value>,
{
    fn from(v: T) -> Self {
        SimpleExpr::Value(v.into())
    }
}
// TODO: to column
// impl From<String> for SimpleExpr {
//     fn from(c: String) -> Self {
//         SimpleExpr::Column(c)
//     }
// }

impl From<FunctionCall> for SimpleExpr {
    fn from(func: FunctionCall) -> Self {
        SimpleExpr::FunctionCall(func)
    }
}

impl From<Keyword> for SimpleExpr {
    fn from(k: Keyword) -> Self {
        SimpleExpr::Keyword(k)
    }
}

impl Expression for SimpleExpr {
    fn un_op(self, op: UnaryOper) -> SimpleExpr {
        SimpleExpr::Unary(op, Box::new(self))
    }

    fn bin_op<O, T>(self, op: O, right: T) -> SimpleExpr
        where
            O: Into<BinaryOper>,
            T: Into<SimpleExpr>,
    {
        SimpleExpr::Binary(Box::new(self), op.into(), Box::new(right.into()))
    }
}

impl SimpleExpr {
    /// Negates an expression with `NOT`.
    pub fn not(self) -> SimpleExpr {
        self.un_op(UnaryOper::Not)
    }

    /// Express a logical `AND` operation.
    pub fn and(self, right: SimpleExpr) -> Self {
        self.binary(BinaryOper::And, right)
    }

    /// Express a logical `OR` operation.
    pub fn or(self, right: SimpleExpr) -> Self {
        self.binary(BinaryOper::Or, right)
    }

    /// Express an equal (`=`) expression.
    pub fn eq<V>(self, v: V) -> SimpleExpr
        where V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Equal, v)
    }

    /// Express a not equal (`<>`) expression.
    pub fn ne<V>(self, v: V) -> SimpleExpr
        where V: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::NotEqual, v)
    }

    /// Perform addition with another [`SimpleExpr`].
    pub fn add<T>(self, right: T) -> Self
        where T: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Add, right)
    }

    /// Perform multiplication with another [`SimpleExpr`].
    pub fn mul<T>(self, right: T) -> Self
        where T: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Mul, right.into())
    }

    /// Perform division with another [`SimpleExpr`].
    pub fn div<T>(self, right: T) -> Self
        where T: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Div, right.into())
    }

    /// Perform subtraction with another [`SimpleExpr`].
    pub fn sub<T>(self, right: T) -> Self
        where T: Into<SimpleExpr>,
    {
        self.binary(BinaryOper::Sub, right)
    }

    /// Create any binary operation
    pub fn binary<O, T>(self, op: O, right: T) -> Self
        where
            O: Into<BinaryOper>,
            T: Into<SimpleExpr>,
    {
        self.bin_op(op, right)
    }

    pub(crate) fn is_binary(&self) -> bool {
        matches!(self, Self::Binary(_, _, _))
    }

    pub(crate) fn get_bin_oper(&self) -> Option<&BinaryOper> {
        match self {
            Self::Binary(_, oper, _) => Some(oper),
            _ => None,
        }
    }
}
