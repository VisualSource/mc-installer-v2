use tauri::Runtime;
use mc_laucher_lib_rs::client::Client;


#[derive(Default)]
pub struct AppState {
  s: std::sync::Mutex<Client>,
}
// remember to call `.manage(MyState::default())`
#[tauri::command]
pub async fn is_game_running(state: tauri::State<'_, AppState>) -> Result<bool, String> {

    if let std::sync::LockResult::Ok(mut value) = state.s.lock() {
        match value.is_running() {
            Ok(status) => return Ok(status),
            Err(err) => return Err(err.to_string())
        }
    }

  Ok(false)
}
