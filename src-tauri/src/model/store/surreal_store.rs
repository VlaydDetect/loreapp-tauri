//! Small store layer to talk to the SurrealDB.
//!
//! This module is to narrow and normalize the surrealdb API surface
//! to the rest of the application code (.e.g, Backend Model Controllers)

use std::fmt::Debug;
use crate::model::store::{Error, Result};
use surreal_qb::filter::{FilterGroups, ListOptions};
use crate::model::store::{Creatable, Patchable};
use crate::prelude::*;
use serde::de::DeserializeOwned;
use serde::Serialize;
use surrealdb::{Surreal, engine::local::{Db, RocksDb}};
use surrealdb::sql::{Array, Datetime, Object, thing, Value};
use crate::fs::{path_to_string, get_user_path};
use surrealdb::Response;
use crate::model::vmap;

// --- Store definition and implementation
//     Note: This is used to normalize the store access for what is
//           needed for this application.

/// Store struct normalizing CRUD SurrealDB application calls
pub(in crate::model) struct SurrealStore {
    db: Box<Surreal<Db>>,
}

impl SurrealStore {
    pub(in crate::model) async fn new() -> Result<Self> {
        let db_path = format!("{}/loreapp.db", path_to_string(&get_user_path()));
        let surreal_db = Surreal::new::<RocksDb>(db_path).await.map_err(|ex| Error::FailToCreateDb(ex.to_string()))?;
        surreal_db.use_ns("loreapp_namespace").use_db("loreapp_database").await.map_err(|ex| Error::FailToCreateDb(ex.to_string()))?;
        Ok(Self { db: Box::new(surreal_db) })
    }

    pub(in crate::model) async fn exec_get(&self, tid: &str) -> Result<Object> {
        let sql = "SELECT * FROM $tid";
        let vars = vmap!["tid".into() => tid.into()];
        let mut ress = self.db.query(sql).bind(vars).await?;

        solo_response_to_object_vec(ress)?.into_iter().next().ok_or_else(|| Error::UnresolvableResponse("Response is empty")).into()
    }

    pub(in crate::model) async fn exec_create<T>(&self, tb: &str, data: T) -> Result<Object>
        where T: Creatable + Sync + Send + DeserializeOwned + Serialize,
    {
        let sql = "CREATE type::table($tb) CONTENT $data;";

        // let vars = vmap!["tb".into() => tb.into(),"data".into() => data.into()];
        // println!("vars: {:?}", vars);
        let mut data: Object = W(data.into()).try_into()?;
        let now = Datetime::default().to_string();
        data.insert("ctime".into(), now.into());
        self.db.set("tb", tb).await?;
        self.db.set("data", data).await?;

        let mut ress = self.db.query(sql).await?;

        self.db.unset("tb").await?;
        self.db.unset("data").await?;

        solo_response_to_object_vec(ress)?.into_iter().next().ok_or_else(|| Error::UnresolvableResponse("Response is empty")).into()
    }

    pub(in crate::model) async fn exec_merge<T>(&self, tid: &str, data: T) -> Result<Object>
        where T: Patchable + Sync + Send + DeserializeOwned + Serialize
    {
        let sql = "UPDATE $tid MERGE $data";
        let vars = vmap!["tid".into() => tid.into(),"data".into() => data.into()];

        let mut ress = self.db.query(sql).bind(vars).await?;

        solo_response_to_object_vec(ress)?.into_iter().next().ok_or_else(|| Error::UnresolvableResponse("Response is empty")).into()
    }

    pub(in crate::model) async fn exec_delete(&self, tid: &str) -> Result<Object> {
        let sql = "DELETE $tid";
        let vars = vmap!["tid".into() => thing(tid)?.into()];

        let mut ress = self.db.query(sql).bind(vars).await?;

        solo_response_to_object_vec(ress)?.into_iter().next().ok_or_else(|| Error::UnresolvableResponse("Response is empty")).into()
    }

    pub(in crate::model) async fn exec_select<F: Into<FilterGroups>>(&self, tb: &str, filter_groups: Option<F>, list_options: ListOptions) -> Result<Vec<Object>> {
        let (sql, vars) = surreal_qb::build_query::build_select_query(tb.to_string(), filter_groups, list_options);
        // let filter_or_groups = filter_groups.map(|v| v.into());
        // let (sql, vars) = build_select_query(tb, filter_or_groups, list_options)?;
        println!("exec_select SQL: {:?}", sql);
        println!("exec_select VARS: {:#?}", vars);

        let mut ress = self.db.query(&sql).bind(vars).await?;
        println!("exec_select Response: {:#?}", ress);

        solo_response_to_object_vec(ress)
    }

    pub(crate) async fn exec_index() {
        let sql = "";
    }

    pub(crate) fn db(self) -> Box<Surreal<Db>> {
        self.db
    }

    pub(in crate::model) async fn exec_custom_solo_query(&self, sql: &str, vars: Object) -> Result<Vec<Object>> {
        let mut ress = self.db.query(sql).bind(vars).await?;
        solo_response_to_object_vec(ress)
    }

    pub(in crate::model) async fn exec_custom_multi_query(&self, sqls: &str, vars: Object, to_take: usize) -> Result<Vec<Object>> {
        let mut ress = self.db.query(sqls).bind(vars).await?;
        multi_response_to_object_vec(ress, to_take)
    }
}

fn solo_response_to_object_vec(mut response: Response) -> Result<Vec<Object>> {
    let ress: Value = response.take(0)?;
    response_to_object_vec(ress)
}

fn multi_response_to_object_vec(mut response: Response, to_take: usize) -> Result<Vec<Object>> {
    let ress: Value = response.take(to_take)?;
    response_to_object_vec(ress)
}

fn response_to_object_vec(value: Value) -> Result<Vec<Object>> {
    if let Value::Array(Array(val)) = value {
        match val.into_iter().map(|x| W(x).try_into()).collect() {
            Ok(val) => {
                println!("response_to_object_vec ress var: {:#?}", val);
                Ok(val)
            },
            Err(err) => Err(err.into())
        }
    } else {
        Err(Error::UnresolvableResponse("Response is not valid"))
    }
}


// #[cfg(test)]
// mod tests {
//     use modql::filter::*;
//     use std::sync::Arc;
//     use tokio::sync::OnceCell;
//
//     use crate::model::ModelStore;
//     use crate::utils::XTake;
//     use modql::ListOptions;
//
//     static STORE_ONCE: OnceCell<Arc<ModelStore>> = OnceCell::const_new();
//
//     /// Initialize store once for this unit test group.
//     /// Will panic if can't create store.
//     async fn get_shared_test_store() -> Arc<ModelStore> {
//         STORE_ONCE
//             .get_or_init(|| async {
//                 // create and seed the store
//                 let model_manager = ModelStore::new().await.unwrap();
//
//                 crate::model::seed_store_for_dev(model_manager.clone())
//                     .await
//                     .unwrap();
//                 model_manager
//             })
//             .await
//             .clone()
//     }
//
//     #[derive(Debug, FilterNodes)]
//     struct ProjectFilter {
//         pub id: Option<OpValsInt64>,
//         pub name: Option<OpValsString>,
//         pub some_other: Option<OpValsString>,
//     }
//
//     #[derive(Debug, FilterNodes)]
//     struct TaskFilter {
//         pub project_id: Option<OpValsString>,
//         pub title: Option<OpValsString>,
//         pub done: Option<OpValsBool>,
//         pub desc: Option<OpValsString>,
//     }
//
//     #[test]
//     fn test_surreal_build_select_query() -> anyhow::Result<()> {
//         let filter = ProjectFilter {
//             id: Some(OpValInt64::Lt(1).into()),
//             name: Some(OpValString::Eq("Hello".to_string()).into()),
//             some_other: None,
//         };
//         let filter_nodes: Vec<FilterNode> = filter.try_into()?;
//
//         let (sql, vars) = super::build_select_query(
//             "project",
//             Some(filter_nodes.into()),
//             ListOptions::default(),
//         )?;
//
//         assert!(sql.contains("id <"), "should contain id <");
//         assert!(sql.contains("name ="), "should contain name =");
//         assert!(sql.contains("$w1"), "should contain $w1");
//         // should have 3 vars, one for the $tb, and one per var
//         assert_eq!(vars.len(), 3, "should have e vars");
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_simple_project_select() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter = ProjectFilter {
//             id: None,
//             name: Some(OpValString::Eq("Project A".to_string()).into()),
//             some_other: None,
//         };
//
//         // --- EXEC
//         let mut rs = model_manager
//             .store()
//             .exec_select("project", Some(filter), ListOptions::default())
//             .await?;
//
//         // --- CHECKS
//         assert_eq!(rs.len(), 1, "number of projects returned");
//         let mut obj = rs.pop().unwrap();
//         assert_eq!(obj.x_take::<String>("name")?.unwrap(), "Project A");
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_simple_task_select() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//
//         // get the "Project A" project_id
//         let project_filter_node = FilterNode::from(("name", "Project A"));
//         let mut rs = model_manager
//             .store()
//             .exec_select("project", Some(project_filter_node), ListOptions::default())
//             .await?;
//         let project_id = rs.pop().unwrap().x_take_val::<String>("id")?;
//
//         let filter = TaskFilter {
//             project_id: Some(OpValString::from(project_id).into()),
//             title: None,
//             done: Some(OpValBool::Eq(true).into()),
//             desc: None,
//         };
//
//         // --- EXEC
//         let rs = model_manager
//             .store()
//             .exec_select("task", Some(filter), ListOptions::default())
//             .await?;
//
//         // --- CHECKS
//         assert_eq!(
//             rs.len(),
//             100,
//             "Result length (for Project A & done: true tasks"
//         );
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_contains() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_node = FilterNode::from(("title", OpValString::Contains("200".into())));
//
//         // --- EXEC
//         let mut rs = model_manager
//             .store()
//             .exec_select(
//                 "task",
//                 Some(filter_node),
//                 ListOptions {
//                     order_bys: Some("title".into()),
//                     ..Default::default()
//                 },
//             )
//             .await?;
//
//         // --- CHECK
//         assert_eq!(
//             "Task B.200",
//             rs.pop().unwrap().x_take_val::<String>("title")?
//         );
//         assert_eq!(
//             "Task A.200",
//             rs.pop().unwrap().x_take_val::<String>("title")?
//         );
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_starts_with() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_node = FilterNode::from(("title", OpValString::StartsWith("Task A.1".into())));
//
//         // --- EXEC
//         let rs = model_manager
//             .store()
//             .exec_select("task", Some(filter_node), ListOptions::default())
//             .await?;
//
//         // --- CHECK
//         assert_eq!(rs.len(), 111, "Number of tasks starting with 'Task A.1'");
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_ends_with() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_node = FilterNode::from(("title", OpValString::EndsWith("11".into())));
//
//         // --- EXEC
//         let rs = model_manager
//             .store()
//             .exec_select("task", Some(filter_node), ListOptions::default())
//             .await?;
//
//         // --- CHECK
//         assert_eq!(rs.len(), 4, "Number of tasks ending with '11'");
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_or() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_nodes_1: Vec<FilterNode> = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("11".into()),
//         ))];
//         let filter_nodes_2: Vec<FilterNode> = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("22".into()),
//         ))];
//
//         // --- EXEC
//         let rs = model_manager
//             .store()
//             .exec_select(
//                 "task",
//                 Some(vec![filter_nodes_1, filter_nodes_2]),
//                 ListOptions::default(),
//             )
//             .await?;
//
//         // --- CHECK
//         assert_eq!(rs.len(), 8, "Number of tasks ending with '11' OR '22'");
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_order_bys() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_nodes_1 = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("11".into()),
//         ))];
//         let filter_nodes_2 = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("22".into()),
//         ))];
//
//         let list_options = ListOptions {
//             order_bys: Some(vec!["done", "!title"].into()),
//             ..Default::default()
//         };
//
//         // --- EXEC
//         let rs = model_manager
//             .store()
//             .exec_select(
//                 "task",
//                 Some(vec![filter_nodes_1, filter_nodes_2]),
//                 list_options,
//             )
//             .await?;
//
//         // --- CHECK
//         assert_eq!(rs.len(), 8, "Number of tasks ending with '11' OR '22'");
//         // TODO: Need to check the order
//
//         // for mut obj in rs.into_iter() {
//         // 	println!(
//         // 		"{:?} {:?}",
//         // 		obj.x_take_val::<String>("title")?,
//         // 		obj.x_take_val::<bool>("done")?
//         // 	);
//         // }
//
//         Ok(())
//     }
//
//     #[tokio::test]
//     async fn test_surreal_select_offset_limit() -> anyhow::Result<()> {
//         // --- FIXTURE
//         let model_manager = get_shared_test_store().await;
//         let filter_nodes_1 = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("11".into()),
//         ))];
//         let filter_nodes_2 = vec![FilterNode::from((
//             "title",
//             OpValString::EndsWith("22".into()),
//         ))];
//
//         let list_options = ListOptions {
//             order_bys: Some(vec!["done", "title"].into()),
//             limit: Some(2),
//             offset: Some(1),
//         };
//
//         // --- EXEC
//         let mut rs = model_manager
//             .store()
//             .exec_select(
//                 "task",
//                 Some(vec![filter_nodes_1, filter_nodes_2]),
//                 list_options,
//             )
//             .await?;
//
//         // --- CHECK
//         assert_eq!(rs.len(), 2, "Number of tasks when Limit = 2");
//         // Check tasks
//         // Note: This will reverse order checked as we are usin pop.
//         assert_eq!(
//             "Task B.11",
//             rs.pop().unwrap().x_take_val::<String>("title")?
//         );
//         assert_eq!(
//             "Task A.111",
//             rs.pop().unwrap().x_take_val::<String>("title")?
//         );
//
//         // --- Visualy check results
//         // for mut obj in rs.into_iter() {
//         // 	println!(
//         // 		"{:?} {:?}",
//         // 		obj.x_take_val::<String>("title")?,
//         // 		obj.x_take_val::<bool>("done")?
//         // 	);
//         // }
//
//         Ok(())
//     }
// }
