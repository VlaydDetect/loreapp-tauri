//! For calling built-in SQL functions.

use crate::{expr::*};

/// Functions
#[derive(Debug, Clone, PartialEq)]
pub enum Function {
    Max,
    Min,
    Sum,
    Avg,
    Abs,
    Count,
    IfNull,
    CharLength,
    // TODO: move to the specific function enum
    StartsWith,
    EndsWith,
    Len,
    //
    Cast,
    Coalesce,
    Lower,
    Upper,
    BitAnd,
    BitOr,
    Random,
    Round,
}

/// Function call.
#[derive(Debug, Clone, PartialEq)]
pub struct FunctionCall {
    pub(crate) func: Function,
    pub(crate) args: Vec<SimpleExpr>,
}

impl FunctionCall {
    pub(crate) fn new(func: Function) -> Self {
        Self {
            func,
            args: Vec::new(),
        }
    }

    /// Append an argument to the function call
    pub fn arg<T>(mut self, arg: T) -> Self
        where
            T: Into<SimpleExpr>,
    {
        self.args.push(arg.into());
        self
    }

    /// Replace the arguments of the function call
    pub fn args<I>(mut self, args: I) -> Self
        where
            I: IntoIterator<Item = SimpleExpr>,
    {
        self.args = args.into_iter().collect();
        self
    }

    pub fn get_func(&self) -> &Function {
        &self.func
    }

    pub fn get_args(&self) -> &[SimpleExpr] {
        &self.args
    }
}

/// Function call helper.
#[derive(Debug, Clone)]
pub struct Func;

impl Func {
    /// Call `MAX` function.
    pub fn max<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Max).arg(expr)
    }

    /// Call `MIN` function.
    pub fn min<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Min).arg(expr)
    }

    /// Call `SUM` function.
    pub fn sum<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Sum).arg(expr)
    }

    /// Call `AVG` function.
    pub fn avg<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Avg).arg(expr)
    }

    /// Call `ABS` function.
    pub fn abs<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Abs).arg(expr)
    }

    /// Call `COUNT` function.
    pub fn count<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Count).arg(expr)
    }

    /// Call `CHAR_LENGTH` function.
    pub fn char_length<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::CharLength).arg(expr)
    }

    /// Call `STARTS_WITH` function.
    pub fn starts_with<A, B>(a: A, b: B) -> FunctionCall
        where A: Into<SimpleExpr>,
              B: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::StartsWith).args([a.into(), b.into()])
    }

    /// Call `ENDS_WITH` function.
    pub fn ends_with<A, B>(a: A, b: B) -> FunctionCall
        where A: Into<SimpleExpr>,
              B: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::EndsWith).args([a.into(), b.into()])
    }

    /// Call `LEN` function.
    pub fn len<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Len).arg(expr)
    }

    /// Call `IF NULL` function.
    pub fn if_null<A, B>(a: A, b: B) -> FunctionCall
        where
            A: Into<SimpleExpr>,
            B: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::IfNull).args([a.into(), b.into()])
    }

    /// Call `COALESCE` function.
    pub fn coalesce<I>(args: I) -> FunctionCall
        where I: IntoIterator<Item = SimpleExpr>,
    {
        FunctionCall::new(Function::Coalesce).args(args)
    }

    /// Call `LOWER` function.
    pub fn lower<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Lower).arg(expr)
    }

    /// Call `UPPER` function.
    pub fn upper<T>(expr: T) -> FunctionCall
        where T: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Upper).arg(expr)
    }

    /// Call `ROUND` function.
    pub fn round<A>(expr: A) -> FunctionCall
        where A: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Round).arg(expr)
    }

    /// Call `ROUND` function with the precision.
    pub fn round_with_precision<A, B>(a: A, b: B) -> FunctionCall
        where
            A: Into<SimpleExpr>,
            B: Into<SimpleExpr>,
    {
        FunctionCall::new(Function::Round).args([a.into(), b.into()])
    }

    /// Call `RANDOM` function.
    pub fn random() -> FunctionCall {
        FunctionCall::new(Function::Random)
    }
}
