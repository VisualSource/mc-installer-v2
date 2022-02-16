use mc_laucher_lib_rs::{ get_minecraft_directory, json::client::Loader, get_latest_offical_version };
use std::collections::HashMap;
use serde::{ Deserialize, Serialize };
use log::{ warn };
use std::fs::File;

#[derive(Deserialize,Debug,Serialize, Clone)]
pub struct Resolution {
    width: u32,
    height: u32,
}

#[derive(Serialize, Debug)]
pub struct RustyProfileMedia {
    icon: Option<String>
}

#[derive(Serialize, Debug)]
pub struct RustyProfile {
    media: RustyProfileMedia,
    name: String,
    minecraft: String,
    loader: Loader,
    loader_version: Option<String>,
    dot_minecraft: Option<String>,
    java: Option<String>,
    category: String,
    created: Option<String>,
    last_used: Option<String>,
    resolution: Option<Resolution>,
}

#[derive(Deserialize,Debug)]
struct MinecraftProfile {
    resolution: Option<Resolution>,
    created: Option<String>,
    #[serde(rename = "gameDir")]
    game_dir: Option<String>,
    icon: String,
    #[serde(rename = "lastUsed")]
    last_used: Option<String>,
    #[serde(rename = "lastVersionId")]
    last_version_id: String,
    name: String,
    #[serde(rename = "type")]
    profile_type: String,
    #[serde(rename = "javaDir")]
    java_dir: Option<String>
}

#[derive(Deserialize,Debug)]
struct LauncherProfiles {
    profiles: HashMap<String,MinecraftProfile>,
}

#[tauri::command]
pub async fn import_profiles() -> Result<Vec<RustyProfile>, String> {

    let forge_id = match regex::Regex::new(r"(?P<minecraft>\d+.\d+.\d+)-forge-(?P<modloader>\d+.\d+.\d+)"){
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    let fabric_id = match regex::Regex::new(r"fabric-loader-(?P<modloader>\d+.\d+.\d+)-(?P<minecraft>\d+.\d+.\d+)"){
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    let optifine_id = match regex::Regex::new(r"(?P<minecraft>\d+.\d+.\d+)-OptiFine_(?P<modloader>\w+_\w+_\w\d(_pre)?)"){
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    let vanilla_id = match regex::Regex::new(r"(?P<minecraft>\d+.\d+.\d+)"){
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    
    let dir = match get_minecraft_directory() {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    let launcher_profile = dir.join("launcher_profiles.json");

    if !launcher_profile.is_file() {
        return Ok(vec![]);
    }   

    let reader = match File::open(launcher_profile) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };


    let data: LauncherProfiles = match serde_json::from_reader::<File,LauncherProfiles>(reader) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    let mut failed_imports: u32 = 0;
    let mut profiles: Vec<RustyProfile> = vec![];

    for (key, value) in data.profiles {

        let mut minecraft = String::default();
        let mut modloader: Loader = Loader::default();
        let mut modloader_version: Option<String> = None;

        if forge_id.is_match(&value.last_version_id) {
            match forge_id.captures(&value.last_version_id) {
                Some(keys) => {
                    minecraft = keys.name("minecraft").unwrap().as_str().to_string();
                    modloader = Loader::Forge;
                    modloader_version = Some(keys.name("modloader").unwrap().as_str().to_string());
                }
                None => {
                    warn!("Failed import: {}",key);
                    failed_imports += 1;
                    continue;
                }
            } 
        } else if fabric_id.is_match(&value.last_version_id) {
            match fabric_id.captures(&value.last_version_id) {
                Some(keys) => {
                    minecraft = keys.name("minecraft").unwrap().as_str().to_string();
                    modloader = Loader::Fabric;
                    modloader_version = Some(keys.name("modloader").unwrap().as_str().to_string());
                }
                None => {
                    warn!("Failed import: {}",key);
                    failed_imports += 1;
                    continue;
                }
            } 
        } else if optifine_id.is_match(&value.last_version_id) {
            match optifine_id.captures(&value.last_version_id) {
                Some(keys) => {
                    minecraft = keys.name("minecraft").unwrap().as_str().to_string();
                    modloader = Loader::Optifine;
                    modloader_version = Some(keys.name("modloader").unwrap().as_str().to_string());
                }
                None => {
                    warn!("Failed import: {}",key);
                    failed_imports += 1;
                    continue;
                }
            } 
        } else if vanilla_id.is_match(&value.last_version_id) {
            match vanilla_id.captures(&value.last_version_id) {
                Some(keys) => {
                    minecraft = keys.name("minecraft").unwrap().as_str().to_string();
                }
                None => {
                    warn!("Failed import: {}",key);
                    failed_imports += 1;
                    continue;
                }
            } 
        } else {
            if value.last_version_id == "latest_release".to_string() {
                match get_latest_offical_version() {
                    Ok(value)=> {
                        minecraft = value.release;
                    }
                    Err(err) =>{
                        warn!("Failed import: {}",key);
                        failed_imports += 1;
                        continue;
                    }
                }
            } else {
                warn!("Failed import: {}",key);
                failed_imports += 1;
                continue;
            }
        }
    
       profiles.push(RustyProfile {
            resolution: value.resolution,
            created: value.created,
            dot_minecraft: value.game_dir,
            media: RustyProfileMedia {
                icon: Some(value.icon)
            },
            last_used: value.last_used,
            java: value.java_dir,
            name: value.name,
            minecraft,
            category: modloader.to_string(),
            loader: modloader,
            loader_version: modloader_version
        });
    }




  Ok(profiles)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn test_import_profiles() {
        match import_profiles().await {
            Ok(value) => println!("{:#?}",value),
            Err(err) => eprintln!("{}",err)
        }
    }
}