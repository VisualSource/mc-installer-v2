use crate::expections::{ LauncherLibError,LibResult};
use crate::utils::{get_http_client,  get_offical_version_list, download_file };
use crate::mod_utiles::get_metadata;
use crate::runtime::get_exectable_path;
use crate::vanilla::install_minecraft_version;
use crate::json::{
    runtime::MinecraftJavaRuntime,
    install::{ Callback, Event }
};
use std::path::PathBuf;
use serde::{ Deserialize, Serialize };
use std::process::{Command,Stdio};

const FABRIC_API_ROOT: &str = "https://meta.fabricmc.net/v2/versions/";
const FABRIC_INSTALLER_MAVEN: &str = "https://maven.fabricmc.net/net/fabricmc/fabric-installer/";

#[derive(Serialize,Deserialize, Debug,Clone)]
pub struct FabricVersionItem {
    pub version: String,
    pub stable: bool
}

#[derive(Deserialize, Debug,Clone)]
struct FabricLoaderVersion {
    separator: String,
    build: i32,
    maven: String,
    version: String,
    stable: bool
}

pub fn get_supported_mc_versions() -> LibResult<Vec<FabricVersionItem>> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match client.get(format!("{}game",FABRIC_API_ROOT).as_str()).send() {
        Ok(value) => {
            match value.json::<Vec<FabricVersionItem>>() {
                Ok(versions) => Ok(versions),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        }
        Err(error) => Err(LauncherLibError::HTTP{ 
            source: error,
            msg: "Failed to maker request".into()
        })
    }
}

pub fn get_supported_stable_versions() -> LibResult<Vec<FabricVersionItem>> {
    let versions = match get_supported_mc_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let mut stable: Vec<FabricVersionItem> = vec![];
    for version in versions.iter().filter(|version|version.stable == true) {
        stable.push(version.clone());
    }

    Ok(stable)
}

pub fn get_latest_supported() -> LibResult<String> {
    let mc = match get_supported_mc_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };
    match mc.get(0) {
        Some(version) => Ok(version.version.clone()),
        None => Err(LauncherLibError::NotFound("Unknown".into()))
    }
}

pub fn get_latest_supported_stable() -> LibResult<String> {
    let versions = match get_supported_stable_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match versions.get(0) {
        Some(value) => Ok(value.version.clone()),
        None => Err(LauncherLibError::NotFound("Unknown".into()))
    }
}

pub fn is_supported(mc_version: String) -> LibResult<bool> {
    let versions = match  get_supported_mc_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let is_vaild = versions.iter().any(|e| e.version == mc_version);

    Ok(is_vaild)
}

fn get_loader_versions() -> LibResult<Vec<FabricLoaderVersion>> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match client.get(format!("{}loader",FABRIC_API_ROOT).as_str()).send() {
        Ok(value) => {
            match value.json::<Vec<FabricLoaderVersion>>(){
                Ok(versions) => Ok(versions),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        }
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to make http request".into()
        })
    }
}

fn get_latest_loader_version() -> LibResult<String> {
    let loaders = match get_loader_versions() {
      Ok(value) => value,
      Err(err) => return Err(err)  
    };
    match loaders.get(0) {
        Some(value) => Ok(value.version.clone()),
        None => Err(LauncherLibError::NotFound("Unkown".into()))
    }
}

fn get_latest_installer() -> LibResult<String> {
    match get_metadata(FABRIC_INSTALLER_MAVEN) {
        Ok(value) => Ok(value.versioning.release.clone()),
        Err(err) => return Err(err)
    }
}

pub fn install_fabric(mc: String, mc_dir: PathBuf, loader: Option<String>, callback: Callback, java: Option<String>, temp_path: PathBuf) -> LibResult<()> {

    let mc_path = mc_dir.join("versions").join(mc.clone()).join(format!("{}.json",mc));

    // check if given mc version is a offical version.
    match get_offical_version_list() {
        Ok(version) => {
            if !version.iter().any(|e| e.id == mc) {
                return Err(LauncherLibError::NotFound(mc))
            }
        }
        Err(err) => return Err(err)
    }

    // check if given minecraft version is supported by fabric
    match is_supported(mc.clone()) {
        Err(err) => return Err(err),
        Ok(value) => {
            if !value {
                return Err(LauncherLibError::Unsupported(mc));
            }
        }
    }

    let loaderv = match loader {
        Some(value) => value,
        None => {
            match get_latest_loader_version() {
                Ok(value) => value,
                Err(err) => return Err(err)
            }
        }
    };

    if !mc_path.is_file() {
        if let Err(err) = install_minecraft_version(mc.clone(), mc_dir.clone(), callback) {
            return Err(err);
        }
    }

    let fabric_mc = format!("fabric-loader-{}-{}",loaderv,mc).to_string();

    let fabric = mc_dir.join("versions").join(fabric_mc.clone()).join(format!("{}.json",fabric_mc));

    if fabric.is_file() {
        return Ok(());
    }

    let installer_version = match get_latest_installer() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let installer_url = format!("{maven}{version}/fabric-installer-{version}.jar",
        maven=FABRIC_INSTALLER_MAVEN,
        version=installer_version
    ).to_string();

    let installer_file = temp_path.join("fabric-install.js");

    callback(Event::progress(0, 1));
    if let Err(err) = download_file(installer_url, installer_file.clone(), callback, None, false) {
        return Err(err);
    }
    callback(Event::progress(1, 1));

    let exec = match java {
        Some(value) => value,
        None => {
            match get_exectable_path(MinecraftJavaRuntime::JavaRuntimeBeta, mc_dir.clone()) {
                Ok(value) => {
                    match value {
                        Some(j) => String::from(j.to_str().expect("Failed to make path a string")),
                        None => String::from("java")
                    }
                }
                Err(err) => return Err(err)
            }
        }
    };

    let args = [
        "-jar",
        installer_file.to_str().expect("Failed to make path a string"),
        "client",
        "-dir",
        mc_dir.to_str().expect("Failed to make path a string"),
        "-mcversion",
        mc.as_str(),
        "-loader",
        loaderv.as_str(),
        "-noprofile"
    ];

    match Command::new(exec).args(args).stdout(Stdio::inherit()).output() {
        Ok(value) => {
            callback(Event::Status(String::from_utf8_lossy(&value.stderr).to_string()));
            callback(Event::Status(String::from_utf8_lossy(&value.stdout).to_string()));
            callback(Event::Status(value.status.to_string()));

            if let Err(err) = std::fs::remove_file(installer_file) {
                return Err(LauncherLibError::OS {
                    source: err,
                    msg: "Failed to remove file".into()
                });
            }

        }
        Err(err) => return Err(LauncherLibError::OS {
            source: err,
            msg: "Failed to run command".into()
        })
    };

    install_minecraft_version(fabric_mc, mc_dir, callback)
}



#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_get_supported_mc_versions() {
        match get_supported_mc_versions() {
            Ok(value) => println!("{:#?}",value),
            Err(err) => eprintln!("{}",err)
        }
    }
}