use crate::minecraft::exceptions::{ WithException, InterialError };
use crate::minecraft::utils::get_user_agent;
use serde::{Deserialize, Serialize};
use log::{ error, debug };

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
struct XSTSJson {
    #[serde(rename="Token")]
    token: String,
}

#[derive(Deserialize, Debug)]
struct MinecraftJson {
    access_token: String
}

#[derive(Deserialize,Serialize, Clone, Debug)]
pub struct PlayerProfile {
    pub id: String,
    pub name: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>
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


fn authenticate_with_xbl(access_token: String) -> WithException<u8> {
    let agent: ureq::Agent = get_user_agent();

    let payload = json!({
        "Properties": {
            "AuthMethod": "RPS",
            "SiteName": "user.auth.xboxlive.com",
            "RpsTicket": format!("d={}",access_token).as_str()
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
    
     });

    match agent.post("https://user.auth.xboxlive.com/user/authenticate").set("Accept", "application/json").send_json(payload) {
        Ok(value) => {
            debug!("{:?}",value.into_string());
        }
        Err(ureq::Error::Status(code, response)) => {
            error!("Status: {} | {:?}",code,response.into_string());
            //Err(InterialError::boxed("Failed to make request"));
        }
        Err(ureq::Error::Transport(err)) => {
            error!("{} {} {:?}",err.kind(), err.to_string(),err.url());
           // Err(InterialError::boxed("Failed to make request"));
        }
    }

    Ok(0)
}


fn authenticate_width_xsts(xbl_token: String) -> WithException<XSTSJson> {
    let agent: ureq::Agent = get_user_agent();

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

    match agent
    .post("https://xsts.auth.xboxlive.com/xsts/authorize")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send_json(payload) {
        Ok(value) => {
            debug!("{:#?}",value);
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

fn get_profile(token: String) -> WithException<PlayerProfile> {
    let agent: ureq::Agent = get_user_agent();

    match agent.get("https://api.minecraftservices.com/minecraft/profile")
    .set("Authorization", format!("Bearer {}",token).as_str()).call() {
        Ok(value) => {
            debug!("{:#?}",value);
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

pub fn complete_login(client_id: String, client_secret: String, redirect_uri: String, auth_code: String) -> WithException<()> {

    let authorization: OAuth2LoginJson = match get_authorization_token(client_id, client_secret, redirect_uri, auth_code) {
        Ok(value) => value,
        Err(error) => return Err(error)
    };

    debug!("{:#?}", authorization);

    let xbl_request = match authenticate_with_xbl(authorization.access_token.clone()) {
        Ok(value) => value,
        Err(error) => return Err(error)
    };

    //let xbl_token = xbl_request.token.clone();
   // let userhash = xbl_request.display_claims.xui.get(0).expect("Failed to get claim").uhs.clone();
/*
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

    Ok(())
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
