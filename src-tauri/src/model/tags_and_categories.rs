//! All model and controller for the Tags and Categories type

use std::collections::{BTreeMap, HashMap};
use std::sync::Arc;
use super::bmc_base::{Bmc, bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use super::store::x_take::XTake;
use crate::model::{Document, DocumentFilter, Error, get_parent_id, Picture, PictureFilter, PictureForCreate, PictureForUpdate, Result, vmap};
use surreal_qb::filter::{FilterNodes, finalize_list_options, ListOptions, OpValsArray, OpValsString};
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use surrealdb::sql::{Datetime, Object, Value};
use ts_rs::TS;
use crate::model::bmc_graph::{bmc_delete_edge, bmc_relate, bmc_rerelate_edge, GraphBmc};
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
        Ok(Self {
            id: val.x_take_val("id")?,
            r#in: val.x_take_val("in")?,
            out: val.x_take_val("out")?,
        })
    }
}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoryWithParent {
    pub category: Category,
    pub parent: Option<String>,
}

impl TryFrom<Object> for CategoryWithParent {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<CategoryWithParent> {
        let category = Category {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
        };

        let with_parent = CategoryWithParent {
            category,
            parent: get_parent_id(val),
        };

        Ok(with_parent)
    }
}

#[derive(Debug, Serialize, Default, TS, Clone, PartialEq)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoryNode {
    id: String,
    ctime: String,
    name: String,
    #[ts(type="CategoryNode[]")]
    children: Vec<CategoryNode>
}

#[derive(Debug, Serialize, Default, TS, PartialEq)]
#[ts(export, export_to = "../src/interface/")]
pub struct CategoriesTree {
    nodes: Vec<CategoryNode>
}

pub fn build_categories_tree(mut cwps: Vec<CategoryWithParent>) -> CategoriesTree {
    fn recursive_loop<'a>(node: &'a mut CategoryNode, id: &String) -> Option<&'a mut CategoryNode> {
        if (node.id.eq(id)) { return Some(node); }

        for child in node.children.iter_mut() {
            if let Some(find) = recursive_loop(child, id) {
                return Some(find);
            }
        }

        None
    };

    let mut categories_map = HashMap::<String, CategoryNode>::new();
    let mut root_ids = Vec::<String>::new();

    for cwp in &cwps {
        categories_map.insert(cwp.category.id.clone(), CategoryNode {
            id: cwp.category.id.clone(),
            name: cwp.category.name.clone(),
            ctime: cwp.category.ctime.clone(),
            children: vec![],
        });
        if cwp.parent.is_none() {
            root_ids.push(cwp.category.id.clone());
        }
    }

    for cwp in cwps {
        if let Some(parent_id) = cwp.parent {
            if let Some(child_node) = categories_map.remove(&cwp.category.id) {
                if let Some(mut parent_node) = categories_map.remove(&parent_id) {
                    parent_node.children.push(child_node.clone());
                    categories_map.insert(parent_id, parent_node);
                } else {
                    for (_, node) in categories_map.iter_mut() {
                        if let Some(parent_node) = recursive_loop(node, &parent_id) {
                            parent_node.children.push(child_node.clone());
                        }
                    }
                }
            }
        }
    }

    let mut root_nodes = Vec::<CategoryNode>::new();

    for id in root_ids {
        if let Some(node) = categories_map.remove(&id) {
            root_nodes.push(node);
        }
    }

    CategoriesTree {
        nodes: root_nodes,
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

    pub async fn create_new_category(ctx: Arc<Ctx>) -> Result<Category> {
        let sql = "LET $count = (SELECT count(string::startsWith(name,\"New Category\")) FROM category GROUP ALL)[0].count;\
        IF $count = None THEN \
        (CREATE category SET name = \"New Category 1\", ctime = $ctime) \
        ELSE \
        (CREATE category SET name = string::concat(\"New Category \", <string>($count+1)), ctime = $ctime) \
        END";

        let now = Datetime::default().to_string();
        let vars = vmap!("ctime".into() => now.into());
        let result = bmc_custom_multi_query::<Category>(ctx, Self::ENTITY, sql, Some(vars.into())).await?;

        result
            .into_iter()
            .next()
            .ok_or(Error::Store(crate::model::store::Error::ResponseIsEmpty))
    }

    pub async fn attach_subcategory(ctx: Arc<Ctx>, id: &str, sub_id: &str) -> Result<CategoriesTree> {
        // FIXME: check if subcategory already attached to this category
        bmc_relate::<Categories>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_tree(ctx).await
    }

    pub async fn detach_subcategory(ctx: Arc<Ctx>, id: &str, sub_id: &str) -> Result<CategoriesTree> {
        bmc_delete_edge::<Categories>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_tree(ctx).await
    }

    pub async fn reattach_subcategory(ctx: Arc<Ctx>, id: &str, from_id: Option<&str>, to_id: Option<&str>) -> Result<CategoriesTree> {
        bmc_rerelate_edge::<Categories>(ctx.clone(), Self::RELATION_ENTITY, id, from_id, to_id).await?;
        Self::list_tree(ctx).await
    }

    pub async fn list_tree(ctx: Arc<Ctx>) -> Result<CategoriesTree> {
        let sql = f!("SELECT *, <-{}<-category.id AS parent FROM category ORDER BY id ASC;", Self::RELATION_ENTITY).into_boxed_str();
        // let vars = vmap!["tb".into() => Self::ENTITY.into()];
        let cwps = bmc_custom_solo_query::<CategoryWithParent>(ctx, Self::ENTITY, &sql, None).await?;
        let tree = build_categories_tree(cwps);
        Ok(tree)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_categories_tree_build_1() {
        let cwps = vec![
            CategoryWithParent {
                category: Category {
                    id: "category:8aevtugsorhcjs3gcv3c".into(),
                    name: "C1".into(),
                    ctime: "".into(),
                },
                parent: None
            },
            CategoryWithParent {
                category: Category {
                    id: "category:p0t3l8nfkxwd064qhjkh".into(),
                    name: "C2".into(),
                    ctime: "".into(),
                },
                parent: Some("category:8aevtugsorhcjs3gcv3c".into())
            },
            CategoryWithParent {
                category: Category {
                    id: "category:qmmro25o7cuwxhotgtys".into(),
                    name: "SC1".into(),
                    ctime: "".into(),
                },
                parent: Some("category:p0t3l8nfkxwd064qhjkh".into())
            },
        ];

        let result_tree = build_categories_tree(cwps);
        let expected_result = CategoriesTree {
            nodes: vec![
                CategoryNode {
                    id: "category:8aevtugsorhcjs3gcv3c".into(),
                    ctime: "".into(),
                    name: "C1".into(),
                    children: vec![
                        CategoryNode {
                            id: "category:p0t3l8nfkxwd064qhjkh".into(),
                            name: "C2".into(),
                            ctime: "".into(),
                            children: vec![
                                CategoryNode {
                                    id: "category:qmmro25o7cuwxhotgtys".into(),
                                    name: "SC1".into(),
                                    ctime: "".into(),
                                    children: vec![]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        assert_eq!(result_tree, expected_result);
    }

    // #[test]
    // fn test_tree_build_2() {
    //     let cwps = vec![
    //         CategoryWithParent {
    //             category: Category {
    //                 id: "category:8aevtugsorhcjs3gcv3c".into(),
    //                 name: "C1".into(),
    //                 ctime: "".into(),
    //             },
    //             parent: None
    //         },
    //         CategoryWithParent {
    //             category: Category {
    //                 id: "category:p0t3l8nfkxwd064qhjkh".into(),
    //                 name: "C2".into(),
    //                 ctime: "".into(),
    //             },
    //             parent: Some(Category {
    //                 id: "category:8aevtugsorhcjs3gcv3c".into(),
    //                 name: "C1".into(),
    //                 ctime: "".into(),
    //             },)
    //         },
    //         CategoryWithParent {
    //             category: Category {
    //                 id: "category:qmmro25o7cuwxhotgtys".into(),
    //                 name: "SC1".into(),
    //                 ctime: "".into(),
    //             },
    //             parent: Some(Category {
    //                 id: "category:p0t3l8nfkxwd064qhjkh".into(),
    //                 name: "C2".into(),
    //                 ctime: "".into(),
    //             })
    //         },
    //     ];
    //
    //     let result_tree = build_categories_tree(cwps);
    //     let expected_result = CategoriesTree {
    //         nodes: vec![
    //             CategoryNode {
    //                 id: "category:8aevtugsorhcjs3gcv3c".into(),
    //                 ctime: "".into(),
    //                 name: "C1".into(),
    //                 children: vec![
    //                     CategoryNode {
    //                         id: "category:p0t3l8nfkxwd064qhjkh".into(),
    //                         name: "C2".into(),
    //                         ctime: "".into(),
    //                         children: vec![
    //                             CategoryNode {
    //                                 id: "category:qmmro25o7cuwxhotgtys".into(),
    //                                 name: "SC1".into(),
    //                                 ctime: "".into(),
    //                                 children: vec![]
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     assert_eq!(result_tree, expected_result);
    // }
}
