use crate::files::user_cache::read_user_cache;
use tauri::api::http::{ ClientBuilder, HttpRequestBuilder, ResponseType };
use std::collections::HashMap;
use serde::{ Serialize };
use log::{ debug };
use mc_laucher_lib_rs::{
    vanilla::{
        get_vanilla_versions
    },
    optifine::{
        get_optifine_versions
    },
    json::client::Loader };
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
#[derive(Serialize)]
pub struct MinecraftVersion {
    loader: Loader,
    minecraft: String,
    loader_version: Option<String>
}

#[tauri::command]
pub async fn stable_vanilla_versions() -> Result<Vec<MinecraftVersion>, String> {
    match get_vanilla_versions().await {
        Ok(value) => {
            let mut versions: Vec<MinecraftVersion> = vec![];

            for i in value.iter().filter(|e|{ e.version_type == "release".to_string() }) {
                versions.push(MinecraftVersion {
                    minecraft: i.id.clone(),
                    loader: Loader::Vanilla,
                    loader_version: None
                });
            }

            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_optifine_versions() -> Result<Vec<MinecraftVersion>, String> {
    match get_optifine_versions().await {
        Ok(value) => {
            debug!("{:#?}",value);

            Ok(vec![])
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_fabric_versions() -> Result<Vec<MinecraftVersion>, String> {
    match mc_laucher_lib_rs::fabric::get_supported_mc_versions().await {
        Ok(value) => {
            let mut versions: Vec<MinecraftVersion> = vec![];

            for i in value {
                versions.push(MinecraftVersion {
                    minecraft: i.version.clone(),
                    loader: Loader::Fabric,
                    loader_version: None
                });
            }

            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}

#[tauri::command]
pub async fn stable_forge_versions() -> Result<Vec<MinecraftVersion>, String> {
    match mc_laucher_lib_rs::forge::get_forge_versions().await {
        Ok(value) => {
            let mut versions: Vec<MinecraftVersion> = vec![];

            for i in value {
                versions.push(MinecraftVersion {
                    minecraft: i.clone(),
                    loader: Loader::Forge,
                    loader_version: None
                });
            }

            Ok(versions)
        }
        Err(err) => Err(err.to_string())
    }
}