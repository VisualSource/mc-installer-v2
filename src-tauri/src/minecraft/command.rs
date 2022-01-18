use crate::minecraft::utils::{get_classpath_separator, parse_rule_list, JsonVersionsData, inherit_json};
use crate::minecraft::exceptions::{WithException,InterialError, VersionNotFound};
use crate::minecraft::runtime::{get_exectable_path};
use crate::minecraft::natives::get_natives;
use std::fs::{read_to_string};
use std::path::{ PathBuf };
use log::{error, debug};

#[derive(Default,Debug,Clone)]
pub struct GameOptions {
    pub navtives_directory: Option<PathBuf>,
    pub classpath: Option<String>,
    pub executable_path: Option<PathBuf>,
    pub java_arguments: Option<String>,
    pub custom_resolution: Option<String>,
    pub demo: bool,
    pub launcher_name: Option<String>,
    pub launcher_version: Option<String>,
    pub username: Option<String>,
    pub game_directory: Option<PathBuf>,
    pub uuid: Option<String>,
    pub token: Option<String>,
    pub resolution_width: Option<String>,
    pub resolution_height: Option<String>,
    pub enable_logging_config: bool,
    pub server: Option<String>,
    pub port: Option<String>
}

/// Returns the argument with all libs that come after -cp
pub fn get_libraries(data: &JsonVersionsData, path: PathBuf) -> WithException<String> {
   
    let class_sep = get_classpath_separator();

    if !data.libraries.is_array() {
        return Err(InterialError::boxed("Expected data to be json array"));
    }

    let mut libstr = String::new();
    for i in data.libraries.as_array().expect("Lib should have been an array").iter() {
        if !parse_rule_list(i, "rules", &mut GameOptions::default()) {
            continue;
         }
        let mut current_path = path.join("libraries");
        // lib_path,name,version
        let lib_name: Vec<String> = i.get("name").expect("Object sould have had name prop").as_str().expect("Failed to make str").clone().split(":").map(|v|String::from(v)).collect();

        let lib_path: Vec<String> = lib_name[0].split(".").map(|v|String::from(v)).collect();

        for path_part in lib_path {
            current_path = current_path.join(path_part);
        }

        // name = 1, version = 2
        current_path = current_path.join(lib_name[1].clone()).join(lib_name[2].clone()); 
          
        let native = get_natives(&i);

        let jar_name = if native.is_empty() {
            format!("{}-{}.jar",lib_name[1],lib_name[2]).to_string()
        } else {
            format!("{}-{}-{}.jar",lib_name[1],lib_name[2],native).to_string()
        };
        
        current_path = current_path.join(jar_name);

        libstr = vec![libstr,format!("{}{}",current_path.to_str().expect("Failed to make path a str"),class_sep).to_string()].join("");
    }

    let mut jarpath = path.clone();
    if let Some(jar) = data.jar.clone() {
        jarpath = jarpath.join("versions").join(jar.clone()).join(format!("{}.jar",jar));
        libstr = format!("{}{}",libstr,jarpath.to_string_lossy());
    } else {
        jarpath = jarpath.join("versions").join(data.id.clone()).join(format!("{}.jar",data.id.clone()));
        libstr = format!("{}{}",libstr,jarpath.to_string_lossy());
    }

   Ok(libstr)
}

/// Replaces all placeholder arguments with needed data
pub fn replace_arguments(arg: String, version_data: &JsonVersionsData, path: &PathBuf, options: &mut GameOptions) -> WithException<String> {
    let mut argstr = arg;

    if let Some(natives) = options.navtives_directory.clone() {
        argstr = argstr.replace("${natives_directory}", natives.to_str().expect("Failed to transform"));
    } else {
        return Err(InterialError::boxed("Missing argument nativesDirectory"));
    }   
    if let Some(launcher_name) = options.launcher_name.clone().or(Some("rust-launcher".to_string())) {
        argstr = argstr.replace("${launcher_name}", launcher_name.as_str());
    }
    if let Some(launcher_version) = options.launcher_version.clone().or(Some("1.0.0".to_string())) {
        argstr = argstr.replace("${launcher_version}", launcher_version.as_str());
    }

    if let Some(classpath) = options.classpath.clone() {
        argstr = argstr.replace("${classpath}", classpath.as_str());
    } else {
        return Err(InterialError::boxed("Missing argument classpath"));
    }

    if let Some(prama) = options.username.clone().or(Some("{username}".to_string())) {
        argstr = argstr.replace("${auth_player_name}", prama.as_str());
    } 

    argstr = argstr.replace("${version_name}", version_data.id.as_str());
  
    if let Some(prama) = options.game_directory.clone().or(Some(path.clone())) {
        argstr = argstr.replace("${game_directory}", prama.to_str().expect("Should have been string"));
    } 

    argstr = argstr.replace("${assets_root}", path.join("assets").to_str().expect("Should be string"));
   
    if let Some(prama) = version_data.assets.clone().or(Some(version_data.id.clone())) {
        argstr = argstr.replace("${assets_index_name}", prama.as_str());
    } 

    if let Some(prama) = options.uuid.clone().or(Some("{uuid}".to_string())) {
        argstr = argstr.replace("${auth_uuid}", prama.as_str());
    } 
    if let Some(prama) = options.token.clone().or(Some("{token}".to_string())) {
        argstr = argstr.replace("${auth_access_token}", prama.as_str());
    } 

    argstr = argstr.replace("${user_type}","mojang");
    argstr = argstr.replace("${version_type}", version_data.r#type.as_str());
    argstr = argstr.replace("${user_properties}","{}");

    if let Some(prama) = options.resolution_width.clone().or(Some("854".to_string())) {
        argstr = argstr.replace("${resolution_width}", prama.as_str());
    } 

    if let Some(prama) = options.resolution_height.clone().or(Some("480".to_string())) {
        argstr = argstr.replace("${resolution_height}", prama.as_str());
    } 

    argstr = argstr.replace("${game_assets}",path.join("assets").join("virtual").join("legacy").to_str().expect("Should have been a string"));

    if let Some(prama) = options.token.clone().or(Some("{token}".to_string())) {
        argstr = argstr.replace("${auth_session}", prama.as_str())
    } 

    argstr = argstr.replace("${library_directory}",path.join("libraries").to_str().expect("Should have been a string"));

    argstr = argstr.replace("${classpath_separator}",get_classpath_separator().as_str());

    Ok(argstr)
}

/// Returns all arguments from verions.json
pub fn get_arguments(data: &serde_json::Value, version_data: &JsonVersionsData, path: PathBuf, options: &mut GameOptions) -> Vec<String> {

    let mut args = vec![];

    for i in data.as_array().expect("Expected Object") {
        if !parse_rule_list(&i, "compatibilityRules", options) {
            continue;
        }
        if !parse_rule_list(&i,"rules", options){
            continue;
        }

        if i.is_string() {
            if let Ok(value) = replace_arguments(i.as_str().expect("Should be a str").to_string(), &version_data,&path,options) {
                args.push(value);
            }
        } else {
            if let Some(value) = i.get("value") {
                if value.is_string() {
                    if let Ok(arg) = replace_arguments(value.as_str().expect("Should be a string").to_string(), &version_data,&path,options) {
                        args.push(arg);
                    }
                } else {
                    for v in value.as_array().expect("Should be a array") {
                        if let Ok(arg) = replace_arguments(v.as_str().expect("Failed to make string").to_string(), &version_data,&path,options) {
                            args.push(arg);
                        }
                    }
                }
            }
        } 
    }
    args
}

/// Returns a command for launching minecraft
pub fn get_minecraft_commands(version: String, minecraft_dir: PathBuf, options: &mut GameOptions) -> WithException<Vec<String>> {

    let version_path = minecraft_dir.join("versions").join(version.clone());

    if !version_path.is_dir() {
        return Err(VersionNotFound::boxed(version));
    }

    let versions_path_json = version_path.join(format!("{}.json",version.clone()));

    let mut data: JsonVersionsData = match read_to_string(versions_path_json) {
        Ok(value) => {
            match serde_json::from_str::<JsonVersionsData>(&value) {
                Ok(json) => json,
                Err(error) => {
                    error!("Failed to convert data to struct | {}",error);
                    return Err(InterialError::boxed(error.to_string()))
                }
            }
        }
        Err(error) => {
            error!("Failed to get verion file | {}",error);
            return Err(InterialError::boxed(error.to_string()))
        }
    };

    if data.inheritsFrom.is_some() {
        match inherit_json(&data, &minecraft_dir) {
            Ok(value) => {
                data = value;
            }
            Err(error) => return Err(error)
        }
    }

    if options.navtives_directory.is_none() {
        options.navtives_directory = Some(minecraft_dir.join("versions").join(data.id.clone()).join("natives"));
    }

    match get_libraries(&data, minecraft_dir.clone()) {
        Ok(libs) => {
            options.classpath = Some(libs);
        }
        Err(error) => return Err(error)
    }

    let mut command: Vec<String> = vec![];

    if let Some(exec) = options.executable_path.clone() {
        command.push(String::from(exec.to_str().expect("Failed to make path a str")));
    } else if let Some(java) = data.javaVersion.clone() {
        match get_exectable_path(java["component"].as_str().expect("Failed to get runtime").to_string(), minecraft_dir.clone()) {
            Ok(exec) => {
                if let Some(java) = exec {
                    command.push(String::from(java.to_str().expect("Failed to make path a str")));
                } else {
                    command.push(String::from("java"));
                }
            }
            Err(_) => {
                command.push(String::from("java"));
            }
        } 
    } else {
        command.push(String::from("java"));
    }

    if let Some(args) = options.java_arguments.clone() {
        command.push(args);
    }

    if let Some(args) = data.arguments.get("jvm") {
        let jvm_args = get_arguments(args, &data, minecraft_dir.clone(), options);
        command = [command,jvm_args].concat();
    } else {
        let dir = options.navtives_directory.clone().expect("Expected navites directory");
        command.push(format!("-Djava.library.path={}",dir.to_str().expect("Expected a str")).to_string());
        command.push(String::from("-cp"));
        command.push(options.classpath.clone().expect("Expected classpath"));
    }

    if options.enable_logging_config  {
        if let Some(logger) = data.logging.clone() {
            let logger_id = logger["client"]["file"]["id"].as_str().expect("Failed to make string").to_string();
            let logger_file = minecraft_dir.join("assets").join("log_configs").join(logger_id);
            let cmd = logger["client"]["argument"].as_str().expect("Failed to make string").to_string().replace("${path}",logger_file.to_str().expect("Failed to transform"));
            command.push(cmd);
        }
    }
    
    command.push(data.mainClass.clone());

    // would do a minecraftArguments check in older game versions

    let args = get_arguments(&data.arguments["game"], &data, minecraft_dir, options);
   
    command = [command,args].concat();

    if let Some(server) = options.server.clone() {
        command.push(String::from("--server"));
        command.push(server);
        if let Some(port) = options.port.clone() {
            command.push(String::from("--port"));
            command.push(port);
        }
    }

    debug!("{:#?}",command);
    Ok(command)
}


#[test]
fn test_get_minecraft_commands() {
    let verion = "1.17.1".to_string();
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    let mut options = GameOptions::default();
    match get_minecraft_commands(verion, mc, &mut options) {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(error) => {
            eprintln!("{}",error);
        }
    }
}