use super::*;

impl OperLeftAssocDecider for SurrealQueryBuilder {
    fn well_known_left_associative(&self, op: &BinaryOper) -> bool {
        let common_answer = common_well_known_left_associative(op);
        // TODO: add operators
        // let pg_specific_answer = matches!(op, BinOper::PgOperator(PgBinOper::Concatenate));
        // common_answer || pg_specific_answer
        common_answer
    }
}

impl PrecedenceDecider for SurrealQueryBuilder {
    fn inner_expr_well_known_greater_precedence(
        &self,
        inner: &SimpleExpr,
        outer_oper: &Oper,
    ) -> bool {
        let common_answer = common_inner_expr_well_known_greater_precedence(inner, outer_oper);
        common_answer
    }
}

impl QueryBuilder for SurrealQueryBuilder {
    fn placeholder(&self) -> (&str, bool) {
        ("$", true)
    }

    fn prepare_query_statement(&self, query: &SubQueryStatement, sql: &mut dyn SurrelaQLWriter) {
        query.prepare_statement(self, sql);
    }

    fn prepare_value(&self, value: &Value, sql: &mut dyn SurrelaQLWriter) {
        sql.push_param(value.clone(), self as _);
    }

    fn write_string_quoted(&self, string: &str, buffer: &mut String) {
        let escaped = self.escape_string(string);
        let string = if escaped.find('\\').is_some() {
            "E'".to_owned() + &escaped + "'"
        } else {
            "'".to_owned() + &escaped + "'"
        };
        write!(buffer, "{string}").unwrap()
    }

    fn write_bytes(&self, bytes: &[u8], buffer: &mut String) {
        write!(buffer, "'\\x").unwrap();
        for b in bytes {
            write!(buffer, "{b:02X}").unwrap();
        }
        write!(buffer, "'").unwrap();
    }
}
