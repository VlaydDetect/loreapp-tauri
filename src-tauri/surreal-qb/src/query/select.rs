use crate::{
    backend::QueryBuilder,
    expr::*,
    prepare::*,
    query::{condition::*, OrderedStatement},
    types::*,
    FunctionCall,
    QueryStatementBuilder, QueryStatementWriter, SubQueryStatement,
};
use crate::filter::FilterGroups;
use inherent::inherent;
use surrealdb::sql::Object;

/// Select expression used in select statement
#[derive(Debug, Clone, PartialEq)]
pub struct SelectExpr {
    pub expr: SimpleExpr,
    pub alias: Option<String>,
}

/// Select rows from an existing table
#[derive(Default, Debug, Clone, PartialEq)]
pub struct SelectStatement {
    pub(crate) selects: Vec<SelectExpr>,
    pub(crate) from: Vec<TableRef>,
    pub(crate) r#where: ConditionHolder,
    pub(crate) groups: Vec<SimpleExpr>,
    pub(crate) orders: Vec<OrderExpr>,
    pub(crate) limit: Option<Value>,
    pub(crate) offset: Option<Value>,
}

impl<T> From<T> for SelectExpr
    where
        T: Into<SimpleExpr>,
{
    fn from(expr: T) -> Self {
        SelectExpr {
            expr: expr.into(),
            alias: None,
        }
    }
}

impl SelectStatement {
    /// Construct a new [`SelectStatement`]
    pub fn new() -> Self {
        Self::default()
    }

    /// Take the ownership of data in the current [`SelectStatement`]
    pub fn take(&mut self) -> Self {
        Self {
            selects: std::mem::take(&mut self.selects),
            from: std::mem::take(&mut self.from),
            r#where: std::mem::replace(&mut self.r#where, ConditionHolder::new()),
            groups: std::mem::take(&mut self.groups),
            orders: std::mem::take(&mut self.orders),
            limit: self.limit.take(),
            offset: self.offset.take(),
        }
    }

    /// A shorthand to express if ... else ... when constructing the select statement.
    pub fn conditions<T, F>(&mut self, b: bool, if_true: T, if_false: F) -> &mut Self
        where
            T: FnOnce(&mut Self),
            F: FnOnce(&mut Self),
    {
        if b {
            if_true(self)
        } else {
            if_false(self)
        }
        self
    }

    /// Clear the select list
    pub fn clear_selects(&mut self) -> &mut Self {
        self.selects = Vec::new();
        self
    }

    /// Add an expression to the select expression list.
    pub fn expr<T>(&mut self, expr: T) -> &mut Self
        where
            T: Into<SelectExpr>,
    {
        self.selects.push(expr.into());
        self
    }

    /// Add select expressions from vector of [`SelectExpr`].
    pub fn exprs<T, I>(&mut self, exprs: I) -> &mut Self
        where
            T: Into<SelectExpr>,
            I: IntoIterator<Item = T>,
    {
        self.selects
            .append(&mut exprs.into_iter().map(|c| c.into()).collect());
        self
    }

    pub fn exprs_mut_for_each<F>(&mut self, func: F)
        where F: FnMut(&mut SelectExpr),
    {
        self.selects.iter_mut().for_each(func);
    }

    /// Add a column to the select expression list.
    pub fn column(&mut self, col: String) -> &mut Self
    {
        self.expr(SimpleExpr::Column(col))
    }

    /// Select columns.
    pub fn columns<I>(&mut self, cols: I) -> &mut Self
        where I: IntoIterator<Item = String>,
    {
        self.exprs(
            cols.into_iter()
                .map(|c| SimpleExpr::Column(c))
                .collect::<Vec<SimpleExpr>>(),
        )
    }

    /// Select column.
    pub fn expr_as<T>(&mut self, expr: T, alias: String) -> &mut Self
        where T: Into<SimpleExpr>,
    {
        self.expr(SelectExpr {
            expr: expr.into(),
            alias: Some(alias),
        });
        self
    }

    /// From table.
    pub fn from<R>(&mut self, tbl_ref: R) -> &mut Self
        where
            R: IntoTableRef,
    {
        self.from_from(tbl_ref.into_table_ref())
    }

    /// Shorthand for selecting from a constant value list.
    /// Panics on an empty values list.
    pub fn from_values<I, V>(&mut self, value_tuples: I, alias: String) -> &mut Self
        where
            I: IntoIterator<Item = V>,
            V: IntoValueTuple,
    {
        let value_tuples: Vec<ValueTuple> = value_tuples
            .into_iter()
            .map(|vt| vt.into_value_tuple())
            .collect();
        assert!(!value_tuples.is_empty());
        self.from_from(TableRef::ValuesList(value_tuples, alias))
    }

    /// From table with alias.
    pub fn from_as<R>(&mut self, tbl_ref: R, alias: String) -> &mut Self
        where R: IntoTableRef,
    {
        self.from_from(tbl_ref.into_table_ref().alias(alias))
    }

    /// From sub-query.
    pub fn from_subquery(&mut self, query: SelectStatement, alias: String) -> &mut Self {
        self.from_from(TableRef::SubQuery(query, alias))
    }

    /// From function call.
    pub fn from_function(&mut self, func: FunctionCall, alias: String) -> &mut Self  {
        self.from_from(TableRef::FunctionCall(func, alias))
    }

    fn from_from(&mut self, select: TableRef) -> &mut Self {
        self.from.push(select);
        self
    }

    /// Group by columns.
    pub fn group_by_columns<I>(&mut self, cols: I) -> &mut Self
        where I: IntoIterator<Item = String>,
    {
        self.add_group_by(
            cols.into_iter()
                .map(|c| SimpleExpr::Column(c))
                .collect::<Vec<_>>(),
        )
    }

    /// Add a group by column.
    pub fn group_by_col(&mut self, col: String) -> &mut Self {
        self.group_by_columns([col])
    }

    /// Add group by expressions from vector of [`SelectExpr`].
    pub fn add_group_by<I>(&mut self, expr: I) -> &mut Self
        where
            I: IntoIterator<Item = SimpleExpr>,
    {
        self.groups.append(&mut expr.into_iter().collect());
        self
    }

    /// Limit the number of returned rows.
    pub fn limit(&mut self, limit: u64) -> &mut Self {
        self.limit = Some(limit.into());
        self
    }

    /// Reset limit
    pub fn reset_limit(&mut self) -> &mut Self {
        self.limit = None;
        self
    }

    /// Offset number of returned rows.
    pub fn offset(&mut self, offset: u64) -> &mut Self {
        self.offset = Some(offset.into());
        self
    }

    /// Reset offset
    pub fn reset_offset(&mut self) -> &mut Self {
        self.offset = None;
        self
    }
}

#[inherent]
impl QueryStatementBuilder for SelectStatement {
    pub fn build_collect_any_into(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        query_builder.prepare_select_statement(self, sql);
    }

    pub fn into_sub_query_statement(self) -> SubQueryStatement {
        SubQueryStatement::SelectStatement(self)
    }

    pub fn build_any(&self, query_builder: &dyn QueryBuilder) -> (String, Object);
    pub fn build_collect_any(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) -> String;
}

#[inherent]
impl QueryStatementWriter for SelectStatement {
    pub fn build_collect_into<T: QueryBuilder>(&self, query_builder: T, sql: &mut dyn SurrelaQLWriter) {
        query_builder.prepare_select_statement(self, sql);
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
impl OrderedStatement for SelectStatement {
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
        where  I: IntoIterator<Item = (String, Order)>;
}

#[inherent]
impl ConditionalStatement for SelectStatement {
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
