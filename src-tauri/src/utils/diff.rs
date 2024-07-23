use serde::{Deserialize, Serialize};
use crate::{Result, Error};
use serde_diff::{Apply, Diff, SerdeDiff};
use crate::prelude::f;

pub fn apply_diff<T>(old: &mut T, new: &T) -> Result<()>
    where T: Serialize + for<'a> Deserialize<'a> + SerdeDiff
{
    let json_diff_data = serde_json::to_string(&Diff::serializable(old, new))?;
    let mut deserializer = serde_json::Deserializer::from_str(&json_diff_data);
    Apply::apply(&mut deserializer, old).map_err(|ex| Error::Other(f!("serde_diff deserializer apply error: {ex}")))
}