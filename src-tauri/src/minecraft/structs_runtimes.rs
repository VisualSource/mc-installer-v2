use std::collections::HashMap;
use serde::Deserialize;


#[derive(Deserialize,Debug,Clone)]
pub struct RuntimeAvailabilityData {
    pub group: i32,
    pub progress: i32
}

#[derive(Deserialize,Debug, Clone)]
pub struct RuntimeManifestData {
    pub sha1: String,
    pub size: i32,
    pub url: String
}

#[derive(Deserialize,Debug,Clone)]
pub struct RuntimeVersionData {
    pub name: String,
    pub released: String
}

#[derive(Deserialize,Debug,Clone)]
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



#[derive(Deserialize,Debug)]
pub struct VMFFileDownload {
    pub sha1: String,
    pub size: i32,
    pub url: String
}
#[derive(Deserialize,Debug)]
pub struct JVMFFileDownloadOptions {
    pub lzma: Option<VMFFileDownload>,
    pub raw: VMFFileDownload
}


#[derive(Deserialize,Debug)]
pub struct JVMFileProps {
    #[serde(rename="type")]
    pub action: String,
    pub executable: Option<bool>,
    pub downloads: Option<JVMFFileDownloadOptions>,
    pub target: Option<String>

}

#[derive(Deserialize,Debug)]
pub struct JVMFiles {
    pub files: HashMap<String,JVMFileProps>
}



