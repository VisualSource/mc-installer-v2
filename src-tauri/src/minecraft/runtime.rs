use std::env::consts;
use std::path::PathBuf;
use ureq;
use serde::Deserialize;
use crate::minecraft::exceptions::{WithException,InterialError, VersionNotFound};
use crate::minecraft::utils::{get_user_agent,download_file};

const JVM_MANIFEST_URL: &str = "https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json";

#[derive(Deserialize,Debug)]
pub struct RuntimeAvailabilityData {
    pub group: i32,
    pub progress: i32
}

#[derive(Deserialize,Debug)]
pub struct RuntimeManifestData {
    pub sha1: String,
    pub size: i32,
    pub url: String
}

#[derive(Deserialize,Debug)]
pub struct RuntimeVersionData {
    pub name: String,
    pub released: String
}

#[derive(Deserialize,Debug)]
pub struct RuntimeData {
    pub availability: RuntimeAvailabilityData,
    pub manifest: RuntimeManifestData,
    pub version: RuntimeVersionData
}

#[derive(Deserialize,Debug)]
pub struct ArchManifest {
    #[serde(rename="java-runtime-alpha")]
    pub java_runtime_alpha: Vec<RuntimeData>,
    #[serde(rename="java-runtime-beta")]
    pub java_runtime_beta: Vec<RuntimeData>,
    #[serde(rename="jre-legacy")]
    pub jre_legacy: Vec<RuntimeData>,
    #[serde(rename="minecraft-java-exe")]
    pub minecraft_java_exe: Vec<RuntimeData>
}


#[derive(Deserialize,Debug)]
pub struct JVMManifest {
    pub gamecore: ArchManifest,
    pub linux: ArchManifest,
    #[serde(rename="linux-i386")]
    pub linux_i386: ArchManifest,
    #[serde(rename="mac-os")]
    pub mac_os: ArchManifest,
    #[serde(rename="windows-x64")]
    pub windows_x64: ArchManifest,
    #[serde(rename="windows-x86")]
    pub windows_x86: ArchManifest,
}


/// Get the name that is used to identify the platform
fn get_jvm_platform_string() -> WithException<String> {
    match consts::OS {
        "windows" => {
            if consts::ARCH == "x86" {
                return Ok(String::from("windows-x86"));
            }

            Ok(String::from("windows-x64"))
        }
        "macos" => {
            Ok(String::from("mac-os"))
        }
        "linux" => {
            if consts::ARCH == "x86" {
                return Ok(String::from("linux-i386"));
            }
            Ok(String::from("linux"))
        }
        _ => {
            Err(InterialError::boxed("Failed to get platform"))
        }
    }
}

/// returns a list of all mc jvm runtimes
fn get_jvm_runtimes() -> WithException<JVMManifest> {
    let agent = get_user_agent();

    match agent.get(JVM_MANIFEST_URL).call() {
        Ok(res) => {
            let raw_json: std::io::Result<JVMManifest> = res.into_json();
            match raw_json {
                Err(error) => Err(InterialError::boxed(error.to_string())),
                Ok(value) => Ok(value)
            }
        }
        Err(ureq::Error::Status(code, res)) => {
            let response = res.into_string().expect("Failed to transform response into a string");
            Err(InterialError::boxed(format!("HTTP ERROR | Code: {} | Res: {}",code,response)))
        }
        Err(e) => {
            eprintln!("{}",e);
            Err(InterialError::boxed("HTTP REQUEST ERROR"))
        }
    }
}

pub fn install_jvm_runtime(jvm_version: String,minecraft_dir: PathBuf) -> WithException<()> { 
    match get_jvm_runtimes() {
        Ok(runtimes) => {
            match get_jvm_platform_string() {
                Ok(runtime) => {
                    match runtime.as_str() {
                        "windows-x86" => {
                            match jvm_version.as_str() {
                                "java-runtime-beta" => {
                                    if runtimes.windows_x86.java_runtime_beta.len() > 0 {
                                        let path = minecraft_dir.join("runtime\\java-runtime-beta\\windows-x86\\java-runtime-beta");
                                       
                                    }
                                }
                                "java-runtime-alpha" => {
                                    if runtimes.windows_x86.java_runtime_alpha.len() > 0 {
                                        
                                    }
                                }
                                "jre-legacy" => {
                                    if runtimes.windows_x86.jre_legacy.len() > 0 {
                                        
                                    }
                                }
                                "minecraft-java-exe" => {
                                    if runtimes.windows_x86.minecraft_java_exe.len() > 0 {
                                        
                                    }
                                }
                                _ => return Err(VersionNotFound::boxed(jvm_version.clone()))
                            }
                            Ok(())
                        }
                        "windows-x64" => {
                            match jvm_version.as_str() {
                                "java-runtime-beta" => {
                                    if runtimes.windows_x64.java_runtime_beta.len() > 0 {
                                        let path = minecraft_dir.join("runtime\\java-runtime-beta\\windows-x64\\java-runtime-beta");
                                        match download_file(runtimes.windows_x64.java_runtime_beta[0].manifest.url.clone(),path,Some(runtimes.windows_x64.java_runtime_beta[0].manifest.sha1.clone()),false) {
                                            Ok(_res) => {

                                            }
                                            Err(err) => return Err(err)
                                        }
                                    }
                                }
                                "java-runtime-alpha" => {
                                    if runtimes.windows_x64.java_runtime_alpha.len() > 0 {
                                        
                                    }
                                }
                                "jre-legacy" => {
                                    if runtimes.windows_x64.jre_legacy.len() > 0 {
                                        
                                    }
                                }
                                "minecraft-java-exe" => {
                                    if runtimes.windows_x64.minecraft_java_exe.len() > 0 {
                                        
                                    }
                                }
                                _ => return Err(VersionNotFound::boxed(jvm_version.clone()))
                            }
                            Ok(())
                        }
                        "mac-os" => {
                            Ok(())
                        }
                        "linux-i386" => {
                            Ok(())
                        }
                        "linux" => {
                            Ok(())
                        }
                        _ => Err(VersionNotFound::boxed(runtime))
                    }
                }
                Err(error) => Err(error)
            }
        }
        Err(error) => Err(error)
    }
}

/// Returns the path to the executable. None if it does not exists
pub fn get_exectable_path(jvm_version: String, minecraft_dir: PathBuf) -> WithException<Option<PathBuf>> {

    match get_jvm_platform_string() {
        Ok(platform) => {
            let mut java_path = minecraft_dir.join("runtime").join(jvm_version.clone()).join(platform).join(jvm_version).join("bin").join("java");

            if java_path.is_file() {
                return Ok(Some(java_path));
            }

            let exe_java = java_path.with_extension("exe");

            if exe_java.is_file() {
                return Ok(Some(exe_java));
            }

            java_path.pop();
            java_path.pop();

            let jre = java_path.join("jre.bundle").join("Contents").join("Home").join("bin").join("java");

            if jre.is_file() {
                return Ok(Some(jre));
            }

            Ok(None)
        }
        Err(err)=>{
            Err(err)
        }
    }
}


#[test]
fn test_install_jvm_runtime() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");

    if let Err(error) = install_jvm_runtime(String::from("java-runtime-beta"), mc) {
        eprintln!("{}",error);
    }
    
}

#[test]
fn test_get_jvm_runtimes() {
    match get_jvm_runtimes() {
        Ok(value) => {
            println!("{:#?}",value);
        }
        Err(error) => {
            eprintln!("{}",error);
        }
    }
}