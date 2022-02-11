#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod app;
mod commands;
use log::{ info };


fn main() {
  app::init();
  info!("Init complete");
  tauri::Builder::default()
     /* .invoke_handler(tauri::generate_handler![
        login_microsoft_account,
        logout_microsoft_account,
        get_vanilla_versions,
        get_fabric_verions,
        get_forge_versions,
        get_latest_minecraft_version,
        ms_login_done,
        ms_logout_done,
        get_minecraft_news,
        refresh_microsoft_account,
        run_minecraft,
        run_install,
        read_user_cache
      ])*/
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
