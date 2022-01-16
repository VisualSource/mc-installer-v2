use crate::minecraft::utils::{get_user_agent, download_file };
use crate::minecraft::exceptions::{WithException,InterialError};
use log::{ error, info };
use serde::Deserialize;
use std::path::PathBuf;

pub fn install_iris(mc_dir: PathBuf, mc_version: String) -> WithException<()> {
    unimplemented!();
}

pub fn get_iris_mc_versions() -> WithException<Vec<String>> {
    unimplemented!();
}

pub fn get_iris_loader_verions() -> WithException<Vec<String>> {
    unimplemented!();
}