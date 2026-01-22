// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
mod services;
mod utils;

use commands::*;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            open_file_dialog,
            read_file,
            load_pdf,
            get_pdf_info,
            get_available_models,
            get_models_dir,
            is_model_downloaded,
            list_downloaded_models,
            get_model_path,
            delete_model,
            get_model_size
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
