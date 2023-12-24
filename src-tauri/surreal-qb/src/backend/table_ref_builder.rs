use crate::*;

pub trait TableRefBuilder: QuotedBuilder {
    /// Translate [`TableRef`] that without values into SQL statement.
    fn prepare_table_ref_iden(&self, table_ref: &TableRef, sql: &mut dyn SurrelaQLWriter) {
        match table_ref {
            TableRef::Table(iden) => {
                write!(sql, "type::table(").unwrap();
                prepare("$tb", sql.as_writer(), self.quote());
                write!(sql, ")").unwrap();
                sql.insert_param("tb", iden.into());
            }
            TableRef::TableAlias(iden, alias) => {
                write!(sql, "type::table(").unwrap();
                prepare("$tb", sql.as_writer(), self.quote());
                write!(sql, ")").unwrap();
                sql.insert_param("tb", iden.into());
                write!(sql, " AS ").unwrap();
                prepare(alias, sql.as_writer(), self.quote());
            }
            TableRef::SubQuery(_, _)
            | TableRef::ValuesList(_, _)
            | TableRef::FunctionCall(_, _) => {
                panic!("TableRef with values is not support")
            }
        }
    }
}
