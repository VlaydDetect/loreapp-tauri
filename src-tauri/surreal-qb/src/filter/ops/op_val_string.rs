use crate::filter::OpVal;

#[derive(Debug)]
pub struct OpValsString(pub Vec<OpValString>);

#[derive(Debug, Clone)]
pub enum OpValString {
    Eq(String),
    Not(String),

    In(Vec<String>),
    NotIn(Vec<String>),

    Lt(String),
    Lte(String),

    Gt(String),
    Gte(String),

    Contains(String),
    NotContains(String),

    ContainsAny(Vec<String>),
    NotContainsAny(Vec<String>),

    ContainsAll(Vec<String>),

    StartsWith(String),
    NotStartsWith(String),

    StartsWithAny(Vec<String>),
    NotStartsWithAny(Vec<String>),

    EndsWith(String),
    NotEndsWith(String),

    EndsWithAny(Vec<String>),
    NotEndsWithAny(Vec<String>),

    Empty(bool),
    Null(bool),
}

// region:    --- Simple value to Eq OpValString
impl From<String> for OpValString {
    fn from(val: String) -> Self {
        OpValString::Eq(val)
    }
}

impl From<&str> for OpValString {
    fn from(val: &str) -> Self {
        OpValString::Eq(val.to_string())
    }
}
// endregion: --- Simple value to Eq OpValString

// region:    --- Simple value to Eq OpValStrings
impl From<String> for OpValsString {
    fn from(val: String) -> Self {
        OpValString::from(val).into()
    }
}

impl From<&str> for OpValsString {
    fn from(val: &str) -> Self {
        OpValString::from(val).into()
    }
}
// endregion: --- Simple value to Eq OpValStrings

// region:    --- StringOpVal to OpVal
impl From<OpValString> for OpVal {
    fn from(val: OpValString) -> Self {
        OpVal::String(val)
    }
}
// endregion: --- StringOpVal to OpVal

// region:    --- Primitive to OpVal::String(StringOpVal::Eq)
impl From<String> for OpVal {
    fn from(val: String) -> Self {
        OpValString::Eq(val).into()
    }
}

impl From<&str> for OpVal {
    fn from(val: &str) -> Self {
        OpValString::Eq(val.to_string()).into()
    }
}
// endregion: --- Primitive to OpVal::String(StringOpVal::Eq)

mod json {
    use crate::filter::json::OpValueToOpValType;
    use crate::filter::OpValString;
    use crate::{Error, Result};
    use serde_json::Value;

    impl OpValueToOpValType for OpValString {
        fn op_value_to_op_val_type(op: &str, value: Value) -> Result<Self>
        where
            Self: Sized,
        {
            fn into_strings(value: Value) -> Result<Vec<String>> {
                let mut values = Vec::new();

                let Value::Array(array) = value else {
                    return Err(Error::JsonValArrayWrongType {
                        actual_value: value,
                    });
                };

                for item in array.into_iter() {
                    if let Value::String(item) = item {
                        values.push(item);
                    } else {
                        return Err(Error::JsonValArrayItemNotOfType {
                            expected_type: "String",
                            actual_value: item,
                        });
                    }
                }

                Ok(values)
            }

            // FIXME: Needs to do the In/Array patterns.
            let ov = match (op, value) {
                ("$eq", Value::String(string_v)) => OpValString::Eq(string_v),
                ("$in", value) => OpValString::In(into_strings(value)?),

                ("$not", Value::String(string_v)) => OpValString::Not(string_v),
                ("$notIn", value) => OpValString::NotIn(into_strings(value)?),

                ("$lt", Value::String(string_v)) => OpValString::Lt(string_v),
                ("$lte", Value::String(string_v)) => OpValString::Lte(string_v),

                ("$gt", Value::String(string_v)) => OpValString::Gt(string_v),
                ("$gte", Value::String(string_v)) => OpValString::Gte(string_v),

                ("$contains", Value::String(string_v)) => OpValString::Contains(string_v),
                ("$notContains", Value::String(string_v)) => OpValString::NotContains(string_v),

                ("$containsAny", value) => OpValString::ContainsAny(into_strings(value)?),

                ("$containsAll", value) => OpValString::ContainsAll(into_strings(value)?),

                ("$startsWith", Value::String(string_v)) => OpValString::StartsWith(string_v),
                ("$startsWithAny", value) => OpValString::StartsWithAny(into_strings(value)?),

                ("$notStartsWith", Value::String(string_v)) => OpValString::NotStartsWith(string_v),
                ("$notStartsWithAny", value) => OpValString::NotStartsWithAny(into_strings(value)?),

                ("$endsWith", Value::String(string_v)) => OpValString::EndsWith(string_v),
                ("$endsWithAny", value) => OpValString::EndsWithAny(into_strings(value)?),

                ("$notEndsWith", Value::String(string_v)) => OpValString::NotEndsWith(string_v),
                ("$notEndsWithAny", value) => OpValString::NotEndsWithAny(into_strings(value)?),

                ("$empty", Value::Bool(v)) => OpValString::Empty(v),
                ("$null", Value::Bool(v)) => OpValString::Null(v),

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

    impl OpValString {
        pub fn into_surrealql(self, prop_name: &str) -> SurrealResult<ConditionExpression> {
            let binary_fn = |op: BinaryOper, v: String| {
                let vxpr = SimpleExpr::Value(Value::from(v));
                ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.into(), op, vxpr))
            };
            let binaries_fn = |op: BinaryOper, v: Vec<String>| {
                let vxpr_list: Vec<SimpleExpr> = v.into_iter().map(Value::from).map(SimpleExpr::from).collect();
                let vxpr = SimpleExpr::Tuple(vxpr_list);
                ConditionExpression::SimpleExpr(SimpleExpr::binary(prop_name.into(), op, vxpr))
            };
            let cond_any_of_fn = |op: BinaryOper, values: Vec<String>| {
                let mut cond = Condition::any();

                for value in values {
                    let expr = binary_fn(op, value);
                    cond = cond.add(expr);
                }

                ConditionExpression::Condition(cond)
            };
            let two_args_func_call = |func: Function, v: String, negate: bool| {
                let mut cond = SimpleExpr::FunctionCall(FunctionCall::new(func).args([
                    SimpleExpr::Value(prop_name.into()),
                    SimpleExpr::Value(v.as_str().into())
                ]));
                cond = if negate { cond.not() } else { cond };
                ConditionExpression::SimpleExpr(cond)
            };
            let cond_any_func_call = |func: Function, values: Vec<String>, negate: bool| {
                let mut cond = Condition::any();

                for value in values {
                    let expr = two_args_func_call(func.clone(), value, false);
                    cond = cond.add(expr);
                }

                cond = if negate { cond.not() } else { cond };

                ConditionExpression::Condition(cond)
            };

            let cond = match self {
                OpValString::Eq(s) => binary_fn(BinaryOper::Equal, s),
                OpValString::Not(s) => binary_fn(BinaryOper::NotEqual, s),
                OpValString::In(s) => binaries_fn(BinaryOper::In, s),
                OpValString::NotIn(s) => binaries_fn(BinaryOper::NotIn, s),
                OpValString::Lt(s) => binary_fn(BinaryOper::SmallerThan, s),
                OpValString::Lte(s) => binary_fn(BinaryOper::SmallerThanOrEqual, s),
                OpValString::Gt(s) => binary_fn(BinaryOper::GreaterThan, s),
                OpValString::Gte(s) => binary_fn(BinaryOper::GreaterThanOrEqual, s),

                OpValString::Contains(s) => binary_fn(BinaryOper::Contains, s),
                OpValString::NotContains(s) => binary_fn(BinaryOper::NotContains, s),

                OpValString::ContainsAll(values) => {
                    let mut cond = Condition::all();

                    for value in values {
                        let expr = binary_fn(BinaryOper::Contains, value);
                        cond = cond.add(expr);
                    }

                    ConditionExpression::Condition(cond)
                }
                OpValString::ContainsAny(values) => cond_any_of_fn(BinaryOper::Contains, values),
                OpValString::NotContainsAny(values) => cond_any_of_fn(BinaryOper::NotContains, values),

                OpValString::StartsWith(s) => two_args_func_call(Function::StartsWith, s, false),
                OpValString::StartsWithAny(values) => cond_any_func_call(Function::StartsWith, values, false),

                OpValString::NotStartsWith(s) => two_args_func_call(Function::StartsWith, s, true),
                OpValString::NotStartsWithAny(values) => cond_any_func_call(Function::StartsWith, values, true),

                OpValString::EndsWith(s) => two_args_func_call(Function::EndsWith, s, false),
                OpValString::EndsWithAny(values) => cond_any_func_call(Function::EndsWith, values, false),

                OpValString::NotEndsWith(s) => two_args_func_call(Function::EndsWith, s, true),
                OpValString::NotEndsWithAny(values) => cond_any_func_call(Function::EndsWith, values, true),

                OpValString::Empty(empty) => {
                    let op = if empty { BinaryOper::Equal } else { BinaryOper::NotEqual };
                    let mut cond = Condition::any().add(surreal_is_value_null(prop_name, empty));

                    let expr = Expr::expr(Func::len(prop_name)).binary(op, SimpleExpr::Value("0".into()));
                    let expr = ConditionExpression::SimpleExpr(expr);

                    cond = cond.add(expr);
                    cond.into()
                }
                OpValString::Null(null) => surreal_is_value_null(prop_name, null),
            };

            Ok(cond)
        }
    }
}
