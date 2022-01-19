use crate::minecraft::command::{GameOptions, get_minecraft_commands};
use crate::minecraft::utils::{get_minecraft_directory};
use crate::minecraft::install::install_minecraft_version;
use serde::Deserialize;
use std::process::{ Command, Stdio };
use log::{ info, error };

#[derive(Deserialize)]
pub struct MinecraftRunOptions {
    token: String,
    uuid: String,
    username: String,
    version: String
}



#[tauri::command]
pub fn run_minecraft(manifest: MinecraftRunOptions) -> Result<(),String> {
    let mut options = GameOptions::default();
    options.token = Some(manifest.token);
    options.uuid = Some(manifest.uuid);
    options.username = Some(manifest.username);

    let mc_dir = match get_minecraft_directory() {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    let mut args: Vec<String> = match get_minecraft_commands(manifest.version, mc_dir, &mut options) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
 
    let java: String = args.remove(0); 
  
    match Command::new(java).args(args).spawn(){
        Err(err) => {
            error!("{}",err);
        }
        Ok(value) => {
            
        }
    }

    Ok(())
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

    let ms_dir = match get_minecraft_directory(){
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    if let Err(err) = install_minecraft_version(manifest.version, ms_dir){
        error!("{}",err);
        return Err(err.to_string())
    }

    info!("Install complete");

    Ok(())
}

