use crate::filter::OpValsValue;
use crate::filter::*;

pub mod op_val_bool;
pub mod op_val_nums;
pub mod op_val_string;
pub mod op_val_value;
pub mod op_val_array;

// region:    --- OpVal
#[derive(Debug, Clone)]
pub enum OpVal {
	String(OpValString),

	Int64(OpValInt64),

	Float64(OpValFloat64),
	// Decimal(OpValFloat128), //TODO

	Array(OpValArray),

	Bool(OpValBool),
	Value(OpValValue),
}

// endregion: --- OpVal

// region:    --- From [Type]OpVal & Vec<[Type]OpVal> to [Type]OpVals

// Convenient implementation when single constraints.
// Common implementation
macro_rules! impl_from_for_opvals {
	($($ov:ident, $ovs:ident),*) => {
		$(
			impl From<$ov> for $ovs {
				fn from(val: $ov) -> Self {
					$ovs(vec![val])
				}
			}

			impl From<Vec<$ov>> for $ovs {
				fn from(val: Vec<$ov>) -> Self {
					$ovs(val)
				}
			}
		)*
	};
}

// For all opvals (must specified the pair as macro rules are hygienic)
impl_from_for_opvals!(
	// String
	OpValString,
	OpValsString,
	// Arrays
	OpValArray,
	OpValsArray,
	// Ints
	OpValInt64,
	OpValsInt64,
	// Floats
	OpValFloat64,
	OpValsFloat64,
	// Bool
	OpValBool,
	OpValsBool,
	// OpValJson
	OpValValue,
	OpValsValue
);

// endregion: --- From [Type]OpVal & Vec<[Type]OpVal> to [Type]OpVals

pub use self::surrealql::*;

mod surrealql {
	use surrealdb::sql::json;
	use crate::{ConditionExpression, Expr};

	pub fn value_from_vec<F: Into<surrealdb::sql::Value>>(vec: Vec<F>) -> surrealdb::sql::Value {
		// let new_vec = Vec::<surrealdb::sql::Value>::new();
		// for i in vec {
		// 	new_vec.push(i.into());
		// }
		//
		// new_vec;

		vec.into_iter().map(|v| v.into()).collect::<Vec<surrealdb::sql::Value>>().into()
	}

	pub fn value_from_vec_of_serde_value(vec: Vec<serde_json::Value>) -> surrealdb::Result<surrealdb::sql::Value> {
		let mut new_vec = Vec::<surrealdb::sql::Value>::new();
		for v in vec {
			let value = json(v.to_string().as_str())?;
			new_vec.push(value);
		}

		Ok(new_vec.into())
	}

	pub fn surreal_is_value_null<S: Into<String>>(col: S, null: bool) -> ConditionExpression {
		if null {
			Expr::col(col.into()).is_null().into()
		} else {
			Expr::col(col.into()).is_not_null().into()
		}
	}
}
