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
    let app_state = AppState::default();

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:practice.db", vec![])
                .build(),
        )
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
            get_model_size,
            // Translation commands
            translate_text,
            translate_page,
            translate_document,
            detect_language,
            // OCR commands
            is_page_scanned,
            ocr_page,
            ocr_document,
            extract_text_from_image,
            // Keychain commands
            store_api_key,
            get_api_key,
            delete_api_key,
            has_api_key,
            list_api_services
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
