use crate::{ConditionHolder, IntoCondition, SimpleExpr};

#[derive(Debug, Clone, Default, PartialEq)]
pub struct OnDuplicate {
    pub(crate) target: Option<OnDuplicateTarget>,
    pub(crate) target_where: ConditionHolder,
    pub(crate) action: Option<OnDuplicateAction>,
    pub(crate) action_where: ConditionHolder,
}

/// Represents ON CONFLICT (upsert) targets
#[derive(Debug, Clone, PartialEq)]
pub enum OnDuplicateTarget {
    /// A list of columns with unique constraint
    DuplicateColumns(Vec<String>),
}

/// Represents ON CONFLICT (upsert) actions
#[derive(Debug, Clone, PartialEq)]
pub enum OnDuplicateAction {
    /// Do nothing
    DoNothing,
    /// Update column value of existing row
    Update(Vec<OnDuplicateUpdate>),
}

/// Represents strategies to update column in ON CONFLICT (upsert) actions
#[derive(Debug, Clone, PartialEq)]
pub enum OnDuplicateUpdate {
    /// Update column value of existing row with inserting value
    Column(String),
    /// Update column value of existing row with expression
    Expr(String, SimpleExpr),
}

impl OnDuplicate {
    /// Create a ON CONFLICT expression without target column,
    /// a special method designed for MySQL
    pub fn new() -> Self {
        Default::default()
    }

    /// Set ON CONFLICT target column
    pub fn column(column: String) -> Self
    {
        Self::columns([column])
    }

    /// Set ON CONFLICT target columns
    pub fn columns<I>(columns: I) -> Self
        where I: IntoIterator<Item = String>,
    {
        Self {
            target: Some(OnDuplicateTarget::DuplicateColumns(
                columns.into_iter().map(|c| c).collect()
            )),
            target_where: ConditionHolder::new(),
            action: None,
            action_where: ConditionHolder::new(),
        }
    }

    pub fn do_nothing(&mut self) -> &mut Self {
        self.action = Some(OnDuplicateAction::DoNothing);
        self
    }

    /// Set ON CONFLICT update column
    pub fn update_column(&mut self, column: String) -> &mut Self
    {
        self.update_columns([column])
    }

    /// Set ON CONFLICT update columns
    pub fn update_columns<I>(&mut self, columns: I) -> &mut Self
        where I: IntoIterator<Item = String>,
    {
        let mut update_strats: Vec<OnDuplicateUpdate> = columns
            .into_iter()
            .map(|x| OnDuplicateUpdate::Column(x))
            .collect();

        match &mut self.action {
            Some(OnDuplicateAction::Update(v)) => {
                v.append(&mut update_strats);
            }
            Some(OnDuplicateAction::DoNothing) | None => {
                self.action = Some(OnDuplicateAction::Update(update_strats));
            }
        };
        self
    }

    /// Set ON CONFLICT update exprs
    pub fn values<I>(&mut self, values: I) -> &mut Self
        where I: IntoIterator<Item = (String, SimpleExpr)>,
    {
        let mut update_exprs: Vec<OnDuplicateUpdate> = values
            .into_iter()
            .map(|(c, e)| OnDuplicateUpdate::Expr(c, e))
            .collect();

        match &mut self.action {
            Some(OnDuplicateAction::Update(v)) => {
                v.append(&mut update_exprs);
            }
            Some(OnDuplicateAction::DoNothing) | None => {
                self.action = Some(OnDuplicateAction::Update(update_exprs));
            }
        };
        self
    }

    /// Set ON CONFLICT update value
    pub fn value<T>(&mut self, col: String, value: T) -> &mut Self
        where T: Into<SimpleExpr>,
    {
        self.values([(col, value.into())])
    }

    /// Set target WHERE
    pub fn target_and_where(&mut self, other: SimpleExpr) -> &mut Self {
        self.target_cond_where(other)
    }

    /// Set target WHERE
    pub fn target_and_where_option(&mut self, other: Option<SimpleExpr>) -> &mut Self {
        if let Some(other) = other {
            self.target_cond_where(other);
        }
        self
    }

    /// Set target WHERE
    pub fn target_cond_where<C>(&mut self, condition: C) -> &mut Self
        where
            C: IntoCondition,
    {
        self.target_where.add_condition(condition.into_condition());
        self
    }

    /// Set action WHERE
    pub fn action_and_where(&mut self, other: SimpleExpr) -> &mut Self {
        self.action_cond_where(other)
    }

    /// Set action WHERE
    pub fn action_and_where_option(&mut self, other: Option<SimpleExpr>) -> &mut Self {
        if let Some(other) = other {
            self.action_cond_where(other);
        }
        self
    }

    /// Set action WHERE
    pub fn action_cond_where<C>(&mut self, condition: C) -> &mut Self
        where
            C: IntoCondition,
    {
        self.action_where.add_condition(condition.into_condition());
        self
    }
}
