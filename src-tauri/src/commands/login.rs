use crate::app::{ CLIENT_ID, REDIRECT_URI };
use crate::files::{
    user_cache::{
        update_user_cache,
        remove_user 
    }
};
use mc_laucher_lib_rs::login::{ get_auth_code,login_microsoft,ms_login_url };
use tauri::{ WindowUrl, WindowBuilder, Runtime, Manager };
use log::{ error, warn };
use std::thread;
use std::path::PathBuf;

fn create_window<R: Runtime>(app: tauri::AppHandle<R>,  title: String, label: String, url: String, ignore_url: String, done_script: String) -> Result<(),String>{
    let raw_script = r#"
        window.__open_url = "{open_url}";
        window.__redirect = "{redirect}";
        window.__ignore = "{ignore_url}";
        window.__complete_func = "{complete_func}";
        async function init() {
            if(location.href.includes(window.__ignore)) return;
            if(location.href === "chrome-error://chromewebdata/") {
                __TAURI_INVOKE__("login_error", { err: "No Internet connection" });
                return;
            }
            if(location.href.match(/^(https:\/\/login.microsoftonline.com\/common\/oauth2\/nativeclient)/)){
                document.body.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; align-content: center;">
                    <h1>Loading Profile</h1>
                    <div>Please Wait</div>
                </div>`;
                __TAURI_INVOKE__(window.__complete_func,{ url: location.href });
                return;
            }
            location.replace(window.__open_url);
        }
        window.addEventListener("load",init);
    "#;

    let script = raw_script
    .replace("{open_url}", url.as_str())
    .replace("{complete_func}",done_script.as_str())
    .replace("{ignore_url}", ignore_url.as_str())
    .replace("{redirect}",REDIRECT_URI);

    if let Err(err) = app.create_window(label,WindowUrl::App(PathBuf::from("/bootstrap.html")),|window_bulider,web_attr| { 
        (window_bulider.title(title),web_attr.initialization_script(script.as_str()))
    }) {
        error!("{}",err);
        return Err("Failed to create window".into())

    }

    Ok(())
}

#[tauri::command]
pub async fn login_error<R: Runtime>(window: tauri::Window<R>, err: String) -> Result<(), String> {
    if let Err(error) = window.emit_to("main", "rustyminecraft://login_error", "Invaild auth code") {
        error!("{}",error);
    }
    error!("Login Error: {}",err);
  Ok(())
}


async fn login_core(url: String) -> Result<mc_laucher_lib_rs::json::authentication_microsoft::Account,String> {
    let code = match get_auth_code(url) {
        Some(value) => value,
        None => return Err("Invaild auth code".to_string())
    };

    let account = match login_microsoft(CLIENT_ID.into(), REDIRECT_URI.into(), code).await {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    if let Err(err) = update_user_cache(&account) {
        return Err(err.to_string());
    }

    Ok(account)
}

#[tauri::command]
pub async fn login_done<R: Runtime>(window: tauri::Window<R>, url: String) -> Result<(),()> {

    match login_core(url).await {
        Ok(account) => {
            if let Err(error) = window.emit_to("main", "rustyminecraft://login_complete", account) {
                error!("{}",error);
                return Err(());
            }
        }
        Err(err) => {
            error!("Failed to rejoin a thread");
            if let Err(error) = window.emit_to("main", "rustyminecraft://login_error",err) {
                error!("{}",error);
            }
        }
    }

    if window.label() == "ms-login" {
        if let Err(err) = window.close() {
            error!("{}",err);
        }
    } else {
        warn!("Did not expect window ({}) to call this!",window.label());
    }

  Ok(())
}

#[tauri::command]
pub async fn login<R: Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {

    let url = ms_login_url(CLIENT_ID.into(),REDIRECT_URI.into());

    if let Err(err) = create_window(app, "Microsoft Login".into(), "ms-login".into(), url, "https://login.live.com/oauth20_authorize.srf".into(),"login_done".into()){
        return Err(err);
    }

  Ok(())
}

#[tauri::command]
pub async fn logout_done<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    if window.label() == "ms-logout" {
        if let Err(err) = window.close() {
            error!("{}",err);
        }
    } else {
        warn!("Did not expect window {} to call this function",window.label());
    }
    Ok(())
}

/// <https://stackoverflow.com/questions/39386633/how-to-signout-from-an-azure-application>
/// <https://stackoverflow.com/questions/10005306/how-to-signout-from-windows-live-using-microsoft-live-controls-signin-button-inw>
#[tauri::command]
pub async fn logout<R: Runtime>(app: tauri::AppHandle<R>, xuid: String) -> Result<(), String> {
    let url = format!("https://login.live.com/oauth20_logout.srf?client_id={client_id}&redirect_uri={redirect_uri}&scope=XboxLive.signin%20offline_access",client_id=CLIENT_ID,redirect_uri=REDIRECT_URI).to_string();
    if let Err(err) = create_window(app,"Mincrosoft Logout".into(),"ms-logout".into(),url, "https://login.live.com/oauth20_logout.srf".into(),"logout_done".into()) {
        return Err(err);
    }

    if let Err(err) = remove_user(xuid) {
        return Err(err);
    }
   
  Ok(())
}
