use crate::{
    backend::QueryBuilder,
    expr::*,
    prepare::*,
    query::{condition::*, OrderedStatement},
    types::*,
    QueryStatementBuilder, QueryStatementWriter, ReturningClause, SubQueryStatement
};
use inherent::inherent;
use surrealdb::sql::Object;

/// Update existing rows in the table
#[derive(Default, Debug, Clone, PartialEq)]
pub struct UpdateStatement {
    pub(crate) table: Option<Box<TableRef>>,
    pub(crate) values: Vec<(String, Box<SimpleExpr>)>,
    pub(crate) r#where: ConditionHolder,
    pub(crate) orders: Vec<OrderExpr>,
    pub(crate) limit: Option<Value>,
    pub(crate) returning: Option<ReturningClause>,
}

impl UpdateStatement {
    /// Construct a new [`UpdateStatement`]
    pub fn new() -> Self {
        Self::default()
    }

    /// Specify which table to update.
    pub fn table<T>(&mut self, tbl_ref: T) -> &mut Self
        where T: IntoTableRef,
    {
        self.table = Some(Box::new(tbl_ref.into_table_ref()));
        self
    }

    /// Update column values. To set multiple column-value pairs at once.
    pub fn values<I>(&mut self, values: I) -> &mut Self
        where I: IntoIterator<Item = (String, SimpleExpr)>,
    {
        for (k, v) in values.into_iter() {
            self.values.push((k, Box::new(v)));
        }
        self
    }

    /// Update column value by [`SimpleExpr`].
    pub fn value<T>(&mut self, col: String, value: T) -> &mut Self
        where T: Into<SimpleExpr>,
    {
        self.values.push((col, Box::new(value.into())));
        self
    }

    /// Limit number of updated rows.
    pub fn limit(&mut self, limit: u64) -> &mut Self {
        self.limit = Some(limit.into());
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

    /// Get column values
    pub fn get_values(&self) -> &[(String, Box<SimpleExpr>)] {
        &self.values
    }
}

#[inherent]
impl QueryStatementBuilder for UpdateStatement {
    pub fn build_collect_any_into(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        query_builder.prepare_update_statement(self, sql);
    }

    pub fn into_sub_query_statement(self) -> SubQueryStatement {
        SubQueryStatement::UpdateStatement(self)
    }

    pub fn build_any(&self, query_builder: &dyn QueryBuilder) -> (String, Object);
    pub fn build_collect_any(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
}

#[inherent]
impl QueryStatementWriter for UpdateStatement {
    pub fn build_collect_into<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter) {
        query_builder.prepare_update_statement(self, sql);
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
impl OrderedStatement for UpdateStatement {
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
impl ConditionalStatement for UpdateStatement {
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
