use crate::filter::OpVal;
use surrealdb::sql::{Array, Value};

#[derive(Debug)]
pub struct OpValsArray(pub Vec<OpValArray>);

#[derive(Debug, Clone)]
pub enum OpValArray {
    Eq(Array),
    Not(Array),

    EqAny(Value), // ?=
    EqAll(Value), // *=

    Contains(Value),
    NotContains(Value),

    ContainsAll(Array),
    ContainsAny(Array),
    ContainsNone(Array),

    AllInside(Array), //ALLINSIDE
    AnyInside(Array), // ANYINSIDE
    NoneInside(Array), // NONEINSIDE

    Empty(bool),
    Null(bool),
}

impl From<Array> for OpValArray {
    fn from(value: Array) -> Self {
        OpValArray::Eq(value)
    }
}

impl From<Vec<Value>> for OpValArray {
    fn from(value: Vec<Value>) -> Self {
        OpValArray::Eq(value.into())
    }
}

impl From<Array> for OpValsArray {
    fn from(value: Array) -> Self {
        OpValArray::from(value).into()
    }
}

impl From<Vec<Value>> for OpValsArray {
    fn from(value: Vec<Value>) -> Self {
        OpValArray::from(value).into()
    }
}

impl From<OpValArray> for OpVal {
    fn from(value: OpValArray) -> Self {
        OpVal::Array(value)
    }
}

impl From<Array> for OpVal {
    fn from(value: Array) -> Self {
        OpValArray::Eq(value).into()
    }
}

impl From<Vec<Value>> for OpVal {
    fn from(value: Vec<Value>) -> Self {
        OpValArray::Eq(value.into()).into()
    }
}

mod json {
    use crate::filter::json::OpValueToOpValType;
    use crate::filter::OpValArray;
    use crate::{Error, Result};
    use serde_json::Value as Json;
    use surrealdb::sql::{Array, json, Value};

    impl OpValueToOpValType for OpValArray {
        fn op_value_to_op_val_type(op: &str, value: Json) -> Result<Self>
            where Self: Sized
        {
            fn into_value(value: Json) -> Result<Value> {
                json(value.to_string().as_str()).map_err::<Error, _>(|ex| ex.into())
            }

            fn into_array(value: Json) -> Result<Array> {
                let mut array = Vec::<Value>::new();

                let Json::Array(arr) = value else {
                    return Err(Error::JsonValArrayWrongType {
                        actual_value: value,
                    });
                };

                for item in arr.into_iter() {
                    let sur_val = into_value(item)?;
                    array.push(sur_val);
                }

                Ok(array.into())
            }

            let ov = match (op, value) {
                ("$eq", v) => OpValArray::Eq(into_array(v)?),
                ("$not", v) => OpValArray::Not(into_array(v)?),

                ("$eqAny", v) => OpValArray::EqAny(into_value(v)?),
                ("$eqAll", v) => OpValArray::EqAll(into_value(v)?),

                ("$contains", v) => OpValArray::Contains(into_value(v)?),
                ("$notContains", v) => OpValArray::NotContains(into_value(v)?),

                ("$containsAny", v) => OpValArray::ContainsAny(into_array(v)?),
                ("$containsAll", v) => OpValArray::ContainsAll(into_array(v)?),
                ("$containsNone", v) => OpValArray::ContainsNone(into_array(v)?),

                ("$allIn", v) => OpValArray::AllInside(into_array(v)?),
                ("anyIn", v) => OpValArray::AnyInside(into_array(v)?),
                ("noneIn", v) => OpValArray::NoneInside(into_array(v)?),

                ("$empty", Json::Bool(v)) => OpValArray::Empty(v),
                ("$null", Json::Bool(v)) => OpValArray::Null(v),

                (_, v) => {
                    return Err(Error::JsonOpValNotSupported {
                        operator: op.to_string(),
                        value: v,
                    })
                }
            };

            Ok(ov)
        }
    }
}

mod surrealql {
    use super::*;
    use crate::*;
    use crate::filter::surreal_is_value_null;
    use crate::error::SurrealResult;
    use surrealdb::sql::{Array, Value};

    impl OpValArray {
        pub fn into_surrealql(self, prop_name: &str) -> SurrealResult<ConditionExpression> {
            let array_binary_fn = |op: BinaryOper, a: Array| {
                let vxpr = SimpleExpr::Value(types::Value(Value::from(a)));
                ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.into(), op, vxpr))
            };

            let solo_binary_fn = |op: BinaryOper, v: Value| {
                let vxpr = SimpleExpr::Value(types::Value(v));
                ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.into(), op, vxpr))
            };

            let cond = match self {
                OpValArray::Eq(a) => array_binary_fn(BinaryOper::Equal, a),
                OpValArray::Not(a) => array_binary_fn(BinaryOper::NotEqual, a),

                OpValArray::EqAny(v) => solo_binary_fn(BinaryOper::EqualAny, v),
                OpValArray::EqAll(v) => solo_binary_fn(BinaryOper::EqualAll, v),

                OpValArray::Contains(v) => solo_binary_fn(BinaryOper::Contains, v),
                OpValArray::NotContains(v) => solo_binary_fn(BinaryOper::NotContains, v),

                OpValArray::ContainsAll(a) => array_binary_fn(BinaryOper::ContainsAll, a),
                OpValArray::ContainsAny(a) => array_binary_fn(BinaryOper::ContainsAny, a),
                OpValArray::ContainsNone(a) => array_binary_fn(BinaryOper::ContainsNone, a),

                OpValArray::AllInside(a) => array_binary_fn(BinaryOper::AllIn, a),
                OpValArray::AnyInside(a) => array_binary_fn(BinaryOper::AnyIn, a),
                OpValArray::NoneInside(a) => array_binary_fn(BinaryOper::NoneIn, a),

                OpValArray::Empty(empty) => {
                    let op = if empty { BinaryOper::Equal } else { BinaryOper::NotEqual };
                    let mut cond = Condition::any().add(surreal_is_value_null(prop_name, empty));

                    let expr = Expr::expr(Func::len(prop_name)).binary(op, SimpleExpr::Value("0".into()));
                    let expr = ConditionExpression::SimpleExpr(expr);

                    cond = cond.add(expr);
                    cond.into()
                }
                OpValArray::Null(null) => surreal_is_value_null(prop_name, null),
            };

            Ok(cond)
        }
    }
}
