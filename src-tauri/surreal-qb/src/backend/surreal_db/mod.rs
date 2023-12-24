mod query;

use super::*;

/// Surreal query builder.
#[derive(Default, Debug)]
pub struct SurrealQueryBuilder;

const QUOTE: Quote = Quote(0x00, 0x00);

impl QuotedBuilder for SurrealQueryBuilder {
    fn quote(&self) -> Quote {
        QUOTE
    }
}

impl EscapeBuilder for SurrealQueryBuilder {}

impl TableRefBuilder for SurrealQueryBuilder {}
