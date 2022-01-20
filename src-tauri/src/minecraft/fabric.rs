use crate::minecraft::exceptions::{WithException,ExternalProgramError,InterialError, VersionNotFound, UnsupportedVersion};
use crate::minecraft::utils::{download_file,get_user_agent, is_version_vaild};
use crate::minecraft::install::install_minecraft_version;
use crate::minecraft::runtime::get_exectable_path;
use crate::minecraft::modloader_utils::{get_metadata};
use crate::app::APP_INFO;
use std::process::{Command,Stdio};
use std::path::PathBuf;
use std::fs::remove_file;
use serde::{Deserialize,Serialize};
use app_dirs2::{app_dir, AppDataType};
use log::{error,info };
use simplelog::{TermLogger, LevelFilter, Config, TerminalMode, ColorChoice };

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


/// Returns all available minecraft versions for fabric
fn get_all_minecraft_versions() -> WithException<Vec<FabricVersionItem>> {
    let agent = get_user_agent();

    match agent.get(format!("{}game",FABRIC_API_ROOT).as_str()).call() {
        Ok(value) => {
            match value.into_json::<Vec<FabricVersionItem>>() {
                Ok(versions) => Ok(versions),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to transfrom api data"))
                }
            }
        }
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to make request to api"))
        }
    }
}
// returns a list of stable minecraft versions that support fabric
pub fn get_stable_fabric_minecraft_versions() -> WithException<Vec<FabricVersionItem>> {

    let versions: Vec<FabricVersionItem> = match get_all_minecraft_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let mut stable: Vec<FabricVersionItem> = vec![];
    for version in versions.iter().filter(|version|version.stable == true) {
        stable.push(version.clone());
    }

    Ok(stable)
}
/// returns the latest unstable minecraft version that supports fabric. IE: a snapshot
fn get_latest_minecraft_version() -> WithException<String> {
    
    let mc = match get_all_minecraft_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match mc.get(0) {
        Some(version) => {
            Ok(version.version.clone())
        }
        None => {
            Err(VersionNotFound::boxed(""))
        }
    }
}
/// Returns that latest statble minecraft version that supports fabric
pub fn get_latest_stable_fabric_minecraft_version() -> WithException<String> {
    let stable = match get_stable_fabric_minecraft_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match stable.get(0) {
        Some(version) => {
            Ok(version.version.clone())
        }
        None => Err(VersionNotFound::boxed(""))
    }
}
/// check is a minecraft version is supported by fabric
fn is_minecraft_version_supported(version: String) -> WithException<bool> {
    let versions = match get_all_minecraft_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    for i in versions.iter() {
        if i.version == version {
            return Ok(true);
        }
    }

    Ok(false)
}

/// returns all fabric loader versions
fn get_all_loader_versions() -> WithException<Vec<FabricLoaderVersion>> {
    let agent = get_user_agent();

    match agent.get(format!("{}loader",FABRIC_API_ROOT).as_str()).call() {
        Ok(value) => {
            match value.into_json::<Vec<FabricLoaderVersion>>() {
                Ok(versions) => Ok(versions),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to transform api data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}
/// get the latest fabric loader version
fn get_latest_loader_version() -> WithException<String> {
    let versions = match get_all_loader_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match versions.get(0) {
        Some(version) => {
            Ok(version.version.clone())
        },
        None => Err(VersionNotFound::boxed("fabric loader")) 
    }

}

/// Returns the latest installer version
fn get_latest_installer_verion() -> WithException<String> {
    match get_metadata(FABRIC_INSTALLER_MAVEN) {
        Ok(value) => {
           Ok(value.versioning.release.clone())
        }
        Err(err) => return Err(err)
    }
}

/// Install a fabric version
pub fn install_fabric(mc_version: String, mc_dir: PathBuf, loader_verion: Option<String>, java: Option<String>) -> WithException<()> {
    
    match is_version_vaild(mc_version.clone(), mc_dir.clone()) {
        Ok(value) => {
            if !value {
                return Err(VersionNotFound::boxed(mc_version));
            }
        }
        Err(err) => {
            return Err(err);
        }
    }

    match is_minecraft_version_supported(mc_version.clone()) {
        Ok(value) => {
            if !value {
                return Err(UnsupportedVersion::boxed(mc_version));
            }
        }
        Err(err) => {
            return Err(err);
        }
    }

    let loader = match loader_verion {
        Some(value) => value,
        None => {
            match get_latest_loader_version() {
                Ok(value) => value,
                Err(err) => return Err(err)
            }
        }
    };

    if !mc_dir.join("versions").join(mc_version.clone()).join(format!("{}.json",mc_version)).is_file() || !mc_dir.join("versions").join(mc_version.clone()).join(format!("{}.jar",mc_version)).is_file(){
        if let Err(err) = install_minecraft_version(mc_version.clone(), mc_dir.clone()) {
            return Err(err);
        }
    }
    
    let installer_version = match get_latest_installer_verion() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let installer_url = format!("{maven}{version}/fabric-installer-{version}.jar",maven=FABRIC_INSTALLER_MAVEN,version=installer_version).to_string();

    let install_path_temp = match app_dir(AppDataType::UserConfig, &APP_INFO,"/temp") {
        Ok(value) => value,
        Err(err) => {
            error!("{}",err);
            return Err(InterialError::boxed("Failed to get temp path"));
        }
    };

    let tmp = install_path_temp.join("fabric-install.jar");

    if let Err(err) = download_file(installer_url, tmp.clone(), None, false) {
        return Err(err);
    }

    let exec = match java {
        Some(value) => value,
        None => {
            match get_exectable_path("java-runtime-beta".to_string(), mc_dir.clone()) {
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
        tmp.to_str().expect("Failed to make path a string"),
        "client",
        "-dir",
        mc_dir.to_str().expect("Failed to make path a string"),
        "-mcversion",
        mc_version.as_str(),
        "-loader",
        loader.as_str()
    ];

    match Command::new(exec).args(args).stdout(Stdio::inherit()).output() {
        Ok(output) => {

            info!("Fabric loader Status: {}", output.status);
            info!("Fabric loader stdout: {}", String::from_utf8_lossy(&output.stdout));
            info!("Fabric loader stderr: {}", String::from_utf8_lossy(&output.stderr));

            if let Err(err) = remove_file(install_path_temp.join("fabric-install.jar")) {
                error!("{}",err);
                return Err(InterialError::boxed("Failed to remove temp file"));
            }
        }
        Err(err) => {
            error!("{}",err);
            let arg_string = args.join(" ");
            println!("{}",arg_string);
            return Err(ExternalProgramError::boxed("Failed to run fabric installer",&arg_string, "", ""));
        }
    }


    let fabric_mc = format!("fabric-loader-{}-{}",loader,mc_version).to_string();
    info!("Start {} install",fabric_mc);
    install_minecraft_version(fabric_mc, mc_dir)
}


#[test]
fn test_install_fabric() {
    TermLogger::init(LevelFilter::Info,Config::default(), TerminalMode::Stdout, ColorChoice::Always).expect("Failed to make logger");
    //TermLogger::init(LevelFilter::Info,Config::default(), TerminalMode::Stdout, ColorChoice::Always).expect("Failed to make logger");
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    if let Err(err) = install_fabric(String::from("1.18.1"),mc,None,None) {
        eprintln!("{}",err);
    }
}

#[test]
fn test_get_latest_installer_verion() {
    match get_latest_installer_verion() {
        Ok(value) => println!("{:#?}",value),
        Err(err) => eprintln!("{}",err)
    }
}

#[test]
fn test_get_latest_loader_version() {
    match get_latest_loader_version() {
        Ok(value) => println!("{:#?}",value),
        Err(err) => eprintln!("{}",err)
    }
}

#[test]
fn test_get_all_loader_versions() {
    match get_all_loader_versions() {
        Ok(value) => println!("{:#?}",value),
        Err(err) => eprintln!("{}",err)
    }
}


#[test]
fn test_is_minecraft_version_supported() {
    match is_minecraft_version_supported(String::from("1.18.1")) {
        Ok(value) => assert_eq!(value,true),
        Err(err) => eprintln!("{}",err)
    }
    match is_minecraft_version_supported(String::from("1.13.0")) {
        Ok(value) => assert_eq!(value,false),
        Err(err) => eprintln!("{}",err)
    }
}


#[test]
fn test_get_latest_stable_minecraft_version() {
    match get_latest_stable_fabric_minecraft_version() {
        Ok(value) => {
            println!("{}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}


#[test]
fn test_get_latest_minecraft_version() {
    match get_latest_minecraft_version() {
        Ok(value) => {
            println!("{}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_stable_minecraft_versions() {
    match get_stable_fabric_minecraft_versions() {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}


#[test]
fn test_get_all_minecraft_versions() {
    match get_all_minecraft_versions() {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}


