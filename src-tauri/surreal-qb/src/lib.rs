// --- Sub-Modules
mod error;
pub mod filter;
pub mod includes;

pub mod backend;
pub mod expr;
pub mod prepare;
pub mod query;
pub mod types;
pub mod func;
pub mod analyzer;

// --- Re-Exports
pub use crate::error::{Error, Result, SurrealResult};

pub use backend::*;
pub use expr::*;
pub use prepare::*;
pub use query::*;
pub use types::*;
pub use func::*;
pub use analyzer::*;

pub mod build_query {
    use surrealdb::sql::Object;
    use crate::filter::{FilterGroups, ListOptions};
    use crate::{Condition, Query, SurrealQueryBuilder};

    pub fn build_select_query<F>(table: String, filters: Option<F>, list_options: ListOptions) -> (String, Object)
        where F: Into<FilterGroups>,
    {
        let mut query = Query::select();
        query.from(table).column("*".to_string());
        if let Some(filters) = filters {
            let filters: FilterGroups = filters.into();
            let cond: Condition = filters.try_into().unwrap(); // FIXME
            query.cond_where(cond);
        }
        list_options.apply_to_surreal_query(&mut query);
        // let (sql, object) = query.build(SurrealQueryBuilder);
        // println!("build_select_query SQL: {sql:#?}");
        // println!("build_select_query VALUES: {object:#?}");
        // (sql, object)
        query.build(SurrealQueryBuilder)
    }
}
