#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
extern crate crypto;
extern crate ureq;
extern crate app_dirs2;
extern crate os_version;
#[macro_use]
extern crate serde_json;
use app_dirs2::{AppInfo, app_root, AppDataType };

mod minecraft;

const APP_INFO: AppInfo = AppInfo{ name: "MCModInstaller", author: "VisualSource"};

fn main() {
  app_root(AppDataType::UserConfig, &APP_INFO).expect("Failed to create app root");
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
