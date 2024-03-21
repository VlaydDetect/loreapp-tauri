use std::collections::HashMap;
use std::sync::Arc;

use serde::{Serialize, Serializer};
use serde::ser::SerializeStruct;
use serde_with_macros::skip_serializing_none;
use surreal_qb::filter::{FilterNodes, finalize_list_options, ListOptions, OpValsString};
use surrealdb::sql::{Datetime, Object, Value};
use ts_rs::TS;

use crate::model::{DocumentBmc, Error, get_parent_id, Result};
use crate::model::{Document, DocumentFilter, vmap};
use crate::model::bmc_base::{Bmc, bmc_create, bmc_custom_multi_query, bmc_custom_solo_query, bmc_delete, bmc_get, bmc_list, bmc_update};
use crate::model::bmc_graph::{bmc_delete_edge, bmc_relate, bmc_rerelate_edge, GraphBmc};
use crate::model::ctx::Ctx;
use crate::model::store::{Creatable, Filterable, Patchable, vec_to_surreal_value};
use crate::prelude::f;

use super::store::x_take::XTake;

//#region ---------- Documents Folder -------------
#[derive(Debug, Serialize, Deserialize, Default, TS, Clone)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentsFolder {
    pub id: String,
    pub ctime: String,
    pub name: String,
    // pub documents: Vec<String>,
    // pub folders: Vec<String>,

    // TODO: Is it necessary?
    // pub tags: Option<Vec<String>>,
    // pub categories: Option<Vec<String>>,
}

impl TryFrom<Object> for DocumentsFolder {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<DocumentsFolder> {
        Ok(Self {
            id: val.x_take_val("id")?,
            ctime: val.x_take_val("ctime")?,
            name: val.x_take_val("name")?,
            // documents: val.x_take_val("documents")?,
            // folders: val.x_take_val("folders")?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct DocumentsFolders {
    id: String,
    r#in: String,
    out: String,
}

impl TryFrom<Object> for DocumentsFolders {
    type Error = Error;
    fn try_from(mut val: Object) -> Result<DocumentsFolders> {
        Ok(Self {
            id: val.x_take_val("id")?,
            r#in: val.x_take_val("in")?,
            out: val.x_take_val("out")?,
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct DocumentWithParent {
    document: Document,
    parent: Option<String>,
}

impl TryFrom<Object> for DocumentWithParent {
    type Error = Error;

    fn try_from(mut val: Object) -> Result<DocumentWithParent> {
        let document: Document = val.clone().try_into()?;

        Ok(DocumentWithParent {
            document,
            parent: get_parent_id(val),
        })
    }
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct DocumentsFolderWithParent {
    folder: DocumentsFolder,
    parent: Option<String>,
}

impl TryFrom<Object> for DocumentsFolderWithParent {
    type Error = Error;

    fn try_from(mut val: Object) -> Result<DocumentsFolderWithParent> {
        let folder: DocumentsFolder = val.clone().try_into()?;

        Ok(DocumentsFolderWithParent {
            folder,
            parent: get_parent_id(val),
        })
    }
}

#[derive(Debug, Serialize, Deserialize, TS, Clone, PartialEq)]
#[ts(export, export_to = "../src/interface/")]
pub enum DocumentsFolderChild {
    Document(Document),
    DocumentsFolder(DocumentsFolderNode)
}

#[derive(Debug, Serialize, Deserialize, Default, TS, Clone, PartialEq)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentsFolderNode {
    pub id: String,
    pub ctime: String,
    pub name: String,
    // pub documents: Vec<Document>,
    // pub folders: Vec<DocumentsFolderNode>,
    children: Vec<DocumentsFolderChild>
    // TODO: Is it necessary?
    // pub tags: Option<Vec<String>>,
    // pub categories: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Default, TS, PartialEq)]
#[ts(export, rename_all = "camelCase", export_to = "../src/interface/")]
#[serde(rename_all = "camelCase")]
pub struct DocumentsFolderTree {
    // root_folders: Vec<DocumentsFolderNode>,
    // root_documents: Vec<Document>,
    roots: Vec<DocumentsFolderChild>
}

pub fn build_folders_tree(
    mut dfwps: Vec<DocumentsFolderWithParent>,
    mut dwps: Vec<DocumentWithParent>,
) -> DocumentsFolderTree {
    fn recursive_loop<'a>(
        node: &'a mut DocumentsFolderNode,
        id: &String,
    ) -> Option<&'a mut DocumentsFolderNode> {
        if (node.id.eq(id)) {
            return Some(node);
        }

        // for child in node.folders.iter_mut() {
        //     if let Some(find) = recursive_loop(child, id) {
        //         return Some(find);
        //     }
        // }

        for child in node.children.iter_mut() {
            match child {
                DocumentsFolderChild::DocumentsFolder(folder) => {
                    if let Some(find) = recursive_loop(folder, id) {
                        return Some(find);
                    }
                },
                _ => {}
            }
        }

        None
    }

    let mut folders_map = HashMap::<String, DocumentsFolderNode>::new();
    let mut docs_map = HashMap::<String, Document>::new();

    let mut root_folders_ids = Vec::<String>::new();
    let mut root_docs_ids = Vec::<String>::new();

    for dfwp in &dfwps {
        folders_map.insert(
            dfwp.folder.id.clone(),
            DocumentsFolderNode {
                id: dfwp.folder.id.clone(),
                name: dfwp.folder.name.clone(),
                ctime: dfwp.folder.ctime.clone(),
                // documents: vec![],
                // folders: vec![],
                children: vec![],
            },
        );
        if dfwp.parent.is_none() {
            root_folders_ids.push(dfwp.folder.id.clone());
        }
    }

    for dwp in &dwps {
        docs_map.insert(dwp.document.id.clone(), dwp.document.clone());
        if dwp.parent.is_none() {
            root_docs_ids.push(dwp.document.id.clone());
        }
    }

    for dwp in dwps {
        if let Some(parent_id) = dwp.parent {
            if let Some(mut parent_node) = folders_map.remove(&parent_id) {
                // parent_node.documents.push(dwp.document.clone());
                parent_node.children.push(DocumentsFolderChild::Document(dwp.document.clone()));
                folders_map.insert(parent_id, parent_node);
            }
        }
    }

    for dfwp in dfwps {
        if let Some(parent_id) = dfwp.parent {
            if let Some(child_node) = folders_map.remove(&dfwp.folder.id) {
                if let Some(mut parent_node) = folders_map.remove(&parent_id) {
                    // parent_node.folders.push(child_node.clone());
                    parent_node.children.push(DocumentsFolderChild::DocumentsFolder(child_node.clone()));
                    folders_map.insert(parent_id, parent_node);
                } else {
                    for (_, node) in folders_map.iter_mut() {
                        if let Some(parent_node) = recursive_loop(node, &parent_id) {
                            // parent_node.folders.push(child_node.clone());
                            parent_node.children.push(DocumentsFolderChild::DocumentsFolder(child_node.clone()));
                        }
                    }
                }
            }
        }
    }

    let mut roots = Vec::<DocumentsFolderChild>::new();
    for id in root_folders_ids {
        if let Some(node) = folders_map.remove(&id) {
            roots.push(DocumentsFolderChild::DocumentsFolder(node));
        }
    }

    for id in root_docs_ids {
        if let Some(node) = docs_map.remove(&id) {
            roots.push(DocumentsFolderChild::Document(node));
        }
    }

    DocumentsFolderTree {
        roots
    }
}

#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentsFolderForCreate {
    pub name: String,
}

impl From<DocumentsFolderForCreate> for Value {
    fn from(val: DocumentsFolderForCreate) -> Self {
        let mut data = vmap!("name".into() => val.name.into());
        Value::Object(data.into())
    }
}

impl Creatable for DocumentsFolderForCreate {}

#[skip_serializing_none]
#[derive(Debug, Serialize, Deserialize, Default, TS)]
#[ts(export, export_to = "../src/interface/")]
pub struct DocumentsFolderForUpdate {
    pub name: Option<String>,
    pub documents: Option<Vec<String>>, // Use documents ids
    pub folders: Option<Vec<String>>,   // Use folders ids
}

impl From<DocumentsFolderForUpdate> for Value {
    fn from(val: DocumentsFolderForUpdate) -> Self {
        let mut data = vmap!();

        if let Some(name) = val.name {
            data.insert("name".into(), name.into());
        }

        if let Some(documents) = val.documents {
            data.insert("documents".into(), vec_to_surreal_value(documents.into()));
        }

        if let Some(folders) = val.folders {
            data.insert("documents".into(), vec_to_surreal_value(folders.into()));
        }

        data.into()
    }
}

impl Patchable for DocumentsFolderForUpdate {}

#[derive(FilterNodes, Debug, Deserialize, Default)]
pub struct DocumentsFolderFilter {
    pub id: Option<OpValsString>,
    pub ctime: Option<OpValsString>,
    pub name: Option<OpValsString>, // TODO: surrealdb full-text search
}

impl Filterable for DocumentsFolderFilter {}

pub struct DocumentsFolderBmc;

impl Bmc for DocumentsFolderBmc {
    const ENTITY: &'static str = "documentsFolder";
}

impl GraphBmc for DocumentsFolderBmc {
    const RELATION_ENTITY: &'static str = "documentsFolders";
}

impl DocumentsFolderBmc {
    pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<DocumentsFolder> {
        bmc_get(ctx, Self::ENTITY, id).await
    }

    pub async fn create(
        ctx: Arc<Ctx>,
        data: DocumentsFolderForCreate,
    ) -> Result<DocumentsFolder> {
        bmc_create(ctx, Self::ENTITY, data).await
    }

    pub async fn update(
        ctx: Arc<Ctx>,
        id: &str,
        data: DocumentsFolderForUpdate,
    ) -> Result<DocumentsFolder> {
        bmc_update(ctx, Self::ENTITY, id, data).await
    }

    pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<DocumentsFolder> {
        bmc_delete(ctx, Self::ENTITY, id).await
    }

    pub async fn list(
        ctx: Arc<Ctx>,
        filters: Option<Vec<DocumentFilter>>,
        list_options: Option<ListOptions>,
    ) -> Result<Vec<DocumentsFolder>> {
        let list_options = finalize_list_options(list_options)?;
        bmc_list(ctx, Self::ENTITY, filters, list_options).await
    }

    pub async fn create_unnamed(ctx: Arc<Ctx>) -> Result<DocumentsFolder> {
        let sql = "LET $count = (SELECT count(string::startsWith(name,\"unnamed\")) FROM documentsFolder GROUP ALL)[0].count;\
        IF $count = None THEN \
        (CREATE documentsFolder SET name = \"unnamed1\", ctime = $ctime) \
        ELSE \
        (CREATE documentsFolder SET name = string::concat(\"unnamed\", <string>($count+1)), ctime = $ctime) \
        END";
        let now = Datetime::default().to_string();
        let vars = vmap!("ctime".into() => now.into());
        let result = bmc_custom_multi_query::<DocumentsFolder>(ctx, Self::ENTITY, sql, Some(vars.into())).await?;

        result
            .into_iter()
            .next()
            .ok_or(Error::Store(crate::model::store::Error::ResponseIsEmpty))
    }

    pub async fn attach_folder_or_document(
        ctx: Arc<Ctx>,
        id: &str,
        sub_id: &str,
    ) -> Result<DocumentsFolderTree> {
        bmc_relate::<DocumentsFolders>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_tree(ctx).await
    }

    pub async fn detach_folder_or_document(
        ctx: Arc<Ctx>,
        id: &str,
        sub_id: &str,
    ) -> Result<DocumentsFolderTree> {
        bmc_delete_edge::<DocumentsFolders>(ctx.clone(), Self::RELATION_ENTITY, id, sub_id).await?;
        Self::list_tree(ctx).await
    }

    pub async fn reattach_folder_or_document(
        ctx: Arc<Ctx>,
        id: &str,
        from_id: Option<&str>,
        to_id: Option<&str>,
    ) -> Result<DocumentsFolderTree> {
        bmc_rerelate_edge::<DocumentsFolders>(
            ctx.clone(),
            Self::RELATION_ENTITY,
            id,
            from_id,
            to_id,
        )
        .await?;
        Self::list_tree(ctx).await
    }

    pub async fn list_tree(ctx: Arc<Ctx>) -> Result<DocumentsFolderTree> {
        let mut sql = f!("SELECT *, <-{}<-documentsFolder.id AS parent FROM documentsFolder ORDER BY id ASC;", Self::RELATION_ENTITY).into_boxed_str();

        // let mut vars = vmap!["tb".into() => Self::ENTITY.into()];
        let dfwps = bmc_custom_solo_query::<DocumentsFolderWithParent>(ctx.clone(), "", &sql, None).await?;
        println!("{dfwps:?}");

        // vars = vmap!["tb".into() => DocumentBmc::ENTITY.into()];
        sql = f!("SELECT *, <-{}<-document.id AS parent FROM document ORDER BY id ASC;", Self::RELATION_ENTITY).into_boxed_str();
        let dwps = bmc_custom_solo_query::<DocumentWithParent>(ctx.clone(), "", &sql, None).await?;
        println!("{dwps:?}");

        let tree = build_folders_tree(dfwps, dwps);
        Ok(tree)

    //     Ok(
    //         DocumentsFolderTree {
    //             roots: vec![
    //                 DocumentsFolderChild::Document(Document {
    //                     id: "document:d1".into(),
    //                     title: "D1".into(),
    //                     ctime: "".into(),
    //                     body: None,
    //                     tags: None,
    //                     categories: None,
    //                     used_pics: None,
    //                 }),
    //                 DocumentsFolderChild::DocumentsFolder(DocumentsFolderNode {
    //                     id: "documentsFolder:df1".to_string(),
    //                     ctime: "".to_string(),
    //                     name: "DF1".to_string(),
    //                     children: vec![
    //                         DocumentsFolderChild::DocumentsFolder(DocumentsFolderNode {
    //                             id: "documentsFolder:df2".to_string(),
    //                             ctime: "".to_string(),
    //                             name: "DF2".to_string(),
    //                             children: vec![],
    //                         }),
    //                         DocumentsFolderChild::Document(Document {
    //                             id: "document:d2".to_string(),
    //                             ctime: "".to_string(),
    //                             title: "D2".to_string(),
    //                             body: None,
    //                             tags: None,
    //                             categories: None,
    //                             used_pics: None,
    //                         })
    //                     ],
    //                 })
    //             ]
    //         }
    //     )
    }
}
//#endregion ---------- Documents Folder ----------

// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn test_folders_tree_build_1() {
//         let dfwps = vec![
//             DocumentsFolderWithParent {
//                 folder: DocumentsFolder {
//                     id: "documentsFolder:8aevtugsorhcjs3gcv3c".into(),
//                     name: "DF1".to_string(),
//                     ctime: "".to_string(),
//                 },
//                 parent: None,
//             },
//             DocumentsFolderWithParent {
//                 folder: DocumentsFolder {
//                     id: "documentsFolder:p0t3l8nfkxwd064qhjkh".into(),
//                     name: "SDF1".to_string(),
//                     ctime: "".to_string(),
//                 },
//                 parent: Some("documentsFolder:8aevtugsorhcjs3gcv3c".into()),
//             },
//             DocumentsFolderWithParent {
//                 folder: DocumentsFolder {
//                     id: "documentsFolder:qmmro25o7cuwxhotgtys".into(),
//                     name: "SSDF2".to_string(),
//                     ctime: "".to_string(),
//                 },
//                 parent: Some("documentsFolder:p0t3l8nfkxwd064qhjkh".into()),
//             },
//         ];
//
//         let dwps = vec![
//             DocumentWithParent {
//                 document: Document {
//                     id: "document:1".to_string(),
//                     title: "D1".to_string(),
//                     ctime: "".to_string(),
//                     body: None,
//                     tags: None,
//                     categories: None,
//                     used_pics: None,
//                 },
//                 parent: None,
//             },
//             DocumentWithParent {
//                 document: Document {
//                     id: "document:2".to_string(),
//                     title: "D2".to_string(),
//                     ctime: "".to_string(),
//                     body: None,
//                     tags: None,
//                     categories: None,
//                     used_pics: None,
//                 },
//                 parent: Some("documentsFolder:8aevtugsorhcjs3gcv3c".into()),
//             },
//             DocumentWithParent {
//                 document: Document {
//                     id: "document:3".to_string(),
//                     title: "D3".to_string(),
//                     ctime: "".to_string(),
//                     body: None,
//                     tags: None,
//                     categories: None,
//                     used_pics: None,
//                 },
//                 parent: Some("documentsFolder:qmmro25o7cuwxhotgtys".into()),
//             },
//         ];
//
//         let result_tree = build_folders_tree(dfwps, dwps);
//         let expected_result = DocumentsFolderTree {
//             root_documents: vec![Document {
//                 id: "document:1".to_string(),
//                 title: "D1".to_string(),
//                 ctime: "".to_string(),
//                 body: None,
//                 tags: None,
//                 categories: None,
//                 used_pics: None,
//             }],
//             root_folders: vec![DocumentsFolderNode {
//                 id: "documentsFolder:8aevtugsorhcjs3gcv3c".into(),
//                 name: "DF1".to_string(),
//                 ctime: "".to_string(),
//                 documents: vec![Document {
//                     id: "document:2".to_string(),
//                     title: "D2".to_string(),
//                     ctime: "".to_string(),
//                     body: None,
//                     tags: None,
//                     categories: None,
//                     used_pics: None,
//                 }],
//                 folders: vec![DocumentsFolderNode {
//                     id: "documentsFolder:p0t3l8nfkxwd064qhjkh".into(),
//                     name: "SDF1".to_string(),
//                     ctime: "".to_string(),
//                     documents: vec![],
//                     folders: vec![DocumentsFolderNode {
//                         id: "documentsFolder:qmmro25o7cuwxhotgtys".into(),
//                         name: "SSDF2".to_string(),
//                         ctime: "".to_string(),
//                         documents: vec![Document {
//                             id: "document:3".to_string(),
//                             title: "D3".to_string(),
//                             ctime: "".to_string(),
//                             body: None,
//                             tags: None,
//                             categories: None,
//                             used_pics: None,
//                         }],
//                         folders: vec![],
//                     }],
//                 }],
//             }],
//         };
//
//         println!("{result_tree:#?}");
//
//         assert_eq!(result_tree, expected_result);
//     }
// }
