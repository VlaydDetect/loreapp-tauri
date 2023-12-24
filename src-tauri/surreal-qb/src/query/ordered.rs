use crate::{expr::*, types::*};

pub trait OrderedStatement {
    // Implementation for the trait.
    fn add_order_by(&mut self, order: OrderExpr) -> &mut Self;

    /// Clear order expressions
    fn clear_order_by(&mut self) -> &mut Self;

    /// Order by column.
    fn order_by(&mut self, col: String, order: Order) -> &mut Self {
        self.add_order_by(OrderExpr {
            expr: SimpleExpr::Column(col),
            order,
        })
    }

    /// Order by [`SimpleExpr`].
    fn order_by_expr(&mut self, expr: SimpleExpr, order: Order) -> &mut Self {
        self.add_order_by(OrderExpr {
            expr,
            order,
        })
    }

    /// Order by vector of columns.
    fn order_by_columns<I>(&mut self, cols: I) -> &mut Self
        where I: IntoIterator<Item = (String, Order)>,
    {
        cols.into_iter().for_each(|(c, order)| {
            self.add_order_by(OrderExpr {
                expr: SimpleExpr::Column(c),
                order,
            });
        });
        self
    }
}
