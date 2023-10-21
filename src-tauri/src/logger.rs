use crate::fs::{get_app_data_path, path_to_string};
use simple_log::LogConfigBuilder;

pub fn init_logger() {
    let config = LogConfigBuilder::builder()
        .path(format!("{}/main_log.log", path_to_string(&get_app_data_path())))
        .size(1 * 100)
        .roll_count(10)
        .output_file()
        .output_console()
        .build();

    simple_log::new(config).unwrap();
}