use simplelog::{ WriteLogger, TermLogger, CombinedLogger, LevelFilter, Config, TerminalMode, ColorChoice, SharedLogger };
use app_dirs2::{ AppInfo,AppDataType, app_root, app_dir };
use std::boxed::Box;
use std::fs::File;
use std::env;


pub const APP_INFO: AppInfo = AppInfo{ name: "MCRustLauncher", author: "VisualSource"};

/// Setsup app_root and logger
pub fn init() {
    app_root(AppDataType::UserConfig, &APP_INFO).expect("Failed to create app root");

    let logs = app_dir(AppDataType::UserConfig, &APP_INFO, "/logs").expect("Failed to get logs path");

    let is_debug = match env::var_os("LOGGER") {
        Some(value) => {
            value == "console"
        }
        None => false
    };

    let prints: Vec<Box<dyn SharedLogger>> = if is_debug {
        vec![
            TermLogger::new(LevelFilter::Info,Config::default(),TerminalMode::Mixed,ColorChoice::Auto),
            TermLogger::new(LevelFilter::Error, Config::default(), TerminalMode::Mixed, ColorChoice::Auto),
            TermLogger::new(LevelFilter::Debug, Config::default(), TerminalMode::Mixed, ColorChoice::Auto),
            TermLogger::new(LevelFilter::Warn, Config::default(),TerminalMode::Mixed, ColorChoice::Auto)
        ]
    } else {
        vec![
            WriteLogger::new(LevelFilter::Warn, Config::default(), File::create(logs.join("mc_rust_lancher_warn.log")).expect("Failed to create log file")),
            WriteLogger::new(LevelFilter::Error, Config::default(), File::create(logs.join("mc_rust_lancher_error.log")).expect("Failed to create log file"))
        ]
    };
    CombinedLogger::init(prints).expect("Failed to create logginer");
}