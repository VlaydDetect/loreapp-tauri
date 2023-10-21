use modql::ListOptions;
use rayon::prelude::*;
use tauri::{AppHandle, Manager, Wry};
use walkdir::WalkDir;
use crate::ctx::Ctx;
use crate::event::HubEvent;
use crate::fs::{IMAGE_EXTENSIONS, read_file_as_data_url};
use crate::model::{ModelStoreState, Picture, PictureFilter, PictureForCreate};
use crate::settings::AppSettings;
use crate::Result;

/**
*  An utility method for writing pictures to database
**/
#[tauri::command]
pub async fn process_pictures(app: AppHandle<Wry>) -> Result<()> {
    let model_state = app.state::<ModelStoreState>();

    let mut values = Vec::<PictureForCreate>::new();

    let opts = ListOptions {
        limit: None,
        offset: None,
        order_bys: Some("!ctime".into()),
    };
    let pictures = model_state.store().exec_select::<PictureFilter>("picture", None, opts).await.unwrap();
    let pictures: Vec<Picture> = pictures.into_iter().map(|o| o.try_into()).collect::<Result<_>>().unwrap();

    WalkDir::new(AppSettings::deserialize().gallery_path.clone())
        .into_iter()
        .par_bridge()
        .for_each(|entry| {
            if let Ok(entry) = entry {
                let file_path = entry.path().to_string_lossy().to_string();

                let walkdir_filetype = entry.file_type();

                if walkdir_filetype.is_file() {
                    let extension = entry.path().extension().unwrap().to_str().unwrap();
                    if IMAGE_EXTENSIONS.contains(&extension.clone()) {
                        let img_data_url = read_file_as_data_url(file_path).unwrap(); // TODO
                        let id = uuid::Uuid::new_v4().to_string();

                        if !pictures.iter().any(|pic| pic.img_data_url == img_data_url.clone() || pic.id == id.clone()) {
                            values.push(PictureForCreate {
                                id,
                                img_data_url,
                            });
                        }
                    }
                };
            }
        });

    for value in values {
        model_state.store().exec_create::<PictureForCreate>("picture", value).await?;
    }

    Ctx::from_app(app).unwrap().emit_hub_event(HubEvent {
        hub: "Model".to_string(),
        topic: "picture".to_string(),
        label: Some("create".to_string()),
        data: None
    });

    Ok(())
}
