use crate::minecraft::utils::{download_file,parse_rule_list,inherit_json,get_user_agent, JsonVersionsData};
use crate::minecraft::runtime::{install_jvm_runtime,does_runtime_exist};
use crate::minecraft::exceptions::{WithException,InterialError,VersionNotFound};
use crate::minecraft::natives::{get_natives,extract_natives_file};
use crate::minecraft::command::GameOptions;
use std::fs::read_to_string;
use std::path::PathBuf;
use log::{ error, info };
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

pub fn install_libraries(data: &JsonVersionsData, path: PathBuf) -> WithException<()> {

    for i in data.libraries.as_array().expect("Should be a array").iter() {
        if !parse_rule_list(&i, "rules", &mut GameOptions::default()) {
            continue;
        }

        let mut cur_path = path.join("libararies");
        let mut download_url = String::from("https://libraries.minecraft.net");

        if let Some(url) = i.get("url") {
            let mut new_url = url.clone().as_str().expect("Failed to make string").to_string();
            if new_url.ends_with("/") {
                new_url.pop();
                download_url = new_url;
            } else {
                download_url = new_url;
            }
        }

        // lib_path[0] == libPath, lib_path[1] == name, lib_path[2] == version
        let libdata: Vec<String> = i["name"].clone().as_str().expect("Failed to make string").split(":").map(|v|String::from(v)).collect();
        let libpath = libdata[0].clone();
        let name = libdata[1].clone();
        let mut version = libdata[2].clone();

        if libdata.len() != 3 {
            continue;
        }

        for lib_part in libpath.split(".") {
            cur_path = cur_path.join(lib_part);
            download_url = format!("{}/{}",download_url,lib_part).to_string();
        }


        let mut file_end = String::from("jar");
        // version_data[0] == version, version_data[1] == file_end
        let version_data: Vec<&str> = version.split("@").collect();

        if version_data.len() == 2 {
            file_end = String::from(version_data[1]);
            version = version_data[0].to_string();
        }


        let jar_filename = format!("{}-{}.{}",name,version,file_end).to_string();
        download_url = format!("{}/{}/{}",download_url,name,version).to_string();
        cur_path = cur_path.join(name.clone()).join(version.clone());
        
        let natives = get_natives(i);


        let mut jar_filename_native = String::new();
        if !natives.is_empty() {
            jar_filename_native = format!("{}-{}-{}.jar",name,version,natives).to_string();
        }

        download_url = format!("{}/{}",download_url,jar_filename).to_string();


        if let Err(err) = download_file(download_url, cur_path.clone().join(jar_filename.clone()), None, false) {
           return Err(err);
        }

        if i.get("downloads").is_none() {
            if let Some(extract) = i.get("extract") {
                if let Err(err) = extract_natives_file(cur_path.join(jar_filename_native),path.join("versions").join(data.id.clone()).join("natives"), extract){
                    return Err(err);
                }
            }
            continue;
        }

        if let Some(artifact) = i["downloads"].get("artifact") {
            let url = artifact["url"].clone().as_str().expect("Failed to make string").to_string();
            let sha1 = artifact["sha1"].clone().as_str().expect("Failed to make string").to_string();
            if let Err(err) = download_file(url, cur_path.join(jar_filename), Some(sha1), false){
                return Err(err);
            }
        }

        if !natives.is_empty() {
            let url = i["downloads"]["classifiers"][natives.clone()]["url"].clone().as_str().expect("Failed to make string").to_string();
            let sha1 = i["downloads"]["classifiers"][natives]["sha1"].clone().as_str().expect("Failed to make string").to_string();
            if let Err(err) = download_file(url, cur_path.join(jar_filename_native.clone()), Some(sha1), false) {
                return Err(err);
            }

            if let Some(extract) = i.get("extract") {
                if let Err(err) = extract_natives_file(cur_path.join(jar_filename_native), path.join("versions").join(data.id.clone()).join("natives"), extract) {
                    return Err(err);
                }
            }
        }
    }
    Ok(())
}

/// Install all assets
pub fn install_assets(data: &JsonVersionsData, path: PathBuf) -> WithException<()> {

    let asset_index = match data.assetIndex.clone() {
        Some(value) => value,
        None => return Ok(())
    };

    let url = asset_index["url"].clone().as_str().expect("Failed to make string").to_string();
    let asset_path = path.join("assets").join("indexes").join(format!("{}.json",data.assets.clone().expect("Expected prop assets to exists")));
    let sha1 = asset_index["sha1"].clone().as_str().expect("Failed to make string").to_string();

    if let Err(err) = download_file(url, asset_path.clone(), Some(sha1), false) {
        return Err(err);
    }

    let manifest: AssetMap = match read_to_string(asset_path) {
        Ok(value) => {
            match serde_json::from_str::<AssetMap>(&value) {
                Ok(json) => json,
                Err(err) => {
                    error!("{}",err);
                    return Err(InterialError::boxed("Failed to transform data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            return Err(InterialError::boxed("Failed to read file"))
        }
    };

    for (key,value) in manifest.objects.iter() {
        info!("GET {}",key);
        let pre = value.hash.get(0..2).expect("Should have this value");
        let url = format!("https://resources.download.minecraft.net/{}/{}",pre,value.hash.clone());
        let path = path.join("assets").join("objects").join(pre).join(value.hash.clone());

        if let Err(err) = download_file(url, path, Some(value.hash.clone()), false) {
            return Err(err);
        }
        
    }

    Ok(())
}

pub fn do_version_install(version_id: String, path: PathBuf, url: Option<String>) -> WithException<()> {
    
    let version_path = path.join("versions").join(version_id.clone()).join(format!("{}.json",version_id.clone()).to_string());
    if let Some(download) = url {
        if let Err(err) = download_file(download, version_path.clone(), None, false) {
            return Err(err);
        }
    }

    let mut manifest: JsonVersionsData = match read_to_string(version_path) {
        Err(err) => {
            error!("{}",err);
            return Err(InterialError::boxed("Failed to read manifest"))
        },
        Ok(raw) => {
            match serde_json::from_str::<JsonVersionsData>(&raw) {
                Ok(value) => value,
                Err(err) => {
                    error!("{}",err);
                    return Err(InterialError::boxed("Failed to translate manifest"));
                }
            }
        }
    };

    if manifest.inheritsFrom.is_some() {
        match inherit_json(&manifest, &path) {
            Ok(value) => {
                manifest = value;
            }
            Err(err) => {
                return Err(err);
            } 
        }
    }

    if let Err(err) = install_libraries(&manifest,path.clone()) {
        return Err(err);
    }
    if let Err(err) = install_assets(&manifest,path.clone()) {
        return Err(err);
    }

    if let Some(logging) = manifest.logging.clone() {
        let logger_file = path.join("assets").join("log_configs").join(logging["client"]["file"]["id"].clone().as_str().expect("Failed to make string"));
        if let Err(err) = download_file(
            logging["client"]["file"]["url"].clone().as_str().expect("Failed to make string").to_string(), 
            logger_file, 
            Some(logging["client"]["file"]["sha1"].clone().as_str().expect("Failed to make string").to_string()), 
            false) {
           return Err(err);
        }
    }

    if let Some(downloads) = manifest.downloads.clone() {
        let download_path = path.join("versions").join(manifest.id.clone()).join(format!("{}.jar",manifest.id.clone()).to_string());
        if let Err(err) = download_file(
            downloads["client"]["url"].clone().as_str().expect("Failed to make string").to_string(), download_path, Some(downloads["client"]["sha1"].clone().as_str().expect("Failed to make string").to_string()), false) {
            return Err(err);
        }
    }

    //Skipping support of old forge versions

    if let Some(args) = manifest.javaVersion.clone() {
        let version = args["component"].clone().as_str().expect("Failed to make string").to_string();
        match does_runtime_exist(version,path.clone()) {
            Ok(value) => {
                if !value {
                    return install_jvm_runtime(args["component"].clone().as_str().expect("Failed to make string").to_string(),path);
                }
            }
            Err(err) => return Err(err)
        }
    }

    Ok(())
}

/// Installs a minecraft version
pub fn install_minecraft_version(version_id: String, minecraft_dir: PathBuf) -> WithException<()> {

    let version_json_path = minecraft_dir.join("versions").join(version_id.clone()).join(format!("{}.json",version_id.clone()).to_string());

    if version_json_path.is_file() {
        return do_version_install(version_id, minecraft_dir, None);
    }

    let agent = get_user_agent();

    match agent.get("https://launchermeta.mojang.com/mc/game/version_manifest.json").call() {
        Ok(value) => {
            match value.into_json::<VersionManifest>() {
                Ok(json) => {
                    for version in json.versions {
                        if version.id == version_id {
                            return do_version_install(version_id, minecraft_dir, Some(version.url));
                        }
                    }

                    Err(VersionNotFound::boxed(version_id))
                }
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to transform data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to get version list"))
        }
    }
}


#[test]
fn test_install_minecraft_verions() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    let version = String::from("1.17.1");

    match install_minecraft_version(version, mc) {
        Ok(_) => {}
        Err(err) => {
            eprintln!("{}",err);
        } 
    }
}

#[test]
fn test_do_version_install() {
    unimplemented!();
}


#[test]
fn test_install_assets() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    let dummy = JsonVersionsData {
        inheritsFrom: None,
        arguments: json!({}),
        assetIndex: Some(json!({
            "id": "1.17",
            "sha1": "1898734d8df0347c8b297eff354a4e1738d28c21",
            "size": 346003,
            "totalSize": 346400827,
            "url": "https://launchermeta.mojang.com/v1/packages/1898734d8df0347c8b297eff354a4e1738d28c21/1.17.json"
        })),
        assets: Some(String::from("1.17")),
        complianceLevel: None,
        downloads: None,
        id: String::new(),
        javaVersion: None,
        libraries: json!({}),
        logging: None,
        mainClass: String::new(),
        minimumLauncherVersion: None,
        releaseTime: String::new(),
        time: String::new(),
        jar: None,
        r#type: String::new()
    };

    match install_assets(&dummy, mc) {
        Ok(_) => {}
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_install_libraries() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    let manifest = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft\\versions\\1.17.1\\1.17.1.json");

    let a = serde_json::from_str::<JsonVersionsData>(&read_to_string(manifest).expect("Failed")).expect("");

    match install_libraries(&a, mc) {
        Ok(_) => {}
        Err(value) => {
            eprintln!("{}",value);
        }
    }
}