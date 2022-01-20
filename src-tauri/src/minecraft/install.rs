use crate::minecraft::utils::{download_file,parse_rule_list,inherit_json, get_version_list,JsonVersionsData};
use crate::minecraft::runtime::{install_jvm_runtime,does_runtime_exist};
use crate::minecraft::exceptions::{WithException,InterialError,VersionNotFound};
use crate::minecraft::natives::{get_natives,extract_natives_file};
use crate::minecraft::command::GameOptions;
use std::fs::read_to_string;
use std::path::PathBuf;
use log::{ error, info, warn };
use serde::Deserialize;

#[derive(Deserialize)]
struct LatestMinecraft {
    release: String,
    snapshot: String
}

#[derive(Deserialize)]
struct VersionsListItem {
    id: String,
    #[serde(rename="type")]
    state: String,
    url: String,
    time: String,
    #[serde(rename="releaseTime")]
    release_time: String
}

#[derive(Deserialize)]
struct VersionManifest {
    latest: LatestMinecraft,
    versions: Vec<VersionsListItem>
}

#[derive(Deserialize)]
struct AssetMapItem {
    pub hash: String,
    pub size: i32
}
#[derive(Deserialize)]
struct AssetMap {
    pub objects: std::collections::HashMap<String,AssetMapItem>
}

pub type CallBack = fn(progress: usize, time: u32, item: usize, max_items: Option<usize>);

fn install_libraries(data: &JsonVersionsData, path: PathBuf, callback: CallBack ) -> WithException<()> {

    let libraries = match data.libraries.as_array() {
        Some(value) => value,
        None => return Err(InterialError::boxed("object was not a array"))
    };

    let max_items = libraries.len(); 


    callback(0,0,0,Some(max_items));

    for (count,i) in libraries.iter().enumerate() {
        if !parse_rule_list(&i, "rules", &mut GameOptions::default()) {
            continue;
        }
        let mut current_path = path.join("libraries");

        let mut download_url = "https://libraries.minecraft.net".to_string();
        if let Some(url) = i.get("url") {
            let value = url.as_str().expect("Failed to make string");
            if value.ends_with("/") {
                download_url = match value.get(0..(value.len() - 1)) {
                    Some(uri) => uri.to_string(),
                    None => return Err(InterialError::boxed("Failed to remove char /"))
                } 
            } else {
                download_url = value.to_string();
            }
        }

        let (libpath,name, mut version) = match i.get("name") {
            Some(data) => {
                match data.as_str() {
                    Some(str_data) => {
                        let lib_parts = str_data.split(":").map(|v|v.to_string()).collect::<Vec<String>>();
                        if lib_parts.len() != 3 {
                            warn!("Lib name does not contain the required params");
                            continue;
                        }
                        (lib_parts[0].clone(),lib_parts[1].clone(),lib_parts[2].clone())
                    }
                    None => {
                        warn!("Failed to make lib name a string");
                        continue;
                    }
                }
            }
            None => {
                warn!("Failed to get library name from string");
                continue;
            }
        };

        for lib_path_part in libpath.split(".") {
             current_path = current_path.join(lib_path_part);
             download_url = format!("{}/{}",download_url,lib_path_part).to_string();
        }


        let mut fileend = "jar";
        let temp_version = version.clone();
        let version_data = temp_version.split("@").clone().collect::<Vec<&str>>();
        if version_data.len() == 2 {
            fileend = version_data[1];
            version = version_data[0].to_string();
        }

        let jar_filename = format!("{}-{}.{}",name,version,fileend).to_string();
        download_url = format!("{}/{}/{}",download_url,name,version).to_string();
        current_path = current_path.join(name.clone()).join(version.clone());

        let native = get_natives(&i);
        let jar_filename_native = if !native.is_empty() {
            format!("{}-{}-{}.jar",name,version,native).to_string()
        } else {
            String::default()
        };
        
        if let Err(err) = download_file(download_url, current_path.join(jar_filename.clone()), None, false) {
            error!("Failed to download file | {}", err);
        }

        if i.get("downloads").is_none() {
            if let Some(extract) = i.get("extract") {
                if let Err(err) = extract_natives_file(current_path.join(jar_filename_native), path.join("version").join(data.id.clone()).join("natives"), &extract) {
                    error!("Failed to extract natives file | {}",err);
                }
            }
            continue;
        }
        if let Some(artifact) = i["downloads"].get("artifact") {
            let url = artifact["url"].as_str().expect("Failed to make string").to_string();
            let sha1 = artifact["sha1"].as_str().expect("Failed to make string").to_string();
            if let Err(err) = download_file(url, current_path.join(jar_filename), Some(sha1), false) {
                error!("{}",err);
                return Err(InterialError::boxed("Failed to download libarary artifact"));
            }
        }
        if !native.is_empty() {
            let url = i["downloads"]["classifiers"][native.clone()]["url"].as_str().expect("Failed to make a string").to_string();
            let sha1 = i["downloads"]["classifiers"][native]["sha1"].as_str().expect("Failed to make a string").to_string();
            if let Err(err) = download_file(url, current_path.join(jar_filename_native), Some(sha1), false) {
                error!("{}",err);
                return Err(InterialError::boxed("Failed to download library native file"));
            }
        }
        callback(count.clone(),0,count,None);
    }

    info!("Download of libraries has finished");
    Ok(())
}

fn install_assets(data: &JsonVersionsData, path: PathBuf, callback: CallBack) -> WithException<()> {

    if let Some(asset_index) = data.assetIndex.clone() {
        let url = asset_index["url"].as_str().expect("Failed to make string").to_string();
        let sha1 = asset_index["sha1"].as_str().expect("Failed to make string").to_string();
        let file_path = path.join("assets").join("indexes").join(format!("{}.json",data.assets.clone().expect("Failed to get assets key")));

        if let Err(err) = download_file(url,file_path.clone(), Some(sha1), false) {
            error!("{}",err);
            return Err(InterialError::boxed("Failed to download asset file"));
        }

        let assets_data = match read_to_string(file_path) {
            Ok(raw) => {
                match serde_json::from_str::<AssetMap>(&raw) {
                    Ok(value) => value,
                    Err(err) => {
                        error!("{}",err);
                        return Err(InterialError::boxed("Failed to parse data into struct"));
                    }
                }
            }
            Err(err) => {
                error!("{}",err);
                return Err(InterialError::boxed("Failed to read file"));
            }
        };

        callback(0,0,0,Some(assets_data.objects.len()));
        let mut count = 0;
        for (key,value) in assets_data.objects.iter() {
            info!("Fetch: {}",key);
            let pre = value.hash.get(0..2).expect("Should have this value");
            let url = format!("https://resources.download.minecraft.net/{}/{}",pre,value.hash.clone());
            let outpath = path.join("assets").join("objects").join(pre).join(value.hash.clone());
            if let Err(err) = download_file(url, outpath, Some(value.hash.clone()), false){
                error!("{}",err);
                return Err(InterialError::boxed("Failed to download object"));
            }
            count += 1;
            callback(count,0,count,None);
        }


    }

    Ok(())
}

fn do_version_install(version_id: String, path: PathBuf, url: Option<String>, callback: CallBack) -> WithException<()> {

    let version_json = path.join("versions").join(version_id.clone()).join(format!("{}.json",version_id));

    if let Some(do_url) = url {
        if let Err(err) = download_file(do_url,version_json.clone(), None, false) {
            error!("{}",err);
            return Err(InterialError::boxed("Failed to download verion json"));
        }
    }

    let mut version_data: JsonVersionsData = match read_to_string(version_json) {
        Ok(raw) => {
            match serde_json::from_str::<JsonVersionsData>(&raw) {
                Ok(value) => value,
                Err(err) => {
                    error!("{}",err);
                    return Err(InterialError::boxed("Failed to parse data into struct"));
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            return Err(InterialError::boxed("Failed read file"));
        }
    };


    if version_data.inheritsFrom.is_some() {
        match inherit_json(&version_data, &path) {
            Ok(data) => {
                version_data = data;
            }
            Err(err) => return Err(err)
        }
    }

    if let Err(err) = install_libraries(&version_data, path.clone(), callback) {
        return Err(err);
    }
    if let Err(err) = install_assets(&version_data, path.clone(), callback) {
        return Err(err);
    }

    if let Some(logging) = version_data.logging {
        if logging.as_object().expect("Failed to make logging a object").len() != 0 {
            let logging_file = path.join("assets").join("log_configs").join(logging["client"]["file"]["id"].as_str().expect("Failed to make string"));
            let url = logging["client"]["file"]["url"].as_str().expect("Failed to make string").to_string();
            let sha1 = logging["client"]["file"]["sha1"].as_str().expect("Failed to make string").to_string();
            if let Err(err) = download_file(url, logging_file, Some(sha1), false) {
                return Err(err);
            }
        }
    }

    if let Some(downloads) = version_data.downloads {
        let url = downloads["client"]["url"].as_str().expect("Failed to make string").to_string();
        let sha1 = downloads["client"]["sha1"].as_str().expect("Failed to make string").to_string();
        let output = path.join("versions").join(version_data.id.clone()).join(format!("{}.jar",version_data.id.clone()));
        if let Err(err) = download_file(url, output, Some(sha1), false) {
            return Err(err);
        }
    }

    if let Some(java_version) = version_data.javaVersion {
        info!("Start JVM check");
        let runtime = java_version["component"].as_str().expect("Failed to make string").to_string();
        match does_runtime_exist(runtime.clone(), path.clone()) {
            Ok(has_runtime) => {
                if !has_runtime {
                    if let Err(err) = install_jvm_runtime(runtime, path) {
                        return Err(err);
                    }
                }
            }
            Err(err) => return Err(err)
        }
    }

    Ok(())
}

pub fn install_minecraft_version(version_id: String, minecraft_dir: PathBuf) -> WithException<()> {
    
    if minecraft_dir.join("versions").join(version_id.clone()).join(format!("{}.json",version_id.clone())).is_file() {
        if let Err(err) = do_version_install(version_id, minecraft_dir,None, |progress, time, item, max_items| { info!("Progess {} | time: {} | item: {} | max: {:?}",progress,time,item,max_items); }  ) {
            return Err(err);
        }
        return Ok(());
    }

    match get_version_list() {
        Ok(versions) => {
            for i in versions.iter() {
                if i.id == version_id {
                    return do_version_install(version_id, minecraft_dir, Some(i.url.clone()), |progress, time, item, max_items| { info!("Progess {} | time: {} | item: {} | max: {:?}",progress,time,item,max_items); })
                }
            }
            Err(VersionNotFound::boxed(version_id))
        }
        Err(err) => Err(err)
    }
}
