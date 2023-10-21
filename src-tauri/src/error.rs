//! This is the main (and only for now) application Error type.
//! It's using 'thiserror' as it reduces boilerplate error code while providing rich error typing.
//!
//! Notes:
//!     - The strategy is to start with one Error type for the whole application and then seggregate as needed.
//!     - Since everything is typed from the start, renaming and refactoring become relatively trivial.
//!     - By best practices, `anyhow` is not used in application code, but can be used in unit or integration test (will be in dev_dependencies when used)
//!

use serde::{Serialize, Serializer};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("")]
    CtxFail,
    #[error("{0}")]
    XValueNotOfType(&'static str),
    #[error("{0}")]
    XPropertyNotFound(String),
    #[error("{0}")]
    StoreFailToCreate(String),
    #[error("{0}")]
    Modql(#[from] modql::Error),
    #[error("{0}")]
    ModqlOperatorNotSupported(String),
    #[error("{0}")]
    Surreal(#[from] surrealdb::err::Error),

    // #[error("")]
    // CtxFail,
    // XValueNotOfType(&'static str),
    // XPropertyNotFound(String),
    // StoreFailToCreate(String),
    // Modql(modql::Error),
    // ModqlOperatorNotSupported(String),
    // Surreal(surrealdb::err::Error),

    #[error("{0}")]
    JsonSerde(#[from] serde_json::Error),
    #[error(transparent)]
    IO(#[from] std::io::Error),
    #[error(transparent)]
    Watch(#[from] notify::Error),
    #[error("{0}")]
    Other(String)
}

// impl Serialize for Error {
//     fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> where S: Serializer {
//         serializer.serialize_str(self.to_string().as_ref())
//     }
// }
//
// impl From<modql::Error> for Error {
//     fn from(val: modql::Error) -> Self {
//         Error::Modql(val)
//     }
// }
//
// impl From<surrealdb::err::Error> for Error {
//     fn from(val: surrealdb::err::Error) -> Self {
//         Error::Surreal(val)
//     }
// }
//
// impl From<String> for Error {
//     fn from(value: String) -> Self {
//         Error::StoreFailToCreate(value)
//     }
// }
//
// impl From<serde_json::Error> for Error {
//     fn from(value: serde_json::Error) -> Self {
//         Error::JsonSerde(value)
//     }
// }
//
// impl From<std::io::Error> for Error {
//     fn from(value: std::io::Error) -> Self {
//         Error::IO(value)
//     }
// }

// impl std::fmt::Display for Error {
//     fn fmt(&self, fmt: &mut std::fmt::Formatter) -> core::result::Result<(), std::fmt::Error> {
//         write!(fmt, "{self:?}")
//     }
// }
//
// impl std::error::Error for Error {}
