use crate::minecraft::exceptions::{ WithException, InterialError };
use crate::minecraft::utils::get_user_agent;
use serde::{Deserialize, Serialize};
use log::{ error };

#[derive(Deserialize)]
struct OAuth2LoginJson {
    access_token: Option<String>,
    refresh_token: Option<String>,
    error: Option<String>
}

#[derive(Deserialize)]
struct XboxLineCliamsItem {
    uhs: String
}

#[derive(Deserialize)]
struct XboxLiveClaims {
    xui: Vec<XboxLineCliamsItem>
}

#[derive(Deserialize)]
 struct XboxLiveJson {
    #[serde(rename="Token")]
    token: String,
    #[serde(rename="DisplayClaims")]
    display_claims: XboxLiveClaims
 }

#[derive(Deserialize)]
struct XSTSJson {
    #[serde(rename="Token")]
    token: String,
}

#[derive(Deserialize)]
struct MinecraftJson {
    access_token: String
}

#[derive(Deserialize,Serialize, Clone)]
pub struct PlayerProfile {
    pub id: String,
    pub name: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>
}

/// Returns the url to the website on which hte user logs in to
pub fn get_login_url(client_id: String, redirect_uri: String) -> String {
        format!(
            "https://login.live.com/oauth20_authorize.srf?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope=XboxLive.signin%20offline_access&state=<optional;",
            client_id=client_id,
            redirect_uri=redirect_uri
    ).to_string()
}

pub fn url_contains_auth_code(url: String) -> bool {
    let parsed = urlparse::urlparse(url);
    match parsed.get_parsed_query() {
        Some(code) => {
            code.contains_key("code")
        }
        None => false 
    }
}

pub fn get_auth_code_from_url(url: String) -> WithException<String> {

    let parsed = urlparse::urlparse(url);

    let query = match parsed.get_parsed_query() {
        Some(value) => value,
        None => {
            error!("Url does not contain a query string");
            return Err(InterialError::boxed("Url does not contain a query string"))
        }
    };

    let code = match query.get("code") {
        Some(value) => value,
        None => {
            error!("Url does not contain a query prop 'code'");
            return Err(InterialError::boxed("Url does not contain a query prop 'code'"))
        }
    };

    let token = match code.get(0) {
        Some(value) => value,
        None => {
            error!("Failed to get auth code");
            return Err(InterialError::boxed("Failed to get auth code"))
        }
    };

   Ok(token.to_owned())
}


fn get_authorization_token(client_id: String, client_secret: String, redirect_uri: String, auth_code: String) -> WithException<OAuth2LoginJson> {
    let agent = get_user_agent();

    let payload = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("redirect_uri",redirect_uri.as_str()),
        ("code",auth_code.as_str()),
        ("grant_type","authorization_code")
    ];

    match agent
    .post("https://login.live.com/oauth20_token.srf")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send_form(&payload) {
        Ok(value) => {
            match value.into_json::<OAuth2LoginJson>() {
                Ok(json) => Ok(json),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to tranfrom data"))
                } 
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }

}

fn refresh_authorization_token(client_id: String, client_secret: String, redirect_uri: String, refresh_token: String) -> WithException<OAuth2LoginJson> {
    let agent = get_user_agent();
    let payload = json!({
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    });

    match agent.post("https://login.live.com/oauth20_token.srf").send_json(payload) {
        Ok(value) => {
            match value.into_json::<OAuth2LoginJson>() {
                Ok(json) => Ok(json),
                Err(err) => {
                   error!("{}",err);
                   Err(InterialError::boxed("Failed to transform data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}


fn authenticate_with_xbl(access_token: String) -> WithException<XboxLiveJson> {
    let agent: ureq::Agent = get_user_agent();

    let payload = json!({
        "Properties": {
            "AuthMethod": "RPS",
            "SiteName": "user.aut.xboxlive.com",
            "RpsTicket": format!("f={}",access_token)
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
    });

    match agent
    .post("https://user.auth.xboxlive.com/user/authenticate")
    .set("Content-Type","application/json")
    .set("Accept","application/json")
    .send_json(payload) {
        Ok(value) => {
            match value.into_json::<XboxLiveJson>() {
                Ok(json) => Ok(json),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to transfrom data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}


fn authenticate_width_xsts(xbl_token: String) -> WithException<XSTSJson> {
    let agent: ureq::Agent = get_user_agent();

    let payload = json!({
        "Properties": {
            "SanboxId": "RETAIL",
            "UserTokens": [
                xbl_token
            ]
        },
        "RelyingParty": "rp://api.minecraftservices.com/",
        "TokenType": "JWT"
    });

    match agent
    .post("https://xsts.auth.xboxlive.com/xsts/authorize")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send_json(payload) {
        Ok(value) => {
            match value.into_json::<XSTSJson>() {
                Ok(json) => Ok(json),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to transfrom data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}

fn authenticate_with_minecraft(userhash: String, xsts_token: String) -> WithException<MinecraftJson> {
    let agent: ureq::Agent = get_user_agent();
    let payload = json!({
        "identityToken": format!("XBL3.0 x={};{}",userhash,xsts_token)
    });

    match agent
    .post("https://api.minecraftservices.com/authentication/login_with_xbox")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send_json(payload) {
        Ok(value) => {
            match value.into_json::<MinecraftJson>() {
                Ok(json) => Ok(json),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to get minecraft data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}

fn get_profile(token: String) -> WithException<PlayerProfile> {
    let agent: ureq::Agent = get_user_agent();

    match agent.get("https://api.minecraftservices.com/minecraft/profile").set("Authorization", format!("Bearer {}",token).as_str()).call() {
        Ok(value) => {
            match value.into_json::<PlayerProfile>() {
                Ok(value) => Ok(value),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to get player profile"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}

pub fn complete_login(client_id: String, client_secret: String, redirect_uri: String, auth_code: String) -> WithException<PlayerProfile> {

    let token_request: OAuth2LoginJson = match get_authorization_token(client_id, client_secret, redirect_uri, auth_code) {
        Ok(value) => value,
        Err(error) => return Err(error)
    };

    let xbl_request: XboxLiveJson = match authenticate_with_xbl(token_request.access_token.expect("Expected value").clone()) {
        Ok(value) => value,
        Err(error) => return Err(error)
    };

    let xbl_token = xbl_request.token.clone();
    let userhash = xbl_request.display_claims.xui.get(0).expect("Failed to get claim").uhs.clone();

    let xsts_request: XSTSJson = match authenticate_width_xsts(xbl_token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };
    
    let account_request: MinecraftJson = match authenticate_with_minecraft(userhash, xsts_request.token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let mut profile: PlayerProfile = match get_profile(account_request.access_token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    profile.access_token = Some(account_request.access_token);
    profile.refresh_token = Some(token_request.refresh_token.expect("Expected Token"));

    Ok(profile)
}


pub fn complete_refresh(client_id: String, client_secret: String, redirect_uri: String, refresh_token: String) -> WithException<PlayerProfile> {

    let token_request: OAuth2LoginJson = match refresh_authorization_token(client_id, client_secret, redirect_uri, refresh_token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    if token_request.error.is_some() {
        error!("Request returned a error");
        return Err(InterialError::boxed("Invaild Refresh token"));
    }

    let token = token_request.access_token.expect("Expect Token value");

    let xbl_request: XboxLiveJson = match authenticate_with_xbl(token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let xbl_token = xbl_request.token.clone();
    let userhash = xbl_request.display_claims.xui.get(0).expect("Failed to get claim").uhs.clone();

    let xsts_request: XSTSJson = match authenticate_width_xsts(xbl_token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let account_request: MinecraftJson = match authenticate_with_minecraft(userhash, xsts_request.token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let mut profile: PlayerProfile = match get_profile(account_request.access_token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    profile.access_token = Some(account_request.access_token);
    profile.refresh_token = Some(token_request.refresh_token.expect("Expected Value"));

    Ok(profile)
}
