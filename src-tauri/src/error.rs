//! This is the main (and only for now) application Error type.
//! It's using 'thiserror' as it reduces boilerplate error code while providing rich error typing.
//!
//! Notes:
//!     - The strategy is to start with one Error type for the whole application and then seggregate as needed.
//!     - Since everything is typed from the start, renaming and refactoring become relatively trivial.
//!     - By best practices, `anyhow` is not used in application code, but can be used in unit or integration test (will be in dev_dependencies when used)
//!

use crate::model;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Model(#[from] model::Error),
    #[error("{0}")]
    XValueNotOfType(&'static str),
    #[error("{0}")]
    JsonSerde(#[from] serde_json::Error),
    #[error(transparent)]
    IO(#[from] std::io::Error),
    #[error(transparent)]
    Watch(#[from] notify::Error),
    #[error("{0}")]
    Other(String)
}
