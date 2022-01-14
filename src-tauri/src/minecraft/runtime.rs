use crate::minecraft::exceptions::{ WithException, InterialError, VersionNotFound };
use crate::minecraft::structs_runtimes::{ JVMManifest, RuntimeData, JVMFiles };
use crate::minecraft::utils::{ get_user_agent, download_file };
use std::fs::{ create_dir_all, write };
use std::path::{ PathBuf };
use std::process::Command;
use std::env::consts;
use log::{ error, info };


const JVM_MANIFEST_URL: &str = "https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json";

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
            error!("Failed to get platform");
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
                Err(error) => {
                    error!("Failed to parse data into struct | {}",error);
                    Err(InterialError::boxed(error.to_string()))
                },
                Ok(value) => Ok(value)
            }
        }
        Err(ureq::Error::Status(code, res)) => {
            error!("Http request error | {} {:?}", code, res);
            let response = res.into_string().expect("Failed to transform response into a string");
            Err(InterialError::boxed(format!("Http error | Code: {} | Res: {}",code,response)))
        }
        Err(e) => {
            error!("Http request error | {}",e);
            Err(InterialError::boxed("Http request error"))
        }
    }
}

fn get_manifest(arch: String, runtime: String, runtimes: JVMManifest) -> WithException<RuntimeData> {
    match arch.as_str() {
        "linux" => {
            match runtime.as_str() {
                "java-runtime-alpha" => {
                    if let Some(value) = runtimes.linux.java_runtime_alpha.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java-runtime-alpha | linux"))
                    }
                },
                "java-runtime-beta" => {
                    if let Some(value) = runtimes.linux.java_runtime_beta.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java-runtime-beta | linux"))
                    }
                }
                "jre-legacy" => {
                    if let Some(value) = runtimes.linux.jre_legacy.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("jre-legacy | linux"))
                    }
                }
                "minecraft-java-exe" => {
                    if let Some(value) = runtimes.linux.minecraft_java_exe.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("linux | linux"))
                    }
                }
                _ => {
                    error!("Failed to find runtime {} for {}",runtime,arch);
                    Err(VersionNotFound::boxed(runtime))
                }
            }
        }
        "linux-i386" => {
            match runtime.as_str() {
                "java-runtime-alpha" => {
                    if let Some(value) = runtimes.linux_i386.java_runtime_alpha.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_alpha | linux_i386"))
                    }
                },
                "java-runtime-beta" => {
                    if let Some(value) = runtimes.linux_i386.java_runtime_beta.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_beta | linux_i386"))
                    }
                }
                "jre-legacy" => {
                    if let Some(value) = runtimes.linux_i386.jre_legacy.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("jre_legacy | linux_i386"))
                    }
                }
                "minecraft-java-exe" => {
                    if let Some(value) = runtimes.linux_i386.minecraft_java_exe.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("minecraft_java_exe | linux_i386"))
                    }
                }
                _ =>  {
                    error!("Failed to find runtime {} for {}",runtime,arch);
                    Err(VersionNotFound::boxed(runtime))
                }
            }
        }
        "mac-os" => {
            match runtime.as_str() {
                "java-runtime-alpha" => {
                    if let Some(value) = runtimes.mac_os.java_runtime_alpha.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_alpha | mac_os"))
                    }
                },
                "java-runtime-beta" => {
                    if let Some(value) = runtimes.mac_os.java_runtime_beta.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_beta | mac_os"))
                    }
                }
                "jre-legacy" => {
                    if let Some(value) = runtimes.mac_os.jre_legacy.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("jre_legacy | mac_os"))
                    }
                }
                "minecraft-java-exe" => {
                    if let Some(value) = runtimes.mac_os.minecraft_java_exe.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("minecraft_java_exe | mac_os"))
                    }
                }
                _ =>  {
                    error!("Failed to find runtime {} for {}",runtime,arch);
                    Err(VersionNotFound::boxed(runtime))
                }
            }
        }
        "windows-x64" => {
            match runtime.as_str() {
                "java-runtime-alpha" => {
                    if let Some(value) = runtimes.windows_x64.java_runtime_alpha.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_alpha | windows_x64"))
                    }
                },
                "java-runtime-beta" => {
                    if let Some(value) = runtimes.windows_x64.java_runtime_beta.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_beta | windows_x64"))
                    }
                }
                "jre-legacy" => {
                    if let Some(value) = runtimes.windows_x64.jre_legacy.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("jre_legacy | windows_x64"))
                    }
                }
                "minecraft-java-exe" => {
                    if let Some(value) = runtimes.windows_x64.minecraft_java_exe.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("minecraft_java_exe | windows_x64"))
                    }
                }
                _ => {
                    error!("Failed to find runtime {} for {}",runtime,arch);
                    Err(VersionNotFound::boxed(runtime))
                }
            }
        }
        "windows-x86" => {
            match runtime.as_str() {
                "java-runtime-alpha" => {
                    if let Some(value) = runtimes.windows_x86.java_runtime_alpha.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_alpha | windows_x86"))
                    }
                },
                "java-runtime-beta" => {
                    if let Some(value) = runtimes.windows_x86.java_runtime_beta.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("java_runtime_beta | windows_x86"))
                    }
                }
                "jre-legacy" => {
                    if let Some(value) = runtimes.windows_x86.jre_legacy.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("jre_legacy | windows_x86"))
                    }
                }
                "minecraft-java-exe" => {
                    if let Some(value) = runtimes.windows_x86.minecraft_java_exe.last() {
                        Ok(value.to_owned())
                    } else {
                        error!("Failed to find runtime {} for {}",runtime,arch);
                        Err(VersionNotFound::boxed("minecraft_java_exe | windows_x86"))
                    }
                }
                _ => {
                    error!("Failed to find runtime {} for {}",runtime,arch);
                    Err(VersionNotFound::boxed(runtime))
                }
            }
        }
        _ => {
            error!("Failed to find runtime {} for {}",runtime,arch);
            Err(InterialError::boxed("No Runtime for this arch"))
        }
    }
}

pub fn install_jvm_runtime(jvm_version: String, minecraft_dir: PathBuf) -> WithException<()> { 
    let runtimes = match get_jvm_runtimes() {
        Err(err) => return Err(err),
        Ok(value) => value
    };
    let arch = match get_jvm_platform_string() {
        Err(err) => return Err(err),
        Ok(value) => value
    };

    let manifest: RuntimeData = match get_manifest(arch.clone(), jvm_version.clone(), runtimes) {
        Ok(value) => value,
        Err(err) => return Err(err)
    };

    let response = match get_user_agent().get(manifest.manifest.url.as_str()).call() {
        Ok(value) => value,
        Err(ureq::Error::Status(code,error)) => {
            error!("Http error | {} {:?}",code,error);
            let msg = error.into_string().expect("Failed to transform response into a string");
            return Err(InterialError::boxed(format!("Http error | Code: {} | Why: {}",code, msg)));
        }
        Err(other) => {
            error!("Http error | {} ",other);
            return Err(InterialError::boxed("Http error | Transport error"));
        }
    };

    let src_download = match response.into_json::<JVMFiles>() {
        Ok(value) => value,
        Err(err) => {
            error!("Failed to parse data into struct | {}",err);
            return Err(InterialError::boxed(err.to_string()));
        }
    };

    let root = minecraft_dir.join("runtime").join(jvm_version.clone()).join(arch.clone()).join(jvm_version.clone());

    for (key, value) in src_download.files {
        let cur = root.join(key.replace("/","\\"));

        match value.action.as_str() {
            "file" => {
                if let Some(download) = value.downloads {
                    if let Some(lzma) = download.lzma {
                        match download_file(lzma.url, cur.clone(), Some(lzma.sha1), true){
                            Ok(value)=>{
                                info!("Download state: {:?}",value);
                            }
                            Err(error)=>return Err(error)
                        }
                    } else {
                        match download_file(download.raw.url, cur.clone(), Some(download.raw.sha1), false){
                            Ok(value)=>{
                                info!("Download state: {:?}",value);
                            }
                            Err(error)=>return Err(error)
                        }
                    }
                }

                if consts::OS != "windows" {
                    if let Err(error) = Command::new("chmod").args(["+x",cur.to_str().expect("Should be a str")]).output() {
                        return Err(InterialError::boxed(format!("Failed to make file a executable | {}",error.to_string())));
                    }
                }
            }
            "directory" => {
                if !cur.exists() {
                    if let Err(error) = create_dir_all(cur) {
                        error!("{}",error);
                        return Err(InterialError::boxed(error.to_string()));
                    }
                }
            }
            _ => {}
        }
    }

    let version = minecraft_dir.join("runtime").join(jvm_version.clone()).join(arch).join(".version");

    if let Err(error) = write(version,manifest.version.name){
        error!("Failed to write file | {}",error);
        return Err(InterialError::boxed(error.to_string()));
    }

    Ok(())
}

/// Returns the path to the java executable. None if it does not exists
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

pub fn does_runtime_exist(jvm_version: String, minecraft_dir: PathBuf) -> WithException<bool> {
    let platform = match get_jvm_platform_string() {
        Ok(value) => value,
        Err(err) => return Err(err)
    };
    let java_path = minecraft_dir.join("runtime").join(jvm_version.clone()).join(platform).join(jvm_version).join("bin").join("java");

    if java_path.is_file() {
        return Ok(true);
    }

    let exe_java = java_path.with_extension("exe");

    if exe_java.is_file() {
        return Ok(true);
    }

    Ok(false)
}

pub fn validate_runtime_files(_jvm_version: String, _minecraft_dir: PathBuf) -> WithException<()> {
    unimplemented!();
}


#[test]
fn test_get_executable_path() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");
    let jvm = "java-runtime-alpha".to_string();
    match get_exectable_path(jvm,mc) {
        Ok(value) => {
            println!("{:#?}",value);
        },
        Err(err)=>{
            eprintln!("{}",err);
        }
    }
}

#[test]
fn test_install_jvm_runtime() {
    let mc = PathBuf::from("C:\\Users\\Collin\\AppData\\Roaming\\.minecraft");

    if let Err(error) = install_jvm_runtime(String::from("java-runtime-alpha"), mc) {
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