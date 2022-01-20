use crate::minecraft::utils::{get_user_agent, download_file };
use crate::minecraft::exceptions::{WithException,InterialError};
use log::{ error, info };
use serde::Deserialize;
use std::path::PathBuf;

const OPTIFINE_HEADLESS: &str = "https://raw.github.com/VisualSource/";
const OPTIFINE_HEADLESS_SHA1: &str = "";

pub fn install_optifine(mc: String, version: Option<String>, mc_dir: PathBuf) -> WithException<()> {
    unimplemented!();
}

pub fn get_optifine_versions() -> WithException<Vec<String>> {
    unimplemented!();
}