use crate::{expr::SimpleExpr, types::LogicalChainOper};
use crate::filter::FilterGroups;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConditionType {
    Any,
    All,
}

/// Represents anything that can be passed to an [`Condition::any`] or [`Condition::all`]'s [`Condition::add`] method.
///
/// The arguments are automatically converted to the right enum.
#[derive(Debug, Clone, PartialEq)]
pub enum ConditionExpression {
    Condition(Condition),
    SimpleExpr(SimpleExpr),
}

/// Represents the value of an [`Condition::any`] or [`Condition::all`]: a set of disjunctive or conjunctive conditions.
#[derive(Debug, Clone, PartialEq)]
pub struct Condition {
    pub(crate) negate: bool,
    pub(crate) condition_type: ConditionType,
    pub(crate) conditions: Vec<ConditionExpression>
}

pub trait IntoCondition {
    fn into_condition(self) -> Condition;
}

#[derive(Default, Debug, Clone, PartialEq)]
pub enum ConditionHolderContents {
    #[default]
    Empty,
    Chain(Vec<LogicalChainOper>),
    Condition(Condition),
}

#[derive(Default, Debug, Clone, PartialEq)]
pub struct ConditionHolder {
    pub contents: ConditionHolderContents,
}

impl Condition {
    /// Add a condition to the set.
    ///
    /// If it's an [`Condition::any`], it will be separated from the others by an `" OR "` in the query. If it's
    /// an [`Condition::all`], it will be separated by an `" AND "`.
    pub fn add<C>(mut self, condition: C) -> Self
        where C: Into<ConditionExpression>,
    {
        let mut expr: ConditionExpression = condition.into();
        if let ConditionExpression::Condition(ref mut c) = expr {
            // Skip the junction if there is only one.
            if c.conditions.len() == 1 && !c.negate {
                expr = c.conditions.pop().unwrap();
            }
        }
        self.conditions.push(expr);
        self
    }

    /// Add an optional condition to the set.
    ///
    /// Shorthand for `if o.is_some() { self.add(o) }`
    pub fn add_option<C>(self, other: Option<C>) -> Self
        where C: Into<ConditionExpression>,
    {
        if let Some(other) = other {
            self.add(other)
        } else {
            self
        }
    }

    /// Create a condition that is true if any of the conditions is true.
    pub fn any() -> Condition {
        Condition {
            negate: false,
            condition_type: ConditionType::Any,
            conditions: Vec::new(),
        }
    }

    /// Create a condition that is false if any of the conditions is false.
    pub fn all() -> Condition {
        Condition {
            negate: false,
            condition_type: ConditionType::All,
            conditions: Vec::new(),
        }
    }

    /// Negates a condition.
    pub fn not(mut self) -> Self {
        self.negate = !self.negate;
        self
    }

    /// Whether or not any condition has been added
    pub fn is_empty(&self) -> bool {
        self.conditions.is_empty()
    }

    /// How many conditions were added
    pub fn len(&self) -> usize {
        self.conditions.len()
    }

    pub(crate) fn to_simple_expr(&self) -> SimpleExpr {
        let mut inner_exprs = vec![];
        for ce in &self.conditions {
            inner_exprs.push(match ce {
                ConditionExpression::Condition(c) => c.to_simple_expr(),
                ConditionExpression::SimpleExpr(e) => e.clone(),
            });
        }
        let mut inner_exprs_into_iter = inner_exprs.into_iter();
        let expr = if let Some(first_expr) = inner_exprs_into_iter.next() {
            let mut out_expr = first_expr;
            for e in inner_exprs_into_iter {
                out_expr = match self.condition_type {
                    ConditionType::Any => out_expr.or(e),
                    ConditionType::All => out_expr.and(e),
                };
            }
            out_expr
        } else {
            SimpleExpr::Constant(match self.condition_type {
                ConditionType::Any => false.into(),
                ConditionType::All => true.into(),
            })
        };
        if self.negate {
            expr.not()
        } else {
            expr
        }
    }
}

impl From<Condition> for ConditionExpression {
    fn from(condition: Condition) -> Self {
        ConditionExpression::Condition(condition)
    }
}

impl From<SimpleExpr> for ConditionExpression {
    fn from(condition: SimpleExpr) -> Self {
        ConditionExpression::SimpleExpr(condition)
    }
}

/// Macro to easily create an [`Condition::any`].
#[macro_export]
macro_rules! any {
    ( $( $x:expr ),* $(,)?) => {
        {
            let mut tmp = $crate::Condition::any();
            $(
                tmp = tmp.add($x);
            )*
            tmp
        }
    };
}

/// Macro to easily create an [`Condition::all`].
#[macro_export]
macro_rules! all {
    ( $( $x:expr ),* $(,)?) => {
        {
            let mut tmp = $crate::Condition::all();
            $(
                tmp = tmp.add($x);
            )*
            tmp
        }
    };
}

pub trait ConditionalStatement {
    /// And where condition.
    fn and_where(&mut self, other: SimpleExpr) -> &mut Self {
        self.cond_where(other)
    }

    /// Optional and where, short hand for `if c.is_some() q.and_where(c)`.
    fn and_where_option(&mut self, other: Option<SimpleExpr>) -> &mut Self {
        if let Some(other) = other {
            self.and_where(other);
        }
        self
    }

    // Trait implementation.
    fn and_or_where(&mut self, condition: LogicalChainOper) -> &mut Self;

    /// Where condition, expressed with `any` and `all`.
    /// Calling `cond_where` multiple times will conjoin them.
    /// Calling `or_where` after `cond_where` will panic.
    fn cond_where<C>(&mut self, condition: C) -> &mut Self
        where C: IntoCondition;
}

impl IntoCondition for SimpleExpr {
    fn into_condition(self) -> Condition {
        Condition::all().add(self)
    }
}

impl IntoCondition for Condition {
    fn into_condition(self) -> Condition {
        self
    }
}

impl ConditionHolder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn new_with_condition(condition: Condition) -> Self {
        let contents = ConditionHolderContents::Condition(condition);
        Self { contents }
    }

    pub fn is_empty(&self) -> bool {
        match &self.contents {
            ConditionHolderContents::Empty => true,
            ConditionHolderContents::Chain(c) => c.is_empty(),
            ConditionHolderContents::Condition(c) => c.conditions.is_empty(),
        }
    }

    pub fn is_one(&self) -> bool {
        match &self.contents {
            ConditionHolderContents::Empty => true,
            ConditionHolderContents::Chain(c) => c.len() == 1,
            ConditionHolderContents::Condition(c) => c.conditions.len() == 1,
        }
    }

    pub fn add_and_or(&mut self, condition: LogicalChainOper) {
        match &mut self.contents {
            ConditionHolderContents::Empty => {
                self.contents = ConditionHolderContents::Chain(vec![condition])
            }
            ConditionHolderContents::Chain(c) => c.push(condition),
            ConditionHolderContents::Condition(_) => {
                panic!("Cannot mix `and_where`/`or_where` and `cond_where` in statements")
            }
        }
    }

    pub fn add_condition(&mut self, mut addition: Condition) {
        match std::mem::take(&mut self.contents) {
            ConditionHolderContents::Empty => {
                self.contents = ConditionHolderContents::Condition(addition);
            }
            ConditionHolderContents::Condition(mut current) => {
                if current.condition_type == ConditionType::All && !current.negate {
                    if addition.condition_type == ConditionType::All && !addition.negate {
                        current.conditions.append(&mut addition.conditions);
                        self.contents = ConditionHolderContents::Condition(current);
                    } else {
                        self.contents = ConditionHolderContents::Condition(current.add(addition));
                    }
                } else {
                    self.contents = ConditionHolderContents::Condition(
                        Condition::all().add(current).add(addition),
                    );
                }
            }
            ConditionHolderContents::Chain(_) => {
                panic!("Cannot mix `and_where`/`or_where` and `cond_where` in statements")
            }
        }
    }
}
