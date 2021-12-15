#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
extern crate app_dirs2;
use app_dirs2::{AppInfo, app_root, AppDataType };

const APP_INFO: AppInfo = AppInfo{ name: "MCModInstaller", author: "VisualSource"};

fn main() {
  app_root(AppDataType::UserConfig, &APP_INFO).expect("Failed to create app root");
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
