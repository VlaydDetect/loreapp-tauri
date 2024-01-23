//! All model and controller for the Tags and Categories type

use std::collections::{BTreeMap, HashMap};
use std::sync::Arc;
use super::bmc_base::{Bmc, bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use super::store::x_take::XTake;
use crate::model::{Document, DocumentFilter, Error, Picture, PictureFilter, PictureForCreate, PictureForUpdate, Result, vmap};
use surreal_qb::filter::{FilterNodes, finalize_list_options, ListOptions, OpValsArray, OpValsString};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;
use crate::model::bmc_graph::{bmc_delete_edge, bmc_relate, GraphBmc};
use crate::model::ctx::Ctx;
use crate::prelude::f;
use crate::utils::LabelValue;
use rayon::prelude::*;

//#region -------------------------------- Categories --------------------------------
//#region -------------------------------- Relation Table --------------------------------
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct Categories {
    id: String,
    r#in: String,
    out: String,
}

impl TryFrom<Object> for Categories {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Categories> {
        let category = Categories {
            id: val.x_take_val("id")?,
            r#in: val.x_take_val("in")?,
            out: val.x_take_val("out")?,
        };

        Ok(category)
    }
}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
struct CategoryWithParent {
    category: Category,
    parent: Option<Category>,
}

impl TryFrom<Object> for CategoryWithParent {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<CategoryWithParent> {
        let category = Category {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
        };

        let mut parent: Option<Category> = None;
        let parent_obj = val.remove("parent");

        if let Some(parent_obj) = parent_obj {
            if let Value::Array(surrealdb::sql::Array(parent_obj_vec)) = parent_obj {
                if let Some(parent_obj) = parent_obj_vec.iter().next() {
                    if let Value::Object(mut parent_obj) = parent_obj.clone() {
                        parent = Some(Category {
                            id: parent_obj.x_take_val("id")?,
                            ctime: parent_obj.x_take_val("ctime")?,
                            name: parent_obj.x_take_val("name")?,
                        });
                    }
                }
            }
        }

        let with_parent = CategoryWithParent {
            category,
            parent,
        };

        Ok(with_parent)
    }
}

#[derive(Debug, Serialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoryNode {
    id: String,
    ctime: String,
    name: String,
    #[ts(type="CategoryNode[]")]
    children: Vec<CategoryNode>
}

#[derive(Debug, Serialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoriesTree {
    nodes: Vec<CategoryNode>
}

fn build_categories_tree(mut categories_with_parents: Vec<CategoryWithParent>) -> CategoriesTree {
    categories_with_parents.par_sort_by(|a, b| a.category.name.cmp(&b.category.name));
    categories_with_parents.reverse();

    let mut category_map: HashMap<String, CategoryNode> = HashMap::new();
    let mut root_categories: Vec<CategoryNode> = Vec::new();

    for CategoryWithParent { category, parent } in categories_with_parents {
        let node = category_map
            .entry(category.name.clone())
            .or_insert_with(|| CategoryNode {
                id: category.id.clone(),
                ctime: category.ctime.clone(),
                name: category.name.clone(),
                children: Vec::new(),
            }).clone();

        if let Some(parent) = parent {
            let parent_node = category_map
                .entry(parent.name.clone())
                .or_insert_with(|| CategoryNode {
                    id: parent.id.clone(),
                    ctime: parent.ctime.clone(),
                    name: parent.name.clone(),
                    children: Vec::new(),
                });

            parent_node.children.push(node.clone());
            // parent_node.children.sort_by(|a, b| a.name.cmp(&b.name));
        } else {
            root_categories.push(node.clone());
        }
    }

    // root_categories.sort_by(|a, b| a.name.cmp(&b.name));

    CategoriesTree {
        nodes: root_categories
    }
}
//#endregion -------------------------------- Relation Table --------------------------------

//#region -------------------------------- Category Table --------------------------------
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct Category {
    pub id: String,
    pub ctime: String,
    pub name: String,
}

impl TryFrom<Object> for Category {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Category> {
        let category = Category {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
        };

        Ok(category)
    }
}

#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoryForCreate {
    name: String,
}

impl From<CategoryForCreate> for Value {
    fn from(val: CategoryForCreate) -> Self {
        let mut data = vmap!["name".into() => val.name.into()];
        Value::Object(data.into())
    }
}

impl Creatable for CategoryForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoryForUpdate {
    name: Option<String>,
}

impl From<CategoryForUpdate> for Value {
    fn from(val: CategoryForUpdate) -> Self {
        let mut data = vmap!();
        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }
        Value::Object(data.into())
    }
}

impl Patchable for CategoryForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct CategoryFilter {
    pub ctime: Option<OpValsString>,
    pub name: Option<OpValsString>,
}

impl Filterable for CategoryFilter {}

pub struct CategoryBmc;

impl Bmc for CategoryBmc {
    const ENTITY: &'static str = "category";
}

impl GraphBmc for CategoryBmc {
    const RELATION_ENTITY: &'static str = "categories";
}

impl CategoryBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Category> {
        bmc_get::<Category>(ctx, Self::ENTITY, id).await
    }

    pub async fn create(ctx: Arc<Ctx>, data: CategoryForCreate) -> Result<Category> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: CategoryForUpdate) -> Result<Category> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<Category> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filters: Option<Vec<CategoryFilter>>) -> Result<Vec<Category>> {
        let list_options = ListOptions {
            limit: None,
            offset: None,
            order_bys: Some("ctime".into()),
        };
        bmc_list::<Category, _>(ctx, Self::ENTITY, filters, list_options).await
    }

    pub async fn attach_subcategory(ctx: Arc<Ctx>, id: &str, sub_id: &str) -> Result<CategoriesTree> {
        // FIXME: check if subcategory already attached to this category
        bmc_relate::<Categories>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_with_parent(ctx).await
    }

    pub async fn detach_subcategory(ctx: Arc<Ctx>, id: &str, sub_id: &str) -> Result<CategoriesTree> {
        bmc_delete_edge::<Categories>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_with_parent(ctx).await
    }

    pub async fn list_with_parent(ctx: Arc<Ctx>) -> Result<CategoriesTree> {
        let sql = f!("SELECT *, <-{}<-category.* AS parent FROM category ORDER BY id ASC;", Self::RELATION_ENTITY).into_boxed_str();
        let vars = vmap!["tb".into() => Self::RELATION_ENTITY.into()];
        let cwps = bmc_custom_solo_query::<CategoryWithParent>(ctx, Self::ENTITY, &sql, vars.into()).await?;
        Ok(build_categories_tree(cwps))
    }
}
//#endregion -------------------------------- Category Table --------------------------------
//#endregion -------------------------------- Categories --------------------------------

//#region -------------------------------- Tags --------------------------------
//#region -------------------------------- Tag Table --------------------------------
#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct Tag {
    id: String,
    ctime: String,
    name: String,
}

impl TryFrom<Object> for Tag {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<Tag> {
        let tag = Tag {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
        };

        Ok(tag)
    }
}

#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct TagForCreate {
    name: String,
}

impl From<TagForCreate> for Value {
    fn from(val: TagForCreate) -> Self {
        let mut data = vmap!["name".into() => val.name.into()];
        Value::Object(data.into())
    }
}

impl Creatable for TagForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct TagForUpdate {
    name: Option<String>,
}

impl From<TagForUpdate> for Value {
    fn from(val: TagForUpdate) -> Self {
        let mut data = vmap!();
        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }
        Value::Object(data.into())
    }
}

impl Patchable for TagForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct TagFilter {
    pub ctime: Option<OpValsString>,
    pub name: Option<OpValsString>,
}

impl Filterable for TagFilter {}

pub struct TagBmc;

impl Bmc for TagBmc {
    const ENTITY: &'static str = "tag";
}

impl TagBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Tag> {
        bmc_get::<Tag>(ctx, Self::ENTITY, id).await
    }

    // Returns the created Picture struct
    pub async fn create(ctx: Arc<Ctx>, data: TagForCreate) -> Result<Tag> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(ctx: Arc<Ctx>, id: &str, data: TagForUpdate) -> Result<Tag> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<Tag> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(ctx: Arc<Ctx>, filters: Option<Vec<TagFilter>>, list_options: Option<ListOptions>) -> Result<Vec<Tag>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list(ctx, Self::ENTITY, filters, list_options).await
    }
}
//#endregion -------------------------------- Tag Table --------------------------------
//#endregion -------------------------------- Tags --------------------------------
