use crate::model::store;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("")]
    CtxFail,
    #[error("{0}")]
    Store(#[from] store::Error),
    #[error("surreal-qb ERROR: {0}")]
    QB(#[from] surreal_qb::Error),
    #[error("{0}")]
    ParseError(#[from] magic_utils::ParseError),
    #[error("{0}")]
    Other(String),
}
