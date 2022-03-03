use crate::files::user_cache::read_user_cache;
use tauri::api::http::{ ClientBuilder, HttpRequestBuilder, ResponseType };
use std::collections::HashMap;
use mc_laucher_lib_rs::{
    vanilla::{
        get_vanilla_versions
    },
    optifine::{
        get_optifine_versions
    }
};
pub mod login;
pub mod state;
pub mod importer;
pub mod play;

const MINECRAFT_NEWS_URL: &str = "https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid";

#[tauri::command]
pub async fn get_minecraft_news(items: u32) -> Result<serde_json::Value, String> {
    let client = match ClientBuilder::new().build() {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    let query = HashMap::from([
        ("pageSize".into(), items.to_string())
        ]);
    let headers = HashMap::from([
        ("user-agent".into(),format!("rustymodclient/{}",env!("CARGO_PKG_VERSION")))
    ]);

    let request = HttpRequestBuilder::new("GET", MINECRAFT_NEWS_URL).unwrap().query(query).headers(headers).response_type(ResponseType::Json);

    match client.send(request).await {
        Ok(res) => {
            match res.read().await {
                Ok(value) => {
                    Ok(value.data)
                }
                Err(err) => Err(err.to_string())
            }
        },
        Err(err) => Err(err.to_string())
    }
}


#[tauri::command]
pub async fn get_user_cache() -> Result<std::collections::HashMap<std::string::String, mc_laucher_lib_rs::json::authentication_microsoft::Account>, String> {
    match read_user_cache() {
        Ok(value) => Ok(value),
        Err(err) => Err(err)
    }
}

#[tauri::command]
pub async fn stable_vanilla_versions() -> Result<Vec<String>, String> {
    match get_vanilla_versions().await {
        Ok(value) => {
            let mut versions: Vec<String> = vec![];
            let vaild_semver = match regex::Regex::new(r"\d+.\d+.\d+(\d+|\w+)?") {
                Ok(value) => value,
                Err(err) => return Err(err.to_string())
            };

            for i in value.iter().filter(|e|{ e.version_type == "release".to_string() }) {
                let key = if !vaild_semver.is_match(&i.id) {
                    format!("{}.0",i.id.clone()).to_string()
                } else {
                    i.id.clone()
                };

                match semver_rs::satisfies(key.as_str(), ">=1.16.5", None) {
                    Ok(value) => {
                        if !value {
                            continue;
                        }
                    }
                    Err(_err) => {
                        continue;
                    }
                }
                
                versions.push(i.id.clone());
            }

            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_optifine_versions() -> Result<std::collections::HashMap<String,Vec<String>>, String> {
    match get_optifine_versions().await {
        Ok(value) => {
            let mut versions: std::collections::HashMap<String,Vec<String>> = HashMap::new();
            let vaild_semver = match regex::Regex::new(r"\d+.\d+.\d+(\d+|\w+)?") {
                Ok(value) => value,
                Err(err) => return Err(err.to_string())
            };

            for i in value {
                let key = if !vaild_semver.is_match(&i.mc) {
                    format!("{}.0",i.mc.clone()).to_string()
                } else {
                    i.mc.clone()
                };

                match semver_rs::satisfies(key.as_str(), ">=1.16.5", None) {
                    Ok(value) => {
                        if !value {
                            continue;
                        }
                    }
                    Err(_err) => {
                        continue;
                    }
                }
                
                match versions.get_mut(&i.mc) {
                    Some(version) => {
                            version.push(i.name);
                    }
                    None => {
                        versions.insert(i.mc,vec![i.name]);
                    }
                } 
            }
            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_fabric_versions() -> Result<Vec<String>, String> {
    match mc_laucher_lib_rs::fabric::get_supported_mc_versions().await {
        Ok(value) => {
            let mut versions: Vec<String> = vec![];
            let vaild_semver = match regex::Regex::new(r"\d+.\d+.\d+(\d+|\w+)?") {
                Ok(value) => value,
                Err(err) => return Err(err.to_string())
            };

            for i in value {
                let id = if !vaild_semver.is_match(&i.version) {
                    format!("{}.0",i.version.clone()).to_string()
                } else {
                    i.version.clone()
                };

                match semver_rs::satisfies(id.as_str(), ">=1.16.5", None) {
                    Ok(value) => {
                        if !value {
                            continue;
                        }
                    }
                    Err(_err) => {
                        continue;
                    }
                }


                if i.stable {
                    versions.push(i.version);
                }
            }

            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_forge_versions() -> Result<std::collections::HashMap<String,Vec<String>>, String> {
    match mc_laucher_lib_rs::forge::get_forge_versions().await {
        Ok(value) => {
            let mut versions: std::collections::HashMap<String,Vec<String>> = HashMap::new();
            let vaild_semver = match regex::Regex::new(r"\d+.\d+.\d+(\d+|\w+)?") {
                Ok(value) => value,
                Err(err) => return Err(err.to_string())
            };

            for i in value {
                let id = i.split("-").collect::<Vec<&str>>();
                let (real_key, key) = match id.get(0) {
                    Some(value) => {
                        if !vaild_semver.is_match(value) {
                            (value.to_string(),format!("{}.0",value).to_string())
                        } else {
                            (value.to_string(),value.to_string())
                        }
                    },
                    None => continue
                };

                match semver_rs::satisfies(key.as_str(), ">=1.16.5", None) {
                    Ok(value) => {
                        if !value {
                            continue;
                        }
                    }
                    Err(_err) => {
                        continue;
                    }
                }

                match versions.get_mut(&real_key) {
                    Some(version) => {
                        if let Some(loader_version) = id.get(1) {
                            version.push(loader_version.to_string());
                        }
                    }
                    None => {
                        if let Some(loader_version) = id.get(1) {
                            versions.insert(real_key,vec![loader_version.to_string()]);
                        }
                    }
                } 
            }
            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}