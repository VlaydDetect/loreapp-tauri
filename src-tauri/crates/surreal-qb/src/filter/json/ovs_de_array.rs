use super::ovs_json::OpValueToOpValType;
use crate::filter::{OpValArray, OpValsArray};
use serde::{de::MapAccess, de::Visitor, Deserialize, Deserializer};
use serde_json::Value;
use std::fmt;
use serde::de::SeqAccess;

impl<'de> Deserialize<'de> for OpValsArray {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: Deserializer<'de>,
    {
        deserializer.deserialize_any(crate::filter::json::ovs_de_array::ArrayOpValsVisitor)
    }
}

struct ArrayOpValsVisitor;

impl<'de> Visitor<'de> for crate::filter::json::ovs_de_array::ArrayOpValsVisitor {
    type Value = OpValsArray; // for deserialize

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        write!(formatter, "ArrayOpValsVisitor visitor not implemented for this type.")
    }

    fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
        where
            A: SeqAccess<'de>
    {
        println!("visit_seq");
        let mut array = Vec::<surrealdb::sql::Value>::new();

        while let Some(elem) = seq.next_element::<Value>()? {
            array.push(surrealdb::sql::json(elem.to_string().as_str()).unwrap());
        }

        Ok(OpValArray::Eq(array.into()).into())
    }

    fn visit_map<M>(self, mut map: M) -> Result<Self::Value, M::Error>
        where
            M: MapAccess<'de>,
    {
        let mut opvals: Vec<OpValArray> = Vec::new();

        while let Some(k) = map.next_key::<String>()? {
            // Note: Important to always call next_value
            let value = map.next_value::<Value>()?;
            let opval = OpValArray::op_value_to_op_val_type(&k, value).map_err(serde::de::Error::custom)?;
            opvals.push(opval)
        }

        println!("opvals: {opvals:#?}");

        Ok(OpValsArray(opvals))
    }
}
