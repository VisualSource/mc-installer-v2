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
  get_minecraft_news,
  importer::{
    import_profiles
  },
  login::{
    login,
    login_done,
    logout,
    logout_done,
    login_error
  },
  state::{
    AppState, 
    is_game_running,
    can_run_setup,
    setup_complete
  }
};


fn main() {
  app::init();
  info!("Init complete");
  tauri::Builder::default()
  .manage(AppState::default())
  .invoke_handler(tauri::generate_handler![
    get_minecraft_news,
    is_game_running,
    login,
    login_done,
    logout,
    login_error,
    logout_done,
    get_user_cache,
    can_run_setup,
    setup_complete,
    import_profiles
  ])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}
