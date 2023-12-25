use crate::filter::ops::OpVal;
use crate::filter::{OpValBool, OpValFloat64, OpValInt64, OpValString};

pub trait IntoFilterNodes {
    fn filter_nodes(self, context_path: Option<String>) -> Vec<FilterNode>;
}


#[derive(Debug, Clone)]
pub struct FilterNode {
    pub context_path: Option<String>, // would be for the project.title (project in this case)
    pub name: String,
    pub opvals: Vec<OpVal>,
}

impl FilterNode {
    pub fn new(name: impl Into<String>, opvals: impl Into<Vec<OpVal>>) -> FilterNode {
        FilterNode {
            context_path: None,
            name: name.into(),
            opvals: opvals.into(),
        }
    }
    pub fn new_with_context(
        context_path: Option<String>,
        name: impl Into<String>,
        opvals: impl Into<Vec<OpVal>>,
    ) -> FilterNode {
        FilterNode {
            context_path,
            name: name.into(),
            opvals: opvals.into(),
        }
    }
}

// region:    --- From Tuples (OpVal[Type])
// Implements the From trait from tuples to FilterNode
macro_rules! from_tuples_opval {
	($($OV:ident),+) => {
		$(
			/// From trait from (prop_name, [Type]OpValue) for FilterNode
			/// (e.g., `let node: FilterNode = ("id", IntOpVal::Gt(1)).into()`)
			impl From<(&str, $OV)> for FilterNode {
				fn from((name, ov): (&str, $OV)) -> Self {
					Self {
						context_path: None,
						name: name.to_string(),
						opvals: vec![ov.into()],
					}
				}
			}

			/// From trait from (prop_name, Vec<[Type]OpValue>)  for FilterNode
			/// (e.g., `let node: FilterNode = (prop_name, Vec<[Type]OpValue>).into()`)
			impl From<(&str, Vec<$OV>)> for FilterNode {
				fn from((name, ovs): (&str, Vec<$OV>)) -> Self {
					Self {
						context_path: None,
						name: name.to_string(),
						opvals: ovs.into_iter().map(|v| v.into()).collect(),
					}
				}
			}
		)+
	};
}
from_tuples_opval!(
    // String
    OpValString,
    // Nums
    // OpValUint64,
    OpValInt64,
    OpValFloat64,
    // Bool
    OpValBool
);
// endregion: --- From Tuples (OpVal[Type])

// region:    --- Froms Tuples (String val)

impl From<(&str, &str)> for FilterNode {
    fn from((name, ov): (&str, &str)) -> Self {
        Self {
            context_path: None,
            name: name.to_string(),
            opvals: vec![OpValString::Eq(ov.to_string()).into()],
        }
    }
}

impl From<(&str, &String)> for FilterNode {
    fn from((name, ov): (&str, &String)) -> Self {
        Self {
            context_path: None,
            name: name.to_string(),
            opvals: vec![OpValString::Eq(ov.to_string()).into()],
        }
    }
}

impl From<(&str, String)> for FilterNode {
    fn from((name, ov): (&str, String)) -> Self {
        Self {
            context_path: None,
            name: name.to_string(),
            opvals: vec![OpValString::Eq(ov).into()],
        }
    }
}

// endregion: --- Froms Tuples (String val)

// region:    --- From Tuples (num val)
// - `nt` e.g., `u64`
// - `ov` e.g., `OpValUint64`
macro_rules! from_tuples_num{
	($(($nt:ty, $ov:ident)),+) => {
		$(

impl From<(&str, $nt)> for FilterNode {
	fn from((name, ov): (&str, $nt)) -> Self {
		Self {
			context_path: None,
			name: name.to_string(),
			opvals: vec![$ov::Eq(ov).into()],
		}
	}
}
		)+
	};
}

from_tuples_num!(
    // (u64, OpValUint64),
    // (u32, OpValUint32),
    (i64, OpValInt64),
    // (f32, OpValFloat32),
    (f64, OpValFloat64)
);

// endregion: --- From Tuples (num val)

// region:    --- From Tuples (bool val)
impl From<(&str, bool)> for FilterNode {
    fn from((name, ov): (&str, bool)) -> Self {
        Self {
            context_path: None,
            name: name.to_string(),
            opvals: vec![OpValBool::Eq(ov).into()],
        }
    }
}

mod surrealql {
    use super::*;
    use crate::ConditionExpression;
    use crate::error::SurrealResult;

    impl FilterNode {
        pub fn into_surql_expr_list(self) -> SurrealResult<Vec<ConditionExpression>> {
            let mut node_exprs: Vec<ConditionExpression> = Vec::new();

            for op_val in self.opvals.into_iter() {
                let cond_expr = match op_val {
                    OpVal::String(ov) => ov.into_surrealql(&self.name)?,
                    OpVal::Array(ov) => ov.into_surrealql(&self.name)?,
                    OpVal::Int64(ov) => ov.into_surrealql(&self.name)?,
                    OpVal::Float64(ov) => ov.into_surrealql(&self.name)?,
                    OpVal::Bool(ov) => ov.into_surrealql(&self.name)?,
                    OpVal::Value(_ov) => {
                        // let Some(for_sea_cond) = for_sea_cond.as_ref() else {
                        //     return Err(IntoSeaError::Custom(
                        //         "OpValsValue must have a #[modql(to_sea_value_fn=\"fn_name\"] or to_sea_condition_fn attribute"
                        //             .to_string(),
                        //     ));
                        // };
                        //
                        // match for_sea_cond {
                        //     ForSeaCondition::ToSeaValue(to_sea_value) => {
                        //         OpValValue::into_sea_cond_expr_with_json_to_sea(ov, &col, to_sea_value)?
                        //     }
                        //     ForSeaCondition::ToSeaCondition(to_sea_condition) => to_sea_condition.call(&col, ov)?,
                        // }
                        unimplemented!()
                    }
                };

                node_exprs.push(cond_expr);
            }

            Ok(node_exprs)
        }
    }
}
