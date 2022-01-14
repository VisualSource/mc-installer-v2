use crate::minecraft::exceptions::{WithException,InterialError};
use crate::minecraft::utils::get_user_agent;
use serde::Deserialize;
use log::{ error, info };

#[derive(Deserialize, Debug,Clone)]
pub struct Version {
   #[serde(rename="$value")]
   pub version: Vec<String>
}

#[derive(Deserialize, Debug,Clone)]
pub struct MavenVersioning {
    pub latest: String,
    pub release: String,
    #[serde(rename="lastUpdated")]
    pub last_updated: String,
    pub versions: Version
}

#[derive(Deserialize, Debug,Clone)]
pub struct MavenMetadata {
    #[serde(rename="groupId")]
    pub group_id: String,
    #[serde(rename="artifactId")]
    pub artifact_id: String,
    pub versioning: MavenVersioning
}


/// Get the maven metadata.xml file 
pub fn get_metadata(root_url: &str) -> WithException<MavenMetadata> {
    let agent = get_user_agent();
    match agent.get(format!("{}maven-metadata.xml",root_url).as_str()).call() {
        Ok(response) => {
            let reader = response.into_reader();
            let res: Result<MavenMetadata,serde_xml_rs::Error> = serde_xml_rs::from_reader(reader);
            match res {
                Ok(value) => Ok(value),
                Err(err) => {
                    error!("{}",err);
                    Err(InterialError::boxed("Failed to read data"))
                }
            }
        }
        Err(err) => {
            error!("{}",err);
            Err(InterialError::boxed("Failed to make request"))
        }
    }
}

#[test]
fn test_get_metadata() {
    match get_metadata("https://maven.fabricmc.net/net/fabricmc/fabric-installer/") {
        Ok(value) => {
            info!("{:#?}",value);
        }
        Err(err) => {
            error!("{}",err);
        }
    }
}