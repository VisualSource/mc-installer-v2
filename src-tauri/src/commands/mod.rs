use crate::files::user_cache::read_user_cache;
use tauri::api::http::{ClientBuilder, HttpRequestBuilder, ResponseType };
use std::collections::HashMap;
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