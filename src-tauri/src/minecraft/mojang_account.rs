use crate::minecraft::utils::get_user_agent;
use crate::minecraft::exceptions::{WithException,InterialError};
use serde::{Deserialize,Serialize};
use uuid::Uuid;
use log::{error};

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct LoginJson {}


/// Logs a user into thier minecraft mojang account
pub fn login_mojang_user(username: String, password: String) -> WithException<LoginJson> {
    let agent = get_user_agent();
    let uuid = Uuid::new_v4().to_simple().to_string().to_lowercase();
    let payload = json!({
        "agent": {
            "name": "Minecraft",
            "version": 1
        },
        "username": username,
        "password": password,
        "clientToken": uuid
    });

    match agent.post("https://authserver.mojang.com/authenticate").send_json(payload) {
        Ok(response) => {
            let data = response.into_json::<LoginJson>();
            match data {
                Ok(value) => {
                    Ok(value)
                }
                Err(error) => {
                    error!("{}",error);
                    Err(InterialError::boxed("Failed to parse data"))
                }
            }
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:#?} {}",res,code);
            Err(InterialError::boxed(format!("Failed to send request | CODE: {}",code)))
        },
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to send request"))
        }
    }
} 

// Check if token is valid
pub fn validate_mojang_access_token(access_token: String) -> WithException<bool> {
    let agent = get_user_agent();
    let payload = json!({
        "accessToken": access_token
    });

    match agent.post("https://authserver.mojang.com/validate").send_json(payload) {
        Ok(response) => {
            Ok(response.status() == 204)
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:#?} {}",res,code);
            Err(InterialError::boxed(format!("Failed to send request | CODE: {}",code)))
        },
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to send request"))
        }
    }
}

#[derive(Debug,Deserialize)]
pub struct TokenRefreshJson {}

fn refresh_access_token(access_token: String, client_token: String) -> WithException<TokenRefreshJson> {
    let agent = get_user_agent();
    let payload = json!({
        "accessToken": access_token,
        "clientToken": client_token
    });

    match agent.post("https://authserver.mojang.com/refresh").send_json(payload) {
        Ok(response) => {
            let data = response.into_json::<TokenRefreshJson>();
            match data {
                Ok(value) => {
                    Ok(value)
                }
                Err(error) => {
                    error!("{}",error);
                    Err(InterialError::boxed("Failed to parse data into struct"))
                }
            }
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:#?} {}",res,code);
            Err(InterialError::boxed(format!("Failed to send request | Code: {}",code)))
        },
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to send request"))
        }
    }
}


fn logout_user(username: String, password: String) -> WithException<bool> {
    let agent = get_user_agent();
    let payload = json!({
        "username": username,
        "password": password,
    });

    match agent.post("https://authserver.mojang.com/signout").send_json(payload) {
        Ok(response) => {
            Ok(response.status() == 204)
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:#?} {}",res,code);
            Err(InterialError::boxed(format!("Failed to send request | Code: {}",code)))
        },
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to send request"))
        }
    }
}

fn invalidate_access_token(access_token: String, client_token: String) -> WithException<TokenRefreshJson> {
    let agent = get_user_agent();
    let payload = json!({
        "accessToken": access_token,
        "clientToken": client_token
    });

    match agent.post("https://authserver.mojang.com/invalidate").send_json(payload) {
        Ok(response) => {
            let data = response.into_json::<TokenRefreshJson>();
            match data {
                Ok(value) => {
                    Ok(value)
                }
                Err(error) => {
                    error!("{}",error);
                    Err(InterialError::boxed("Failed to parse data"))
                }
            }
        }
        Err(ureq::Error::Status(code,res)) => {
            error!("{:#?} {}",res,code);
            Err(InterialError::boxed(format!("Failed to send request | CODE: {}",code)))
        },
        Err(error) => {
            error!("{}",error);
            Err(InterialError::boxed("Failed to send request"))
        }
    }
}