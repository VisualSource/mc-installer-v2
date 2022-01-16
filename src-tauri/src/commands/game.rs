use crate::minecraft::command::GameOptions;
use serde::Deserialize;


#[derive(Deserialize)]
pub struct MinecraftRunOptions {
    token: String,
    uuid: String,
    username: String
}

#[tauri::command]
pub async fn run_minecraft(manifest: MinecraftRunOptions) -> Result<(),String> {
    let mut options = GameOptions::default();
    options.token = Some(manifest.token);
    options.uuid = Some(manifest.uuid);
    options.username = Some(manifest.username);
    unimplemented!();
}

#[derive(Deserialize)]
pub struct MinecraftInstallManifest {
    loader: String,
    version: String,
    loader_version: Option<String>,
    mods: Vec<String>,
    mc_dir: Option<String>,
}

#[tauri::command]
pub async fn run_install(manifest:  MinecraftInstallManifest) -> Result<(),String> {
    unimplemented!();
}