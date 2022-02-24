use std::{path::PathBuf, thread};
use crate::app::{CLIENT_ID,REDIRECT_URI};
use crate::commands::state::AppState;
use mc_laucher_lib_rs::{
    login::login_microsoft_refresh,
    client::{ClientBuilder},
    json::client::Loader
};
use serde::{Deserialize, Serialize};
use log::{ info, error };
use tauri::{Runtime, async_runtime  };

#[derive(Serialize, Clone)]
pub struct LaunchStatus {
  task: u32,
  msg: String
}


#[derive(Deserialize)]
pub struct GameOptions {
    game_dir: Option<PathBuf>,
    java_dir: Option<PathBuf>,
    jvm_args: String,
    refresh_token: String,
    minecraft: String,
    loader: Option<Loader>,
    loader_version: Option<String>
}

#[tauri::command]
pub async fn run_game<R: Runtime>(state: tauri::State<'_, AppState>, window: tauri::Window<R>, settings: GameOptions) -> Result<(), String> {

  info!("getting user ready");
 
  if let Err(error) = window.emit("rustyminecraft://launch_status", LaunchStatus { task: 1, msg: "Authenicating".into() }) {
    error!("{}",error);
  }
 

  let account = match login_microsoft_refresh(CLIENT_ID.into(),REDIRECT_URI.into(), settings.refresh_token).await {
    Ok(value) => value,
    Err(err) => {
      if let Err(error) = window.emit("rustyminecraft://launch_error", err.to_string()) {
        error!("{}",error);
      }
      return Err(err.to_string())
    }
  };

  if let Err(error) = window.emit("rustyminecraft://launch_status", LaunchStatus { task: 2, msg: "Preparing mods folder".into() }) {
    error!("{}",error);
  }
  

  if let Err(error) = window.emit("rustyminecraft://launch_status", LaunchStatus { task: 3, msg: "Building Client".into() }) {
    error!("{}",error);
  }

  info!("Creating client");
  let mut client = match ClientBuilder::new(settings.game_dir) {
    Ok(mut value) => {
      match value.as_msa_user(account)
      .set_java(settings.java_dir)
      .set_jvm_args(settings.jvm_args)
      .set_client_id(CLIENT_ID.into())
      .enable_logging()
      .set_minecraft(settings.minecraft, settings.loader, settings.loader_version) {
        Ok(mc) => {
          match mc.build() { 
            Ok(client) => client, 
            Err(err) => {
              error!("{}",err);
              if let Err(error) = window.emit("rustyminecraft://launch_error", err.to_string()) {
                error!("{}",error);
              }
              return Err(err.to_string());
            } 
          }
        },
        Err(err) => {
          error!("{}",err);
          if let Err(error) = window.emit("rustyminecraft://launch_error", err.to_string()) {
            error!("{}",error);
          }
          return Err(err.to_string());
        }
      }
    }
    Err(err) => {
      error!("{}",err);
      if let Err(error) = window.emit("rustyminecraft://launch_error", err.to_string()) {
        error!("{}",error);
      }
      return Err(err.to_string());
    }
  };

  if let Err(error) = window.emit("rustyminecraft://launch_status", LaunchStatus { task: 4, msg: "Launching Game".into() }) {
    error!("{}",error);
  }

  if let Err(err) = client.start().await {
    error!("{}",err);
    if let Err(error) = window.emit("rustyminecraft://launch_error", err.to_string()) {
      error!("{}",error);
    }
    return Err(err.to_string());
  }

  if let std::sync::LockResult::Ok(mut value) = state.s.lock() {
    *value = client; 
  }

  if let Err(error) = window.emit("rustyminecraft://launch_ok", "Ok") {
    error!("{}",error);
  }

  Ok(())
}