use crate::{
    backend::QueryBuilder,
    error::*,
    prepare::*,
    types::*,
    OnDuplicate, QueryStatementBuilder, QueryStatementWriter, ReturningClause, SelectStatement, SimpleExpr, SubQueryStatement
};
use inherent::inherent;
use surrealdb::sql::Object;

/// Represents a value source that can be used in an insert query.
///
/// [`InsertValueSource`] is a node in the expression tree and can represent a raw value set
/// ('VALUES') or a select query.
#[derive(Debug, Clone, PartialEq)]
pub(crate) enum InsertValueSource {
    Values(Vec<Vec<SimpleExpr>>),
    Select(Box<SelectStatement>),
}

/// Create any new rows into an existing table
#[derive(Debug, Default, Clone, PartialEq)]
pub struct InsertStatement {
    pub(crate) replace: bool,
    pub(crate) table: Option<Box<TableRef>>,
    pub(crate) columns: Vec<String>,
    pub(crate) source: Option<InsertValueSource>,
    pub(crate) on_duplicate: Option<OnDuplicate>,
    pub(crate) returning: Option<ReturningClause>,
    pub(crate) default_values: Option<u32>,
}

impl InsertStatement {
    /// Construct a new [`InsertStatement`]
    pub fn new() -> Self {
        Self::default()
    }

    /// Use REPLACE instead of INSERT
    pub fn replace(&mut self) -> &mut Self {
        self.replace = true;
        self
    }

    /// Specify which table to insert into.
    pub fn into_table<T>(&mut self, tbl_ref: T) -> &mut Self
        where T: IntoTableRef,
    {
        self.table = Some(Box::new(tbl_ref.into_table_ref()));
        self
    }

    /// Specify what columns to insert.
    pub fn columns<I>(&mut self, columns: I) -> &mut Self
        where I: IntoIterator<Item = String>,
    {
        self.columns = columns.into_iter().map(|c| c).collect();
        self
    }

    /// Specify a select query whose values to be inserted.
    pub fn select_from<S>(&mut self, select: S) -> Result<&mut Self>
        where S: Into<SelectStatement>,
    {
        let statement = select.into();

        if self.columns.len() != statement.selects.len() {
            return Err(Error::ColValNumMismatch {
                col_len: self.columns.len(),
                val_len: statement.selects.len(),
            });
        }

        self.source = Some(InsertValueSource::Select(Box::new(statement)));
        Ok(self)
    }

    /// Specify a row of values to be inserted.
    pub fn values<I>(&mut self, values: I) -> Result<&mut Self>
        where
            I: IntoIterator<Item = SimpleExpr>,
    {
        let values = values.into_iter().collect::<Vec<SimpleExpr>>();
        if self.columns.len() != values.len() {
            return Err(Error::ColValNumMismatch {
                col_len: self.columns.len(),
                val_len: values.len(),
            });
        }
        if !values.is_empty() {
            let values_source = if let Some(InsertValueSource::Values(values)) = &mut self.source {
                values
            } else {
                self.source = Some(InsertValueSource::Values(Default::default()));
                if let Some(InsertValueSource::Values(values)) = &mut self.source {
                    values
                } else {
                    unreachable!();
                }
            };
            values_source.push(values);
        }
        Ok(self)
    }

    /// Specify a row of values to be inserted, variation of [`InsertStatement::values`].
    pub fn values_panic<I>(&mut self, values: I) -> &mut Self
        where
            I: IntoIterator<Item = SimpleExpr>,
    {
        self.values(values).unwrap()
    }

    /// ON CONFLICT expression
    pub fn on_duplicate(&mut self, on_conflict: OnDuplicate) -> &mut Self {
        self.on_duplicate = Some(on_conflict);
        self
    }

    /// RETURNING expressions.
    pub fn returning(&mut self, returning: ReturningClause) -> &mut Self {
        self.returning = Some(returning);
        self
    }

    /// RETURNING expressions for a column.
    pub fn returning_col(&mut self, col: String) -> &mut Self {
        self.returning(ReturningClause::Columns(vec![col]))
    }

    /// RETURNING expressions all columns.
    pub fn returning_all(&mut self) -> &mut Self {
        self.returning(ReturningClause::All)
    }

    /// Insert with default values if columns and values are not supplied.
    pub fn or_default_values(&mut self) -> &mut Self {
        self.default_values = Some(1);
        self
    }

    /// Insert multiple rows with default values if columns and values are not supplied.
    pub fn or_default_values_many(&mut self, num_rows: u32) -> &mut Self {
        self.default_values = Some(num_rows);
        self
    }
}

#[inherent]
impl QueryStatementBuilder for InsertStatement {
    pub fn build_collect_any_into(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        query_builder.prepare_insert_statement(self, sql);
    }

    pub fn into_sub_query_statement(self) -> SubQueryStatement {
        SubQueryStatement::InsertStatement(self)
    }

    pub fn build_any(&self, query_builder: &dyn QueryBuilder) -> (String, Object);
    pub fn build_collect_any(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
}

#[inherent]
impl QueryStatementWriter for InsertStatement {
    pub fn build_collect_into<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter) {
        query_builder.prepare_insert_statement(self, sql);
    }

    pub fn build_collect<T: QueryBuilder>(
        &self,
        query_builder: T,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
    pub fn build<T: QueryBuilder>(&self, query_builder: T) -> (String, Object);
    pub fn to_string<T: QueryBuilder>(&self, query_builder: T) -> String;
}
