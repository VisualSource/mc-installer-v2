use crate::minecraft::microsoft_account::{ PlayerProfile, complete_refresh, get_login_url, get_auth_code_from_url, url_contains_auth_code, complete_login };
use tauri::{ WindowUrl, WindowBuilder, Manager };
use log::{ error, warn };
use std::path::PathBuf;

const CLIENT_ID: &str = env!("MICROSOFT_CLIENT_ID");
const CLIENT_SECRET: &str = env!("MICROSOFT_CLIENT_SECRET");
const REDIRECT_URI: &str = "https://login.microsoftonline.com/common/oauth2/nativeclient";

#[tauri::command]
pub async fn ms_login_done(window: tauri::Window, url: Option<String>) {
    if window.label() == "ms-login" {
        if let Err(err) = window.close() {
            error!("{}",err);
        }
        if let None = url {
            if let Err(error) = window.emit_to("main", "mcrust://login_micosoft", false) {
                error!("{}",error);
            }
            return;
        }
        if url_contains_auth_code(url.clone().expect("Failed to get url")) {
            match get_auth_code_from_url(url.expect("Failed to get url")) {
                Ok(auth) => {
                    match complete_login(String::from(CLIENT_ID),String::from(CLIENT_SECRET),String::from(REDIRECT_URI),auth) {
                        Ok(value) => {
                            if let Err(error) = window.emit_to("main", "mcrust://login_micosoft", value) {
                                error!("{}",error);
                            }
                        }
                        Err(err) => {
                            error!("{}",err.to_string());
                            if let Err(error) = window.emit_to("main", "mcrust://login_micosoft", false) {
                                error!("{}",error);
                            }
                        }
                    }
                }
                Err(err) => {
                    error!("{}",err);
                }
            }
        }
    } else {
        warn!("Did not expect window ({}) to call this command",window.label());
    }
}

#[tauri::command]
pub async fn login_microsoft_account(app_handle: tauri::AppHandle) {
    let login_url = get_login_url(String::from(CLIENT_ID),String::from(REDIRECT_URI));
    let raw_script = r#"
        window.__url = "{:url}";
        window.__redirect = "{:redirect_uri}";
        const timer = () => new Promise((ok,_)=>setTimeout(ok,400));
        const init = async (event)=>{
            await timer();
            if(location.href === window.__url) return;
            if(location.href === "chrome-error://chromewebdata/") {
                __TAURI_INVOKE__("ms_login_done");
                console.error("Err");
                return;
            }
            if(location.href.includes(window.__redirect)) {
                console.log("Finished");
                __TAURI_INVOKE__("ms_login_done",{ url: location.href });
                return;
            }
            location.replace(window.__url);
        };
        window.addEventListener("load",init);
    "#;
    let script = raw_script.replace("{:url}", login_url.as_str()).replace("{:redirect_uri}", REDIRECT_URI);
   
    if let Err(err) = app_handle.create_window("ms-login",WindowUrl::App(PathBuf::from("/login_bootstrap.html")),|window_bulider,web_attr| { 
        (window_bulider.title("Mincrosoft Login"),web_attr.initialization_script(script.as_str()))
    }) {
        error!("{}",err);
    }
}

#[tauri::command]
pub async fn refresh_microsoft_account(refresh_token: String) -> Result<PlayerProfile,String> {
    match complete_refresh(
        String::from(CLIENT_ID),
        String::from(CLIENT_SECRET),
        String::from(REDIRECT_URI),
        refresh_token) {
            Ok(value) => Ok(value),
            Err(err) => {
                error!("{}",err);
                Err(err.to_string())
            }
    }
}
