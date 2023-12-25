use serde::Serialize;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    FailToCreateDb(String),
    // #[error("{0}")]
    // FailToExecuteQuery(String),
    #[error("{0}")]
    UnresolvableResponse(&'static str),
    #[error("{0}")]
    Surreal(#[from] surrealdb::Error),

    #[error("{0}")]
    XValueNotOfType(&'static str),
    #[error("{0}")]
    XPropertyNotFound(String),
}

impl From<surrealdb::error::Db> for Error {
    fn from(value: surrealdb::error::Db) -> Self {
        Error::Surreal(surrealdb::Error::from(value))
    }
}