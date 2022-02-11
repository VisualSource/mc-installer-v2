use crate::utils::get_http_client;
use crate::expections::{LauncherLibError,LibResult};
use crate::json::{
    minecraft_account::PlayerProfile,
    authentication_microsoft::{
        AuthoriztionJson, 
        XboxLiveJson,
        MinecraftJson,
        GameOwnership,
        Account
    }
};
use serde_json::json;



const MS_TOKEN_AUTHORIZATION_URL: &str = "https://login.live.com/oauth20_token.srf";

pub fn ms_login_url(client_id: String, redirect_uri: String) -> String {
    format!(
        "https://login.live.com/oauth20_authorize.srf?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope=XboxLive.signin%20offline_access&state=<optional;",
        client_id=client_id,
        redirect_uri=redirect_uri    
    ).to_string()
}

pub fn get_auth_code(url: String) -> Option<String> {
    let query = urlparse::urlparse(url);
    match query.get_parsed_query() {
        Some(value) =>{
            match value.get("code") {
                Some(code) => {
                    match code.get(0) {
                        Some(raw) => Some(raw.clone()),
                        None => None
                    }
                },
                None => None
            }
        },
        None => None
    }
}

fn refresh_auth_token(client_id: String, redirect_uri: String, auth_code: String) -> LibResult<AuthoriztionJson> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let params = std::collections::HashMap::from([
        ("client_id", client_id.as_str()),
        ("redirect_uri",redirect_uri.as_str()),
        ("code",auth_code.as_str()),
        ("grant_type","refresh_token")
    ]);

    match client.post(MS_TOKEN_AUTHORIZATION_URL).json(&params).send() {
        Ok(value) => {
            match value.json::<AuthoriztionJson>() {
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        }
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to make authorization request".into()
        })
    }
}

fn get_authorization_token(client_id: String, redirect_uri: String, auth_code: String) -> LibResult<AuthoriztionJson> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let params = std::collections::HashMap::from([
        ("client_id", client_id.as_str()),
        ("redirect_uri",redirect_uri.as_str()),
        ("code",auth_code.as_str()),
        ("grant_type","authorization_code")
    ]);

    match client.post(MS_TOKEN_AUTHORIZATION_URL).form(&params).send() {
        Ok(value) => {
            println!("{:#?}",value);
            match value.json::<AuthoriztionJson>() {
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        }
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to make authorization request".into()
        })
    }
}

fn authenticate_with_xbl(access_token: String) -> LibResult<XboxLiveJson> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let payload = json!({
        "Properties": {
            "AuthMethod": "RPS",
            "SiteName": "user.auth.xboxlive.com",
            "RpsTicket": format!("d={}",access_token).as_str()
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
     });

    match client.post("https://user.auth.xboxlive.com/user/authenticate").json(&payload).send() {
        Ok(res) => {
            match res.json::<XboxLiveJson>(){
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        }
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to authenticate with xbox live".into()
        })
    }
}

fn authenticate_with_xsts(xbl_token: String) -> LibResult<XboxLiveJson> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

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

    match client.post("https://xsts.auth.xboxlive.com/xsts/authorize").json(&payload).send() {
        Ok(res) => {
            match res.json::<XboxLiveJson>() {
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        },
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to authenticate with XSTS".into()
        })
    }
}

fn authenticate_with_minecraft(userhash: String, xsts_token: String) -> LibResult<MinecraftJson> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let payload = json!({
        "identityToken": format!("XBL3.0 x={};{}",userhash,xsts_token).to_string()
    });

    match client.post("https://api.minecraftservices.com/authentication/login_with_xbox").json(&payload).send() {
        Ok(res) => {
            match res.json::<MinecraftJson>() {
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        },
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to authenticate with minecraft".into()
        })
    }
}

fn check_game_ownership(access_token: String) -> LibResult<()> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match client.get("https://api.minecraftservices.com/entitlements/mcstore").bearer_auth(access_token).send() {
        Ok(res) => {
            match res.json::<GameOwnership>() {
                Ok(value) => {
                    if value.items.is_empty() {
                        return Err(LauncherLibError::General("Account does not own a copy of minecraft".into()))
                    }

                    eprintln!("Did not check jwt signatures, may not be legitimate");

                    Ok(())
                },
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        },
        Err(err) => Err(LauncherLibError::HTTP{
            source: err,
            msg: "Failed to check game ownership".into()
        })
    }
}

fn get_minecraft_profile(token: String) -> LibResult<PlayerProfile> {
    let client = match get_http_client() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    match client.get("https://api.minecraftservices.com/minecraft/profile").bearer_auth(token).send() {
        Ok(res) => {
            match res.json::<PlayerProfile>() {
                Ok(value) => Ok(value),
                Err(err) => Err(LauncherLibError::PraseJsonReqwest(err))
            }
        },
        Err(err) => Err(LauncherLibError::HTTP {
            source: err,
            msg: "Failed to get minecraft profile".into()
        })
    }
}

pub fn login_microsoft(client_id: String, redirect_uri: String, auth_code: String) -> LibResult<Account> {
    let auth: AuthoriztionJson = match get_authorization_token(client_id, redirect_uri, auth_code) {
        Ok(token) => token,
        Err(err) => return Err(err)
    };

    let xbl: XboxLiveJson = match authenticate_with_xbl(auth.access_token.clone()) {
        Ok(profile) => profile,
        Err(err) => return Err(err)
    };

    let userhash = match xbl.get_userhash() {
        Some(value) => value,
        None => return Err(LauncherLibError::General("Failed to get userhash".into())) 
    };

    let xsts: XboxLiveJson = match authenticate_with_xsts(xbl.token.clone()) {
        Ok(value) => value,
        Err(err) => {
            eprintln!("{:#?}",err);
            return Err(err);
        }
    };

    let account: MinecraftJson = match authenticate_with_minecraft(userhash, xsts.token) {
        Ok(value) => value,
        Err(err) => {
            eprintln!("{:#?}",err);
            return Err(err);
        }
    };

    let access_token = account.access_token.clone();

    if let Err(err) = check_game_ownership(access_token.clone()) {
        return Err(err);
    }

    let profile: PlayerProfile = match get_minecraft_profile(access_token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    println!("{:#?}",profile);

    let xuid = match account.get_xuid() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    Ok(Account {
        profile,
        xuid,
        access_token: access_token,
        refresh_token: auth.refresh_token
    })
}

pub fn login_microsoft_refresh(client_id: String, redirect_uri: String, refresh_token: String) -> LibResult<Account> {
    let auth: AuthoriztionJson = match refresh_auth_token(client_id, redirect_uri, refresh_token) {
        Ok(token) => token,
        Err(err) => return Err(err)
    };

    let xbl: XboxLiveJson = match authenticate_with_xbl(auth.access_token.clone()) {
        Ok(profile) => profile,
        Err(err) => return Err(err)
    };

    let userhash = match xbl.display_claims.xui.get(0) {
        Some(value) => value.uhs.clone(),
        None => return Err(LauncherLibError::General("Failed to get userhash".into())) 
    };

    let xsts: XboxLiveJson = match authenticate_with_xsts(xbl.token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let account: MinecraftJson = match authenticate_with_minecraft(userhash, xsts.token) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let access_token = account.access_token.clone();

    if let Err(err) = check_game_ownership(access_token.clone()) {
        return Err(err);
    }

    let profile: PlayerProfile = match get_minecraft_profile(access_token.clone()) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let xuid = match account.get_xuid() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    Ok(Account {
        profile,
        access_token: access_token,
        refresh_token: auth.refresh_token,
        xuid
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_ms_login_url() {
        let client_id = std::env::var("CLIENT_ID").expect("Expected CLIENT ID").to_string();
        let redirect_uri = "https://login.microsoftonline.com/common/oauth2/nativeclient".to_string();
        let url = ms_login_url(client_id, redirect_uri);

        println!("{}",url);
    }
}