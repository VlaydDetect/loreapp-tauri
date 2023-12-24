#[allow(deprecated)]

use std::collections::BTreeMap;
use crate::prelude::*;
use super::{Error, Result};
use surreal_qb::filter::{FilterGroups, ListOptions, OpVal, OpValBool, OpValFloat64, OpValInt64, OpValString};
use surrealdb::sql::Value;
use surrealdb::idx::docids;

// TODO: this will be moved to surreal-modql crate
// TODO: use surrealdb::sql::{Cond, Operator, etc.} for simple into() casts (or apply_to_surreal_query())

/// Private helper to sqlize a OpVal for SurrealDB
fn sqlize(opval: OpVal, prop_name: &str, var_idx: &str) -> Result<(String, Value)> {
    Ok(match opval {
        // Eq
        OpVal::String(OpValString::Eq(v)) => (f!("{prop_name} = ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Eq(v)) => (f!("{prop_name} = ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Eq(v)) => (f!("{prop_name} = ${var_idx}"), v.into()),
        OpVal::Bool(OpValBool::Eq(v)) => (f!("{prop_name} = ${var_idx}"), v.into()),
        // Not
        OpVal::String(OpValString::Not(v)) => (f!("{prop_name} != ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Not(v)) => (f!("{prop_name} != ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Not(v)) => (f!("{prop_name} != ${var_idx}"), v.into()),
        OpVal::Bool(OpValBool::Not(v)) => (f!("{prop_name} != ${var_idx}"), v.into()),
        // <
        OpVal::String(OpValString::Lt(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Lt(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Lt(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        // <=
        OpVal::String(OpValString::Lte(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Lte(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Lte(v)) => (f!("{prop_name} < ${var_idx}"), v.into()),
        // >
        OpVal::String(OpValString::Gt(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Gt(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Gt(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),
        // >=
        OpVal::String(OpValString::Gte(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),
        OpVal::Int64(OpValInt64::Gte(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),
        OpVal::Float64(OpValFloat64::Gte(v)) => (f!("{prop_name} > ${var_idx}"), v.into()),

        // contains
        OpVal::String(OpValString::Contains(v)) => {
            (f!("{prop_name} CONTAINS ${var_idx}"), v.into())
        }

        // startsWith
        OpVal::String(OpValString::StartsWith(v)) => {
            (f!("string::startsWith({prop_name}, ${var_idx}) "), v.into())
        }

        // endsWith
        OpVal::String(OpValString::EndsWith(v)) => {
            (f!("string::endsWith({prop_name}, ${var_idx}) "), v.into())
        }

        _ => return Err(Error::ModqlOperatorNotSupported(f!("{opval:?}"))),
    })
}

// TODO: ListOptions needs to export to TypeScript
// TODO: add filters
pub(super) fn build_select_query(tb: &str, filters: Option<FilterGroups>, list_options: ListOptions) -> Result<(String, BTreeMap<String, Value>)> {
    let mut sql = "SELECT * FROM type::table($tb)".to_string();

    let mut vars = BTreeMap::from([("tb".into(), tb.into())]);

    // --- Apply the filter
    if let Some(filters) = filters {
        let mut idx = 0;
        sql.push_str(" WHERE");

        // For each OR group
        for (group_idx, filter_nodes) in filters.groups().iter().enumerate() {
            if group_idx > 0 {
                sql.push_str(" OR");
            }

            // The AND filters
            sql.push_str(" (");
            for (node_idx, filter_node) in filter_nodes.nodes().iter().enumerate() {
                let key = &filter_node.name;
                for opval in &filter_node.opvals {
                    let var = f!("w{idx}");
                    if node_idx > 0 {
                        sql.push_str(" AND");
                    }
                    // fix me, needs to take it from op_val
                    let (sql_el, val) = sqlize(opval.clone(), key, &var)?;
                    sql.push_str(&f!(" {sql_el}"));
                    vars.insert(var, val);

                    idx += 1;
                }
            }
            sql.push_str(" )");
        }
    }

    // --- Apply the orderby
    if let Some(order_bys) = list_options.order_bys {
        sql.push_str(" ORDER BY ");
        let obs = order_bys
            .order_bys()
            .into_iter()
            .map(|o| o.to_string())
            .collect::<Vec<String>>();
        let obs = obs.join(",");
        sql.push_str(&obs);
    }

    // --- Apply the limit
    if let Some(limit) = list_options.limit {
        sql.push_str(&f!(" LIMIT {limit}"));
    }

    // --- Apply the offset
    if let Some(offset) = list_options.offset {
        sql.push_str(&f!(" START {offset}"));
    }

    Ok((sql, vars))
}

pub(super) enum Tokenizer {
    Black,
    Camel,
    Class,
    Punct
}

impl From<Tokenizer> for String {
    fn from(value: Tokenizer) -> Self {
        match value {
            Tokenizer::Black => "black".to_string(),
            Tokenizer::Camel => "camel".to_string(),
            Tokenizer::Class => "class".to_string(),
            Tokenizer::Punct => "punct".to_string(),
        }
    }
}

pub(super) enum Language {
    Arabic,
    English,
    Greek,
    Russian,
    Tamil,
}

pub(super) enum Filter {
    Ascii,
    Lowercase,
    Uppercase,
    Snowball(Language)
}

pub(super) fn build_define_analyzer_query(name: &str, tokens: Vec<Tokenizer>, filters: Vec<Filter>) {
    let mut sql = "DEFINE ANALYZER $name TOKENIZERS $tokens FILTERS $filters".to_string();

    if !tokens.is_empty() {
        sql.push_str(" TOKENIZERS ");
        let tokens = tokens.into_iter().map(|t| t.into()).collect::<Vec<String>>();
    }
}

pub(super) fn build_define_index_query() {

}

#[cfg(test)]
mod tests {
    use serde_json::*;
    use surreal_qb::filter::*;
    use surreal_qb::filter::ListOptions;

    #[derive(Debug, FilterNodes, Deserialize)]
    struct ProjectFilter {
        pub id: Option<OpValsInt64>,
        pub name: Option<OpValsString>,
        pub some_other: Option<OpValsString>,
    }

    #[test]
    fn test_surreal_build_select_query() -> anyhow::Result<()> {
        let filter: ProjectFilter = serde_json::from_value(json!({
            "id": {"$lt": 1, "$gt": 3},
        }))?;

        let filter: FilterGroups = filter.into();

        let expr = filter.groups()[0].nodes()[0].clone().into_surql_expr_list()?;
        println!("->>> expr: {expr:#?}");

        // println!("->>> filter: {filter:#?}");
        // let filter_nodes: Vec<FilterNode> = filter.try_into()?;
        //
        // let (sql, vars) = super::build_select_query(
        //     "project",
        //     Some(filter_nodes.clone().into()),
        //     ListOptions::default(),
        // )?;
        //
        // println!("->>> nodes: {filter_nodes:#?}");
        // println!("->>> sql: {sql:#?}");
        // println!("->>> vars: {vars:#?}");

        // assert!(sql.contains("id <"), "should contain id <");
        // assert!(sql.contains("name ="), "should contain name =");
        // assert!(sql.contains("$w1"), "should contain $w1");
        // // should have 3 vars, one for the $tb, and one per var
        // assert_eq!(vars.len(), 3, "should have e vars");

        Ok(())
    }
}
