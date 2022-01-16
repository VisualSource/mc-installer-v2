use crate::minecraft::utils::{ get_version_list, get_latest_version };
use crate::minecraft::fabric::{ get_stable_fabric_minecraft_versions };
use crate::minecraft::forge::{ list_forge_versions };
use crate::minecraft::utils::get_user_agent;
use serde::{ Serialize, Deserialize };
use log::{ error };

fn accepted_verions(ver: &String) -> bool {
    for i in ["1.18","1.17"] {
       if ver.contains(i) {
           return true;
       }
    }
    return false;
}

#[derive(Serialize)]
pub struct MinecraftVersionList {
    versions: Vec<String>
}

/// get the all vanilla versions
#[tauri::command]
pub async fn get_vanilla_versions() -> Result<MinecraftVersionList,String> {
    match get_version_list(){
        Ok(value) => {
            let mut versions: Vec<String> = vec![];
            for i in value {
                if accepted_verions(&i.id) {
                    versions.push(i.id);
                }
            }

            Ok(MinecraftVersionList {
                versions: versions
            })
        }
        Err(err) => {
            Err(err.to_string())
        }
    }
}

/// get the latest minecraft version
#[tauri::command]
pub async fn get_latest_minecraft_version() -> Result<String,String> {
    match get_latest_version() {
        Ok(value) => {
            Ok(value.release)
        },
        Err(err) => Err(err.to_string())
    }
}

/// returns all the minecraft versions for fabric
#[tauri::command] 
pub async fn get_fabric_verions() -> Result<MinecraftVersionList,String> {
    match get_stable_fabric_minecraft_versions() {
        Ok(value) => {
            let mut accepted: Vec<String> = vec![];

            for i in value {
                if accepted_verions(&i.version) {
                    accepted.push(i.version);
                }
            }
            Ok(MinecraftVersionList{
                versions: accepted
            })
        }
        Err(err) => {
            Err(err.to_string())
        }
    }
}

#[tauri::command]
pub async fn get_forge_versions() -> Result<MinecraftVersionList,String> {
    match list_forge_versions() {
        Err(err) => Err(err.to_string()),
        Ok(value) => {
            let mut accpect = vec![];

            for i in value {
                if let Some(version) = i.split("-").collect::<Vec<&str>>().get(0).clone() {
                    let a = String::from(version.to_owned());
                    if accepted_verions(&a) {
                        accpect.push(i);
                    }
                }
            }

            Ok(MinecraftVersionList {
                versions: accpect
            })
        }
    }
}

#[derive(Serialize,Deserialize,Clone,Debug)]
pub struct MinecraftNewsImage {
    content_type: String,
    #[serde(rename="imageURL")]
    image_url: String,
    alt: Option<String>
}

#[derive(Serialize,Deserialize,Clone,Debug)]
pub struct MinecraftNewsSub {
    sub_header: String,
    tile_size: String,
    title: String,
    image: MinecraftNewsImage
}

#[derive(Serialize,Deserialize,Clone,Debug)]
pub struct MinecraftNewsItem {
    default_tile: MinecraftNewsSub,
    preferred_tile: Option<MinecraftNewsSub>,
    #[serde(rename="articleLang")]
    article_lang: String,
    pub primary_category: String,
    categories: Vec<String>,
    article_url: String,
    tags: Vec<String>,
    publish_date: String
}

#[derive(Deserialize, Debug)]
pub struct MinecraftNews {
    pub article_grid: Vec<MinecraftNewsItem>
}
#[tauri::command]
pub async fn get_minecraft_news(documents: String) -> Result<Vec<MinecraftNewsItem>,String> {
    let agent = get_user_agent();
    let url = "https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid";

    match agent.get(url).query("pageSize", documents.as_str()).call() {
        Ok(res) => {
            match res.into_json::<MinecraftNews>() {
                Ok(grid) => {
                    let mut news: Vec<MinecraftNewsItem> = vec![];
                    for i in grid.article_grid.iter().filter(|v| v.primary_category == "News" || v.primary_category == "Guides") {
                        news.push(i.clone());
                    }
                    Ok(news)
                }
                Err(err) => {
                    error!("{}",err);
                    Err(err.to_string())
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(err.to_string())
        } 
    }
}