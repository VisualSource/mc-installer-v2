use crate::minecraft::exceptions::{WithException, InterialError};
use std::fs::{File, create_dir_all};
use std::path::PathBuf;
use std::env::consts;
use std::io::Read;
use log::{error, info};


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
                    windows.clone().as_str().expect("Failed to make string").replace("$arch",arch)
                } else {
                    String::new()
                }
            }
            "macos" => {
                if let Some(mac) = natives.get("osx") {
                    mac.clone().as_str().expect("Failed to make string").replace("${arch}",arch)
                } else {
                    String::new()
                }
            }
            "linux" => {
                if let Some(lin) = natives.get("linux") {
                    lin.clone().as_str().expect("Failed to make string").replace("${arch}",arch)
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


#[derive(Default,Debug)]
pub struct ExtractData {
    exclude: Vec<String>
}

pub fn extract_natives_file(filename: PathBuf, extract_path: PathBuf, extract_data: &serde_json::Value) -> WithException<()> {

    info!("ZIPFILE {:?}",filename);
    info!("EXTRACT PATH {:?}",extract_path);
    info!("IGNORE {:?}",extract_data);

    if let Err(error) = create_dir_all(extract_path.clone()) {
        error!("{}",error);
        return Err(InterialError::boxed("Failed to create dir"));
    }

    let file = match File::open(filename) {
        Err(error) => {
            error!("{}",error);
            return Err(InterialError::boxed("Failed to open file"))
        }
        Ok(value) => value
    };

    let mut zip: zip::ZipArchive<File> = match zip::ZipArchive::new(file) {
        Ok(value) => value,
        Err(error) => {
            error!("{}",error);
            return Err(InterialError::boxed("Failed to read archive"));
        }
    };

    let mut ignores: Vec<String> = vec![];

    for file in extract_data["exclude"].as_array().expect("Sould be a string array").iter() {
        ignores.push(file.clone().as_str().expect("Failed to make string").to_string());
    }

    for i in 0..zip.len() {
        match zip.by_index(i) {
            Ok(mut item) => {
               let mut skip = false;
               for e in &ignores {
                   if item.name().starts_with(e) {
                       skip = true;
                       break;
                   }
               }
               if skip {
                   continue;
               }

               let mut buffer: Vec<u8> = vec![];
               if let Err(err) = item.read_to_end(&mut buffer) {
                   error!("{}",err);
                   return Err(InterialError::boxed("failed to write file to buffer"));
               };

               info!("Extract: {}",item.name());
               if let Err(err) = File::create(extract_path.join(item.name())) {
                    error!("{}",err);
                    return Err(InterialError::boxed("Failed to write file"));
               }
            }
            Err(err) => {
                error!("{}",err);
            }
        }
    }

  Ok(())
}

#[test]
fn test_extract_natives_file() {
    let file = PathBuf::from("C:\\projects\\mc-installer-v2\\src-tauri\\text2speech.jar");
    let path = PathBuf::from("C:\\projects\\mc-installer-v2\\src-tauri\\");
    let data = json!(["META-INF/"]);

    match extract_natives_file(file,path,&data) {
        Ok(_) => {}
        Err(err) => {
            eprintln!("{}",err);
        }
    }
}