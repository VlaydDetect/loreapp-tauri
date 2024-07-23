//! Translating the SQL AST into engine-specific SQL statements.

use crate::*;

mod query_builder;
mod table_ref_builder;
mod surreal_db;

pub use self::query_builder::*;
pub use self::table_ref_builder::*;
pub use self::surreal_db::*;

pub(crate) fn prepare<S: Into<String>>(str: S, s: &mut dyn std::fmt::Write, q: Quote) {
    write!(s, "{}", quoted(str.into(), q)).unwrap();
}

fn quoted(str: String, q: Quote) -> String {
    let byte = [q.1];
    let qq: &str = std::str::from_utf8(&byte).unwrap();
    str.replace(qq, qq.repeat(2).as_str())
}

pub trait QuotedBuilder {
    /// The type of quote the builder uses.
    fn quote(&self) -> Quote;
}

pub trait EscapeBuilder {
    /// Escape a SQL string literal
    fn escape_string(&self, string: &str) -> String {
        string
            .replace('\\', "\\\\")
            .replace('"', "\\\"")
            .replace('\'', "\\'")
            .replace('\0', "\\0")
            .replace('\x08', "\\b")
            .replace('\x09', "\\t")
            .replace('\x1a', "\\z")
            .replace('\n', "\\n")
            .replace('\r', "\\r")
    }

    /// Unescape a SQL string literal
    fn unescape_string(&self, string: &str) -> String {
        let mut escape = false;
        let mut output = String::new();
        for c in string.chars() {
            if !escape && c == '\\' {
                escape = true;
            } else if escape {
                write!(
                    output,
                    "{}",
                    match c {
                        '0' => '\0',
                        'b' => '\x08',
                        't' => '\x09',
                        'z' => '\x1a',
                        'n' => '\n',
                        'r' => '\r',
                        c => c,
                    }
                )
                    .unwrap();
                escape = false;
            } else {
                write!(output, "{c}").unwrap();
            }
        }
        output
    }
}

pub trait PrecedenceDecider {
    // This method decides which precedence relations should lead to dropped parentheses.
    // There will be more fine grained precedence relations than the ones represented here,
    // but dropping parentheses due to these relations can be confusing for readers.
    fn inner_expr_well_known_greater_precedence(
        &self,
        inner: &SimpleExpr,
        outer_oper: &Oper,
    ) -> bool;
}

pub trait OperLeftAssocDecider {
    // This method decides if the left associativity of an operator should lead to dropped parentheses.
    // Not all known left associative operators are necessarily included here,
    // as dropping them may in some cases be confusing to readers.
    fn well_known_left_associative(&self, op: &BinaryOper) -> bool;
}

#[derive(Debug, PartialEq)]
pub enum Oper {
    UnOper(UnaryOper),
    BinOper(BinaryOper),
}

impl From<UnaryOper> for Oper {
    fn from(value: UnaryOper) -> Self {
        Oper::UnOper(value)
    }
}

impl From<BinaryOper> for Oper {
    fn from(value: BinaryOper) -> Self {
        Oper::BinOper(value)
    }
}

impl Oper {
    pub(crate) fn is_logical(&self) -> bool {
        matches!(
            self,
            Oper::UnOper(UnaryOper::Not) | Oper::BinOper(BinaryOper::And) | Oper::BinOper(BinaryOper::Or)
        )
    }

    pub(crate) fn is_in(&self) -> bool {
        matches!(
            self,
            Oper::BinOper(BinaryOper::In) | Oper::BinOper(BinaryOper::NotIn)
        )
    }

    pub(crate) fn is_is(&self) -> bool {
        matches!(
            self,
            Oper::BinOper(BinaryOper::Is) | Oper::BinOper(BinaryOper::IsNot)
        )
    }

    pub(crate) fn is_arithmetic(&self) -> bool {
        match self {
            Oper::BinOper(b) => {
                matches!(
                    b,
                    BinaryOper::Mul | BinaryOper::Div | BinaryOper::Mod | BinaryOper::Add | BinaryOper::Sub
                )
            }
            _ => false,
        }
    }

    pub(crate) fn is_comparison(&self) -> bool {
        match self {
            Oper::BinOper(b) => {
                matches!(
                    b,
                    BinaryOper::SmallerThan
                        | BinaryOper::SmallerThanOrEqual
                        | BinaryOper::Equal
                        | BinaryOper::GreaterThanOrEqual
                        | BinaryOper::GreaterThan
                        | BinaryOper::NotEqual
                )
            }
            _ => false,
        }
    }
}