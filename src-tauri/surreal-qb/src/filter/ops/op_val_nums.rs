use crate::filter::{OpVal};

/// - `ovs` OpValsType, e.g., `OpValsUint64`
/// - `ov` OpValType, e.g., `OpValUint64`
/// - `nt` Number type, e.g., `u64`
/// - `vr` Opval Variant e.g., `OpVal::Uint64`
macro_rules! impl_op_val {
	($(($ovs:ident, $ov:ident, $nt:ty, $vr:expr)),+) => {
		$(

#[derive(Debug)]
pub struct $ovs(pub Vec<$ov>);

#[derive(Debug, Clone)]
pub enum $ov {
	Eq($nt),
	Not($nt),
	In(Vec<$nt>),
	NotIn(Vec<$nt>),
	Lt($nt),
	Lte($nt),
	Gt($nt),
	Gte($nt),
	Null(bool),
}

// region:    --- Simple value to Eq e.g., OpValUint64
impl From<$nt> for $ov {
	fn from(val: $nt) -> Self {
		$ov::Eq(val)
	}
}

impl From<&$nt> for $ov {
	fn from(val: &$nt) -> Self {
		$ov::Eq(*val)
	}
}
// endregion: --- Simple value to Eq e.g., OpValUint64

// region:    --- Simple value to Eq e.g., OpValsUint64
impl From<$nt> for $ovs {
	fn from(val: $nt) -> Self {
		$ov::from(val).into()
	}
}

impl From<&$nt> for $ovs {
	fn from(val: &$nt) -> Self {
		$ov::from(*val).into()
	}
}
// endregion: --- Simple value to Eq e.g., OpValsUint64

// region:    --- e.g., OpValUint64 to OpVal
impl From<$ov> for OpVal {
	fn from(val: $ov) -> Self {
		$vr(val)
	}
}
// endregion: --- e.g., OpValUint64 to OpVal

// region:    --- Primitive to OpVal::Int(IntOpVal::Eq)
impl From<$nt> for OpVal {
	fn from(val: $nt) -> Self {
		$ov::Eq(val).into()
	}
}

impl From<&$nt> for OpVal {
	fn from(val: &$nt) -> Self {
		$ov::Eq(*val).into()
	}
}
// endregion: --- Primitive to OpVal::Int(IntOpVal::Eq)
		)+
	};
}

impl_op_val!(
    (OpValsInt64, OpValInt64, i64, OpVal::Int64),
    (OpValsFloat64, OpValFloat64, f64, OpVal::Float64)
);

mod json {
	use super::*;
	use crate::filter::json::OpValueToOpValType;
	use crate::{Error, Result};
	use serde_json::{Number, Value};

	// - `ov` e.g., `OpValInt64`
	// - `asfn` e.g., `as_i64`
	macro_rules! from_json_to_opval_num {
	($(($ov:ident, $asfn:expr)),+) => {
		$(

/// match a the op_value
impl OpValueToOpValType for $ov {

	fn op_value_to_op_val_type(op: &str, value: Value) -> Result<Self>
	where
		Self: Sized,
	{

		// FIXME: Needs to do the In/Array patterns.
		let ov = match (op, value) {
			("$eq", Value::Number(num)) => $ov::Eq($asfn(num)?),
			("$in", value) => {
				let nums = into_numbers(value)?;
				let nums: Result<Vec<_>> = nums.into_iter().map($asfn).collect();
				let nums = nums?;
				$ov::In(nums)
			}
			("$not", Value::Number(num)) => $ov::Not($asfn(num)?),
			("$notIn", value) => {
				let nums = into_numbers(value)?;
				let nums: Result<Vec<_>> = nums.into_iter().map($asfn).collect();
				let nums = nums?;
				$ov::NotIn(nums)
			}

			("$lt", Value::Number(num)) => $ov::Lt($asfn(num)?),
			("$lte", Value::Number(num)) => $ov::Lte($asfn(num)?),

			("$gt", Value::Number(num)) => $ov::Gt($asfn(num)?),
			("$gte", Value::Number(num)) => $ov::Gte($asfn(num)?),

			("$null", Value::Number(num)) => $ov::Gte($asfn(num)?),

			(_, value) => return Err(Error::JsonOpValNotSupported{
						operator: op.to_string(),
						value,
					}),
		};

		Ok(ov)
	}
}
		)+
	};
}

	from_json_to_opval_num!(
        (OpValInt64, as_i64),
        (OpValFloat64, as_f64)
    );

	fn as_i64(num: Number) -> Result<i64> {
		num.as_i64().ok_or(Error::JsonValNotOfType("i64"))
	}

	fn as_f64(num: Number) -> Result<f64> {
		num.as_f64().ok_or(Error::JsonValNotOfType("f64"))
	}

	fn into_numbers(value: Value) -> Result<Vec<Number>> {
		let mut values = Vec::new();

		let Value::Array(array) = value else {
			return Err(Error::JsonValArrayWrongType {
				actual_value: value,
			});
		};

		for item in array.into_iter() {
			if let Value::Number(item) = item {
				values.push(item);
			} else {
				return Err(Error::JsonValArrayItemNotOfType {
					expected_type: "Number",
					actual_value: item,
				});
			}
		}

		Ok(values)
	}
}

mod surrealql {
	use crate::{BinaryOper, ConditionExpression, SimpleExpr};
	use super::*;
	use crate::filter::surreal_is_value_null;
	use crate::error::SurrealResult;

	macro_rules! impl_into_surrealql {
		($($ov:ident),+) => {
			$(
	impl $ov {
		pub fn into_surrealql(self, prop_name: &str) -> SurrealResult<ConditionExpression>  {
			let binary_fn = |op: BinaryOper, vxpr: SimpleExpr| {
				ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.clone().into(), op, vxpr))
			};

			let cond = match self {
				$ov::Eq(s) => binary_fn(BinaryOper::Equal, s.into()),
				$ov::Not(s) => binary_fn(BinaryOper::NotEqual, s.into()),

				$ov::In(s) => binary_fn(
					BinaryOper::In,
					SimpleExpr::Tuple(s.into_iter().map(SimpleExpr::from).collect()),
				),
				$ov::NotIn(s) => binary_fn(
					BinaryOper::NotIn,
					SimpleExpr::Tuple(s.into_iter().map(SimpleExpr::from).collect()),
				),

				$ov::Lt(s) => binary_fn(BinaryOper::SmallerThan, s.into()),
				$ov::Lte(s) => binary_fn(BinaryOper::SmallerThanOrEqual, s.into()),
				$ov::Gt(s) => binary_fn(BinaryOper::GreaterThan, s.into()),
				$ov::Gte(s) => binary_fn(BinaryOper::GreaterThanOrEqual, s.into()),

				$ov::Null(null) => surreal_is_value_null(prop_name.clone(), null),
			};

			Ok(cond)
		}
	}
			)+
		};
	}

	impl_into_surrealql!(OpValInt64, OpValFloat64);
}
