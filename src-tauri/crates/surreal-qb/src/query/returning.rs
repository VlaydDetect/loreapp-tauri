use crate::SimpleExpr;

/// RETURNING clause.
#[derive(Clone, Debug, PartialEq)]
pub enum ReturningClause {
    All,
    Columns(Vec<String>),
    Exprs(Vec<SimpleExpr>),
}

/// Shorthand for constructing [`ReturningClause`]
#[derive(Clone, Debug, Default)]
pub struct Returning;

impl Returning {
    /// Constructs a new [`Returning`].
    pub fn new() -> Self {
        Self
    }

    /// Constructs a new [`ReturningClause::All`].
    pub fn all(&self) -> ReturningClause {
        ReturningClause::All
    }

    /// Constructs a new [`ReturningClause::Columns`].
    pub fn column<C>(&self, col: String) -> ReturningClause  {
        ReturningClause::Columns(vec![col])
    }

    /// Constructs a new [`ReturningClause::Columns`].
    pub fn columns<I>(self, cols: I) -> ReturningClause
        where I: IntoIterator<Item = String>,
    {
        let cols: Vec<String> = cols.into_iter().map(|c| c).collect();
        ReturningClause::Columns(cols)
    }

    /// Constructs a new [`ReturningClause::Exprs`].
    pub fn expr<T>(&self, expr: T) -> ReturningClause
        where T: Into<SimpleExpr>,
    {
        ReturningClause::Exprs(vec![expr.into()])
    }

    /// Constructs a new [`ReturningClause::Exprs`].
    pub fn exprs<T, I>(self, exprs: I) -> ReturningClause
        where
            T: Into<SimpleExpr>,
            I: IntoIterator<Item = T>,
    {
        ReturningClause::Exprs(exprs.into_iter().map(Into::into).collect())
    }
}
