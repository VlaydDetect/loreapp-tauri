//! Query statements (select, insert, update & delete).
//!
//! # Usage
//!
//! - Query Select, see [`SelectStatement`]
//! - Query Insert, see [`InsertStatement`]
//! - Query Update, see [`UpdateStatement`]
//! - Query Delete, see [`DeleteStatement`]

mod condition;
mod delete;
mod insert;
mod on_duplicate;
mod ordered;
mod returning;
mod select;
mod traits;
mod update;

pub use condition::*;
pub use delete::*;
pub use insert::*;
pub use on_duplicate::*;
pub use ordered::*;
pub use returning::*;
pub use select::*;
pub use traits::*;
pub use update::*;

/// Shorthand for constructing any table query
#[derive(Debug, Clone)]
pub struct Query;

#[derive(Debug, Clone)]
pub enum QueryStatement {
    Select(SelectStatement),
    Insert(InsertStatement),
    Update(UpdateStatement),
    Delete(DeleteStatement),
}

#[derive(Debug, Clone, PartialEq)]
pub enum SubQueryStatement {
    SelectStatement(SelectStatement),
    InsertStatement(InsertStatement),
    UpdateStatement(UpdateStatement),
    DeleteStatement(DeleteStatement),
}

impl Query {
    /// Construct table [`SelectStatement`]
    pub fn select() -> SelectStatement {
        SelectStatement::new()
    }

    /// Construct table [`InsertStatement`]
    pub fn insert() -> InsertStatement {
        InsertStatement::new()
    }

    /// Construct table [`UpdateStatement`]
    pub fn update() -> UpdateStatement {
        UpdateStatement::new()
    }

    /// Construct table [`DeleteStatement`]
    pub fn delete() -> DeleteStatement {
        DeleteStatement::new()
    }

    /// Construct [`Returning`]
    pub fn returning() -> Returning {
        Returning::new()
    }
}
