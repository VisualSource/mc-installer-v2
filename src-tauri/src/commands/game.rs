use crate::minecraft::command::{GameOptions, get_minecraft_commands};
use crate::minecraft::utils::{get_minecraft_directory};
use crate::minecraft::install::install_minecraft_version;
use crate::minecraft::forge::{ install_forge_version, is_vaild_forge_version };
use crate::minecraft::optifine::install_optifine;
use crate::minecraft::iris::install_iris;
use crate::minecraft::mods::install_mod_list;
use crate::minecraft::fabric::install_fabric;
use serde::Deserialize;
use std::process::{ Command };
use std::path::PathBuf;
use log::{ info, error };


#[derive(Deserialize, Debug)]
pub enum MinecraftLoader {
    Vanilla(String),
    Forge(String),
    Fabric(String),
    Optifine(String),
    Iris(String)
}

#[derive(Deserialize)]
pub struct MinecraftRunOptions {
    token: String,
    uuid: String,
    username: String,
    version: String,
    jvm: Option<String>
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

    let version = match manifest.version.as_str() {
        "forge" => {
            let ver_data = manifest.version.split("-").collect::<Vec<&str>>();
            format!("{}-forge-{}",ver_data[0],ver_data[1]).to_string()
        }
        _ => manifest.version
    };



    let mut args: Vec<String> = match get_minecraft_commands(version, mc_dir, &mut options) {
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

#[derive(Deserialize, Debug)]
pub struct MinecraftInstallManifest {
    uuid: String,
    loader: String,
    version: String,
    mods: Vec<String>,
    mc_dir: Option<String>,
    loader_version: Option<String>
}

#[tauri::command]
pub async fn run_install(manifest:  MinecraftInstallManifest) -> Result<(),String> {
    info!("{:#?}",manifest);
    let ms_dir = if let Some(dir) = manifest.mc_dir {
        PathBuf::from(dir)
    } else {
        match get_minecraft_directory(){
            Ok(value) => value,
            Err(err) => return Err(err.to_string())
        }
    };

    match manifest.loader.as_str() {
        "vanilla" => {
            if let Err(err) = install_minecraft_version(manifest.version, ms_dir){
                error!("{}",err);
                return Err(err.to_string())
            }
        }
        "fabric" => {
            return Err("Techinal Error with fabric".to_string());
           /* if let Err(err) = install_fabric(manifest.version.clone(), ms_dir, manifest.loader_version, None) {
                error!("{}",err);
                return Err(err.to_string())
            }
            if let Err(err) = install_mod_list(manifest.uuid, manifest.mods, manifest.version, manifest.loader) {
                error!("{}",err);
                return Err(err.to_string())
            }*/
        }
        "forge" => {
            if let Err(err) = install_forge_version(manifest.version.clone(), ms_dir, None) {
                error!("{}",err);
                return Err(err.to_string())
            }
            if let Err(err) = install_mod_list(manifest.uuid, manifest.mods, manifest.version, manifest.loader) {
                error!("{}",err);
                return Err(err.to_string())
            }
        }
        "optifine" => {
            if let Err(err) = install_optifine(manifest.version,manifest.loader_version,ms_dir) {
                error!("{}",err);
                return Err(err.to_string())
            }
        }
        "iris" => {
            if let Err(err) = install_iris(ms_dir, manifest.version, manifest.loader_version) {
                error!("{}",err);
                return Err(err.to_string())
            }
        }
        _ => {
            return Err("Unknown loader".to_string())
        }
    }

   

   /* if let Err(err) = install_minecraft_version(manifest.version, ms_dir){
        error!("{}",err);
        return Err(err.to_string())
    }*/

    info!("Install complete");

    Ok(())
}

