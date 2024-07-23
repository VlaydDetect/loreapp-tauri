use crate::{
    backend::QueryBuilder,
    prepare::*,
    query::{condition::*, OrderedStatement},
    types::*,
    QueryStatementBuilder, QueryStatementWriter, ReturningClause, SimpleExpr, SubQueryStatement,
};
use inherent::inherent;
use surrealdb::sql::Object;

/// Delete existing rows from the table
#[derive(Default, Debug, Clone, PartialEq)]
pub struct DeleteStatement {
    pub(crate) table: Option<Box<TableRef>>,
    pub(crate) r#where: ConditionHolder,
    pub(crate) orders: Vec<OrderExpr>,
    pub(crate) limit: Option<Value>,
    pub(crate) returning: Option<ReturningClause>,
}

impl DeleteStatement {
    /// Construct a new [`DeleteStatement`]
    pub fn new() -> Self {
        Self::default()
    }

    /// Specify which table to delete from.
    pub fn from_table<T>(&mut self, tbl_ref: T) -> &mut Self
        where T: IntoTableRef,
    {
        self.table = Some(Box::new(tbl_ref.into_table_ref()));
        self
    }

    /// Limit number of updated rows.
    pub fn limit(&mut self, limit: u64) -> &mut Self {
        self.limit = Some(limit.into());
        self
    }

    /// RETURNING expressions.
    pub fn returning(&mut self, returning_cols: ReturningClause) -> &mut Self {
        self.returning = Some(returning_cols);
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
}

#[inherent]
impl QueryStatementBuilder for DeleteStatement {
    pub fn build_collect_any_into(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        query_builder.prepare_delete_statement(self, sql);
    }

    pub fn into_sub_query_statement(self) -> SubQueryStatement {
        SubQueryStatement::DeleteStatement(self)
    }

    pub fn build_any(&self, query_builder: &dyn QueryBuilder) -> (String, Object);
    pub fn build_collect_any(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
}

#[inherent]
impl QueryStatementWriter for DeleteStatement {
    pub fn build_collect_into<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter) {
        query_builder.prepare_delete_statement(self, sql);
    }

    pub fn build_collect<T: QueryBuilder>(
        &self,
        query_builder: T,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
    pub fn build<T: QueryBuilder>(&self, query_builder: T) -> (String, Object);
    pub fn to_string<T: QueryBuilder>(&self, query_builder: T) -> String;
}

#[inherent]
impl OrderedStatement for DeleteStatement {
    pub fn add_order_by(&mut self, order: OrderExpr) -> &mut Self {
        self.orders.push(order);
        self
    }

    pub fn clear_order_by(&mut self) -> &mut Self {
        self.orders = Vec::new();
        self
    }

    pub fn order_by(&mut self, col: String, order: Order) -> &mut Self;

    pub fn order_by_expr(&mut self, expr: SimpleExpr, order: Order) -> &mut Self;

    pub fn order_by_columns<I>(&mut self, cols: I) -> &mut Self
        where I: IntoIterator<Item = (String, Order)>;
}

#[inherent]
impl ConditionalStatement for DeleteStatement {
    pub fn and_or_where(&mut self, condition: LogicalChainOper) -> &mut Self {
        self.r#where.add_and_or(condition);
        self
    }

    pub fn cond_where<C>(&mut self, condition: C) -> &mut Self
        where
            C: IntoCondition,
    {
        self.r#where.add_condition(condition.into_condition());
        self
    }

    pub fn and_where_option(&mut self, other: Option<SimpleExpr>) -> &mut Self;
    pub fn and_where(&mut self, other: SimpleExpr) -> &mut Self;
}
