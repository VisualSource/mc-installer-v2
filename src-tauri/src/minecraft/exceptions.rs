use std::fmt::Display;
use std::boxed::Box;


pub trait Exception: Display {
    fn as_string(&self) -> String;
}

pub type WithException<T> = Result<T,Box<dyn Exception>>;


macro_rules! exception {
    ($t:ident) => {
        impl Exception for $t {
            fn as_string(&self) -> String {
                self.msg.clone() 
             }
        }
    };
}
macro_rules! printable {
    ($t:ident) => {
        impl Display for $t {
            fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
                writeln!(f,"{:?}",self)
            }
        }
    };
}



#[derive(Debug,Clone)]
pub struct VersionNotFound {
    msg: String,
    pub version: String
}

impl VersionNotFound {
    pub fn new(version: String) -> Self {
        Self {
            msg: format!("Version {} was not found",version).to_string(),
            version: version
        }
    }
    pub fn boxed<S : Into<String>>(version: S) -> Box<Self> {
        Box::new(Self::new(version.into()))
    }
}
exception!(VersionNotFound);
printable!(VersionNotFound);

#[derive(Debug,Clone)]
pub struct UnsupportedVersion {
    msg: String,
    pub version: String
}
impl UnsupportedVersion {
    pub fn new(version: String) -> Self {
        Self {
            msg: format!("Version {} is not supported",version).to_string(),
            version: version
        }
    }
    pub fn boxed<S : Into<String>>(version: S) -> Box<Self> {
        Box::new(Self::new(version.into()))
    }
}
exception!(UnsupportedVersion);
printable!(UnsupportedVersion);

#[derive(Debug,Clone)]
pub struct ExternalProgramError {
    msg: String,
    pub command: String,
    pub stdout: String,
    pub stderr: String
}
impl ExternalProgramError  {
    pub fn new(msg: String, command: String, stdout: String, stderr: String) -> Self {
        Self {
            msg,
            command,
            stdout,
            stderr
        }
    }
    pub fn boxed<S : Into<String>>(msg: S, command: S, stdout: S, stderr: S) -> Box<Self> {
        Box::new(Self::new(msg.into(), command.into(), stdout.into(), stderr.into()))
    }
}
exception!(ExternalProgramError);
printable!(ExternalProgramError);


#[derive(Debug,Clone)]
pub struct InterialError {
    msg: String
}
impl InterialError  {
    pub fn new(msg: String) -> Self {
        Self {
            msg
        }
    }
    pub fn boxed<S : Into<String>>(msg: S) -> Box<Self>{
        Box::new(Self::new(msg.into()))
    }
}
exception!(InterialError);
printable!(InterialError);
