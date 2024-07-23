use std::fmt::Debug;

use crate::{backend::QueryBuilder, SurrelaQLWriter, SurrelaQLWriterValues, SubQueryStatement};
use surrealdb::sql::Object;

pub trait QueryStatementBuilder: Debug {
    /// Build corresponding SQL statement for certain database backend and collect query parameters into a vector
    fn build_any(&self, query_builder: &dyn QueryBuilder) -> (String, Object) {
        let (placeholder, numbered) = query_builder.placeholder();
        let mut sql = SurrelaQLWriterValues::new(placeholder, numbered);
        self.build_collect_any_into(query_builder, &mut sql);
        sql.into_object()
    }

    /// Build corresponding SQL statement for certain database backend and collect query parameters
    fn build_collect_any(&self, query_builder: &dyn QueryBuilder, sql: &mut dyn SurrelaQLWriter) -> String {
        self.build_collect_any_into(query_builder, sql);
        sql.to_string()
    }

    /// Build corresponding SQL statement into the SqlWriter for certain database backend and collect query parameters
    fn build_collect_any_into(&self, query_builder: &dyn QueryBuilder, sql: &mut dyn SurrelaQLWriter);

    fn into_sub_query_statement(self) -> SubQueryStatement;
}

pub trait QueryStatementWriter: QueryStatementBuilder {
    /// Build corresponding SQL statement for certain database backend and return SQL string
    fn to_string<T: QueryBuilder>(&self, query_builder: T) -> String {
        let mut sql = String::with_capacity(256);
        self.build_collect_any_into(&query_builder, &mut sql);
        sql
    }

    /// Build corresponding SQL statement for certain database backend and collect query parameters into a vector
    fn build<T: QueryBuilder>(&self, query_builder: T) -> (String, Object) {
        let (placeholder, numbered) = query_builder.placeholder();
        let mut sql = SurrelaQLWriterValues::new(placeholder, numbered);
        self.build_collect_into(query_builder, &mut sql);
        sql.into_object()
    }

    /// Build corresponding SQL statement for certain database backend and collect query parameters
    fn build_collect<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter) -> String {
        self.build_collect_into(query_builder, sql);
        sql.to_string()
    }

    fn build_collect_into<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter);
}
