use app_dirs2::{ AppDataType, app_root };
use mc_laucher_lib_rs::client::Client;
use serde::{ Deserialize, Serialize };

use crate::app::{APP_INFO};

#[derive(Default)]
pub struct AppState {
  s: std::sync::Mutex<Client>,
}

#[tauri::command]
pub async fn is_game_running(state: tauri::State<'_, AppState>) -> Result<bool, String> {

    if let std::sync::LockResult::Ok(mut value) = state.s.lock() {
        match value.is_running() {
            Ok(status) => return Ok(status),
            Err(err) => return Err(err.to_string())
        }
    }

  Ok(false)
}

#[derive(Deserialize,Serialize)]
struct YmlConfig {
  setup: bool
}

#[tauri::command]
pub async fn setup_complete() -> Result<(), String> {
  use std::fs::File;

  let root = match app_root(AppDataType::UserConfig, &APP_INFO) {
    Ok(value) => value,
    Err(err) => return Err(err.to_string())
  };

  let config_path = root.join("config.yml");

  let file = match File::create(config_path) {
    Ok(value) => value,
    Err(err) => return Err(err.to_string())
  };

  let data = std::collections::HashMap::from([ ("setup",true) ]);

  if let Err(err) = serde_yaml::to_writer(file,&data) {
    return Err(err.to_string());
  }

  Ok(())
}


#[tauri::command]
pub async fn can_run_setup() -> Result<bool, String> {
    use std::fs::File;

    let root = match app_root(AppDataType::UserConfig, &APP_INFO) {
      Ok(value) => value,
      Err(err) => return Err(err.to_string())
    };

    let config_path = root.join("config.yml");

    if !config_path.is_file() {
      return Ok(true);
    }

    let file = match File::open(config_path) {
      Ok(value) => value,
      Err(err) => return Err(err.to_string())
    };

    let config: YmlConfig = match serde_yaml::from_reader::<File,YmlConfig>(file){
      Ok(value)=> value,
      Err(err) => return Err(err.to_string())
    };

  Ok(!config.setup)
}

