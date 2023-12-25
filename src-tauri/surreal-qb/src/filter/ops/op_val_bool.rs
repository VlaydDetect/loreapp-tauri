use crate::filter::OpVal;

#[derive(Debug)]
pub struct OpValsBool(pub Vec<OpValBool>);

#[derive(Debug, Clone)]
pub enum OpValBool {
    Eq(bool),
    Not(bool),
    Null(bool),
}

// region:    --- Simple Value to Eq BoolOpVal
impl From<bool> for OpValBool {
    fn from(val: bool) -> Self {
        OpValBool::Eq(val)
    }
}

impl From<&bool> for OpValBool {
    fn from(val: &bool) -> Self {
        OpValBool::Eq(*val)
    }
}
// endregion: --- Simple Value to Eq BoolOpVal

// region:    --- Simple Value to Eq BoolOpVals
impl From<bool> for OpValsBool {
    fn from(val: bool) -> Self {
        OpValBool::from(val).into()
    }
}

impl From<&bool> for OpValsBool {
    fn from(val: &bool) -> Self {
        OpValBool::from(*val).into()
    }
}
// endregion: --- Simple Value to Eq BoolOpVals

// region:    --- BoolOpVal to OpVal
impl From<OpValBool> for OpVal {
    fn from(val: OpValBool) -> Self {
        OpVal::Bool(val)
    }
}
// endregion: --- BoolOpVal to OpVal

// region:    --- Simple Value to Eq OpVal::Bool(BoolOpVal::Eq)
impl From<bool> for OpVal {
    fn from(val: bool) -> Self {
        OpValBool::Eq(val).into()
    }
}

impl From<&bool> for OpVal {
    fn from(val: &bool) -> Self {
        OpValBool::Eq(*val).into()
    }
}
// endregion: --- Simple Value to Eq OpVal::Bool(BoolOpVal::Eq)

// region:    --- json
mod json {
    use super::*;
    use crate::filter::json::OpValueToOpValType;
    use crate::{Error, Result};
    use serde_json::Value;

    impl OpValueToOpValType for OpValBool {
        fn op_value_to_op_val_type(op: &str, value: Value) -> Result<Self>
        where
            Self: Sized,
        {
            let ov = match (op, value) {
                ("$eq", Value::Bool(v)) => OpValBool::Eq(v),
                ("$not", Value::Bool(v)) => OpValBool::Not(v),
                ("$null", Value::Bool(v)) => OpValBool::Not(v),
                (_, value) => {
                    return Err(Error::JsonOpValNotSupported {
                        operator: op.to_string(),
                        value,
                    })
                }
            };

            Ok(ov)
        }
    }
}
// endregion: --- json

mod surrealql {
    use crate::{BinaryOper, ConditionExpression, SimpleExpr};
    use super::*;
    use crate::filter::surreal_is_value_null;
    use crate::error::SurrealResult;

    impl OpValBool {
        pub fn into_surrealql(self, prop_name: &str) -> SurrealResult<ConditionExpression> {
            let binary_fn = |op: BinaryOper, vxpr: SimpleExpr| {
                ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.into(), op, vxpr))
            };

            let cond = match self {
                OpValBool::Eq(s) => binary_fn(BinaryOper::Equal, s.into()),
                OpValBool::Not(s) => binary_fn(BinaryOper::NotEqual, s.into()),
                OpValBool::Null(null) => surreal_is_value_null(prop_name, null),
            };

            Ok(cond)
        }
    }
}
