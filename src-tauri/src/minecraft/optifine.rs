use crate::minecraft::utils::{get_user_agent, download_file };
use crate::minecraft::exceptions::{WithException,InterialError};
use log::{ error, info };
use serde::Deserialize;

const OPTIFINE_HEADLESS: &str = "https://raw.github.com/VisualSource/";
const OPTIFINE_HEADLESS_SHA1: &str = "";

pub fn install_optifine() -> WithException<()> {
    unimplemented!();
}

pub fn get_optifine_versions() -> WithException<Vec<String>> {
    unimplemented!();
}