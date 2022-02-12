use crate::files::user_cache::read_user_cache;
pub mod login;
pub mod state;


#[tauri::command]
pub async fn get_user_cache() -> Result<std::collections::HashMap<std::string::String, mc_laucher_lib_rs::Account>, String> {
    match read_user_cache() {
        Ok(value) => Ok(value),
        Err(err) => Err(err)
    }
}