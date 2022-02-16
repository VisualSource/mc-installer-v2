use crate::app::{ APP_INFO };
use mc_laucher_lib_rs::json::authentication_microsoft::Account;
use std::collections::HashMap;
use std::fs::{ File, read_to_string };
use app_dirs2::{ get_app_dir, AppDataType };
use log::{ debug };

pub fn read_user_cache() -> Result<HashMap<String,Account>,String> {
    let root = match get_app_dir(AppDataType::UserConfig, &APP_INFO, "/") {
        Ok(value) => value,
        Err(err) =>  return Err(err.to_string())
    };

    let user_cache_file = root.join("user_cache.json");
    debug!("{:?}", user_cache_file);
    let reader = match read_to_string(user_cache_file.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string()) 
    };

    let yml = match serde_json::from_str::<HashMap<String,Account>>(&reader) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    Ok(yml)
}

pub fn remove_user(xuid: String) -> Result<(), String> {
    let root = match get_app_dir(AppDataType::UserConfig, &APP_INFO, "/") {
        Ok(value) => value,
        Err(err) =>  return Err(err.to_string())
    };

    let user_cache_file = root.join("user_cache.json");
    debug!("{:?}", user_cache_file);
    let reader = match read_to_string(user_cache_file.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string()) 
    };

    let mut yml = match serde_json::from_str::<HashMap<String,Account>>(&reader) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    yml.remove(&xuid);

    let writer = match File::create(user_cache_file) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    if let Err(err) = serde_json::to_writer(writer, &yml) {
        return Err(err.to_string());
    }

    Ok(())
}

pub fn update_user_cache(account: &Account) -> Result<(), String> {
    let root = match get_app_dir(AppDataType::UserConfig, &APP_INFO, "/") {
        Ok(value) => value,
        Err(err) =>  return Err(err.to_string())
    };

    let user_cache_file = root.join("user_cache.json");
    debug!("{:?}", user_cache_file);
    let reader = match read_to_string(user_cache_file.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string()) 
    };

    let mut yml = match serde_json::from_str::<HashMap<String,Account>>(&reader) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    yml.insert(account.xuid.clone(),account.clone());

    let writer = match File::create(user_cache_file) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    if let Err(err) = serde_json::to_writer(writer, &yml) {
        return Err(err.to_string());
    }

    Ok(())
}