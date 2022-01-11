use std::path::{ PathBuf };
use std::fs::{read_to_string};
use crate::minecraft::exceptions::{WithException,InterialError, VersionNotFound};
use crate::minecraft::utils::{get_classpath_separator, parse_rule_list, JsonVersionsData, inherit_json};
use crate::minecraft::natives::get_natives;

/// Returns the argument with all libs that come after -cp
pub fn get_libraries(data: &JsonVersionsData, path: PathBuf) -> WithException<String> {
   

   let class_sep = get_classpath_separator();
   let mut libstr = String::new();

       if !data.libraries.is_array() {
        return Err(InterialError::boxed("Expected data to be json array"));
       }

       for i in data.libraries.as_array().expect("Lib should have been an array").iter() {
           if !parse_rule_list(i, "rules", &json!({})) {
               continue;
           }
           let mut current_path = path.join("libraries");

           let lib_name: Vec<String> = i.get("name").expect("Object sould have had name prop").to_string().split(":").map(|v|String::from(v)).collect();

           let lib_path: Vec<String> = lib_name[0].split(".").map(|v|String::from(v)).collect();

           for path_part in lib_path {
                current_path = current_path.join(path_part);
           }

           current_path = current_path.join(lib_name[1].clone()); // name = 1
           current_path = current_path.join(lib_name[2].clone()); // version = 2

           let native = get_natives(&i);

           let jar_name = if native.is_empty() {
                format!("{}-{}.jar",lib_name[1],lib_name[2]).to_string()
           } else {
                format!("{}-{}-{}.jar",lib_name[1],lib_name[2],native).to_string()
           };
           
           current_path = current_path.join(jar_name);

           libstr = format!("{}{}{}",libstr,current_path.to_string_lossy(),class_sep).to_string();
       }


        let mut jarpath = path.clone();
        jarpath = jarpath.join("versions");
        jarpath = jarpath.join(data.id.clone());
        jarpath = jarpath.join(format!("{}.jar",data.id.clone()));
        libstr = format!("{}{}",libstr,jarpath.to_string_lossy());
   

   Ok(libstr)
}

/// Replaces all placeholder arguments with needed data
pub fn replace_arguments(arg: String, version_data: &serde_json::Value, path: &PathBuf, options: &serde_json::Value) -> WithException<String> {
    let mut argstr = arg;

    if let Some(natives) = options.get("nativesDirectory") {
        argstr = argstr.replace("${natives_directory}", natives.as_str().expect("Should have been string"));
    } else {
        return Err(InterialError::boxed("Missing argument nativesDirectory"));
    }   
    if let Some(launcher_name) = options.get("launcherName").or(Some(&json!("rust-launcher"))) {
        argstr = argstr.replace("${launcher_name}", launcher_name.as_str().expect("Should have been string") );
    }
    if let Some(launcher_version) = options.get("launcherVersion").or(Some(&json!("1.0.0"))) {
        argstr = argstr.replace("${launcher_version}", launcher_version.as_str().expect("Should have been string"));
    }

    if let Some(classpath) = options.get("classpath") {
        argstr = argstr.replace("${classpath}", classpath.as_str().expect("Should have been string"));
    } else {
        return Err(InterialError::boxed("Missing argument classpath"));
    }

    if let Some(prama) = options.get("username").or(Some(&json!("{username}"))) {
        argstr = argstr.replace("${auth_player_name}", prama.as_str().expect("Should have been string"));
    } 

    if let Some(prama) = version_data.get("id") {
        argstr = argstr.replace("${version_name}", prama.as_str().expect("Should have been string"));
    } else {
        return Err(InterialError::boxed("Missing argument version name"));
    }

    if let Some(prama) = options.get("gameDirectory").or(Some(&json!(path))) {
        argstr = argstr.replace("${game_directory}", prama.as_str().expect("Should have been string"));
    } 

    argstr = argstr.replace("${assets_root}", path.join("assets").to_str().expect("Should be string"));
   
    if let Some(prama) = options.get("assets") {
        argstr = argstr.replace("${assets_index_name}", prama.as_str().expect("Should have been string"));
    } else if let Some(paramid) = version_data.get("id") {
        argstr = argstr.replace("${assets_index_name}", paramid.as_str().expect("Should have been string"));
    } else {
        return Err(InterialError::boxed("Missing argument assets index name"));
    }

    if let Some(prama) = options.get("uuid").or(Some(&json!("{uuid}"))) {
        argstr = argstr.replace("${auth_uuid}", prama.as_str().expect("Should have been string"));
    } 
    if let Some(prama) = options.get("token").or(Some(&json!("{token}"))) {
        argstr = argstr.replace("${auth_access_token}", prama.as_str().expect("Should have been string"));
    } 

    argstr = argstr.replace("${user_type}","mojang");


    if let Some(prama) = version_data.get("type") {
        argstr = argstr.replace("${version_type}", prama.as_str().expect("Should have been string"));
    } else {
        return Err(InterialError::boxed("Missing argument version type"));
    }

    argstr = argstr.replace("${user_properties}","{}");

    if let Some(prama) = options.get("resolutionWidth").or(Some(&json!("854"))) {
        argstr = argstr.replace("${resolution_width}", prama.as_str().expect("Should have been string"));
    } 

    if let Some(prama) = options.get("resolutionHeight").or(Some(&json!("480"))) {
        argstr = argstr.replace("${resolution_height}", prama.as_str().expect("Should have been string"));
    } 

    let game_assets_path = vec!["assets","virtual","legacy"].join("\\");
    argstr = argstr.replace("${game_assets}",path.join(game_assets_path).to_str().expect("Should have been a string"));

    if let Some(prama) = options.get("token").or(Some(&json!("{token}"))) {
        argstr = argstr.replace("${auth_session}", prama.as_str().expect("Should have been string"));
    } 

    argstr = argstr.replace("${library_directory}",path.join("libraries").to_str().expect("Should have been a string"));

    argstr = argstr.replace("${classpath_separator}",get_classpath_separator().as_str());


    Ok(argstr)
}

/// Returns all arguments from verions.json
pub fn get_arguments(data: serde_json::Value, version_data: serde_json::Value, path: PathBuf, options: serde_json::Value) -> Vec<String> {

    let mut args = vec![];

    for i in data.as_object().expect("Expected Object").values() {
        if !parse_rule_list(&i, "compatibilityRules", &options) {
            continue;
        }
        if !parse_rule_list(&i,"rules", &options){
            continue;
        }

        if i.is_string() {
            if let Ok(value) = replace_arguments(i.to_string(), &version_data,&path,&options ) {
                args.push(value);
            }
        } else {
            if let Some(value) = i.get("value") {
                if value.is_string() {
                    if let Ok(arg) = replace_arguments(value.to_string(), &version_data,&path,&options ) {
                        args.push(arg);
                    }
                } else {
                    for v in value.as_array().expect("Should be a array") {
                        if let Ok(arg) = replace_arguments(v.to_string(), &version_data,&path,&options ) {
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
pub fn get_minecraft_commands(version: String, minecraft_dir: PathBuf, options: serde_json::Value) -> WithException<Vec<String>> {

    let mut config = options.clone();

    let mut path_v = minecraft_dir.join("versions");
    path_v = path_v.join(version.clone());
    
    if !path_v.is_dir() {
        return Err(VersionNotFound::boxed(version))
    }

    let verions_json = path_v.join(format!("{}.json",version));

    
    let mut data: JsonVersionsData = if let Ok(value) = read_to_string(verions_json) { 
        let content: JsonVersionsData = serde_json::from_str(&value).expect("Failed to content to Struct");
        content
    } else { 
        return Err(InterialError::boxed("Failed to get verion data")); 
    };

    if data.inheritsFrom.is_some() {
        match inherit_json(&data, &minecraft_dir) {
            Ok(value) =>{
                data = value;
            }
            Err(error) => return Err(error)
        }
    }


    let mut commands: Vec<String> = vec![];


    if options.get("navtivesDirectory").is_none() {
        config["navtivesDirectory"] = json!(path_v.join(data.id.clone()).join("natives"));
    } 

    if let Ok(classpath) = get_libraries(&data, minecraft_dir) {
        config["classpath"] = json!(classpath);
    }

    

    if options.get("executablePath").is_some() {
        commands.push(options["executablePath"].to_string());
    } else if let Some(java) = data.javaVersion {
       
    }

    
    Ok(vec![])
}