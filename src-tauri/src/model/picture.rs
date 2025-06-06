//! All model and controller for the Item type
//!

use super::bmc_base::{
    bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list,
    bmc_update, Bmc,
};
use super::store::x_take::XTake;
use super::store::{vec_to_surreal_value, Creatable, Filterable, Patchable};
use super::{vmap, ModelMutateResultData};
use crate::fs::read_file_as_data_url;
use crate::model::ctx::Ctx;
use crate::model::{Category, Error, Result, Tag, TagBmc};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surreal_qb::filter::{
    finalize_list_options, FilterNodes, ListOptions, OpValsArray, OpValsString,
};
use surrealdb::sql::{thing, Object, Value};
use ts_gen::TS;

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct PicturePrototype {
    pub id: String,
    pub ctime: String,
    pub path: String, // TODO: this can be either a DataURL or an absolute path to the file (under development)
    pub name: Option<String>,
    pub desc: Option<String>,
    pub tags: Option<Vec<String>>,
    pub categories: Option<Vec<String>>,
}

impl TryFrom<Object> for PicturePrototype {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<PicturePrototype> {
        let picture = PicturePrototype {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            path: val.x_take_val("path")?,
            name: val.x_take("name")?,
            desc: val.x_take("desc")?,
            tags: val.x_take("tags")?,
            categories: val.x_take("categories")?,
        };

        Ok(picture)
    }
}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export)]
pub struct Picture {
    pub id: String,
    pub ctime: String,
    pub path: String, // TODO: this can be either a DataURL or an absolute path to the file (under development)
    pub name: Option<String>,
    pub desc: Option<String>,
    pub tags: Option<Vec<Tag>>,
    pub categories: Option<Vec<Category>>,
}

#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export)]
pub struct PictureForCreate {
    pub path: String,
    pub name: Option<String>,
}

impl From<PictureForCreate> for Value {
    fn from(val: PictureForCreate) -> Self {
        let mut data = vmap!["path".into() => val.path.into()];

        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }

        Value::Object(data.into())
    }
}

impl Creatable for PictureForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export)]
pub struct PictureForUpdate {
    pub name: Option<String>,
    pub desc: Option<String>,
    pub categories: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
}

impl From<PictureForUpdate> for Value {
    fn from(val: PictureForUpdate) -> Self {
        let mut data = vmap!();
        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }
        if let Some(desc) = val.desc {
            data.insert("desc".into(), desc.into());
        }
        if let Some(tags) = val.tags {
            data.insert("tags".into(), vec_to_surreal_value(tags.into()));
        }
        if let Some(categories) = val.categories {
            data.insert("categories".into(), vec_to_surreal_value(categories.into()));
        }
        Value::Object(data.into())
    }
}

impl Patchable for PictureForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct PictureFilter {
    pub id: Option<OpValsString>,
    pub ctime: Option<OpValsString>,
    pub name: Option<OpValsString>, // TODO: surrealdb full-text search
    pub desc: Option<OpValsString>, // TODO: surrealdb full-text search
    pub tags: Option<OpValsArray>,
    pub categories: Option<OpValsArray>,
}

impl Filterable for PictureFilter {}

pub struct PictureBmc;

impl Bmc for PictureBmc {
    const ENTITY: &'static str = "picture";
}

impl PictureBmc {
    async fn make_picture(ctx: Arc<Ctx>, prototype: PicturePrototype) -> Result<Picture> {
        let mut picture_categories: Option<Vec<Category>> = None;
        let mut picture_tags: Option<Vec<Tag>> = None;

        if let Some(categories) = prototype.categories {
            if !categories.is_empty() {
                let sql = "SELECT * FROM $categories;";

                let mut things: Vec<Value> = vec![];
                for c in categories.iter() {
                    let thing = thing(c).map_err(|ex| Error::Store(ex.into()))?;
                    things.push(thing.into());
                }

                let vars = vmap!("categories".into() => things.into());
                let result = bmc_custom_solo_query::<Category>(
                    ctx.clone(),
                    Self::ENTITY,
                    sql,
                    Some(vars.into()),
                )
                .await?;
                picture_categories = Some(result);
            }
        }

        if let Some(tags) = prototype.tags {
            if !tags.is_empty() {
                let sql = "SELECT * FROM $tags;";

                let mut things: Vec<Value> = vec![];
                for t in tags.iter() {
                    let thing = thing(t).map_err(|ex| Error::Store(ex.into()))?;
                    things.push(thing.into());
                }

                let vars = vmap!("tags".into() => things.into());
                let result =
                    bmc_custom_solo_query::<Tag>(ctx.clone(), Self::ENTITY, sql, Some(vars.into()))
                        .await?;
                picture_tags = Some(result);
            }
        }

        Ok(Picture {
            id: prototype.id,
            ctime: prototype.ctime,
            path: prototype.path,
            name: prototype.name,
            desc: prototype.desc,
            categories: picture_categories,
            tags: picture_tags,
        })
    }

    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        let prototype = bmc_get::<PicturePrototype>(ctx.clone(), Self::ENTITY, id).await?;
        Self::make_picture(ctx, prototype).await
    }

    /// Returns the created Picture struct
    pub async fn create(ctx: Arc<Ctx>, data: PictureForCreate) -> Result<Picture> {
        let prototype = bmc_create::<PicturePrototype, _>(ctx.clone(), Self::ENTITY, data).await?;
        Self::make_picture(ctx, prototype).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: PictureForUpdate) -> Result<Picture> {
        let prototype =
            bmc_update::<PicturePrototype, _>(ctx.clone(), Self::ENTITY, id, data).await?;
        Self::make_picture(ctx, prototype).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        let prototype = bmc_delete::<PicturePrototype>(ctx.clone(), Self::ENTITY, id).await?;
        Self::make_picture(ctx, prototype).await
    }

    pub async fn list(
        ctx: Arc<Ctx>,
        filter: Option<Vec<PictureFilter>>,
        list_options: Option<ListOptions>,
    ) -> Result<Vec<Picture>> {
        let list_options = finalize_list_options(list_options)?;
        let prototypes =
            bmc_list::<PicturePrototype, _>(ctx.clone(), Self::ENTITY, filter, list_options)
                .await?;
        let mut result: Vec<Picture> = vec![];
        for p in prototypes.iter() {
            let pic = Self::make_picture(ctx.clone(), p.clone()).await?;
            result.push(pic);
        }
        Ok(result)
    }

    pub async fn get_with_url(ctx: Arc<Ctx>, id: &str) -> Result<Picture> {
        let pic = Self::get(ctx, id).await?;
        let data_url =
            read_file_as_data_url(pic.path).map_err(|ex| Error::Other(ex.to_string()))?;

        Ok(Picture {
            path: data_url,
            ..pic
        })
    }

    pub async fn list_with_urls(
        ctx: Arc<Ctx>,
        filter: Option<Vec<PictureFilter>>,
        list_options: Option<ListOptions>,
    ) -> Result<Vec<Picture>> {
        let mut pics = Self::list(ctx, filter, list_options).await?;

        for pic in &mut pics {
            pic.path =
                read_file_as_data_url(&pic.path).map_err(|ex| Error::Other(ex.to_string()))?;
        }

        Ok(pics)
    }

    pub async fn get_document_used_in(ctx: Arc<Ctx>, id: &str) -> Result<Vec<String>> {
        let sql = "SELECT id FROM type::table($tb) WHERE $id IN used_pics;";
        let vars = vmap!["tb".into() => "document".into(), "id".into() => id.into()];
        let result = bmc_custom_solo_query::<ModelMutateResultData>(
            ctx,
            Self::ENTITY,
            sql,
            Some(vars.into()),
        )
        .await?;

        Ok(result.into_iter().map(|v| v.id).collect())
    }

    pub async fn custom_solo_query(
        ctx: Arc<Ctx>,
        sql: &str,
        vars: Option<Object>,
    ) -> Result<Vec<PicturePrototype>> {
        bmc_custom_solo_query::<PicturePrototype>(ctx, Self::ENTITY, sql, vars).await
    }

    pub async fn custom_multi_query(
        ctx: Arc<Ctx>,
        sqls: &str,
        vars: Option<Object>,
    ) -> Result<Vec<PicturePrototype>> {
        bmc_custom_multi_query::<PicturePrototype>(ctx, Self::ENTITY, sqls, vars).await
    }
}

// #[cfg(test)]
// mod tests {
//     use serde_json::json;
//     use crate::model::PictureFilter;
//
//     #[test]
//     fn test_pictures_filtered_listing() {
//         let filter: Vec<PictureFilter> = vec![
//             serde_json::from_value(json!([
//                 {
//                     "categories": {
//                         "$contains": "C1",
//                     }
//                 }
//             ])).unwrap()
//         ];
//     }
// }
