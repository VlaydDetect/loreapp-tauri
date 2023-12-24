use crate::*;
use std::ops::Deref;

pub trait QueryBuilder: QuotedBuilder + EscapeBuilder + TableRefBuilder + OperLeftAssocDecider + PrecedenceDecider
{
    /// The type of placeholder the builder uses for values, and whether it is numbered.
    fn placeholder(&self) -> (&str, bool) {
        ("$", false)
    }

    /// Prefix for tuples in VALUES list (e.g. ROW for Mysql)
    fn values_list_tuple_prefix(&self) -> &str {
        ""
    }

    /// Translate [`InsertStatement`] into SQL statement.
    fn prepare_insert_statement(&self, insert: &InsertStatement, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_insert(insert.replace, sql);

        if let Some(table) = &insert.table {
            write!(sql, " INTO ").unwrap();
            self.prepare_table_ref(table, sql);
            write!(sql, " ").unwrap();
        }

        self.prepare_output(&insert.returning, sql);

        if insert.default_values.is_some() && insert.columns.is_empty() && insert.source.is_none() {
            let num_rows = insert.default_values.unwrap();
            self.insert_default_values(num_rows, sql);
        } else {
            write!(sql, "(").unwrap();
            insert.columns.iter().fold(true, |first, col| {
                if !first {
                    write!(sql, ", ").unwrap()
                }
                prepare(col, sql.as_writer(), self.quote());
                false
            });
            write!(sql, ")").unwrap();

            if let Some(source) = &insert.source {
                write!(sql, " ").unwrap();
                match source {
                    InsertValueSource::Values(values) => {
                        write!(sql, "VALUES ").unwrap();
                        values.iter().fold(true, |first, row| {
                            if !first {
                                write!(sql, ", ").unwrap()
                            }
                            write!(sql, "(").unwrap();
                            row.iter().fold(true, |first, col| {
                                if !first {
                                    write!(sql, ", ").unwrap()
                                }
                                self.prepare_simple_expr(col, sql);
                                false
                            });
                            write!(sql, ")").unwrap();
                            false
                        });
                    }
                    InsertValueSource::Select(select_query) => {
                        self.prepare_select_statement(select_query.deref(), sql);
                    }
                }
            }
        }

        self.prepare_on_conflict(&insert.on_duplicate, sql);

        self.prepare_returning(&insert.returning, sql);
    }

    /// Translate [`SelectStatement`] into SQL statement.
    fn prepare_select_statement(&self, select: &SelectStatement, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "SELECT ").unwrap();

        select.selects.iter().fold(true, |first, expr| {
            if !first {
                write!(sql, ", ").unwrap()
            }
            self.prepare_select_expr(expr, sql);
            false
        });

        if !select.from.is_empty() {
            write!(sql, " FROM ").unwrap();
            select.from.iter().fold(true, |first, table_ref| {
                if !first {
                    write!(sql, ", ").unwrap()
                }
                self.prepare_table_ref(table_ref, sql);
                false
            });
        }

        self.prepare_condition(&select.r#where, "WHERE", sql);

        if !select.groups.is_empty() {
            write!(sql, " GROUP BY ").unwrap();
            select.groups.iter().fold(true, |first, expr| {
                if !first {
                    write!(sql, ", ").unwrap()
                }
                self.prepare_simple_expr(expr, sql);
                false
            });
        }

        if !select.orders.is_empty() {
            write!(sql, " ORDER BY ").unwrap();
            select.orders.iter().fold(true, |first, expr| {
                if !first {
                    write!(sql, ", ").unwrap()
                }
                self.prepare_order_expr(expr, sql);
                false
            });
        }

        self.prepare_select_limit_offset(select, sql);
    }

    // Translate the LIMIT and OFFSET expression in [`SelectStatement`]
    fn prepare_select_limit_offset(&self, select: &SelectStatement, sql: &mut dyn SurrelaQLWriter) {
        if let Some(limit) = &select.limit {
            write!(sql, " LIMIT ").unwrap();
            self.prepare_value(limit, sql);
        }

        if let Some(offset) = &select.offset {
            write!(sql, " OFFSET ").unwrap();
            self.prepare_value(offset, sql);
        }
    }

    /// Translate [`UpdateStatement`] into SQL statement.
    fn prepare_update_statement(&self, update: &UpdateStatement, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "UPDATE ").unwrap();

        if let Some(table) = &update.table {
            self.prepare_table_ref(table, sql);
        }

        write!(sql, " SET ").unwrap();

        update.values.iter().fold(true, |first, row| {
            if !first {
                write!(sql, ", ").unwrap()
            }
            let (col, v) = row;
            prepare(col, sql.as_writer(), self.quote());
            write!(sql, " = ").unwrap();
            self.prepare_simple_expr(v, sql);
            false
        });

        self.prepare_output(&update.returning, sql);

        self.prepare_condition(&update.r#where, "WHERE", sql);

        self.prepare_update_order_by(update, sql);

        self.prepare_update_limit(update, sql);

        self.prepare_returning(&update.returning, sql);
    }

    /// Translate ORDER BY expression in [`UpdateStatement`].
    fn prepare_update_order_by(&self, update: &UpdateStatement, sql: &mut dyn SurrelaQLWriter) {
        if !update.orders.is_empty() {
            write!(sql, " ORDER BY ").unwrap();
            update.orders.iter().fold(true, |first, expr| {
                if !first {
                    write!(sql, ", ").unwrap();
                }
                self.prepare_order_expr(expr, sql);
                false
            });
        }
    }

    /// Translate LIMIT expression in [`UpdateStatement`].
    fn prepare_update_limit(&self, update: &UpdateStatement, sql: &mut dyn SurrelaQLWriter) {
        if let Some(limit) = &update.limit {
            write!(sql, " LIMIT ").unwrap();
            self.prepare_value(limit, sql);
        }
    }

    /// Translate [`DeleteStatement`] into SQL statement.
    fn prepare_delete_statement(&self, delete: &DeleteStatement, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "DELETE ").unwrap();

        if let Some(table) = &delete.table {
            write!(sql, "FROM ").unwrap();
            self.prepare_table_ref(table, sql);
        }

        self.prepare_output(&delete.returning, sql);

        self.prepare_condition(&delete.r#where, "WHERE", sql);

        self.prepare_delete_order_by(delete, sql);

        self.prepare_delete_limit(delete, sql);

        self.prepare_returning(&delete.returning, sql);
    }

    /// Translate ORDER BY expression in [`DeleteStatement`].
    fn prepare_delete_order_by(&self, delete: &DeleteStatement, sql: &mut dyn SurrelaQLWriter) {
        if !delete.orders.is_empty() {
            write!(sql, " ORDER BY ").unwrap();
            delete.orders.iter().fold(true, |first, expr| {
                if !first {
                    write!(sql, ", ").unwrap();
                }
                self.prepare_order_expr(expr, sql);
                false
            });
        }
    }

    /// Translate LIMIT expression in [`DeleteStatement`].
    fn prepare_delete_limit(&self, delete: &DeleteStatement, sql: &mut dyn SurrelaQLWriter) {
        if let Some(limit) = &delete.limit {
            write!(sql, " LIMIT ").unwrap();
            self.prepare_value(limit, sql);
        }
    }

    /// Translate [`SimpleExpr`] into SQL statement.
    fn prepare_simple_expr(&self, simple_expr: &SimpleExpr, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_simple_expr_common(simple_expr, sql);
    }

    fn prepare_simple_expr_common(&self, simple_expr: &SimpleExpr, sql: &mut dyn SurrelaQLWriter) {
        match simple_expr {
            SimpleExpr::Column(column_ref) => {
                self.prepare_column(column_ref, sql);
            }
            SimpleExpr::Tuple(exprs) => {
                self.prepare_tuple(exprs, sql);
            }
            SimpleExpr::Unary(op, expr) => {
                self.prepare_un_oper(op, sql);
                write!(sql, " ").unwrap();
                let drop_expr_paren =
                    self.inner_expr_well_known_greater_precedence(expr, &(*op).into());
                if !drop_expr_paren {
                    write!(sql, "(").unwrap();
                }
                self.prepare_simple_expr(expr, sql);
                if !drop_expr_paren {
                    write!(sql, ")").unwrap();
                }
            }
            SimpleExpr::FunctionCall(func) => {
                self.prepare_function(&func.func, sql);
                self.prepare_tuple(&func.args, sql);
            }
            SimpleExpr::Binary(left, op, right) => match (op, right.as_ref()) {
                (BinaryOper::In, SimpleExpr::Tuple(t)) if t.is_empty() => {
                    self.binary_expr(&1i32.into(), &BinaryOper::Equal, &2i32.into(), sql)
                }
                (BinaryOper::NotIn, SimpleExpr::Tuple(t)) if t.is_empty() => {
                    self.binary_expr(&1i32.into(), &BinaryOper::Equal, &1i32.into(), sql)
                }
                _ => self.binary_expr(left, op, right, sql),
            },
            SimpleExpr::SubQuery(oper, sel) => {
                if let Some(oper) = oper {
                    self.prepare_sub_query_oper(oper, sql);
                }
                write!(sql, "(").unwrap();
                self.prepare_query_statement(sel.deref(), sql);
                write!(sql, ")").unwrap();
            }
            SimpleExpr::Value(val) => {
                self.prepare_value(val, sql);
            }
            SimpleExpr::Values(list) => {
                write!(sql, "(").unwrap();
                list.iter().fold(true, |first, val| {
                    if !first {
                        write!(sql, ", ").unwrap();
                    }
                    self.prepare_value(val, sql);
                    false
                });
                write!(sql, ")").unwrap();
            }
            SimpleExpr::Keyword(keyword) => {
                self.prepare_keyword(keyword, sql);
            }
            SimpleExpr::Constant(val) => {
                self.prepare_constant(val, sql);
            }
        }
    }

    /// Translate [`SelectExpr`] into SQL statement.
    fn prepare_select_expr(&self, select_expr: &SelectExpr, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_simple_expr(&select_expr.expr, sql);
        match &select_expr.alias {
            Some(alias) => {
                write!(sql, " AS ").unwrap();
                prepare(alias, sql.as_writer(), self.quote());
            }
            None => {}
        };
    }

    /// Translate [`TableRef`] into SQL statement.
    fn prepare_table_ref(&self, table_ref: &TableRef, sql: &mut dyn SurrelaQLWriter) {
        match table_ref {
            TableRef::SubQuery(query, alias) => {
                write!(sql, "(").unwrap();
                self.prepare_select_statement(query, sql);
                write!(sql, ")").unwrap();
                write!(sql, " AS ").unwrap();
                prepare(alias, sql.as_writer(), self.quote());
            }
            TableRef::ValuesList(values, alias) => {
                write!(sql, "(").unwrap();
                self.prepare_values_list(values, sql);
                write!(sql, ")").unwrap();
                write!(sql, " AS ").unwrap();
                prepare(alias, sql.as_writer(), self.quote());
            }
            TableRef::FunctionCall(func, alias) => {
                self.prepare_function(&func.func, sql);
                self.prepare_tuple(&func.args, sql);
                write!(sql, " AS ").unwrap();
                prepare(alias, sql.as_writer(), self.quote());
            }
            _ => self.prepare_table_ref_iden(table_ref, sql),
        }
    }

    /// Translate [`UnaryOper`] into SQL statement.
    fn prepare_un_oper(&self, un_oper: &UnaryOper, sql: &mut dyn SurrelaQLWriter) {
        write!(
            sql,
            "{}",
            match un_oper {
                UnaryOper::Not => "NOT",
            }
        )
            .unwrap();
    }

    fn prepare_bin_oper_common(&self, bin_oper: &BinaryOper, sql: &mut dyn SurrelaQLWriter) {
        write!(
            sql,
            "{}",
            match bin_oper {
                BinaryOper::And => "AND",
                BinaryOper::Or => "OR",
                BinaryOper::Is => "IS",
                BinaryOper::IsNot => "IS NOT",
                BinaryOper::In => "IN",
                BinaryOper::NotIn => "NOT IN",
                BinaryOper::Equal => "=",
                BinaryOper::NotEqual => "<>",
                BinaryOper::SmallerThan => "<",
                BinaryOper::GreaterThan => ">",
                BinaryOper::SmallerThanOrEqual => "<=",
                BinaryOper::GreaterThanOrEqual => ">=",
                BinaryOper::Add => "+",
                BinaryOper::Sub => "-",
                BinaryOper::Mul => "*",
                BinaryOper::Div => "/",
                BinaryOper::Mod => "%",
                BinaryOper::As => "AS",
                BinaryOper::Contains => "CONTAINS",
                BinaryOper::NotContains => "CONTAINSNOT",
                #[allow(unreachable_patterns)]
                _ => unimplemented!(),
            }
        )
            .unwrap();
    }

    /// Translate [`BinaryOper`] into SQL statement.
    fn prepare_bin_oper(&self, bin_oper: &BinaryOper, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_bin_oper_common(bin_oper, sql);
    }

    // FIXME
    /// Translate [`SubQueryOper`] into SQL statement.
    fn prepare_sub_query_oper(&self, oper: &String, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "{}", oper).unwrap();
    }

    /// Translate [`LogicalChainOper`] into SQL statement.
    fn prepare_logical_chain_oper(
        &self,
        log_chain_oper: &LogicalChainOper,
        i: usize,
        length: usize,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        let (simple_expr, oper) = match log_chain_oper {
            LogicalChainOper::And(simple_expr) => (simple_expr, "AND"),
            LogicalChainOper::Or(simple_expr) => (simple_expr, "OR"),
        };
        if i > 0 {
            write!(sql, " {oper} ").unwrap();
        }
        let both_binary = match simple_expr {
            SimpleExpr::Binary(_, _, right) => {
                matches!(right.as_ref(), SimpleExpr::Binary(_, _, _))
            }
            _ => false,
        };
        let need_parentheses = length > 1 && both_binary;
        if need_parentheses {
            write!(sql, "(").unwrap();
        }
        self.prepare_simple_expr(simple_expr, sql);
        if need_parentheses {
            write!(sql, ")").unwrap();
        }
    }

    /// Translate [`Function`] into SQL statement.
    fn prepare_function_common(&self, function: &Function, sql: &mut dyn SurrelaQLWriter) {
        write!(
            sql,
            "{}",
            match function {
                Function::Max => "MAX",
                Function::Min => "MIN",
                Function::Sum => "SUM",
                Function::Avg => "AVG",
                Function::Abs => "ABS",
                Function::Coalesce => "COALESCE",
                Function::Count => "COUNT",
                Function::IfNull => self.if_null_function(),
                Function::CharLength => self.char_length_function(),
                Function::Cast => "CAST",
                Function::Lower => "LOWER",
                Function::Upper => "UPPER",
                Function::BitAnd => "BIT_AND",
                Function::BitOr => "BIT_OR",
                Function::Random => self.random_function(),
                Function::Round => "ROUND",
                Function::StartsWith => "string::startsWith",
                Function::EndsWith => "string::endsWith",
                Function::Len => unreachable!(),
            }
        )
            .unwrap();
    }

    /// Translate [`QueryStatement`] into SQL statement.
    fn prepare_query_statement(&self, query: &SubQueryStatement, sql: &mut dyn SurrelaQLWriter);

    fn prepare_insert(&self, replace: bool, sql: &mut dyn SurrelaQLWriter) {
        if replace {
            write!(sql, "REPLACE").unwrap();
        } else {
            write!(sql, "INSERT").unwrap();
        }
    }

    fn prepare_function(&self, function: &Function, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_function_common(function, sql)
    }

    /// Translate [`OrderExpr`] into SQL statement.
    fn prepare_order_expr(&self, order_expr: &OrderExpr, sql: &mut dyn SurrelaQLWriter) {
        if !matches!(order_expr.order, Order::Field(_)) {
            self.prepare_simple_expr(&order_expr.expr, sql);
        }
        self.prepare_order(order_expr, sql);
    }

    /// Translate [`Order`] into SQL statement.
    fn prepare_order(&self, order_expr: &OrderExpr, sql: &mut dyn SurrelaQLWriter) {
        match &order_expr.order {
            Order::Asc => write!(sql, " ASC").unwrap(),
            Order::Desc => write!(sql, " DESC").unwrap(),
            Order::Field(values) => self.prepare_field_order(order_expr, values, sql),
        }
    }

    /// Translate [`Order::Field`] into SQL statement
    fn prepare_field_order(
        &self,
        order_expr: &OrderExpr,
        values: &Values,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        write!(sql, "CASE ").unwrap();
        let mut i = 0;
        for value in &values.0 {
            write!(sql, "WHEN ").unwrap();
            self.prepare_simple_expr(&order_expr.expr, sql);
            write!(sql, "=").unwrap();
            let value = self.value_to_string(value);
            write!(sql, "{value}").unwrap();
            write!(sql, " THEN {i} ").unwrap();
            i += 1;
        }
        write!(sql, "ELSE {i} END").unwrap();
    }

    /// Write [`Value`] into SQL statement as parameter.
    fn prepare_value(&self, value: &Value, sql: &mut dyn SurrelaQLWriter);

    /// Write [`Value`] inline.
    fn prepare_constant(&self, value: &Value, sql: &mut dyn SurrelaQLWriter) {
        let string = self.value_to_string(value);
        write!(sql, "{string}").unwrap();
    }

    /// Translate a `&[ValueTuple]` into a VALUES list.
    fn prepare_values_list(&self, value_tuples: &[ValueTuple], sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "VALUES ").unwrap();
        value_tuples.iter().fold(true, |first, value_tuple| {
            if !first {
                write!(sql, ", ").unwrap();
            }
            write!(sql, "{}", self.values_list_tuple_prefix()).unwrap();
            write!(sql, "(").unwrap();
            value_tuple.clone().into_iter().fold(true, |first, value| {
                if !first {
                    write!(sql, ", ").unwrap();
                }
                self.prepare_value(&value, sql);
                false
            });

            write!(sql, ")").unwrap();
            false
        });
    }

    /// Translate [`SimpleExpr::Tuple`] into SQL statement.
    fn prepare_tuple(&self, exprs: &[SimpleExpr], sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "(").unwrap();
        exprs.iter().fold(true, |first, expr| {
            if !first {
                write!(sql, ", ").unwrap();
            }
            self.prepare_simple_expr(expr, sql);
            false
        });
        write!(sql, ")").unwrap();
    }

    /// Translate [`Keyword`] into SQL statement.
    fn prepare_keyword(&self, keyword: &Keyword, sql: &mut dyn SurrelaQLWriter) {
        match keyword {
            Keyword::Null => write!(sql, "NULL").unwrap(),
            Keyword::CurrentDate => write!(sql, "CURRENT_DATE").unwrap(),
            Keyword::CurrentTime => write!(sql, "CURRENT_TIME").unwrap(),
            Keyword::CurrentTimestamp => write!(sql, "CURRENT_TIMESTAMP").unwrap(),
        }
    }

    /// Convert a SQL value into syntax-specific string
    fn value_to_string(&self, v: &Value) -> String {
        v.clone().0.as_string()
    }

    #[doc(hidden)]
    /// Write ON CONFLICT expression
    fn prepare_on_conflict(&self, on_conflict: &Option<OnDuplicate>, sql: &mut dyn SurrelaQLWriter) {
        if let Some(on_conflict) = on_conflict {
            self.prepare_on_conflict_keywords(sql);
            self.prepare_on_conflict_target(&on_conflict.target, sql);
            self.prepare_on_conflict_condition(&on_conflict.target_where, sql);
            self.prepare_on_conflict_action(&on_conflict.action, sql);
            self.prepare_on_conflict_condition(&on_conflict.action_where, sql);
        }
    }

    #[doc(hidden)]
    /// Write ON CONFLICT target
    fn prepare_on_conflict_target(
        &self,
        on_conflict_target: &Option<OnDuplicateTarget>,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        if let Some(target) = on_conflict_target {
            match target {
                OnDuplicateTarget::DuplicateColumns(columns) => {
                    write!(sql, "(").unwrap();
                    columns.iter().fold(true, |first, col| {
                        if !first {
                            write!(sql, ", ").unwrap()
                        }
                        prepare(col, sql.as_writer(), self.quote());
                        false
                    });
                    write!(sql, ")").unwrap();
                }
            }
        }
    }

    #[doc(hidden)]
    /// Write ON CONFLICT action
    fn prepare_on_conflict_action(
        &self,
        on_conflict_action: &Option<OnDuplicateAction>,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        if let Some(action) = on_conflict_action {
            match action {
                OnDuplicateAction::DoNothing => {
                    write!(sql, " DO NOTHING").unwrap();
                }
                OnDuplicateAction::Update(update_strats) => {
                    self.prepare_on_conflict_do_update_keywords(sql);
                    update_strats.iter().fold(true, |first, update_strat| {
                        if !first {
                            write!(sql, ", ").unwrap()
                        }
                        match update_strat {
                            OnDuplicateUpdate::Column(col) => {
                                prepare(col, sql.as_writer(), self.quote());
                                write!(sql, " = ").unwrap();
                                self.prepare_on_conflict_excluded_table(col, sql);
                            }
                            OnDuplicateUpdate::Expr(col, expr) => {
                                prepare(col, sql.as_writer(), self.quote());
                                write!(sql, " = ").unwrap();
                                self.prepare_simple_expr(expr, sql);
                            }
                        }
                        false
                    });
                }
            }
        }
    }

    #[doc(hidden)]
    /// Write ON CONFLICT keywords
    fn prepare_on_conflict_keywords(&self, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, " ON CONFLICT ").unwrap();
    }

    #[doc(hidden)]
    /// Write ON CONFLICT keywords
    fn prepare_on_conflict_do_update_keywords(&self, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, " DO UPDATE SET ").unwrap();
    }

    #[doc(hidden)]
    /// Write ON CONFLICT update action by retrieving value from the excluded table
    fn prepare_on_conflict_excluded_table(&self, col: &str, sql: &mut dyn SurrelaQLWriter) {
        write!(
            sql,
            "{}excluded{}",
            self.quote().left(),
            self.quote().right()
        )
            .unwrap();
        write!(sql, ".").unwrap();
        prepare(col, sql.as_writer(), self.quote());
    }

    #[doc(hidden)]
    /// Write ON CONFLICT conditions
    fn prepare_on_conflict_condition(
        &self,
        on_conflict_condition: &ConditionHolder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        self.prepare_condition(on_conflict_condition, "WHERE", sql)
    }

    #[doc(hidden)]
    /// Hook to insert "OUTPUT" expressions.
    fn prepare_output(&self, _returning: &Option<ReturningClause>, _sql: &mut dyn SurrelaQLWriter) {}

    #[doc(hidden)]
    /// Hook to insert "RETURNING" statements.
    fn prepare_returning(&self, returning: &Option<ReturningClause>, sql: &mut dyn SurrelaQLWriter) {
        if let Some(returning) = returning {
            write!(sql, " RETURNING ").unwrap();
            match &returning {
                ReturningClause::All => write!(sql, "*").unwrap(),
                ReturningClause::Columns(cols) => {
                    cols.iter().fold(true, |first, column_ref| {
                        if !first {
                            write!(sql, ", ").unwrap()
                        }
                        self.prepare_column(column_ref, sql);
                        false
                    });
                }
                ReturningClause::Exprs(exprs) => {
                    exprs.iter().fold(true, |first, expr| {
                        if !first {
                            write!(sql, ", ").unwrap()
                        }
                        self.prepare_simple_expr(expr, sql);
                        false
                    });
                }
            }
        }
    }

    fn prepare_column(&self, column: &String, sql: &mut dyn SurrelaQLWriter) {
        prepare(column, sql.as_writer(), self.quote());
    }

    #[doc(hidden)]
    /// Translate a condition to a "WHERE" clause.
    fn prepare_condition(
        &self,
        condition: &ConditionHolder,
        keyword: &str,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        match &condition.contents {
            ConditionHolderContents::Empty => (),
            ConditionHolderContents::Chain(conditions) => {
                write!(sql, " {keyword} ").unwrap();
                for (i, log_chain_oper) in conditions.iter().enumerate() {
                    self.prepare_logical_chain_oper(log_chain_oper, i, conditions.len(), sql);
                }
            }
            ConditionHolderContents::Condition(c) => {
                write!(sql, " {keyword} ").unwrap();
                self.prepare_condition_where(c, sql);
            }
        }
    }

    #[doc(hidden)]
    /// Translate part of a condition to part of a "WHERE" clause.
    fn prepare_condition_where(&self, condition: &Condition, sql: &mut dyn SurrelaQLWriter) {
        let simple_expr = condition.to_simple_expr();
        self.prepare_simple_expr(&simple_expr, sql);
    }

    #[doc(hidden)]
    /// Translate a binary expr to SQL.
    fn binary_expr(
        &self,
        left: &SimpleExpr,
        op: &BinaryOper,
        right: &SimpleExpr,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        // If left has higher precedence than op, we can drop parentheses around left
        let drop_left_higher_precedence =
            self.inner_expr_well_known_greater_precedence(left, &(*op).into());

        // Figure out if left associativity rules allow us to drop the left parenthesis
        let drop_left_assoc = left.is_binary()
            && op == left.get_bin_oper().unwrap()
            && self.well_known_left_associative(op);

        let left_paren = !drop_left_higher_precedence && !drop_left_assoc;
        if left_paren {
            write!(sql, "(").unwrap();
        }
        self.prepare_simple_expr(left, sql);
        if left_paren {
            write!(sql, ")").unwrap();
        }

        write!(sql, " ").unwrap();
        self.prepare_bin_oper(op, sql);
        write!(sql, " ").unwrap();

        // If right has higher precedence than op, we can drop parentheses around right
        let drop_right_higher_precedence =
            self.inner_expr_well_known_greater_precedence(right, &(*op).into());

        // Due to custom representation of casting AS datatype
        let drop_right_as_hack = (op == &BinaryOper::As) && matches!(right, SimpleExpr::Value(_)); // FIXME: it's was SimpleExpr::Custom(_), but it's a Value for now

        let right_paren = !drop_right_higher_precedence && !drop_right_as_hack;
        if right_paren {
            write!(sql, "(").unwrap();
        }
        self.prepare_simple_expr(right, sql);
        if right_paren {
            write!(sql, ")").unwrap();
        }
    }

    #[doc(hidden)]
    /// Write a string surrounded by escaped quotes.
    fn write_string_quoted(&self, string: &str, buffer: &mut String) {
        write!(buffer, "'{}'", self.escape_string(string)).unwrap()
    }

    #[doc(hidden)]
    /// Write bytes enclosed with engine specific byte syntax
    fn write_bytes(&self, bytes: &[u8], buffer: &mut String) {
        write!(buffer, "x'").unwrap();
        for b in bytes {
            write!(buffer, "{b:02X}").unwrap();
        }
        write!(buffer, "'").unwrap();
    }

    #[doc(hidden)]
    /// The name of the function that represents the "if null" condition.
    fn if_null_function(&self) -> &str {
        "IFNULL"
    }

    #[doc(hidden)]
    /// The name of the function that returns the char length.
    fn char_length_function(&self) -> &str {
        "CHAR_LENGTH"
    }

    #[doc(hidden)]
    /// The name of the function that returns a random number
    fn random_function(&self) -> &str {
        // Returning it with parens as part of the name because the tuple preparer can't deal with empty lists
        "RANDOM"
    }

    /// The keywords for insert default row.
    fn insert_default_keyword(&self) -> &str {
        "(DEFAULT)"
    }

    /// Write insert default rows expression.
    fn insert_default_values(&self, num_rows: u32, sql: &mut dyn SurrelaQLWriter) {
        write!(sql, "VALUES ").unwrap();
        (0..num_rows).fold(true, |first, _| {
            if !first {
                write!(sql, ", ").unwrap()
            }
            write!(sql, "{}", self.insert_default_keyword()).unwrap();
            false
        });
    }

    /// Write TRUE constant
    fn prepare_constant_true(&self, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_constant(&true.into(), sql);
    }

    /// Write FALSE constant
    fn prepare_constant_false(&self, sql: &mut dyn SurrelaQLWriter) {
        self.prepare_constant(&false.into(), sql);
    }
}

impl SubQueryStatement {
    pub(crate) fn prepare_statement(
        &self,
        query_builder: &dyn QueryBuilder,
        sql: &mut dyn SurrelaQLWriter,
    ) {
        use SubQueryStatement::*;
        match self {
            SelectStatement(stmt) => query_builder.prepare_select_statement(stmt, sql),
            InsertStatement(stmt) => query_builder.prepare_insert_statement(stmt, sql),
            UpdateStatement(stmt) => query_builder.prepare_update_statement(stmt, sql),
            DeleteStatement(stmt) => query_builder.prepare_delete_statement(stmt, sql),
        }
    }
}

pub(crate) fn common_inner_expr_well_known_greater_precedence(
    inner: &SimpleExpr,
    outer_oper: &Oper,
) -> bool {
    match inner {
        // We only consider the case where an inner expression is contained in either a
        // unary or binary expression (with an outer_oper).
        // We do not need to wrap with parentheses:
        // Columns, tuples (already wrapped), constants, function calls, values,
        // keywords, subqueries (already wrapped), case (already wrapped)
        SimpleExpr::Column(_)
        | SimpleExpr::Tuple(_)
        | SimpleExpr::Constant(_)
        | SimpleExpr::FunctionCall(_)
        | SimpleExpr::Value(_)
        | SimpleExpr::Keyword(_)
        | SimpleExpr::SubQuery(_, _) => true,
        SimpleExpr::Binary(_, inner_oper, _) => {
            let inner_oper: Oper = (*inner_oper).into();
            if inner_oper.is_arithmetic() {
                outer_oper.is_comparison()
                    || outer_oper.is_in()
                    || outer_oper.is_logical()
            } else if inner_oper.is_comparison()
                || inner_oper.is_in()
                || inner_oper.is_is()
            {
                outer_oper.is_logical()
            } else {
                false
            }
        }
        _ => false,
    }
}

pub(crate) fn common_well_known_left_associative(op: &BinaryOper) -> bool {
    matches!(
        op,
        BinaryOper::And | BinaryOper::Or | BinaryOper::Add | BinaryOper::Sub | BinaryOper::Mul | BinaryOper::Mod
    )
}