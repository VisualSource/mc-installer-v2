extern crate jsonwebtoken;
use crate::minecraft::exceptions::{ WithException, InterialError ,ExternalProgramError };
use crate::minecraft::utils::get_user_agent;
use serde::{Deserialize, Serialize};
use crate::app::APP_INFO;
use app_dirs2::{app_dir, AppDataType};
use std::fs::{File,write};
use log::{ error, debug, warn };
use tauri::api::http::{Body, ResponseType, HttpRequestBuilder, ClientBuilder};
use std::collections::HashMap;

const MS_TOKEN_AUTHORIZATION_URL: &str = "https://login.live.com/oauth20_token.srf";


#[derive(Deserialize, Debug)]
struct OAuth2LoginJson {
    token_type: String,
    expires_in: u32,
    scope: String,
    access_token: String,
    refresh_token: String,
    user_id: String,
    foci: Option<String>
}

#[derive(Deserialize, Debug)]
struct XboxLiveCliamsItem {
    uhs: String
}

#[derive(Deserialize, Debug)]
struct XboxLiveClaims {
    xui: Vec<XboxLiveCliamsItem>
}

#[derive(Deserialize, Debug)]
 struct XboxLiveJson {
    #[serde(rename="Token")]
    token: String,
    #[serde(rename="DisplayClaims")]
    display_claims: XboxLiveClaims,
    #[serde(rename="IssueInstant")]
    issue_instant: String,
    #[serde(rename="NotAfter")]
    not_after: String
 }

 #[derive(Deserialize, Debug)]
struct XboxLiveError {
    #[serde(rename="Identity")]
    identify: String,
    #[serde(rename="XErr")]
    xerr: u32,
    #[serde(rename="Message")]
    message: String,
    #[serde(rename="Redirect")]
    redirect: String
} 

#[derive(Deserialize, Debug)]
struct MinecraftJson {
    access_token: String,
    username: String,
    token_type: String,
    expires_in: u32,
    roles: Vec<String>
}

#[derive(Deserialize,Serialize, Clone, Debug)]
pub struct PlayerCapes {
    id: String,
    state: String,
    url: String,
    alias: Option<String>,
    varient: Option<String>,
}

#[derive(Deserialize,Serialize, Clone, Debug)]
pub struct PlayerSkins {
    id: String,
    state: String,
    url: String,
    varient: Option<String>,
    alias: Option<String>,
}

#[derive(Deserialize,Serialize, Clone, Debug)]
pub struct PlayerProfile {
    pub id: String,
    pub name: String,
    pub skins: Vec<PlayerSkins>,
    pub capes: Vec<PlayerCapes>
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Account {
    profile: PlayerProfile,
    access_token: String,
    refresh_token: String
}

#[derive(Deserialize, Debug)]
struct GameOwnerShipItem {
    name: String,
    signature: String
}

#[derive(Deserialize, Debug)]
struct GameOwnership {
    items: Vec<GameOwnerShipItem>,
    signature: String,
    #[serde(rename="keyId")]
    key_id: String
}

///https://login.live.com/logout.srf?
/// ct=1642644026&rver=7.0.6738.0&
/// lc=1033&id=292666&
/// ru=https%3A%2F%2Faccount.microsoft.com%2Fauth%2Fcomplete-signout%3Fru%3Dhttps%253A%252F%252Faccount.microsoft.com%252F%253Frefd%253Daccount.microsoft.com%2526ru%253Dhttps%25253A%25252F%25252Faccount.microsoft.com%25252F%25253Frefd%25253Dlogin.live.com%2526destrt%253Dhome-index%2526refp%253Dsignedout-index
/// <https://stackoverflow.com/questions/39386633/how-to-signout-from-an-azure-application>
/// <https://stackoverflow.com/questions/10005306/how-to-signout-from-windows-live-using-microsoft-live-controls-signin-button-inw>
pub fn get_logout_url(client_id: String, redirect_uri: String) -> String {
    format!("https://login.live.com/oauth20_logout.srf?client_id={client_id}&redirect_uri={redirect_uri}&scope=XboxLive.signin%20offline_access",client_id=client_id,redirect_uri=redirect_uri).to_string()
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

pub fn get_auth_code_from_url(url: String) -> Result<String,String> {

    let parsed = urlparse::urlparse(url);

    let query = match parsed.get_parsed_query() {
        Some(value) => value,
        None => {
            error!("Url does not contain a query string");
            return Err("Url does not contain a query string".to_string())
        }
    };

    let code = match query.get("code") {
        Some(value) => value,
        None => {
            error!("Url does not contain a query prop 'code'");
            return Err("Url does not contain a query prop 'code'".to_string())
        }
    };

    let token = match code.get(0) {
        Some(value) => value,
        None => {
            error!("Failed to get auth code");
            return Err("Failed to get auth code".to_string())
        }
    };

   Ok(token.to_owned())
}

/// Returns ms authorization token
fn get_authorization_token(client_id: String, client_secret: String, redirect_uri: String, auth_code: String) -> WithException<OAuth2LoginJson> {
    let agent = get_user_agent();
    // Accoreding to this thread A "public client" is a mobile or desktop application
    // and thus should not be providing the client_secret value in the request
    // <https://stackoverflow.com/questions/38786249/error-public-clients-cant-send-a-client-secret-while-try-to-get-access-token-i>
    let parameters = [
        ("client_id", client_id.as_str()),
        ("redirect_uri",redirect_uri.as_str()),
        ("code",auth_code.as_str()),
        ("grant_type","authorization_code")
    ];

    match agent
    .post(MS_TOKEN_AUTHORIZATION_URL)
    .send_form(&parameters) {
        Ok(value) => {
            match value.into_json::<OAuth2LoginJson>() {
                Ok(json) => {
                    Ok(json)
                },
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to tranfrom data"))
                } 
            }
        }
        Err(ureq::Error::Status(code, response)) => {
            error!("Status: {} | {:?}",code,response.into_string());
            Err(InterialError::boxed("Failed to make request"))
        }
        Err(ureq::Error::Transport(err)) => {
            error!("{} {} {:?}",err.kind(), err.to_string(),err.url());
            Err(InterialError::boxed("Failed to make request"))
        }
    }

}

/// Returns ms authorization token
fn refresh_authorization_token(client_id: String, client_secret: String, redirect_uri: String, refresh_token: String) -> WithException<OAuth2LoginJson> {
    let agent = get_user_agent();
    let payload = json!({
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    });

    match agent.post(MS_TOKEN_AUTHORIZATION_URL).send_json(payload) {
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

/// currently due a bug with ureq and the underlining TLS library
/// will have to use the async tauri::api::http lib 
/// though i would rather use ureq lib as its sync rather then async 
/// because when calling this func it will be inside a async func already
/// <https://github.com/algesten/ureq/issues/317>
async fn authenticate_with_xbl(access_token: String) -> WithException<XboxLiveJson> {
    let client = ClientBuilder::new().build().expect("Failed to make http client");

    let payload = json!({
        "Properties": {
            "AuthMethod": "RPS",
            "SiteName": "user.auth.xboxlive.com",
            "RpsTicket": format!("d={}",access_token).as_str()
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
    
     });

    let mut headers: HashMap<String,String> = HashMap::new();
    headers.insert("Accept".to_string(), "application/json".to_string());
    headers.insert("Content-Type".to_string(),"application/json".to_string());
    headers.insert("User-Agent".to_string(),"rusty-minecraft-launcher/1.0.0".to_string());

    let request_builder = HttpRequestBuilder::new("POST", "https://user.auth.xboxlive.com/user/authenticate");
    let request = request_builder.body(Body::Json(payload)).response_type(ResponseType::Json).headers(headers);

    match client.send(request).await {
        Ok(value) => {
            match value.read().await {
                Ok(response) => {
                    match serde_json::from_value::<XboxLiveJson>(response.data) {
                        Ok(result) => {
                            Ok(result)
                        }
                        Err(err) => {
                            error!("{}",err);
                            Err(InterialError::boxed("Failed to convert to struct"))
                        }
                    }
                }
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to read response"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}

/// same reasons as with func authenticate_with_xbl
async fn authenticate_width_xsts(xbl_token: String) -> WithException<XboxLiveJson> {
    let client = ClientBuilder::new().build().expect("Failed to make http client");

    let payload = json!({
        "Properties": {
            "SandboxId": "RETAIL",
            "UserTokens": [
                xbl_token
            ]
        },
        "RelyingParty": "rp://api.minecraftservices.com/",
        "TokenType": "JWT"
    });

    let mut headers: HashMap<String,String> = HashMap::new();
    headers.insert("Accept".to_string(), "application/json".to_string());
    headers.insert("Content-Type".to_string(),"application/json".to_string());
    headers.insert("User-Agent".to_string(),"rusty-minecraft-launcher/1.0.0".to_string());

    let request_builder = HttpRequestBuilder::new("POST", "https://xsts.auth.xboxlive.com/xsts/authorize");
    let request = request_builder.body(Body::Json(payload)).response_type(ResponseType::Json).headers(headers);

    match client.send(request).await {
        Ok(value) => {
            match value.read().await {
                Ok(response) => {
                    match serde_json::from_value::<XboxLiveJson>(response.data) {
                        Ok(result) => {
                            Ok(result)
                        }
                        Err(err) => {
                            error!("{}",err);
                            Err(InterialError::boxed("Failed to convert to struct"))
                        }
                    }
                }
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to read response"))
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
        "identityToken": format!("XBL3.0 x={};{}",userhash,xsts_token).to_string()
    });

    match agent
    .post("https://api.minecraftservices.com/authentication/login_with_xbox")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send_json(payload) {
        Ok(value) => {
            debug!("{:#?}",value);
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

fn check_game_ownership(access_token: String) -> WithException<()> {
    let agent: ureq::Agent = get_user_agent();

    let response: GameOwnership = match agent.get("https://api.minecraftservices.com/entitlements/mcstore")
    .set("Authorization", format!("Bearer {}",access_token).as_str()).call() {
        Ok(value) => {
            match value.into_json::<GameOwnership>() {
                Ok(res) => {
                    res
                }
                Err(err) => {
                    error!("{}",err);
                    return Err(InterialError::boxed("Failed to parse response"));
                }
            }
        }
        Err(ureq::Error::Status(code, response)) => {
            error!("Status: {} | {:?}",code,response.into_string());
            return Err(InterialError::boxed("Failed to make request"));
        }
        Err(ureq::Error::Transport(err)) => {
            error!("{} {} {:?}",err.kind(), err.to_string(),err.url());
            return Err(InterialError::boxed("Failed to make request"));
        }
    };


    if response.items.is_empty() {
        return Err(ExternalProgramError::boxed("Account does not own a copy of minecraft", "", "", ""));
    }

    warn!("Did not check jwt signatures, may not be legitimate");
  

    Ok(())
}

fn get_profile(token: String) -> WithException<PlayerProfile> {
    let agent: ureq::Agent = get_user_agent();

    match agent.get("https://api.minecraftservices.com/minecraft/profile")
    .set("Authorization", format!("Bearer {}",token).as_str()).call() {
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

pub async fn complete_login(client_id: String, client_secret: String, redirect_uri: String, auth_code: String) -> Result<Account,String> {

    let authorization: OAuth2LoginJson = match get_authorization_token(client_id, client_secret, redirect_uri, auth_code) {
        Ok(value) => value,
        Err(error) => return Err(error.to_string())
    };

    let xbl_request: XboxLiveJson = match authenticate_with_xbl(authorization.access_token.clone()).await {
        Ok(value) => value,
        Err(error) => return Err(error.to_string())
    };

    let xbl_token = xbl_request.token.clone();
    let userhash = xbl_request.display_claims.xui.get(0).expect("Failed to get claim").uhs.clone();

    let xsts_request: XboxLiveJson = match authenticate_width_xsts(xbl_token).await {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };
    
    let account_request: MinecraftJson = match authenticate_with_minecraft(userhash, xsts_request.token) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    if let Err(err) = check_game_ownership(account_request.access_token.clone()) {
        return Err(err.to_string());
    }

    let profile: PlayerProfile = match get_profile(account_request.access_token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err.to_string())
    };

    let account = Account {
        profile: profile.clone(),
        access_token: account_request.access_token,
        refresh_token: authorization.refresh_token
    };

    match app_dir(AppDataType::UserConfig, &APP_INFO,"/") {
        Ok(value) => {
            let file_path = value.join("user_cache.yml");
            match file_path.is_file() {
                false => {
                    let data = File::create(file_path).expect("Failed to create file");
                    let groups = HashMap::from([
                        (profile.id.clone(), account.clone())
                    ]);
                    if let Err(err) = serde_yaml::to_writer(data, &groups) {
                        error!("{}",err);
                    }
                }
                true => {
                    let data = File::open(file_path.clone()).expect("Failed to open file");
                    let cache = match serde_yaml::from_reader::<File,HashMap<String,Account>>(data) {
                        Ok(mut cache) => {
                            cache.insert(profile.id.clone(),account.clone());
                            cache
                        }
                        Err(err) => {
                            error!("{}",err);
                            return Err("Failed to write cache".to_string());
                        }
                    };

                    match serde_yaml::to_string(&cache) {
                        Ok(saved) => {
                            if let Err(err) = write(file_path,saved) {
                                error!("{}",err);
                            }
                        }
                        Err(err) => {
                            error!("{}",err);
                        }
                    }
                }
            }
            
        }
        Err(err) => {
            error!("{}",err);
        }
    }

    Ok(account)
}

pub fn complete_refresh(client_id: String, client_secret: String, redirect_uri: String, refresh_token: String) -> WithException<PlayerProfile> {

  /*  let token_request: OAuth2LoginJson = match refresh_authorization_token(client_id, client_secret, redirect_uri, refresh_token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let token = token_request.access_token;

    let xbl_request = match authenticate_with_xbl(token) {
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
    profile.refresh_token = Some(token_request.refresh_token);

    Ok(profile)*/
    unimplemented!()
}
