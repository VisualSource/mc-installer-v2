use crate::minecraft::exceptions::{WithException,ExternalProgramError,InterialError, UnsupportedVersion};
use crate::minecraft::install::{ install_minecraft_version };
use crate::minecraft::modloader_utils::get_metadata;
use crate::minecraft::runtime::get_exectable_path;
use crate::minecraft::utils::{download_file};
use crate::app;
use std::process::{ Command,Stdio };
use std::{thread::sleep,time};
use std::fs::remove_file;
use std::path::PathBuf;
use app_dirs2::{ app_root,AppDataType };
use log::{error,info};


// install url https://github.com/xfl03/ForgeInstallerHeadless/releases/download/1.0.1/forge-installer-headless-1.0.1.jar
const FORGE_DOWNLOAD_URL: &str = "https://files.minecraftforge.net/maven/net/minecraftforge/forge/{version}/forge-{version}-installer.jar";
const FORGE_HEADLESS_URL: &str = "https://github.com/TeamKun/ForgeCLI/releases/download/1.0.1/ForgeCLI-1.0.1-all.jar";
const FORGE_MAVEN_ROOT: &str = "https://maven.minecraftforge.net/net/minecraftforge/forge/";
const FORGE_HEADLES_JAR_SHA1: &str = "92c00e9a926483b76670ba4f2d21659df330ffee";

/// install forge
pub fn install_forge_version(version: String, path: PathBuf, java: Option<String>) -> WithException<()> {

    match is_vaild_forge_version(version.clone()) {
        Err(err) => return Err(err),
        Ok(value) => {
            if !value {
                return Err(UnsupportedVersion::boxed(version))
            }
        }
    }

    let app_config = match app_root(AppDataType::UserConfig, &app::APP_INFO){
        Ok(value) => value,
        Err(err) => {
            error!("{}",err);
            return Err(InterialError::boxed("failed to get app root"))
        }
    };

    let headless = app_config.join("downloads").join("forge-installer-headless.jar");
    let forge_jar = app_config.join("temp").join("forge-installer.jar");

 
    if let Err(err) = download_file(FORGE_HEADLESS_URL.to_string(), headless.clone(), None, false) {
        return Err(err);
    }

    let forge_url = FORGE_DOWNLOAD_URL.replace("{version}", version.as_str()).to_string();
    // 0 = minecraft version, 1 = forge build
    let forge_id: Vec<&str> = version.split("-").collect();


    if let Err(err) = download_file(forge_url, forge_jar.clone(), None, false) {
        return Err(err);
    }

    let exec = match java {
        Some(value) => value,
        None => {
            match get_exectable_path("java-runtime-beta".to_string(), path.clone()) {
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

    if let Err(err) = install_minecraft_version(String::from(forge_id[0]),path.clone()) {
        return Err(err);
    }

    let forge_jar_path = forge_jar.to_str().expect("Failed to convert to string");
    let headles_path = headless.to_str().expect("Failed to convert to string");

    let args = [
        "-jar",
        headles_path,
        "--installer",
        forge_jar_path,
        "--target",
        path.to_str().expect("Failed to convert to str")
    ];

    if !forge_jar.exists() {
        info!("File is not in dir: Waiting 1000ms");
        sleep(time::Duration::from_millis(1000));
    }

    match Command::new(exec).args(args).stdout(Stdio::inherit()).output() {
        Ok(output) => {
            
            info!("Forge installer Status: {}",output.status);
            info!("Forge installer stdout: {}", String::from_utf8_lossy(&output.stdout));
            info!("Forge installer stderr: {}", String::from_utf8_lossy(&output.stderr));

            if let Err(err) = remove_file(forge_jar) {
                error!("{}",err);
                return Err(InterialError::boxed("Failed to remove temp file"));
            }
        }
        Err(err) => {
            error!("{}",err);
            return Err(ExternalProgramError::boxed("failed to execute process","", "", ""));
        }
    }



    let version_id = version.split("-").collect::<Vec<&str>>();
    let id = format!("{}-forge-{}",version_id[0],version_id[1]).to_string();
    info!("Start install of {}",id);
    install_minecraft_version(id, path)
}

/// returns a list of forge versions
pub fn list_forge_versions() -> WithException<Vec<String>>{
    match get_metadata(FORGE_MAVEN_ROOT) {
        Ok(value) => {
           Ok(value.versioning.versions.version)
        }
        Err(err) => return Err(err)
    }
}

/// finds the lastestforge version that is compatible to the given vanilla version
pub fn find_forge_version(vanilla_version: String) -> WithException<Option<String>> {
    match list_forge_versions() {
        Ok(versions) => {
            for version in versions {
                if let Some(mc) = version.split("-").collect::<Vec<&str>>().get(0) {
                    if *mc == &vanilla_version {
                        return Ok(Some(version));
                    }
                }
            }
            Ok(None)
        }
        Err(err) => Err(err)
    }
}

/// check if given is a vaild version
pub fn is_vaild_forge_version(forge: String) -> WithException<bool> {
    match list_forge_versions() {
        Ok(versions) => {
            Ok(versions.contains(&forge))
        }
        Err(err) => Err(err)
    }
}

#[test]
fn test_install_forge_version() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    if let Err(err) = install_forge_version(String::from("1.17.1-37.1.1"), mc, None) {
        eprintln!("{}",err);
    }
}


#[test]
fn test_find_forge_version() {
    match find_forge_version(String::from("1.17.1")) {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(err)=>{
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_is_vaild_forge_version() {
    let versions = vec![String::from("1.17.1-37.1.1"),String::from("1.17.1-45.1.2")];
    for version in versions {
        match is_vaild_forge_version(version) {
            Ok(value) => {
                println!("VAILD: {}",value);
            }
            Err(err) => {
                eprintln!("{}",err);
            }
        }
    }
}

#[test]
fn test_list_forge_versions() {
    match list_forge_versions() {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

