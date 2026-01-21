use tauri::AppHandle;

#[tauri::command]
pub async fn open_file_dialog(app: AppHandle) -> Result<Option<String>, String> {
    use tauri::Manager;
    
    let file_path = tauri::api::dialog::blocking::FileDialogBuilder::new()
        .add_filter("PDF Files", &["pdf"])
        .pick_file();

    Ok(file_path.map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
pub async fn read_file(file_path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
