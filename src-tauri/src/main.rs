#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app;
mod commands;
mod files;
use log::{ info };

use commands::{
  get_user_cache,
  login::{
    login,
    login_done,
    logout,
    logout_done,
    login_error
  },
  state::{
    AppState, 
    is_game_running
  }
};


fn main() {
  app::init();
  info!("Init complete");
  tauri::Builder::default()
  .manage(AppState::default())
  .invoke_handler(tauri::generate_handler![
    is_game_running,
    login,
    login_done,
    logout,
    login_error,
    logout_done,
    get_user_cache
  ])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}
