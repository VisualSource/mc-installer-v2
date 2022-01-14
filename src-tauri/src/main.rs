#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
#[macro_use]
extern crate serde_json;
extern crate serde_xml_rs;
extern crate serde_yaml;
extern crate crypto;
extern crate ureq;
extern crate app_dirs2;
extern crate os_version;
extern crate uuid;
extern crate simplelog;
extern crate log;
extern crate url;
extern crate urlparse;

mod app;
mod minecraft;
mod commands;

use log::{ info };
use commands::{get_minecraft_news, mojang_login_done, login_mojang_account, ms_login_done, login_microsoft_account, get_available_minecraft_versions, get_fabric_verions, get_forge_versions, get_latest_minecraft_version };

fn main() {
  app::init();
  info!("Init complete");
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![
        login_microsoft_account,
        get_available_minecraft_versions,
        get_fabric_verions,
        get_forge_versions,
        get_latest_minecraft_version,
        ms_login_done,
        login_mojang_account,
        mojang_login_done,
        get_minecraft_news
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
