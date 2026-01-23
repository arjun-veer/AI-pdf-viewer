use tauri::AppHandle;
use tauri::Manager;

#[tauri::command]
pub async fn open_file_dialog(app: AppHandle) -> Result<Option<String>, String> {
    // Use tauri-plugin-dialog for file picking
    // For now, return None and implement via frontend
    // Tauri 2.x dialog requires async/await handling
    Ok(None)
}

#[tauri::command]
pub async fn read_file(file_path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
