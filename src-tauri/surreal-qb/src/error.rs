//! Main Crate Error

use serde_json::Value;
use surrealdb::Error as SurrealError;
use surrealdb::error::Db;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug)]
pub enum Error {
	// region:    --- Json Errors
	JsonValNotOfType(&'static str),

	JsonValArrayWrongType {
		actual_value: Value,
	},
	JsonValArrayItemNotOfType {
		expected_type: &'static str,
		actual_value: Value,
	},

	JsonOpValNotSupported {
		operator: String,
		value: Value,
	},
	// endregion: --- Json Errors

	/// Column and value vector having different length
	ColValNumMismatch { col_len: usize, val_len: usize },

	Surreal(SurrealError),
	IntoSurreal(IntoSurrealError),

	ListLimitOverMax { max: i64, actial: i64 }
}

impl From<SurrealError> for Error {
	fn from(value: SurrealError) -> Self {
		Error::Surreal(value)
	}
}

impl From<Db> for Error {
	fn from(value: Db) -> Self {
		Error::Surreal(value.into())
	}
}

impl From<IntoSurrealError> for Error {
	fn from(value: IntoSurrealError) -> Self {
		Error::IntoSurreal(value)
	}
}

// region:    --- Error Boilerpate
impl std::fmt::Display for Error {
	fn fmt(&self, fmt: &mut std::fmt::Formatter) -> core::result::Result<(), std::fmt::Error> {
		match self {
			Self::ColValNumMismatch { col_len, val_len } => write!(
				fmt,
				"Columns and values length mismatch: {col_len} != {val_len}"
			),
			_ => write!(fmt, "{self:?}"),
		}
	}
}

impl std::error::Error for Error {}
// endregion: --- Error Boilerpate

// region: --- IntoSurrealError
pub type SurrealResult<T> = core::result::Result<T, IntoSurrealError>;

/// Error for FilterNode to Sea Condition
#[derive(Debug)]
pub enum IntoSurrealError {
	// For now, just Custom. Might have more variants later.
	Custom(String),
	SerdeJson(serde_json::Error),
	QueryAnalyzer(String),
}

impl From<serde_json::Error> for IntoSurrealError {
	fn from(val: serde_json::Error) -> Self {
		Self::SerdeJson(val)
	}
}

impl IntoSurrealError {
	pub fn custom(message: impl Into<String>) -> Self {
		IntoSurrealError::Custom(message.into())
	}
}

impl core::fmt::Display for IntoSurrealError {
	fn fmt(&self, fmt: &mut core::fmt::Formatter) -> core::result::Result<(), core::fmt::Error> {
		write!(fmt, "{self:?}")
	}
}

impl std::error::Error for IntoSurrealError {}
// endregion: --- IntoSurrealError
