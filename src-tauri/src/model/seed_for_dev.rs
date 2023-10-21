use crate::model::{DocumentForCreate, PictureForCreate};
use crate::Result;
use std::sync::Arc;

use super::ModelStore;

/// Only use while developing. Convenient when to seed the store on start of the application.
pub async fn seed_store_for_dev(model_manager: Arc<ModelStore>) -> Result<()> {
    let ps = ["A", "B"].into_iter().map(|k| {
        (
            k,
            DocumentForCreate {
                name: format!("Document {k}"),
            },
        )
    });

    for (k, document) in ps {
        let document_id = model_manager
            .store()
            .exec_create::<DocumentForCreate>("document", document)
            .await?;

        // for i in 1..=200 {
        //     let done = i % 2 == 0;
        //     let picture = PictureForCreate {
        //         project_id: document_id.clone(),
        //         title: format!("Picture {k}.{i}"),
        //         desc: None,
        //         done: Some(done),
        //     };
        //
        //     model_manager
        //         .store()
        //         .exec_create::<PictureForCreate>("picture", picture)
        //         .await?;
        // }
    }

    Ok(())
}