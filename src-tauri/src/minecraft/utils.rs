extern crate zip;
extern crate regex;
extern crate lzma_rs;
use crate::minecraft::exceptions::{ InterialError, WithException};
use crate::minecraft::command::GameOptions;
use std::fs::{ read_to_string, create_dir_all, write, read, remove_file, File };
use std::path::{ Path, PathBuf };
use std::env::{ consts, var, };
use std::io::BufReader;
use crypto::{ sha1::Sha1, digest::Digest };
use ureq::{ Agent, AgentBuilder };
use log::{ info, error, warn, debug };
use serde::Deserialize;

pub type CallBack = fn(progress: u32, time: u32, size: String);

const MINECRAFT_MANIFEST: &str = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
const USER_AGENT_ID: &str = "mcmodclient/1.0";

#[derive(Debug)]
pub enum FileState {
    Download,
    Exists,
    ExistsUnchecked
}

#[allow(non_snake_case)]
#[derive(Deserialize, Debug)]
pub struct JsonVersionsData {
    pub inheritsFrom: Option<String>,
    pub arguments: serde_json::Value,
    pub assetIndex: Option<serde_json::Value>,
    pub assets: Option<String>,
    pub complianceLevel: Option<u32>,
    pub downloads: Option<serde_json::Value>,
    pub id: String,
    pub javaVersion: Option<serde_json::Value>,
    pub libraries: serde_json::Value,
    pub logging: Option<serde_json::Value>,
    pub mainClass: String,
    pub minimumLauncherVersion: Option<u32>,
    pub releaseTime: String,
    pub time: String,
    pub jar: Option<String>,
    pub r#type: String,
}

#[derive(Deserialize)]
pub struct ManifestJsonLastest {
    pub release: String,
    pub snapshot: String
}

#[allow(non_snake_case)]
#[derive(Deserialize)]
pub struct ManifestJsonVersions {
    pub id: String,
    pub r#type: String,
    pub url: String,
    pub time: String,
    pub releaseTime: String
}

#[derive(Deserialize)]
pub struct ManifestJson {
    pub latest: ManifestJsonLastest,
    pub versions: Vec<ManifestJsonVersions>
}

/// Get the http UserAgent
pub fn get_user_agent() -> Agent {
    AgentBuilder::new().user_agent(USER_AGENT_ID).build()
}

/// Returns the classpath seperator for the current os
pub fn get_classpath_separator() -> String {
    match consts::OS {
        "windows" => {
            String::from(";")
        }
        _ => {
            String::from(":")
        }
    }
}

pub fn get_os_version() -> String {
    if let Ok(version) = os_version::detect() {
        match version {
            os_version::OsVersion::Windows(value) => {
                format!("{}.",value.version).to_string()
            } 
            os_version::OsVersion::Linux(value) => {
                if let Some(version) = value.version {
                    version
                } else {
                    String::default()
                }
            }
            _ => {
                String::default()
            }
        }
    } else {
        String::default()
    }
}

/// Returns the default path to the .minecraft directory
pub fn get_minecraft_directory() -> WithException<PathBuf> {
    match consts::OS {
        "windows" => {
            match var("APPDATA") {
                Ok(appdata) => {
                    Ok(Path::new(&appdata).join(".minecraft"))
                }
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed(format!("Failed to get APPDATA env variable. | {}", err.to_string())))
                }
            }
        }
        _ => {
            Err(InterialError::boxed("Current System is not windows!"))
        }
    }
}
/// Returns the latest version of Minecraft
pub fn get_latest_version() -> WithException<ManifestJsonLastest> {
    match get_user_agent().get(MINECRAFT_MANIFEST).call() {
        Ok(response) => {
            let raw_json: std::io::Result<ManifestJson> = response.into_json();
            match raw_json {
                Ok(json) => Ok(json.latest),
                Err(err) => {
                    warn!("{}",err);
                    Err(InterialError::boxed(format!("HTTP | Failed to convert body to json | {}", err.to_string())))
                }
            }
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:?}",res);
            let response = res.into_string().expect("Failed to transform response into a string");
            Err(InterialError::boxed(format!("HTTP ERROR | code: {} | reason: {}",code,response)))
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("HTTP ERROR | UNKNOWN ERROR"))
        }
    }
}
/// Returns all versions the Mojang offers to download
pub fn get_version_list() -> WithException<Vec<ManifestJsonVersions>> {
    let agent: Agent = AgentBuilder::new().user_agent(USER_AGENT_ID).build();
    match agent.get(MINECRAFT_MANIFEST).call() {
        Ok(response) => {
            let raw_json: std::io::Result<ManifestJson> = response.into_json();
            match raw_json {
                Ok(json) => Ok(json.versions),
                Err(err) => { 
                    error!("{}",err);
                    Err(InterialError::boxed(format!("HTTP | Failed to convert body to json | {}", err.to_string())))
                }
            }
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:?}",res);
            let response = res.into_string().expect("Failed to transform response into a string");
            Err(InterialError::boxed(format!("HTTP ERROR | code: {} | reason: {}",code,response)))
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("HTTP ERROR | UNKNOWN ERROR"))
        }
    }
}
/// Returns all installed versions
pub fn get_installed_versions() -> WithException<Vec<JsonVersionsData>> {
    match get_minecraft_directory() {
        Ok(dir) => {
            let mut versions_dir = dir;
            versions_dir.push("versions");
            match versions_dir.read_dir() {
                Ok(dir_contents) => {
                    let mut versions: Vec<JsonVersionsData> = vec![];
                    for folder in dir_contents {
                        match folder {
                            Ok(data) => {  
                                if let Some(comp) = data.path().components().last() {
                                    let base = comp.as_os_str().to_str().unwrap();
                                    let mut path = data.path();
                                    path.push(format!("{}.json",base));
                                    if !path.is_file() { continue; }
                                    if let Ok(raw_json) = read_to_string(path) {
                                        let json: JsonVersionsData = serde_json::from_str(&raw_json).unwrap();
                                        versions.push(json);
                                    }
                                }
                            }
                            Err(err) => {
                                error!("{}",err);
                            }
                        }
                    }
                    Ok(versions)
                }
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed(format!("Failed to read dir | {}", err.to_string())))
                }
            }
        }
        Err(err) => Err(err)
    }
}

/// Returns all installed versions and all all offical versions 
pub fn get_available_versions() -> WithException<Vec<String>> {
    let versions: Vec<ManifestJsonVersions> = match get_version_list() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let installed: Vec<JsonVersionsData> = match get_installed_versions() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };
    let accepted_versions = vec!["1.17".to_string(),"1.18".to_string()];

    let mut version_list: Vec<String> = vec![];

    for i in versions {
        let id = i.id.clone();
        for acc in &accepted_versions {
            if i.id.contains(acc) && i.r#type == "release" {
                version_list.push(id.clone());
            }
        }
    }

    for i in installed {
        if version_list.contains(&i.id) {
            continue;
        }
        version_list.push(i.id);
    }

    Ok(version_list)
}

/// Tries to find out the path to the default java executable
pub fn get_java_executable() -> WithException<PathBuf> {
    match consts::OS {
        "windows" => {
            match var("JAVA_HOME") {
                Ok(java) => {
                    Ok(Path::new(&java).join("bin").join("java.exe"))
                }
                Err(_) => {
                    let oracle_path = Path::new("C:\\Program Files (x86)\\Common Files\\Oracle\\Java\\javapath\\java.exe");
                    let jdk_path = Path::new("C:\\Program Files\\AdoptOpenJDK");
                    if oracle_path.is_file() {
                        Ok(oracle_path.to_path_buf())
                    } else if jdk_path.is_dir() {
                        if let Ok(dir) = jdk_path.read_dir() {
                            if let Some(folder) = dir.last() {
                                let java = folder.unwrap().path().join("\\bin\\java.exe");
                                if java.is_file() {
                                    Ok(java.to_path_buf())
                                } else {
                                    error!("Failed to file java exe");
                                    Err(InterialError::boxed("There are no java exe install"))
                                }
                            } else {
                                error!("Failed to file java exe");
                                Err(InterialError::boxed("There are no java version install in AdoptOpenJDK"))
                            }
                        } else {
                            error!("Failed to file java exe");
                            Err(InterialError::boxed("Failed to find java exe"))
                        }
                    } else {
                        error!("Failed to file java exe");
                        Err(InterialError::boxed("Failed to find java exe"))
                    }
                }
            }
        }
        _ => {
            Err(InterialError::boxed("Current System is not windows!"))
        }
    }
}

/// generates the sha1 hash for a file
pub fn get_sha1_hash(path: PathBuf) -> WithException<String> {
    let mut hasher = Sha1::new();
    match read(path) {
        Ok(raw) => {
            hasher.input(&raw);
            Ok(hasher.result_str())
        }
        Err(err)=>{
            error!("{}",err);
            Err(InterialError::boxed(format!("SHA1 | Failed to read file | {}", err.to_string())))
        }
    }
}

/// Downloads a file with given url, path and sha1
pub fn download_file(url: String, output: PathBuf, /*_callback: CallBack,*/ sha1: Option<String>, lzma_compressed: bool) -> WithException<FileState> {

    // check if the file directory exits
    if !output.exists() {
        let mut path = output.clone();
        path.pop();
        if !path.exists() {
            if let Err(err) = create_dir_all(path) {
                eprintln!("DOWNLOAD CHECK PATH: {}",err);
                return Err(InterialError::boxed(format!("Failed to create output path | {}",err.to_string())));
            }
        }
    }

    // if exits/has sha1 check if vaild if not remove invaild file.
    if output.exists() && output.is_file() {
        if let Some(sha) = sha1.clone() {
            match get_sha1_hash(output.clone()) {
                Ok(value) => {
                    info!("FILE ALREADY EXISTS (SHA1): {:#?}",output.clone());
                    if sha == value {
                        return Ok(FileState::Exists);
                    }
                }
                Err(error) => {
                    return Err(error);
                }
            };
        } else {
            warn!("FILE ALREADY EXISTS (NO SHA1): {:#?}",output.clone());
            return Ok(FileState::ExistsUnchecked);
        }

        if let Err(error) = remove_file(output.clone()) {
            error!("DOWNLOAD FILE | {}",error);
            return Err(InterialError::boxed(format!("DOWNLOAD FILE | Failed to remove invaild file | {}",error.to_string())));
        }  
        
    }
    
    if !url.starts_with("http") {
        error!("Given url is not vaild");
        return Err(InterialError::boxed("DOWNLOAD FILE | Invaild url"));
    }

    match get_user_agent().get(&url).call() {
        Ok(response) => {
            let mut reader = response.into_reader();
            
            if lzma_compressed {
                let mut file = match File::create(output.clone()) {
                    Ok(value) => value,
                    Err(error) => {
                        error!("{}",error);
                        return Err(InterialError::boxed(error.to_string()));
                    }
                };

                let mut f = BufReader::new(reader);

                if let Err(error) = lzma_rs::lzma_decompress(&mut f, &mut file) {
                    error!("Faild to decompress file | {}",error);
                    return Err(InterialError::boxed(error.to_string()));
                }

                info!("DOWNLOADED LZMA FILE {:#?}",output.clone());

            } else {
                let mut writer: Vec<u8> = vec![];

                if let Err(err) = std::io::copy(&mut reader, &mut writer) {
                    error!("Failed to write data to buffer | {}",err);
                    return Err(InterialError::boxed(err.to_string()));
                }

                if let Err(err) = write(output.clone(), writer) {
                    error!("Failed to write file | {}",err);
                    return Err(InterialError::boxed(format!("Failed to write file to system | {}",err.to_string())));
                }

                warn!("DOWNLOADED RAW FILE {:#?}",output.clone());
            }

            if let Some(sha) = sha1 {
                match get_sha1_hash(output.clone()) {
                    Ok(value) => {
                        if sha == value {
                            return Ok(FileState::Download);
                        }
                    }
                    Err(error) => {
                        return Err(error);
                    }
                };
            }

            return Ok(FileState::Download);
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("Http Error | {:?}",res);
            let response = res.into_string().expect("Failed to transform response into a string");
            return Err(InterialError::boxed(format!("HTTP ERROR | Code: {} | Res: {}",code,response)));
        }
        Err(error) => {
            error!("Http error | {}",error);
            return Err(InterialError::boxed("HTTP ERROR | TRANSPORT ERROR"));
        }
    }
} 

/// Parse the mainclass of a jar from META-INF/MANIFEST.MF
pub fn get_jar_mainclass(path: PathBuf) -> WithException<String> {
    use std::io::Read;
 
    match File::open(path.clone()) {
        Ok(file) => {
            if let Ok(mut value) = zip::ZipArchive::new(file) {
                if let Ok(mut manifest) = value.by_name("META-INF/MANIFEST.MF") {
                    let mut buffer = String::new();
                    manifest.read_to_string(&mut buffer).expect("Failed to read META-INF/MANIFEST.MF");

                    let remove_sep = buffer.replace(":"," ");

                    let v: Vec<&str> = remove_sep.split_whitespace().collect();

                    let mut main_index = 0;

                    for i in 0..v.len() {
                        if v[i] == "Main-Class" {
                            main_index = i+1;
                        }
                    }
                    
                    if main_index < v.len() {
                        return Ok(String::from(v[main_index]));
                    }

                    error!("Failed to get Main-Class from {:?}", path.clone());
                    return Err(InterialError::boxed("Failed to get Main-Class"));
                }
            }
            
            error!("Failed to find META-INF/MANIFEST.MF from {:?}", path.clone());
            Err(InterialError::boxed("Failed to find META-INF/MANIFEST.MF"))
        }
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed(format!("Failed to read file | {}",error.to_string())))
        }
    }
}

/// Parse a single rule from versions.json in .minecraft
pub fn parse_single_rule(rule: &serde_json::Value, options: &mut GameOptions) -> bool {
 
    if !rule.is_object() {
        return false;
    }
    let mut result = false;
    
    if rule["action"] == "allow" {
        result = false;
    } else if rule["action"] == "disallow" {
        result = true;
    }

    if let Some(os) = rule.get("os") {
        for (key, value) in os.as_object().expect("Os was not object").iter() {
            match key.as_str() {
                "name" => {
                    if value.as_str().expect("Should have been a string") == "windows" && consts::OS != "windows" {
                        return result;
                    } else if value.as_str().expect("Should have been a string") == "osx" && consts::OS != "macos" {
                        return result;
                    } else if value.as_str().expect("Should have been a string") == "linux" && consts::OS != "linux" {
                        return result;
                    }
                }
                "arch" => {
                    if value == "x86" && consts::ARCH != "x86" {
                        return result;
                    }
                }
                "version" => {
                    let r = regex::Regex::new(value.as_str().expect("Failed to make string")).expect("Failed to create regex");
                    if !r.is_match(get_os_version().as_str()) {
                        return result;
                    }
                }
                _ => {}
            }
        }
    }


    if let Some(features) = rule.get("features") {
        for (key,_) in features.as_object().expect("Features was not a object").iter() {
            if key == "has_custom_resolution" && !options.custom_resolution.is_some() {
                return result;
            }
            if key == "is_demo_user" && !options.demo {
                return result;
            }
        }
    }

    !result
}

// Parse rule list
pub fn parse_rule_list(data: &serde_json::Value, rule_string: &str, options: &mut GameOptions) -> bool {
    if let Some(rules) = data.get(rule_string) {
        for i in rules.as_array().expect("Expexted data to be a object") {
            if !parse_single_rule(i, options) {
                return false;
            }
        }
        true
    } else {
        true
    }
}


/// Implement the inheritsFrom function
/// See <https://github.com/tomsik68/mclauncher-api/wiki/Version-Inheritance-&-Forge>
/// This function my be unneed
pub fn inherit_json(original_data: &JsonVersionsData, path: &PathBuf) -> WithException<JsonVersionsData> {
    let inherit_version = if let Some(value) = original_data.inheritsFrom.clone() { value } else {
        return Err(InterialError::boxed("Expected inheritesFrom to be set"));
    };
    

    let mut new_data = JsonVersionsData {
        inheritsFrom: None,
        time: original_data.time.clone(),
        releaseTime: original_data.releaseTime.clone(),
        id: original_data.id.clone(),
        r#type: original_data.r#type.clone(),
        mainClass: original_data.mainClass.clone(),
        arguments: original_data.arguments.clone(), //
        libraries: original_data.libraries.clone(),
        jar: original_data.jar.clone(),
        assetIndex: None,
        assets: None,
        javaVersion: None,
        downloads: None,
        complianceLevel: None,
        logging: None,
        minimumLauncherVersion: None,
    };



    let version_path = path.join("versions").join(inherit_version.clone()).join(format!("{}.json",inherit_version));
    let raw = if let Ok(value) = read_to_string(version_path.clone()) { value } else {
        error!("Failed to open inherited version from file | {:?}",version_path);
        return Err(InterialError::boxed("Failed to open inherited version file."));
    };

    let inherit_data: JsonVersionsData = if let Ok (data) = serde_json::from_str(&raw) { data } else {
        error!("Failed to read data into struct");
        return Err(InterialError::boxed("Failed to transform data"));
    }; 

    new_data.assetIndex = inherit_data.assetIndex;
    new_data.assets = inherit_data.assets;
    new_data.javaVersion = inherit_data.javaVersion;
    new_data.downloads = inherit_data.downloads;
    new_data.complianceLevel = inherit_data.complianceLevel;
    new_data.logging = inherit_data.logging;
    new_data.minimumLauncherVersion = inherit_data.minimumLauncherVersion;


    let libs = new_data.libraries.as_array_mut().expect("Libraries should be a array");

    for lib in inherit_data.libraries.as_array().expect("Libraries should be a array").iter() {
        libs.push(lib.to_owned());
    }

    let arguments_game = new_data.arguments.get_mut("game").expect("There should be game").as_array_mut().expect("Should be array");

    for arg in inherit_data.arguments.get("game").expect("args").as_array().expect("array") {
        arguments_game.push(arg.to_owned());
    }

    let arguments_game = new_data.arguments.get_mut("jvm").expect("There should be jvm").as_array_mut().expect("Should be array");

    for arg in inherit_data.arguments.get("jvm").expect("args").as_array().expect("array") {
        arguments_game.push(arg.to_owned());
    }

    Ok(new_data)
}

/// Transforms a class string in to a path
/// Ex: 
/// org.apache.logging.log4j:log4j-api:2.14.1 To
/// C:\\Users\\USER\\AppData\\Roming\\.minecraft\\libraries\\org\\apache\\logging\\log4j\\log4j-api\\2.14.1\\log4j-api-2.14.1.jar
pub fn get_libary_path(name: String, path: PathBuf) -> PathBuf {
    unimplemented!();
}

pub fn is_version_vaild(version: String, mc_dir: PathBuf) -> WithException<bool> {

    let v_path = mc_dir.join("versions").join(version.clone());

    if v_path.is_dir() {
        return Ok(true)
    }   

    match get_version_list() {
        Ok(value) => {
            for v in value {
                if v.id == version {
                    return Ok(true)
                }
            }
            return Ok(false)
        }
        Err(err) => {
            return Err(err)
        }
    } 
}



#[test]
fn test_get_available_verions() {
    match get_available_versions() {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}


#[test]
fn test_pase_single_rule() {
    let rule = json!({
        "action": "allow",
        "os": {
            "arch": "x86"
        }
    });
    let mut options = GameOptions::default();

    let res = parse_single_rule(&rule, &mut options);
    println!("RULE RES: {}",res);
}

#[test]
fn test_minecraft_dir() {
    match get_minecraft_directory() {
        Ok(dir) => {
            println!("{:#?}",dir);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_lastest_verions() {
    match get_latest_version() {
        Ok(version) => {
            println!("{} {}",version.release, version.snapshot);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_verions_list() {
    match get_version_list() {
        Ok(versions) => {
            for version in versions {
                println!("VERSION {} {} {} {} {}",version.id, version.r#type, version.url,version.time,version.releaseTime);
            }
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_installed_versions() {
    match get_installed_versions() {
        Ok(versions) => {
            println!("{:#?}",versions);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_inherit_json() {
    let root = if let Ok(dir) = get_minecraft_directory() {dir} else {PathBuf::new()};
    match get_installed_versions() {
        Ok(versions) => {
            if let Some(data) = versions.last() {
                match inherit_json(data, &root) {
                    Ok(value)=> {
                        println!("{:#?}",value);
                    }
                    Err(error)=>{
                        eprintln!("{}",error);
                    }
                }
            }
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_java_executable(){
    match get_java_executable() {
        Ok(versions) => {
            println!("{:#?}",versions);
        }
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_get_sha1() {
    let path = PathBuf::from("C:\\projects\\mc-installer-v2\\src-tauri\\forge-installer-headless-1.0.1.jar");
    match get_sha1_hash(path) {
        Ok(sha1) => {
            println!("{}",sha1);
        }
        Err(error) => eprintln!("{}",error)
    }
}
#[test]
fn test_download_file() {

    let sha1 = Some("eaa5b436ea5a86f04caa4e12a0a130b158a7614d".to_string());
    let url = "https://github.com/VisualSource/mc-installer/blob/main/public/jars/optifineheadless.jar?raw=true".to_string();
    let path = PathBuf::from("C:\\projects\\optifineheadless.jar");
    
    match download_file(url,path,sha1,false) {
        Ok(value) => println!("{:#?}",value),
        Err(err)=>{
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_download_file_compressed() {

    let sha1 = Some("a8ba78ede03aac58a1a5615780b0d600ba143198".to_string());
    let url = "https://launcher.mojang.com/v1/objects/a8ba78ede03aac58a1a5615780b0d600ba143198/javaw.exe".to_string();
    let path = PathBuf::from("C:\\projects\\mc-installer-v2\\src-tauri\\javaw.exe");
    
    match download_file(url,path,sha1,true) {
        Ok(value) => println!("{:#?}",value),
        Err(err)=>{
            eprintln!("{}",err);
        }
    }
}
#[test]
fn test_get_os_verion(){
    println!("{:#?}",get_os_version());
}

#[test]
fn test_get_jar_mainclass() {
    let path = PathBuf::from("C:\\projects\\optifineheadless.jar");
    match get_jar_mainclass(path) {
        Ok(value) => {
            println!("{}",value);
        }
        Err(error) => {
            eprintln!("{}",error);
        }
    }
}

#[test]
fn test_regex() {
    let r = regex::Regex::new("^10\\.").expect("Failed to create regex");
    println!("{}",r.is_match("10."));
}