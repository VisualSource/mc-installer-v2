use crate::minecraft::exceptions::{WithException, VersionNotFound };
use crate::minecraft::utils::parse_rule_list;
use zip;
use serde_json;
use std::env::consts;

/// returns the native part from the json data
pub fn get_natives(data: &serde_json::Value) -> String {
    let arch = match consts::ARCH {
        "x86" => "32",  
        _ => "64"
    };

    if let Some(natives) = data.get("natives") {
        match consts::OS {
            "windows" => {
                if let Some(windows) = natives.get("windows") {
                    windows.to_string().replace("$arch",arch)
                } else {
                    String::new()
                }
            }
            "macos" => {
                if let Some(mac) = natives.get("osx") {
                    mac.to_string().replace("${arch}",arch)
                } else {
                    String::new()
                }
            }
            "linux" => {
                if let Some(lin) = natives.get("linux") {
                    lin.to_string().replace("${arch}",arch)
                } else {
                    String::new()
                }
            }
            _ => {
                String::new()
            }
        }
    } else {
        String::new()
    }
}